module.exports = {
  env: {
    "es6": true,
    "node": true,
    "browser": true
  },
  plugins: [  ],
  extends: [
    "airbnb-base",
  ],
  globals: {
    "Atomics": "readonly",
    "SharedArrayBuffer": "readonly",
    "window": true,
  },
  parserOptions: {
    "ecmaVersion": 2018,
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    }
  },
  rules: {
    "indent": ["error", "tab"],
    "quotes": ["error", "double"],
    "max-len": ["error", { ignoreComments: true, code: 100 }],
    "no-tabs": ["error", { allowIndentationTabs: true }],
    "no-console": "off",
    "no-multi-str": "off",
    "no-underscore-dangle": "off",
    "react/jsx-no-bind": ["error", {
      "allowArrowFunctions": true,
      "allowBind": false,
      "ignoreRefs": true
    }],
    "react/no-did-update-set-state": "error",
    "react/react-in-jsx-scope": "off",
    "react/no-unknown-property": "off",
    "react/display-name": "off",
    "react/jsx-uses-vars": 2,
  },
};
