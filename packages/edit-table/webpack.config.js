const path = require('path');
const webpackMerge = require('webpack-merge');
const baseComponentConfig = require('@splunk/webpack-configs/component.config').default;

module.exports = webpackMerge(baseComponentConfig, {
    entry: {
        EditTable: path.join(__dirname, 'src/EditTable.jsx'),
    },
    output: {
        path: path.join(__dirname),
    },
});
