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
