module.exports = {
    extends: [
        'eslint:recommended',
        'airbnb-base',
        'plugin:flowtype/recommended',
        'plugin:prettier/recommended'
    ],
    parser: 'babel-eslint',
    plugins: ['flowtype'],
    rules: {
        'prettier/prettier': [
            'error',
            {
                singleQuote: true,
                tabWidth: 4,
                printWidth: 80,
                bracketSpacing: true
            }
        ]
    }
};
