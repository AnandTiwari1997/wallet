var path = require('path');

const noRestrictedImportsPatterns = ['./*', '../*'];
module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
        sourceType: 'module',
        requireConfigFile: false,
        ecmaFeatures: {
            blockBindings: true,
            jsx: true,
            modules: true,
            tsx: true
        },
        babelOptions: {
            parserOpts: {
                plugins: ['typescript']
            }
        }
    },
    plugins: [
        'react',
        'import',
        'no-only-tests',
        'no-unsanitized',
        'react-hooks',
        'typescript',
        'prettier'
    ],
    rules: {
        'array-callback-return': ['error'],
        'brace-style': 'error',
        'comma-style': ['error', 'last'],
        curly: ['error', 'all'],
        'dot-notation': ['error', { allowKeywords: true }],
        'eol-last': 'error',
        eqeqeq: ['error', 'always'],
        'import/order': [
            'error',
            {
                'newlines-between': 'always',
                groups: ['builtin', 'external', 'internal', ['sibling', 'parent'], 'index'],
                alphabetize: {
                    order: 'asc'
                }
            }
        ],
        'import/namespace': 'error',
        'import/no-duplicates': 'error',
        'import/no-extraneous-dependencies': [
            'error',
            {
                devDependencies: [
                    'polyfill.js',
                    '*.config.*'
                ]
            }
        ],
        'import/no-self-import': 'error',
        'import/no-unresolved': 'error',
        'jsx-quotes': ['error', 'prefer-double'],
        'keyword-spacing': ['error', { before: true, after: true }],
        'max-params': ['error', { max: 5 }],
        'max-statements-per-line': ['error', { max: 1 }],
        'no-cond-assign': 'error',
        'no-console': ['error', { allow: ['warn', 'error'] }],
        'no-debugger': 'error',
        'no-dupe-args': 'error',
        'no-dupe-keys': 'error',
        'no-duplicate-case': 'error',
        'no-eq-null': 'off',
        'no-empty-function': 'off',
        'no-ex-assign': 'error',
        'no-fallthrough': 'error',
        'no-func-assign': 'error',
        'no-loop-func': 'error',
        'no-mixed-spaces-and-tabs': 'error',
        'no-multi-str': 'error',
        'no-nested-ternary': 'error',
        'no-only-tests/no-only-tests': 'error',
        'no-param-reassign': ['error', { props: true, ignorePropertyModificationsForRegex: ['.*[dD]raft.*'] }],
        'no-restricted-imports': [
            'error',
            {
                patterns: noRestrictedImportsPatterns
            }
        ],
        'no-sparse-arrays': 'error',
        'no-tabs': 'error',
        'no-this-before-super': 'error',
        'no-throw-literal': 'error',
        'no-undef': 'error',
        'no-unexpected-multiline': 'error',
        'no-unsafe-finally': 'error',
        'no-unsafe-negation': 'error',
        'no-unsafe-optional-chaining': ['error', { disallowArithmeticOperators: true }],
        'no-unsanitized/method': 'error',
        'no-unsanitized/property': 'error',
        'no-unreachable': 'error',
        'no-unused-vars': ['error', { vars: 'local', args: 'after-used' }],
        'no-useless-concat': 'error',
        'no-warning-comments': ['error', { terms: ['todo'] }],
        'one-var': ['error', 'never'],
        'one-var-declaration-per-line': ['error', 'always'],
        'prefer-const': ['error', { destructuring: 'any', ignoreReadBeforeAssign: true }],
        'react/no-access-state-in-setstate': 2,
        'react/no-danger': 'error',
        'react/no-deprecated': 'error',
        'react/no-direct-mutation-state': 'error',
        'react/no-arrow-function-lifecycle': 'error',
        'react/no-string-refs': 'error',
        'react/no-this-in-sfc': 'error',
        'react/no-unused-class-component-methods': 'error',
        'react/no-unused-prop-types': 'error',
        'react/no-unknown-property': ['error', { ignore: ['css'] }],
        'react/no-unstable-nested-components': ['error', { allowAsProps: true }],
        'react/prefer-stateless-function': ['error', { ignorePureComponents: true }],
        'react/prop-types': [2, { ignore: ['dispatch', 'translate'] }],
        'react/require-render-return': 'error',
        'react/sort-default-props': ['error', { ignoreCase: true }],
        'react/sort-prop-types': ['error', { ignoreCase: true }],
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'error',
        'require-await': 'error',
        'space-before-blocks': 'error',
        'use-isnan': 'error',
        'valid-typeof': ['error', { requireStringLiterals: true }],
        'valid-jsdoc': 'error',
        'space-infix-ops': ['error', { int32Hint: false }]
    },
    env: {
        es6: true,
        browser: true,
        node: true
    },
    extends: ['plugin:prettier/recommended'],
    globals: {
        ga: true
    }
};
