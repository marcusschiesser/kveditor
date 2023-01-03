/* eslint-disable no-underscore-dangle */
import React, { useState, useMemo } from 'react';

import Table from '@splunk/visualizations/Table';
import Message from '@splunk/react-ui/Message';
import Button from '@splunk/react-ui/Button';
import P from '@splunk/react-ui/Paragraph';

import SplunkVisualization from '@splunk/visualizations/common/SplunkVisualization';

import ModalComponent from './ModalComponent';
import { updateKVEntry, getAllKVEntries, batchInsertKVEntries } from './data';
import { useDashboardApi } from './DashboardApiContext';
import { downloadFile, formatCSVData } from './utils/file';
import SingleFileUpload from './components/SingleFileUpload';
import AbstractModal from './components/AbstractModal';

const COLLECTION_NAME = 'example_collection';
const FILE_SIZE_LIMIT = 1;

const EditTable = ({ id, dataSources, onRequestParamsChange, width, height }) => {
    const { api } = useDashboardApi();

    const style = useMemo(
        () => ({
            height,
            width,
            overflow: 'hidden',
        }),
        [width, height]
    );

    const [openModal, setOpenModal] = useState(false);
    const [infoMessage, setInfoMessage] = useState({ visible: false });
    const [rowData, setRowData] = useState({});
    const [downloading, setDownloading] = useState(false);

    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadedCSVContent, setUploadedCSVContent] = useState();

    const handleEditActionClick = (_, data) => {
        setRowData(data);
        setOpenModal(!openModal);
    };

    const handleOnClose = () => {
        setOpenModal(false);
    };

    const handleMessageRemove = () => {
        setInfoMessage({ visible: false });
    };

    const handleOnSave = async (row) => {
        setOpenModal(false);
        setInfoMessage({ visible: true, message: 'Updating...' });
        const defaultErrorMsg = 'Error updating row. Please try again.';
        updateKVEntry(COLLECTION_NAME, row._key, row, defaultErrorMsg)
            .then(() => {
                setInfoMessage({
                    visible: true,
                    type: 'success',
                    message: 'Row successfully updated',
                });
                api.refreshVisualization(id);
                setTimeout(() => {
                    setInfoMessage({
                        visible: false,
                    });
                }, 1000);
            })
            .catch((err) => {
                setInfoMessage({
                    visible: true,
                    type: 'error',
                    message: err,
                });
            });
    };

    const handleCellClick = (e) => {
        function extractRow(obj) {
            const row = {};

            const removeLeadingRowAndValueSuffixRe = /^row\.([^\.]+)\.value$/;

            // eslint-disable-next-line no-restricted-syntax
            for (const key in obj) {
                if ({}.hasOwnProperty.call(obj, key)) {
                    const match = key.match(removeLeadingRowAndValueSuffixRe);
                    if (match) {
                        row[match[1]] = obj[key];
                    }
                }
            }
            return row;
        }
        // extract row from payload and call click handler
        handleEditActionClick(undefined, extractRow(e.payload));
    };

    const handleDownloadAsCSV = async () => {
        setDownloading(true);
        const defaultErrorMsg = 'Error downloading csv. Please try again.';
        const emptyErrorMsg = 'No data to download.';

        try {
            const data = await getAllKVEntries(COLLECTION_NAME, defaultErrorMsg);
            if (data == null || data.length === 0) {
                throw new Error(emptyErrorMsg);
            }

            const omitColumns = ['_user'];
            const csvRawData = formatCSVData(data, omitColumns);
            downloadFile(csvRawData, 'text/csv', COLLECTION_NAME);
        } catch (err) {
            setInfoMessage({
                visible: true,
                type: 'error',
                message: err.message,
            });
        }

        setDownloading(false);
    };

    const convertCSVToJSON = (csvData) => {
        console.log(csvData);
        const sample = [
            {
                Score: '86',
                Title: 'Awaken',
                Year: '1968',
            },
            {
                Score: 17,
                Title: 'Kayz',
                Year: 1970,
            },
        ];
        return sample;
    };

    const onOpenUploadModal = () => setUploadModalOpen(true);
    const onCloseUploadModal = () => setUploadModalOpen(false);
    const handleFileChange = (fileContent) => setUploadedCSVContent(fileContent);
    const handleUploadCSV = async () => {
        setUploading(true);
        const defaultErrorMsg = 'Error uploading csv. Please try again.';
        const emptyErrorMsg = 'No data to upload.';

        try {
            const jsonData = convertCSVToJSON(uploadedCSVContent);
            if (jsonData == null || jsonData.length === 0) {
                throw new Error(emptyErrorMsg);
            }

            const result = await batchInsertKVEntries(COLLECTION_NAME, jsonData, defaultErrorMsg);
            console.log(result);
        } catch (err) {
            setInfoMessage({
                visible: true,
                type: 'error',
                message: err.message,
            });
        }

        setUploading(false);
        setUploadModalOpen(false);
    };

    return (
        <div style={style}>
            {infoMessage.visible && (
                <Message
                    appearance="fill"
                    type={infoMessage.type || 'info'}
                    onRequestRemove={handleMessageRemove}
                >
                    {infoMessage.message}
                </Message>
            )}
            {/* TODO(thucpn): Refactor this modal component */}
            <ModalComponent
                open={openModal}
                data={rowData}
                onClose={handleOnClose}
                onSave={handleOnSave}
            />
            <AbstractModal
                title="Upload CSV File"
                onClose={onCloseUploadModal}
                open={uploadModalOpen}
            >
                <P>
                    Replace all current data in KV Store with new data from CSV File. File size limit:{' '}
                    {FILE_SIZE_LIMIT} GB.
                </P>
                <SingleFileUpload fileType=".csv" handleFileChange={handleFileChange} />
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
                    <Button disabled={!uploadedCSVContent || uploading} onClick={handleUploadCSV}>
                        Confirm Upload
                    </Button>
                </div>
            </AbstractModal>
            <Table
                width={width}
                height={height}
                dataSources={dataSources}
                onCellClick={handleCellClick}
                onRequestParamsChange={onRequestParamsChange}
            />
            <div style={{ position: 'absolute', bottom: 0, left: 0, display: 'flex' }}>
                <Button disabled={downloading} onClick={handleDownloadAsCSV}>
                    Download as CSV
                </Button>
                <Button onClick={onOpenUploadModal}>Upload CSV</Button>
            </div>
        </div>
    );
};

EditTable.config = {
    dataContract: {
        requiredDataSources: ['primary'],
        initialRequestParams: {
            primary: { offset: 0, count: 10 },
        },
    },
    optionsSchema: {},
    key: 'splunk.EditTable',
    name: 'EditTable',
};

EditTable.propTypes = {
    ...SplunkVisualization.propTypes,
};

EditTable.defaultProps = {
    ...SplunkVisualization.defaultProps,
};

export default EditTable;
