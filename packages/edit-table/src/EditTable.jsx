/* eslint-disable no-underscore-dangle */
import React, { useState, useEffect } from 'react';

import Table from '@splunk/react-ui/Table';
import Pencil from '@splunk/react-icons/Pencil';
import Button from '@splunk/react-ui/Button';
import Tooltip from '@splunk/react-ui/Tooltip';
import Message from '@splunk/react-ui/Message';

import SplunkVisualization from '@splunk/visualizations/common/SplunkVisualization';

import ModalComponent from './ModalComponent';
import { updateKVEntry } from './data';

// Extract data from the datasource a format usable by the table
const formatData = (dataSources) => {
    if (!dataSources.primary.data) {
        return {
            fields: [],
            data: [],
        };
    }

    // Get the names of the fields
    const fields = dataSources.primary.data.fields.map((f) => f.name);
    const data = [];

    // Convert the data from column to row form
    dataSources.primary.data.columns.forEach((col, i) => {
        col.forEach((item, j) => {
            if (!data[j]) {
                data.push({});
            }
            data[j][fields[i].replace(/\s/g, '')] = item;
        });
    });

    return { fields, data };
};

const EditTable = ({ dataSources }) => {
    const [tableData, setTableData] = useState(formatData(dataSources));
    const [openModal, setOpenModal] = useState(false);
    const [infoMessage, setInfoMessage] = useState({ visible: false });
    const [rowData, setRowData] = useState({});

    useEffect(() => {
        setTableData(formatData(dataSources));
    }, [dataSources]);

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

    const rowActionPrimaryButton = (
        <Tooltip content="Edit" contentRelationship="label" onClick={handleEditActionClick}>
            <Button appearance="secondary" icon={<Pencil hideDefaultTooltip />} />
        </Tooltip>
    );

    const updateRow = (key, data) => {
        const keyIndex = tableData.data.findIndex((element) => element._key === key);
        const newData = [...tableData.data];
        newData[keyIndex] = data;
        setTableData({
            fields: tableData.fields,
            data: newData,
        });
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
                // all fine, update tableData
                updateRow(row._key, row);
            })
            .catch((err) => {
                setInfoMessage({
                    visible: true,
                    type: 'error',
                    message: err,
                });
            });
    };

    return (
        <div>
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
            <Table>
                <Table.Head>
                    {tableData.fields.map((field) => {
                        return <Table.HeadCell key={field}>{field}</Table.HeadCell>;
                    })}
                </Table.Head>
                <Table.Body>
                    {tableData.data.map((row) => (
                        <Table.Row
                            key={row._key}
                            actionPrimary={rowActionPrimaryButton}
                            onClick={handleEditActionClick}
                            data={row}
                        >
                            {tableData.fields.map((field) => {
                                return (
                                    <Table.Cell key={`${row._key}_${field}`}>
                                        {row[field]}
                                    </Table.Cell>
                                );
                            })}
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table>
        </div>
    );
};

EditTable.config = {
    dataContract: {},
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
