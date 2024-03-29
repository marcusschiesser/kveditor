import Upload from '@splunk/react-icons/Upload';
import Button from '@splunk/react-ui/Button';
import P from '@splunk/react-ui/Paragraph';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import styled from 'styled-components';
import {
    batchInsertCollectionEntries,
    batchUpsertCollectionEntries,
    deleteAllCollectionEntries,
    doKvStoreChanges,
    getAllCollectionEntries,
} from '../data';
import { convertToJSONArrayFromCSVString } from '../utils/csv';
import { checkJsonArrayCorrectFormat, projectFields } from '../utils/obj';
import AbstractModal from './AbstractModal';
import SingleFileUpload from './SingleFileUpload';

// TODO(thucpn): Research about limit size of CSV file to batch upload to KV store
const FILE_SIZE_LIMIT_GB = 1;
const FILE_SIZE_LIMIT_BYTE = FILE_SIZE_LIMIT_GB * 1024 * 1024 * 1024;

const ModalButtonActionGroup = styled.div`
    display: flex;
    width: fit-content;
    margin-left: auto;
    margin-top: 2rem;
`;

const emptyErrorMsg = 'No data to upload.';
const emptyCSVErrorMsg = 'CSV file is empty.';
const dataFieldErrorMsg = 'CSV file have no enough data fields.';
const backupErrorMsg = 'Error creating backup for KV Store. Please try again later.';
const deleteErrorMsg = 'Error deleting all entries. Please try again.';
const uploadErrorMsg = 'Error uploading csv. Please try again.';
const restoreErrorMsg = 'Error restoring KV Store. If data is lost, please contact admin.';
const fetchAllErrorMsg = 'Error fetching all entries. Please try again.';
const updateErrorMsg = 'Error updating entry.';

