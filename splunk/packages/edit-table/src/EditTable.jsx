/* eslint-disable no-underscore-dangle */
import React, { useState, useMemo } from 'react';

import Table from '@splunk/visualizations/Table';
import Message from '@splunk/react-ui/Message';
import Button from '@splunk/react-ui/Button';

import SplunkVisualization from '@splunk/visualizations/common/SplunkVisualization';

import ModalComponent from './ModalComponent';
import { updateKVEntry, getAllKVEntries } from './data';
import { useDashboardApi } from './DashboardApiContext';
import { downloadFile, formatCSVData } from './utils/file';

const COLLECTION_NAME = 'example_collection';

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
            <ModalComponent
                open={openModal}
                data={rowData}
                onClose={handleOnClose}
                onSave={handleOnSave}
            />
            {/* Use ReadOnlyTable if you want to add action buttons for each row
                But currently, it doesn't support pagination and sorting

                import ReadOnlyTable from './ReadOnlyTable';
                 <ReadOnlyTable
                dataSources={dataSources}
                onEditActionClick={handleEditActionClick}
                onRequestParamsChange={onRequestParamsChange}
            /> */}
            <Table
                width={width}
                height={height}
                dataSources={dataSources}
                onCellClick={handleCellClick}
                onRequestParamsChange={onRequestParamsChange}
            />
            {/* TODO(thucpn): Setup CSS module */}
            <Button
                disabled={downloading}
                onClick={handleDownloadAsCSV}
                style={{ position: 'absolute', bottom: 0, left: 0 }}
            >
                Download as CSV
            </Button>
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
