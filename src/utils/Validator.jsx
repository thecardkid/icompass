'use strict';

import { REGEX } from 'Lib/constants';

const MAX_STICKY_LEN = 300;

export default {
    validateStickyText(text) {
        // return [ validAsHyperlink, validAsText ]
        let isUrl = REGEX.URL.test(text);
        let hasWhitespace = REGEX.HAS_WHITESPACE.test(text);
        let validLength = text.length <= MAX_STICKY_LEN;
        if (isUrl) {
            return [ !hasWhitespace, validLength ];
        } else {
            return [ false, validLength ];
        }
    }
};
