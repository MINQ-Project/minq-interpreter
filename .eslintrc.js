module.exports = {
    parser: '@typescript-eslint/parser',  // Specifies the ESLint parser
    extends: [
      'plugin:@typescript-eslint/recommended',  // Uses the recommended rules from the @typescript-eslint/eslint-plugin
    ],
    parserOptions: {
      ecmaVersion: 2020,  // Allows for the parsing of modern ECMAScript features
      sourceType: 'module',  // Allows for the use of imports
    },
    rules: {
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/no-explicit-any": "off"
    },
  };
  