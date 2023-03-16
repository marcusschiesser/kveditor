module.exports = {
    extends: '@splunk/eslint-config/browser-prettier',
    rules: {
        'no-useless-escape': 'off',
        'consistent-return': 'off',
        'no-underscore-dangle': 'off',
        'no-unused-vars': 'warn',
        'curly': 'off',
        'no-console': [
            'warn',
            {
                allow: ['warn', 'error', 'info'],
            },
        ]
    },
};
