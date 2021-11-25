/* eslint-disable no-underscore-dangle */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import SplunkVisualization from '@splunk/visualizations/common/SplunkVisualization';
import Table from '@splunk/react-ui/Table';
import Pencil from '@splunk/react-icons/Pencil';
import Button from '@splunk/react-ui/Button';
import Tooltip from '@splunk/react-ui/Tooltip';

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

const ReadOnlyTable = ({ dataSources, onRequestParamsChange, onEditActionClick }) => {
    const [tableData, setTableData] = useState(formatData(dataSources));

    useEffect(() => {
        setTableData(formatData(dataSources));
    }, [dataSources]);

    const rowActionPrimaryButton = (
        <Tooltip content="Edit" contentRelationship="label" onClick={onEditActionClick}>
            <Button appearance="secondary" icon={<Pencil hideDefaultTooltip />} />
        </Tooltip>
    );

    const handleMore = async () => {
        onRequestParamsChange('primary', {
            ...dataSources.primary.requestParams,
            offset: 20,
            count: 20,
        });
    };

    return (
        <div>
            <Button
                appearance="secondary"
                icon={<Pencil hideDefaultTooltip />}
                onClick={handleMore}
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
                            onClick={onEditActionClick}
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

ReadOnlyTable.propTypes = {
    dataSources: SplunkVisualization.propTypes.dataSources,
    onRequestParamsChange: SplunkVisualization.propTypes.onRequestParamsChange,
    onEditActionClick: PropTypes.func,
};

export default ReadOnlyTable;
