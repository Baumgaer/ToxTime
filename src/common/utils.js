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
 * Collects all method names of a given object
 *
 * @export
 * @param {Object} toCheck
 * @returns {string[]}
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
 * @param {any} doc The database document
 * @param {any} ret The pre passed value which will be returned
 * @param {any} modelClass The model class (NOT INSTANCE!) which is dependant
 */
export function dataTransformer(doc, ret, modelClass) {
    ret.className = modelClass.className;
    ret.collection = modelClass.collection;
}

/**
 * Capitalizes the first character of the given string
 *
 * @export
 * @param {string} string
 * @returns {string}
 */
export function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Converts a csv string into an array of objects
 *
 * @export
 * @param {string} csv
 * @param {{colSeparator?: string, rowSeparator?: string}} params
 * @returns {Record<string, any>[]}
 */
export function csvToObject(csv, params) {

    csv = csv.trim();
    const colSeparator = params?.colSeparator || ",";
    const rowSeparator = params?.rowSeparator || "\n";

    const lines = csv.split(rowSeparator).map((entry) => entry.trim());
    const result = [];
    const headers = lines[0].split(colSeparator).map((entry) => entry.trim().substring(1, entry.trim().length - 1));

    for (let i = 1; i < lines.length; i++) {
        const obj = {};
        let currentLine = lines[i].split(colSeparator).map((entry) => entry.trim());
        for (let j = 0; j < headers.length; j++) {
            try {
                obj[headers[j]] = JSON.parse(currentLine[j]);
            } catch (error) {
                obj[headers[j]] = currentLine[j];
            }
        }
        if (params?.onData) params.onData(obj);
        result.push(obj);
    }

    return result;
}

/**
 * Generates an excluding filter to avoid to send data to other environment,
 * which is not allowed to send to.
 *
 * @export
 * @param environmentExport
 */
export function dbEnvironmentFilter(environmentExport) {
    let keysToExclude = Object.keys(environmentExport.RawClass.schema || {}).map((key) => `-${key}`);

    let commonProto = Object.getPrototypeOf(environmentExport.RawClass);
    let environmentProto = Object.getPrototypeOf(commonProto);
    while (environmentProto) {
        keysToExclude = keysToExclude.concat(Object.keys(environmentExport.RawClass.schema || {}).map((key) => `-${key}`));
        commonProto = Object.getPrototypeOf(environmentProto);
        if (!commonProto) break;
        environmentProto = Object.getPrototypeOf(commonProto);
    }
    return keysToExclude;
}
