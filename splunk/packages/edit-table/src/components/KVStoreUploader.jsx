import Upload from '@splunk/react-icons/Upload';
import Button from '@splunk/react-ui/Button';
import P from '@splunk/react-ui/Paragraph';
import SearchJob from '@splunk/search-job';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import styled from 'styled-components';
import { batchInsertKVEntries, deleteAllKVEntries } from '../data';
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
    const [uploading, setUploading] = useState(false);
    const [uploadedCSVContent, setUploadedCSVContent] = useState();

    const executeJob = async (job, errorMessage) => {
        try {
            const response = await job.getResults().toPromise();
            const errorMessages = response?.messages?.filter((msg) => msg.type === 'ERROR');
            if (errorMessages && errorMessages.length > 0) {
                console.error('Execute Job Error From Response', response);
                throw new Error(errorMessages.map((msg) => msg.text).join('\n'));
            }
        } catch (err) {
            console.error('Execute Job Error', err);
            throw new Error(err?.message || errorMessage);
        }
    };

    const createBackupForKvStore = async (errorMessage) => {
        const backupJob = SearchJob.create(
            { search: `|inputlookup ${kvStore} |outputlookup ${kvStore}.bak.csv` },
            { app: splunkApp, owner: 'admin' }
        );
        return executeJob(backupJob, errorMessage);
    };

    const restoreKvStoreFromBackup = async (errorMessage) => {
        const restoreJob = SearchJob.create(
            {
                search: `|inputlookup ${kvStore}.bak.csv |outputlookup ${kvStore}`,
            },
            { app: splunkApp, owner: 'admin' }
        );
        return executeJob(restoreJob, errorMessage);
    };

    const onCloseUploadModal = () => {
        setUploadModalOpen(false);
        setUploadedCSVContent(undefined);
    };
    const handleFileChange = (fileContent) => setUploadedCSVContent(fileContent);
    const handleUploadCSV = async () => {
        if (tableMetadata == null) return;

        const emptyErrorMsg = 'No data to upload.';
        const emptyCSVErrorMsg = 'CSV file is empty.';
        const dataFieldErrorMsg = 'CSV file have no enough data fields.';
        const backupErrorMsg = 'Error creating backup for KV Store. Please try again later.';
        const deleteErrorMsg = 'Error deleting all entries. Please try again.';
        const uploadErrorMsg = 'Error uploading csv. Please try again.';
        const restoreErrorMsg = 'Error restoring KV Store. If data is lost, please contact admin.';

        const { dataFields, totalItems } = tableMetadata;
        let isBackupCreated = false;
        let isUploadSuccess = false;
        setUploading(true);

        try {
            if (uploadedCSVContent == null) {
                throw new Error(emptyErrorMsg);
            }

            const jsonData = await convertToJSONArrayFromCSVString(uploadedCSVContent);
            if (jsonData == null || jsonData.length === 0) {
                throw new Error(emptyCSVErrorMsg);
            }

            const isCorrectFormat = checkJsonArrayCorrectFormat(jsonData, dataFields);
            if (!isCorrectFormat) {
                throw new Error(dataFieldErrorMsg);
            }

            await createBackupForKvStore(backupErrorMsg);
            isBackupCreated = true;

            await deleteAllKVEntries(collectionName, deleteErrorMsg, splunkApp);

            const formattedJsonData = projectFields(jsonData, dataFields);
            await batchInsertKVEntries(
                collectionName,
                formattedJsonData,
                uploadErrorMsg,
                splunkApp
            );

            isUploadSuccess = true;
            setInfoMessage({
                visible: true,
                type: 'success',
                message: `CSV file successfully uploaded. Removed ${totalItems} items and added ${formattedJsonData.length} items.`,
            });
        } catch (error) {
            console.error(error);
            setInfoMessage({
                visible: true,
                type: 'error',
                message: error.message,
            });
        }

        if (isBackupCreated && !isUploadSuccess) {
            try {
                await restoreKvStoreFromBackup(restoreErrorMsg);
            } catch (error) {
                console.error(error);
                setInfoMessage({
                    visible: true,
                    type: 'error',
                    message: error.message,
                });
            }
        }

        setUploadedCSVContent(undefined);
        setUploading(false);
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
