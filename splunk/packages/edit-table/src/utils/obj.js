export const checkJsonObjectCorrectFormat = (jsonObject, dataFields) => {
    return dataFields.every((field) => field in jsonObject);
};

export const checkJsonArrayCorrectFormat = (jsonArray, dataFields) => {
    return jsonArray.every((jsonObject) => checkJsonObjectCorrectFormat(jsonObject, dataFields));
};

/**
 * This function creates a new array from the given array `data`.
 * All objects in `data` are copied but just the fields defined in `fields` are copied.
 */
export const projectFields = (data, fields) => {
    return data.map((obj) => {
        const newObj = {};
        fields.forEach((field) => {
            newObj[field] = obj[field];
        });
        return newObj;
    });
};
