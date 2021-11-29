/* eslint-disable no-underscore-dangle */
import React, { useState, useMemo } from 'react';

import Table from '@splunk/visualizations/Table';
import Message from '@splunk/react-ui/Message';

import SplunkVisualization from '@splunk/visualizations/common/SplunkVisualization';

import ModalComponent from './ModalComponent';
import { updateKVEntry } from './data';
import { useDashboardApi } from './DashboardApiContext';

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
        updateKVEntry('example_collection', row._key, row, defaultErrorMsg)
            .then(() => {
                setInfoMessage({
                    visible: true,
                    type: 'success',
                    message: 'Row successfully updated',
                });
                api.refreshVisualization(id);
                // TODO: get dashboardAPI from RefreshButton and call dashboardApi.refreshVisualization to reload data
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
