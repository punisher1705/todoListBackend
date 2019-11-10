'use strict'

let trim = (x) => {
    let value = String(x)
    return value.replace(/^\s+|\s+$/gm, '')
}

let isEmpty = (value) => {
    if(value === null || value === '' || value === undefined) {
        return true;
    } else {
        return false;
    }
}

module.exports = {
    isEmpty: isEmpty,
    trim: trim
}