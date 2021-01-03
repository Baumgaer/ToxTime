/**
 * Removes multiple slashes from a path part and converts the result to a
 * correct part starting with a "/" and ending with not a "/".
 *
 * @param {string} value The "path" of an URL
 * @returns {string} The corrected path of an "URL"
 */
export function toURIPathPart(value) {
    value = value.replace(/\/+/g, "/");
    if (!value.startsWith("/")) value = `/${value}`;
    if (value.endsWith("/") && value.length > 1) {
        value = value.slice(0, -1);
    }
    return value;
}

/**
 * Converts a camelCase string into a kebab-case string
 *
 * @export
 * @param {string} string the string to convert
 * @returns {string} the converted string
 */
export function camelCaseToKebabCase(string) {
    return string.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 *
 *
 * @export
 * @param {Object} toCheck
 * @returns
 */
export function getAllFuncs(toCheck) {
    let props = [];
    let obj = toCheck;

    do {
        props = props.concat(Object.getOwnPropertyNames(obj));
        obj = Object.getPrototypeOf(obj);
    } while (obj);

    return props.sort().filter((e, i, arr) => {
        if (e != arr[i + 1] && typeof toCheck[e] == 'function') return true;
    });
}

/**
 * Handles transformation of data of the database
 *
 * @export
 * @param doc The database document
 * @param ret The pre passed value which will be returned
 * @param modelClass The model class (NOT INSTANCE!) which is dependant
 */
export function dataTransformer(doc, ret, modelClass) {
    ret.className = modelClass.className;
}
