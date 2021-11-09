import React, { useState } from 'react';
import ControlGroup from '@splunk/react-ui/ControlGroup';
import Text from '@splunk/react-ui/Text';
import T from 'prop-types';
import Button from '@splunk/react-ui/Button';

const RowFormKeyStyle = {
    display: 'inline-block',
    width: 130,
};
const RowFormValueStyle = { display: 'inline-block' };

const RowFormListStyle = {
    overflowY: 'auto',
    height: '500px',
};

const RowForm = ({ onSave, data }) => {
    const [currentData, setCurrentData] = useState(data);

    const handleChange = (_, { value, name }) => {
        const newData = { ...currentData };
        newData[name] = value;
        setCurrentData(newData);
    };

    const handleSave = () => {
        onSave(currentData);
    };

    return (
        <div>
            <div>
                <span style={RowFormKeyStyle}>Key</span>
                <span style={RowFormValueStyle}>Value</span>
            </div>
            <div
                style={RowFormListStyle}
            >
                {Object.keys(data).map((key) => (
                    <ControlGroup label={key} key={`group_${key}`}>
                        <Text
                            canClear
                            placeholder="value"
                            key={`text_${key}`}
                            name={key}
                            value={currentData[key]}
                            onChange={handleChange}
                        />
                    </ControlGroup>
                ))}
            </div>
            <div>
                <Button label="Save" appearance="primary" onClick={handleSave} />
            </div>
        </div>
    );
};

RowForm.propTypes = {
    onSave: T.func,
    data: T.object,
};

export default RowForm;
