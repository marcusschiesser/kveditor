import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Button from '@splunk/react-ui/Button';
import DataFields from './components/DataFields';

const RowFormKeyStyle = {
    display: 'inline-block',
    width: 130,
};
const RowFormValueStyle = { display: 'inline-block' };

const RowFormListStyle = {
    overflowY: 'auto',
    height: '500px',
};

const RowForm = ({ onSave, data, model, labelMap }) => {
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
            <div style={RowFormListStyle}>
                <DataFields data={currentData} handleChange={handleChange} model={model} labelMap={labelMap} />
            </div>
            <div>
                <Button label="Save" appearance="primary" onClick={handleSave} />
            </div>
        </div>
    );
};

RowForm.propTypes = {
    onSave: PropTypes.func,
    data: PropTypes.object,
    model: PropTypes.object,
    labelMap: PropTypes.array
};

export default RowForm;
