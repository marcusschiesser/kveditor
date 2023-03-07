import * as csv from 'csvtojson';
import { projectFields } from './obj';

export const formatCSVData = (data, fields) => {
    const formattedJsonData = projectFields(data, fields);
    const headerLine = fields.map((column) => `"${column}"`).join(',');
    const csvRawData = formattedJsonData
        .map((row) => {
            const rowValues = fields.map((column) => {
                const value = row[column];
                if (typeof value === 'undefined') {
                    return '';
                }
                if (typeof value === 'string') {
                    return `"${value}"`;
                }
                return value;
            });
            const rowString = rowValues.join(',');
            return rowString;
        })
        .join('\n');
    return `${headerLine}\n${csvRawData}`;
};

export const convertToJSONArrayFromCSVString = async (csvString) => {
    const jsonData = await csv().fromString(csvString);
    return jsonData;
};
