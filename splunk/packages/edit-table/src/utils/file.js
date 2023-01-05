export const downloadFile = (data, type, filename = 'download') => {
    const blob = new Blob([data], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
};

export const formatCSVData = (data, omitColumns) => {
    const omitData = data.map((row) => {
        const newRow = { ...row };
        omitColumns.forEach((column) => {
            delete newRow[column];
        });
        return newRow;
    });
    const columns = Object.keys(omitData[0]);
    const headerLine = columns.map((column) => `"${column}"`).join(',');
    const csvRawData = omitData
        .map((row) => {
            return Object.values(row)
                .map((value) => {
                    if (typeof value === 'string') {
                        return `"${value}"`;
                    }
                    return value;
                })
                .join(',');
        })
        .join('\n');
    return `${headerLine}\n${csvRawData}`;
};

export const checkJsonObjectCorrectFormat = (jsonObject, dataFields) => {
    return dataFields.every((field) => field in jsonObject);
};

export const checkJsonDataCorrectFormat = (jsonData, dataFields) => {
    return jsonData.every((jsonObject) => checkJsonObjectCorrectFormat(jsonObject, dataFields));
};

/**
 * This function remove the fields that are not in dataFields from the json data
 */
export const formatJsonData = (jsonData, dataFields) => {
    return jsonData.map((jsonObject) => {
        const formattedObject = {};
        dataFields.forEach((field) => {
            formattedObject[field] = jsonObject[field];
        });
        return formattedObject;
    });
};
