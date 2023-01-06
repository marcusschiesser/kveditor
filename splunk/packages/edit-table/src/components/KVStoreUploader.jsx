import Upload from '@splunk/react-icons/Upload';
import Button from '@splunk/react-ui/Button';
import P from '@splunk/react-ui/Paragraph';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { batchInsertKVEntries, deleteAllKVEntries } from '../data';
import AbstractModal from './AbstractModal';
import SingleFileUpload from './SingleFileUpload';
import { checkJsonDataCorrectFormat, projectFields } from '../utils/json';
import { convertCSVStringToJSON } from '../utils/csv';

// TODO(thucpn): Research about limit size of CSV file to batch upload to KV store
const FILE_SIZE_LIMIT_GB = 1;
const FILE_SIZE_LIMIT_BYTE = FILE_SIZE_LIMIT_GB * 1024 * 1024 * 1024;

// TODO(thucpn): So many props here, in the feature, we can consider create EditTable context to pass down props
export default function KVStoreUploader({
    uploadModalOpen,
    setUploadModalOpen,
    collectionName,
    tableMetadata,
    setInfoMessage,
    refreshVisualization,
}) {
    const [uploading, setUploading] = useState(false);
    const [uploadedCSVContent, setUploadedCSVContent] = useState();

    const onCloseUploadModal = () => {
        setUploadModalOpen(false);
        setUploadedCSVContent(undefined);
    };
    const handleFileChange = (fileContent) => setUploadedCSVContent(fileContent);
    const handleUploadCSV = async () => {
        if (tableMetadata == null) {
            return;
        }

        setUploading(true);
        const { dataFields, totalItems } = tableMetadata;
        const emptyErrorMsg = 'No data to upload.';
        const emptyCSVErrorMsg = 'CSV file is empty.';
        const dataFieldErrorMsg = 'CSV file have no enough data fields.';
        const deleteErrorMsg = 'Error deleting all entries. Please try again.';
        const uploadErrorMsg = 'Error uploading csv. Please try again.';

        try {
            if (uploadedCSVContent == null) {
                throw new Error(emptyErrorMsg);
            }

            const jsonData = await convertCSVStringToJSON(uploadedCSVContent);
            if (jsonData == null || jsonData.length === 0) {
                throw new Error(emptyCSVErrorMsg);
            }

            const isCorrectFormat = checkJsonDataCorrectFormat(jsonData, dataFields);
            if (!isCorrectFormat) {
                throw new Error(dataFieldErrorMsg);
            }

            const formattedJsonData = projectFields(jsonData, dataFields);

            await deleteAllKVEntries(collectionName, deleteErrorMsg);
            await batchInsertKVEntries(collectionName, formattedJsonData, uploadErrorMsg);

            setInfoMessage({
                visible: true,
                type: 'success',
                message: `CSV file successfully uploaded. Removed ${totalItems} items and added ${formattedJsonData.length} items.`,
            });

            refreshVisualization();
        } catch (err) {
            setInfoMessage({
                visible: true,
                type: 'error',
                message: err.message,
            });
        }

        setUploading(false);
        setUploadModalOpen(false);
        setUploadedCSVContent(undefined);
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
            <div
                style={{
                    display: 'flex',
                    width: 'fit-content',
                    marginLeft: 'auto',
                    marginTop: '2rem',
                }}
            >
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
            </div>
        </AbstractModal>
    );
}

KVStoreUploader.propTypes = {
    uploadModalOpen: PropTypes.bool.isRequired,
    setUploadModalOpen: PropTypes.func.isRequired,
    collectionName: PropTypes.string.isRequired,
    setInfoMessage: PropTypes.func.isRequired,
    refreshVisualization: PropTypes.func.isRequired,
    tableMetadata: PropTypes.shape({
        dataFields: PropTypes.arrayOf(PropTypes.string).isRequired,
        totalItems: PropTypes.number.isRequired,
    }),
};