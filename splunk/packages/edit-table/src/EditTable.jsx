/* eslint-disable no-underscore-dangle */
import React, { useMemo, useState } from 'react';

import Button from '@splunk/react-ui/Button';
import Message from '@splunk/react-ui/Message';
import P from '@splunk/react-ui/Paragraph';
import Table from '@splunk/visualizations/Table';
import Upload from '@splunk/react-icons/Upload';

import SplunkVisualization from '@splunk/visualizations/common/SplunkVisualization';

import * as csv from 'csvtojson';
import AbstractModal from './components/AbstractModal';
import SingleFileUpload from './components/SingleFileUpload';
import { useDashboardApi } from './DashboardApiContext';
import { getAllKVEntries, updateKVEntry, batchInsertKVEntries, deleteAllKVEntries } from './data';
import ModalComponent from './ModalComponent';
import {
    checkJsonDataCorrectFormat,
    downloadFile,
    formatCSVData,
    formatJsonData,
} from './utils/file';

const COLLECTION_NAME = 'example_collection';

// TODO(thucpn): Research about limit size of CSV file to batch upload to KV store
const FILE_SIZE_LIMIT_GB = 1;
const FILE_SIZE_LIMIT_BYTE = FILE_SIZE_LIMIT_GB * 1024 * 1024 * 1024;

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

    const getTableMetaData = () => {
        const data = dataSources?.primary?.data;
        const meta = dataSources?.primary?.meta;

        if (data == null || meta == null) {
            return null;
        }

        const idColumnKey = '_key';
        const dataFields = data.fields
            .map((field) => field.name)
            .filter((name) => name !== idColumnKey);
        const totalItems = meta.resultCount;

        return {
            dataFields,
            totalItems,
        };
    };

    const onOpenUploadModal = () => setUploadModalOpen(true);
    const onCloseUploadModal = () => {
        setUploadModalOpen(false);
        setUploadedCSVContent(undefined);
    };
    const handleFileChange = (fileContent) => setUploadedCSVContent(fileContent);
    const handleUploadCSV = async () => {
        const tableMetadata = getTableMetaData();
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

            const jsonData = await csv().fromString(uploadedCSVContent);
            if (jsonData == null || jsonData.length === 0) {
                throw new Error(emptyCSVErrorMsg);
            }

            const isCorrectFormat = checkJsonDataCorrectFormat(jsonData, dataFields);
            if (!isCorrectFormat) {
                throw new Error(dataFieldErrorMsg);
            }

            const formattedJsonData = formatJsonData(jsonData, dataFields);

            await deleteAllKVEntries(COLLECTION_NAME, deleteErrorMsg);
            await batchInsertKVEntries(COLLECTION_NAME, formattedJsonData, uploadErrorMsg);

            setInfoMessage({
                visible: true,
                type: 'success',
                message: `CSV file successfully uploaded. Removed ${totalItems} items and added ${formattedJsonData.length} items.`,
            });

            api.refreshVisualization(id);
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

    const data = dataSources?.primary?.data;
    const meta = dataSources?.primary?.meta;
    if (data == null || meta == null) {
        return (
            <div style={style}>
                <Message appearance="fill" type="info">
                    Loading Table...
                </Message>
            </div>
        );
    }

    return (
        <div style={style}>
            {infoMessage.visible && (
                <Message
                    style={{
                        width: '30%',
                        position: 'absolute',
                        top: '-2rem',
                        right: 0,
                        zIndex: 100,
                    }}
                    appearance="fill"
                    type={infoMessage.type || 'info'}
                    onRequestRemove={handleMessageRemove}
                >
                    {infoMessage.message}
                </Message>
            )}
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
                <P style={{ width: 500 }}>
                    Replace all current data in KV Store with new data from CSV File. This action
                    cannot be undone, please make sure you have a backup of your data. <br />
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
