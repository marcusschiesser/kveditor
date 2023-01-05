import React, { useState } from 'react';
import File from '@splunk/react-ui/File';
import Message from '@splunk/react-ui/Message';
import prototype from 'prop-types';

export default function SingleFileUpload({ handleFileChange, accept, fileType, sizeLimit }) {
    const fileReader = new FileReader();
    const [filename, setFilename] = useState();
    const [error, setError] = useState();

    const handleAddFiles = (files) => {
        if (files.length > 0) {
            const file = files[0];
            if (fileType && file.type !== fileType) {
                setError('File type is not supported');
                return;
            }

            if (sizeLimit && file.size > sizeLimit) {
                setError('File size is too large');
                return;
            }

            if (fileReader.readyState === 1) {
                fileReader.abort();
            }

            fileReader.onload = () => {
                setFilename(file.name);
                setError(undefined);
                handleFileChange(fileReader.result);
            };

            fileReader.readAsText(file);
        }
    };

    const handleRemoveFile = () => {
        if (fileReader.readyState === 1) {
            fileReader.abort();
        }
        
        setFilename(undefined);
        setError(undefined);
        handleFileChange(undefined);
    };

    return (
        <div>
            <File
                accept={accept}
                onRequestAdd={handleAddFiles}
                onRequestRemove={handleRemoveFile}
                error={!!error}
            >
                {filename && <File.Item name={filename} />}
                {error && (
                    <Message style={{ marginTop: '1rem' }} appearance="fill" type="error">
                        {error}
                    </Message>
                )}
            </File>
        </div>
    );
}

SingleFileUpload.propTypes = {
    handleFileChange: prototype.func.isRequired,
    accept: prototype.string,
    fileType: prototype.string,
    sizeLimit: prototype.number,
};
