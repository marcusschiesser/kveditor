import ControlGroup from '@splunk/react-ui/ControlGroup';
import Number from '@splunk/react-ui/Number';
import Select from '@splunk/react-ui/Select';
import Switch from '@splunk/react-ui/Switch';
import Text from '@splunk/react-ui/Text';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';

const DataFields = ({ data, handleChange, model }) => {
    const renderInputField = useCallback(
        (key) => {
            const fieldDefinition = model[key];
            const { type, props, label } = fieldDefinition;
            const fieldLabel = label || key;
            switch (type) {
                case 'string': {
                    return (
                        <ControlGroup label={fieldLabel} key={`group_${key}`}>
                            <Text
                                canClear
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
                        <ControlGroup label={fieldLabel} key={`group_${key}`}>
                            <Number
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
                        <ControlGroup label={fieldLabel} key={`group_${key}`}>
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
                    const { options } = fieldDefinition;
                    return (
                        <ControlGroup label={fieldLabel} key={`group_${key}`}>
                            <Select
                                key={`select_${key}`}
                                name={key}
                                value={data[key]}
                                onChange={handleChange}
                            >
                                {options.map((option) => (
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
        [data, handleChange, model]
    );

    return Object.keys(data)
        .filter((key) => !!model[key])
        .sort((key1, key2) => model[key1].order - model[key2].order)
        .map((key) => renderInputField(key));
};

DataFields.propTypes = {
    data: PropTypes.object,
    handleChange: PropTypes.func,
    model: PropTypes.object,
};

export default DataFields;
