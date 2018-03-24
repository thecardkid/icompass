module.exports = {
    "parser": "babel-eslint",
    "env": {
        "browser": true,
        "node": true,
        "jquery": true,
        "mocha": true,
        "jasmine": true,
        "webdriverio/wdio": true,
    },
    "extends": [
        "eslint:recommended",
        "plugin:react/recommended"
    ],
    "parserOptions": {
        "ecmaVersion": 6,
        "ecmaFeatures": {
            "experimentalObjectRestSpread": true,
            "jsx": true
        },
        "sourceType": "module"
    },
    "plugins": [
        "react",
        "webdriverio",
        "jasmine"
    ],
    "rules": {
        "indent": 0,
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "always"
        ],
        "react/no-string-refs": 0,
        "react/jsx-indent": 0,
        "no-useless-escape": 0,
        "react/no-unescaped-entities": 0
    }
};
