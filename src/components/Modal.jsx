'use strict';

import React from 'react';

let Modal = (component) => {
    return (
        <div id="ic-backdrop">
            {component}
        </div>
    );
};

export default Modal;
