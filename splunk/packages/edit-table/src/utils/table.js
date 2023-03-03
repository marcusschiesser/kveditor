export const getTableMetaData = (dataSources) => {
    const data = dataSources?.primary?.data;
    const meta = dataSources?.primary?.meta;

    if (data == null || meta == null) {
        return null;
    }

    const dataFields = data.fields.map((field) => field.name);
    const totalItems = meta.resultCount;

    return {
        dataFields,
        totalItems,
    };
};
