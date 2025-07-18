/** @format */

// ESLint configuration for ESLint v9+

// ESLint v9+ flat config
import googleappsscript from 'eslint-plugin-googleappsscript';
import prettier from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';

export default [
  {
    files: ['**/*.js', '**/*.gs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...googleappsscript.environments.googleappsscript.globals,
        window: 'readonly',
        document: 'readonly',
        diff_match_patch: 'readonly',
      },
    },
    plugins: {
      googleappsscript,
      prettier: prettierPlugin,
    },
    rules: {
      ...prettier.rules,
      'prettier/prettier': 'warn',
      'no-undef': 'error',
    },
  },
];
