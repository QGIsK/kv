/**
 * Internal helper to check if str is type string
 */
const isString = (str: any): boolean => {
    return typeof str === 'string' || str instanceof String;
};

/**
 * Internal helper to check if parameter is an array
 */
const isArray = (arr: any): boolean => {
    return Array.isArray(arr);
};

/**
 * Internal helper to check if string is empty
 */
const isStringEmpty = (str: string): boolean => {
    if (!isString(str)) return false;
    return str.length === 0;
};

/**
 * Internal helper to check if parameter is a date
 */
const isDate = (date: any): boolean => {
    if (isString(date) || isArray(date) || date === undefined || date === null) return false;
    return date && Object.prototype.toString.call(date) === '[object Date]' && !Number.isNaN(date);
};

/**
 * Internal helper to check if parameter is an object
 */
const isObject = (obj: any): boolean => {
    if (isArray(obj) || isDate(obj)) return false;
    return obj !== null && typeof obj === 'object';
};

/**
 *  Internal helper to check if parameter is a number
 */
const isNumber = (num: any): boolean => {
    return !Number.isNaN(num) && !Number.isNaN(parseInt(num));
};

/**
 * Internal helper to check if string includes
 */
const doesInclude = (string: string, includes: string): boolean => {
    return String(string).includes(includes);
};

export default {
    isString,
    isStringEmpty,
    isDate,
    isObject,
    isNumber,
    isArray,
    doesInclude,
};
