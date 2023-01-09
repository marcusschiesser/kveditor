import * as csv from 'csvtojson';

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

export const convertToJSONArrayFromCSVString = async (csvString) => {
    const jsonData = await csv().fromString(csvString);
    return jsonData;
};
