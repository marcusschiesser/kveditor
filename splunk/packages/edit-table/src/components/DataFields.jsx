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
            if (!fieldDefinition) {
                return null;
            }

            const { type, props } = fieldDefinition;
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
                    const { options } = fieldDefinition;
                    return (
                        <ControlGroup label={key} key={`group_${key}`}>
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

    return Object.keys(data).map((key) => renderInputField(key));
};

DataFields.propTypes = {
    data: PropTypes.object,
    handleChange: PropTypes.func,
    model: PropTypes.object,
};

export default DataFields;
