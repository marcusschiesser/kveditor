import File from '@splunk/react-ui/File';
import React, { useState } from 'react';
import prototype from 'prop-types';

export default function SingleFileUpload({ handleFileChange, fileType }) {
    const fileReader = new FileReader();
    const [filename, setFilename] = useState();

    const handleAddFiles = (files) => {
        if (files.length > 0) {
            const file = files[0];
            if (fileReader.readyState === 1) {
                fileReader.abort();
            }
            fileReader.onload = () => {
                setFilename(file.name);
                handleFileChange(fileReader.result);
            };
            fileReader.readAsDataURL(file);
        }
    };

    const handleRemoveFile = () => {
        if (fileReader.readyState === 1) {
            fileReader.abort();
        }
        setFilename(undefined);
    };

    return (
        <div>
            <File
                accept={fileType}
                onRequestAdd={handleAddFiles}
                onRequestRemove={handleRemoveFile}
            >
                {filename && <File.Item name={filename} />}
            </File>
        </div>
    );
}

SingleFileUpload.propTypes = {
    handleFileChange: prototype.func.isRequired,
    fileType: prototype.string,
};
