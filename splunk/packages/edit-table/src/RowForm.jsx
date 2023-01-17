import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Button from '@splunk/react-ui/Button';
import Football from './models/football';
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
            <div style={RowFormListStyle}>
                <DataFields data={currentData} handleChange={handleChange} RowModel={Football} />
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
};

export default RowForm;
