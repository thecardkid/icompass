
import { ERROR_MSG, REGEX } from 'Utils/constants.js';

export default {
    validateCompassCode(code) {
        if (!code)
            return [ false, ERROR_MSG.REQUIRED('A code') ];
        else if (code.length != 8)
            return [ false, ERROR_MSG.INVALID('Your code') ];

        return [ true, code ];
    },

    validateUsername(uname) {
        if (!uname)
            return [ false, ERROR_MSG.REQUIRED('Username') ];
        else if (uname.length > 15)
            return [ false, ERROR_MSG.TEXT_TOO_LONG('Username', 15) ];
        else if (uname.match(REGEX.CHAR_ONLY) != null)
            return [ false, ERROR_MSG.UNAME_HAS_NON_CHAR ];

        return [ true, uname ];
    },

    validateCenter(center) {
        if (!center)
            return [ false, ERROR_MSG.REQUIRED('People group') ];
        else if (center.length > 30)
            return [ false, ERROR_MSG.TEXT_TOO_LONG('People group', 30) ];

        return [ true, center ];
    },

    validateEmail(email) {
        if (!REGEX.EMAIL.test(email)) {
            return [ false, null ];
        }

        return [ true, email ];
    },

    validateStickyText(text) {
        // return [ validAsHyperlink, validAsText ]
        let isUrl = REGEX.URL.test(text);
        let hasWhitespace = REGEX.HAS_WHITESPACE.test(text);
        let validLength = text.length < 300;
        if (isUrl) {
            return [ !hasWhitespace, validLength ];
        } else {
            return [ false, validLength ];
        }
    }
};
