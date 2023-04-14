import React, { useMemo, useState } from 'react';
import Button from '@splunk/react-ui/Button';
import Message from '@splunk/react-ui/Message';
import Table from '@splunk/visualizations/Table';
import SplunkVisualization from '@splunk/visualizations/common/SplunkVisualization';
import styled from 'styled-components';
import KVStoreUploader from './components/KVStoreUploader';
import { useDashboardApi } from './DashboardApiContext';
import { getAllCollectionEntries, updateCollectionEntry } from './data';
import ModalComponent from './ModalComponent';
import { formatCSVData } from './utils/csv';
import { downloadFile } from './utils/file';
import { getTableMetaData } from './utils/table';

const TableButtonActionGroup = styled.div`
    position: absolute;
    bottom: 0;
    left: 0;
    display: flex;
`;

const constructLabelMap = (model) => {
    const labelMap = {};
    Object.keys(model).forEach((key) => {
        const label = model[key].label || key;
        labelMap[label] = key;
    });
    return labelMap;
};

const EditTable = (props) => {
    const { id, dataSources, onRequestParamsChange, width, height, options } = props;
    const { splunkApp, collection: collectionName, kvStore, model, uploadMode, primaryKey } = options;
    const { api } = useDashboardApi();
    const label2key = constructLabelMap(model);

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
        updateCollectionEntry(splunkApp, collectionName, row._key, row, defaultErrorMsg)
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
                    message: err.message,
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

        // when a cell is clicked, the data we get is the label of table header, not the key
        // e.g: if the header label is "Possible Causes", the row data will be {"Possible Causes": "placeholder"}
        // but the expectation is {"possible_causes": "placeholder"}
        // So, we need this function to convert the label to key in row data in order to
        // handle it correctly in edit modal and other places
        function convertLabelObjectToKey(obj) {
            const newObj = {};
            Object.keys(obj).forEach((label) => {
                const key = label2key[label] || label;
                newObj[key] = obj[label];
            });
            return newObj;
        }

        // extract row from payload and call click handler
        handleEditActionClick(undefined, convertLabelObjectToKey(extractRow(e.payload)));
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

    const fields = tableMetadata.dataFields;
    const headers = fields.map((key) => model[key]?.label || key);

    const handleDownloadAsCSV = async () => {
        setDownloading(true);
        const defaultErrorMsg = 'Error downloading csv. Please try again.';
        const emptyErrorMsg = 'No data to download.';

        try {
            const data = await getAllCollectionEntries(splunkApp, collectionName, defaultErrorMsg);
            if (data == null || data.length === 0) {
                throw new Error(emptyErrorMsg);
            }
            const csvRawData = formatCSVData(data, fields);
            downloadFile(csvRawData, 'text/csv', collectionName);
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
                model={model}
            />
            <KVStoreUploader
                uploadModalOpen={uploadModalOpen}
                setUploadModalOpen={setUploadModalOpen}
                collectionName={collectionName}
                splunkApp={splunkApp}
                kvStore={kvStore}
                uploadMode={uploadMode}
                primaryKey={primaryKey}
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
                options={{
                    headers,
                }}
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
