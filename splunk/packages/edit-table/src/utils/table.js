export const getTableMetaData = (dataSources) => {
    const data = dataSources?.primary?.data;
    const meta = dataSources?.primary?.meta;

    if (data == null || meta == null) {
        return null;
    }

    const idColumnKey = '_key';
    const dataFields = data.fields
        .map((field) => field.name)
        .filter((name) => name !== idColumnKey);
    const totalItems = meta.resultCount;

    return {
        dataFields,
        totalItems,
    };
};