// TODO(thucpn): So many props here, in the feature, we can consider create EditTable context to pass down props
export default function KVStoreUploader({
    uploadModalOpen,
    setUploadModalOpen,
    collectionName,
    splunkApp,
    kvStore,
    uploadMode,
    _keyIncludeInCSV,
    tableMetadata,
    setInfoMessage,
    refreshVisualization,
}) {
    const { dataFields, totalItems } = tableMetadata;
    const [uploading, setUploading] = useState(false);
    const [uploadedCSVContent, setUploadedCSVContent] = useState();

    const isReplaceUploadMode = uploadMode === 'replace';
    const primaryKey = '_key';

    const showErrorMessage = (message) => {
        setInfoMessage({
            visible: true,
            type: 'error',
            message,
        });
    };

    const showSuccessMessage = (message) => {
        setInfoMessage({
            visible: true,
            type: 'success',
            message,
        });
    };

    const onCloseUploadModal = () => {
        setUploadModalOpen(false);
        setUploadedCSVContent(undefined);
    };
    const handleFileChange = (fileContent) => setUploadedCSVContent(fileContent);

    const getFormattedData = async () => {
        if (uploadedCSVContent == null) {
            showErrorMessage(emptyErrorMsg);
            return false;
        }

        const jsonData = await convertToJSONArrayFromCSVString(uploadedCSVContent);
        if (jsonData == null || jsonData.length === 0) {
            showErrorMessage(emptyCSVErrorMsg);
            return false;
        }

        // If _keyIncludeInCSV = true, all entries must have _key field
        // If _keyIncludeInCSV = false, _key field can have or not have for each entry
        const dataFieldsForCheck = _keyIncludeInCSV
            ? dataFields
            : dataFields.filter((field) => field !== '_key');
        const isCorrectFormat = checkJsonArrayCorrectFormat(jsonData, dataFieldsForCheck);
        if (!isCorrectFormat) {
            showErrorMessage(dataFieldErrorMsg);
            return false;
        }

        const formattedJsonData = projectFields(jsonData, dataFields);
        return formattedJsonData;
    };

    const getIncrementalUploadData = async (newData) => {
        // If there is no data in KV store, insert all new data
        const entries = await getAllCollectionEntries(splunkApp, collectionName, fetchAllErrorMsg);
        if (entries == null || entries.length === 0) {
            return {
                dataForUpdate: [],
                dataForInsert: newData,
            };
        }

        const entriesKeySet = new Set(entries.map((e) => e[primaryKey]));
        const dataForUpdate = [];
        const dataForInsert = [];

        // For entries with _key, and _key exists in the database, we will update
        // For entries without _key or _key does not exist in the database, we will create new
        newData.forEach((entry) => {
            const primaryKeyValue = entry[primaryKey];
            if (primaryKeyValue && entriesKeySet.has(primaryKeyValue)) {
                dataForUpdate.push(entry);
            } else {
                dataForInsert.push(entry);
            }
        });

        return {
            dataForUpdate,
            dataForInsert,
        };
    };

    const runReplaceUpload = async () => {
        const data = await getFormattedData();
        if (!data || data.length === 0) return;

        try {
            const options = { splunkApp, kvStore, backupErrorMsg, restoreErrorMsg };
            const callback = async () => {
                await deleteAllCollectionEntries(splunkApp, collectionName, deleteErrorMsg);
                await Promise.all(
                    batchInsertCollectionEntries(splunkApp, collectionName, data, uploadErrorMsg)
                );
            };
            await doKvStoreChanges(options, callback);
            showSuccessMessage(
                `CSV file successfully uploaded. Removed ${totalItems} items and added ${data.length} items.`
            );
        } catch (error) {
            console.error(error);
            showErrorMessage(error.message);
        }
    };

    const runIncrementalUpload = async () => {
        const data = await getFormattedData();
        if (!data) return;

        const incrementalUploadData = await getIncrementalUploadData(data);
        const { dataForUpdate, dataForInsert } = incrementalUploadData;

        try {
            const options = { splunkApp, kvStore, backupErrorMsg, restoreErrorMsg };
            const callback = async () => {
                await batchUpsertCollectionEntries(
                    splunkApp,
                    collectionName,
                    incrementalUploadData,
                    updateErrorMsg,
                    uploadErrorMsg
                );
            };
            await doKvStoreChanges(options, callback);
            showSuccessMessage(
                `CSV file successfully uploaded. Update ${dataForUpdate.length} items and added ${dataForInsert.length} items.`
            );
        } catch (error) {
            console.error(error);
            showErrorMessage(error.message);
        }
    };

    const handleUploadCSV = async () => {
        setUploading(true);
        if (isReplaceUploadMode) {
            await runReplaceUpload();
        } else {
            await runIncrementalUpload();
        }
        setUploading(false);
        setUploadedCSVContent(undefined);
        setUploadModalOpen(false);
        refreshVisualization();
    };

    return (
        <AbstractModal title="Upload CSV File" onClose={onCloseUploadModal} open={uploadModalOpen}>
            <P style={{ width: 500 }}>
                Replace all current data in KV Store with new data from CSV File. This action cannot
                be undone, please make sure you have a backup of your data. <br />
                <br /> <strong>File size limit: {FILE_SIZE_LIMIT_GB} GB</strong>
            </P>
            <SingleFileUpload
                accept=".csv"
                fileType="text/csv"
                sizeLimit={FILE_SIZE_LIMIT_BYTE}
                handleFileChange={handleFileChange}
            />
            <ModalButtonActionGroup>
                <Button appearance="secondary" onClick={onCloseUploadModal}>
                    Cancel
                </Button>
                <Button
                    icon={<Upload />}
                    disabled={!uploadedCSVContent || uploading}
                    onClick={handleUploadCSV}
                >
                    Confirm Upload
                </Button>
            </ModalButtonActionGroup>
        </AbstractModal>
    );
}

KVStoreUploader.propTypes = {
    uploadModalOpen: PropTypes.bool.isRequired,
    setUploadModalOpen: PropTypes.func.isRequired,
    collectionName: PropTypes.string.isRequired,
    splunkApp: PropTypes.string,
    kvStore: PropTypes.string,
    uploadMode: PropTypes.string, // 'replace' or 'incremental'
    _keyIncludeInCSV: PropTypes.bool, // could be undefined
    setInfoMessage: PropTypes.func.isRequired,
    refreshVisualization: PropTypes.func.isRequired,
    tableMetadata: PropTypes.shape({
        dataFields: PropTypes.arrayOf(PropTypes.string).isRequired,
        totalItems: PropTypes.number.isRequired,
    }),
};
