// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

module.exports = {
  env: {
    browser: true,
    "jest/globals": true,
  },
  globals: {
    JSX: true,
    NodeJS: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "airbnb",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 8,
    sourceType: "module",
  },
  plugins: [
    "react",
    "jest", "header"],
  rules: {
    "linebreak-style": ["error", "windows"],
    "no-debugger": "warn",
    "react/prop-types": "off",
    "react/jsx-filename-extension": ["error", { extensions: [".tsx", ".jsx"] }],
    "react/require-default-props": "off",
    "react/no-unused-prop-types": "off",
    "react/destructuring-assignment": "off",
    "import/extensions": "off",
    "import/no-unresolved": "off",
    quotes: ["error", "double"],
    semi: ["error", "always"],
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": ["warn"],
    "no-shadow": "off",
    "@typescript-eslint/no-shadow": ["error"],
    "@typescript-eslint/no-explicit-any": "off",
    "header/header": [2, "line", [" Copyright (c) Microsoft Corporation.", " Licensed under the MIT License."]],
  },
  overrides: [{
    files: ["*.js"],
    rules: {
      "@typescript-eslint/no-var-requires": "off",
    },
  }],
};
