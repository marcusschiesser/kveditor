import ControlGroup from '@splunk/react-ui/ControlGroup';
import Number from '@splunk/react-ui/Number';
import Select from '@splunk/react-ui/Select';
import Switch from '@splunk/react-ui/Switch';
import Text from '@splunk/react-ui/Text';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';

const DataFields = ({ data, handleChange, RowModel }) => {
    const renderInputField = useCallback(
        (key) => {
            const dataDefinition = RowModel[key];
            if (!dataDefinition) {
                return null;
            }

            const { type, props } = dataDefinition;

            switch (type) {
                case 'string': {
                    return (
                        <ControlGroup label={key} key={`group_${key}`}>
                            <Text
                                canClear
                                placeholder="value"
                                key={`text_${key}`}
                                name={key}
                                value={data[key].toString()}
                                onChange={handleChange}
                                {...props}
                            />
                        </ControlGroup>
                    );
                }

                case 'number': {
                    return (
                        <ControlGroup label={key} key={`group_${key}`}>
                            <Number
                                placeholder="value"
                                key={`number_${key}`}
                                name={key}
                                value={data[key]}
                                onChange={handleChange}
                                {...props}
                            />
                        </ControlGroup>
                    );
                }

                case 'boolean': {
                    return (
                        <ControlGroup label={key} key={`group_${key}`}>
                            <Switch
                                key={`switch_${key}`}
                                name={key}
                                value={data[key]}
                                onChange={handleChange}
                                {...props}
                            />
                        </ControlGroup>
                    );
                }

                case 'enum': {
                    const { options } = dataDefinition;
                    return (
                        <ControlGroup label={key} key={`group_${key}`}>
                            <Select
                                key={`select_${key}`}
                                name={key}
                                value={data[key]}
                                onChange={handleChange}
                            >
                                {Object.values(options).map((option) => (
                                    <Select.Option
                                        key={`option_${option}`}
                                        value={option}
                                        label={option}
                                    />
                                ))}
                            </Select>
                        </ControlGroup>
                    );
                }

                default:
                    return null;
            }
        },
        [data, handleChange, RowModel]
    );

    return Object.keys(data).map((key) => renderInputField(key));
};

DataFields.propTypes = {
    data: PropTypes.object,
    handleChange: PropTypes.func,
    RowModel: PropTypes.object,
};

export default DataFields;
