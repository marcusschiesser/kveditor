/* eslint-disable no-underscore-dangle */
import React, { useMemo, useState } from 'react';

import Button from '@splunk/react-ui/Button';
import Message from '@splunk/react-ui/Message';
import Table from '@splunk/visualizations/Table';

import SplunkVisualization from '@splunk/visualizations/common/SplunkVisualization';

import styled from 'styled-components';
import KVStoreUploader from './components/KVStoreUploader';
import { useDashboardApi } from './DashboardApiContext';
import { getAllKVEntries, updateKVEntry } from './data';
import ModalComponent from './ModalComponent';
import { formatCSVData } from './utils/csv';
import { downloadFile } from './utils/file';
import { getTableMetaData } from './utils/table';

const COLLECTION_NAME = 'example_kv';

const TableButtonActionGroup = styled.div`
    position: absolute;
    bottom: 0;
    left: 0;
    display: flex;
`;

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
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [infoMessage, setInfoMessage] = useState({ visible: false });
    const [rowData, setRowData] = useState({});
    const [downloading, setDownloading] = useState(false);

    const refreshVisualization = () => {
        api.refreshVisualization(id);
    };

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
                refreshVisualization();
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
            console.log('data',data);
            if (data == null || data.length === 0) {
                throw new Error(emptyErrorMsg);
            }

            const omitColumns = ['_user'];
            const csvRawData = formatCSVData(data, omitColumns);
            downloadFile(csvRawData, 'text/csv', COLLECTION_NAME);
        } catch (err) {
            console.error(err);
            setInfoMessage({
                visible: true,
                type: 'error',
                message: err.message,
            });
        }

        setDownloading(false);
    };

    const onOpenUploadModal = () => setUploadModalOpen(true);

    const tableMetadata = getTableMetaData(dataSources);
    if (tableMetadata == null) {
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
            <KVStoreUploader
                uploadModalOpen={uploadModalOpen}
                setUploadModalOpen={setUploadModalOpen}
                collectionName={COLLECTION_NAME}
                tableMetadata={tableMetadata}
                setInfoMessage={setInfoMessage}
                refreshVisualization={refreshVisualization}
            />
            {/* 
                Use ReadOnlyTable if you want to add action buttons for each row
                But currently, it doesn't support pagination and sorting
                import ReadOnlyTable from './ReadOnlyTable';
                <ReadOnlyTable
                    dataSources={dataSources}
                    onEditActionClick={handleEditActionClick}
                    onRequestParamsChange={onRequestParamsChange}
                /> 
            */}
            <Table
                width={width}
                height={height}
                dataSources={dataSources}
                onCellClick={handleCellClick}
                onRequestParamsChange={onRequestParamsChange}
            />
            <TableButtonActionGroup>
                <Button disabled={downloading} onClick={handleDownloadAsCSV}>
                    Download as CSV
                </Button>
                <Button onClick={onOpenUploadModal}>Upload CSV</Button>
            </TableButtonActionGroup>
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
