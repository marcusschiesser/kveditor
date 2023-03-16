import Upload from '@splunk/react-icons/Upload';
import Button from '@splunk/react-ui/Button';
import P from '@splunk/react-ui/Paragraph';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import styled from 'styled-components';
import {
    batchInsertCollectionEntries,
    deleteAllCollectionEntries,
    doKvStoreChanges,
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

// TODO(thucpn): So many props here, in the feature, we can consider create EditTable context to pass down props
export default function KVStoreUploader({
    uploadModalOpen,
    setUploadModalOpen,
    collectionName,
    splunkApp,
    kvStore,
    tableMetadata,
    setInfoMessage,
    refreshVisualization,
}) {
    const { dataFields, totalItems } = tableMetadata;
    const [uploading, setUploading] = useState(false);
    const [uploadedCSVContent, setUploadedCSVContent] = useState();

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

    const transformData = async () => {
        if (uploadedCSVContent == null) {
            showErrorMessage(emptyErrorMsg);
            return false;
        }

        const jsonData = await convertToJSONArrayFromCSVString(uploadedCSVContent);
        if (jsonData == null || jsonData.length === 0) {
            showErrorMessage(emptyCSVErrorMsg);
            return false;
        }

        const isCorrectFormat = checkJsonArrayCorrectFormat(jsonData, dataFields);
        if (!isCorrectFormat) {
            showErrorMessage(dataFieldErrorMsg);
            return false;
        }

        const formattedJsonData = projectFields(jsonData, dataFields);
        return formattedJsonData;
    };

    const runUpload = async () => {
        const data = await transformData();
        if (!data) return;

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

    const handleUploadCSV = async () => {
        setUploading(true);
        await runUpload();
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
    setInfoMessage: PropTypes.func.isRequired,
    refreshVisualization: PropTypes.func.isRequired,
    tableMetadata: PropTypes.shape({
        dataFields: PropTypes.arrayOf(PropTypes.string).isRequired,
        totalItems: PropTypes.number.isRequired,
    }),
};
