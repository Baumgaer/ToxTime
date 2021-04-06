import lodash, { isUndefined, isNull } from "lodash";
import { isMongoId as validatorIsMongoId } from "validator";
import onChange from "on-change";
import imageCompression from "browser-image-compression";
import natSort from "natsort";
import levenshtein from "fast-levenshtein";

import deepdash from "deepdash";
deepdash(lodash);

export const eachDeep = lodash.eachDeep;

export * from "lodash";

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
 * Converts a kebab-case string into a camelCase string
 *
 * @export
 * @param {string} string the string to convert
 * @returns {string} the converted string
 */
export function kebabCaseToCamelCase(str) {
    let arr = str.split('-');
    let capital = arr.map((item, index) => index ? capitalize(item) : item.toLowerCase());
    let camelString = capital.join("");
    return camelString;
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
 * @param {InstanceType<import("mongoose")["Document"]>} doc The database document
 * @param {Record<string, any>} ret The pre passed value which will be returned
 * @param {typeof import("~common/lib/BaseModel").default} modelClass The model class (NOT INSTANCE!) which is dependant
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
 * Uncapitalizes the first character of the given string
 *
 * @export
 * @param {string} string
 * @returns {string}
 */
export function unCapitalize(string) {
    return string.charAt(0).toLowerCase() + string.slice(1);
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

/**
 * Checks if value is a real value and compares the proxy target with the given value
 * if target and value are equal, it is not a proxy.
 *
 * @export
 * @param {any} value
 * @returns {boolean}
 */
export function isProxy(value) {
    if (!isValue(value)) return false;
    if (onChange.target(value) === value) return false;
    return true;
}

/**
 * Iterates all proxy layers recursive to get the original object
 *
 * @export
 * @param {any} value
 * @returns {any}
 */
export function resolveProxy(value) {
    if (!isProxy(value)) return value;
    return resolveProxy(onChange.target(value));
}

/**
 * Iterates an object's prototypes recursive and collects the names
 *
 * @param {Object} object The object where the prototype names should get from recursively
 * @returns {string[]} The prototype names
 */
export function getPrototypeNamesRecursive(object) {

    const prototypes = [];

    /**
     * Does the recursion
     *
     * @param theObject The recursive needed object
     */
    function getThem(theObject) {
        const prototype = Object.getPrototypeOf(theObject);
        if (prototype) {
            prototypes.push(prototype.constructor.name);
            getThem(prototype);
        }
    }

    getThem(object);
    return prototypes;
}

/**
 * Checks if a given value is not null and not undefined
 *
 * @template T
 * @param value the value to check if it is a real value
 * @returns true if value has another value than undefined or null and false else
 */
export function isValue(value) {
    return !isUndefined(value) && !isNull(value);
}

/**
 * Checks if the value is a wrapper version of a primitive
 *
 * @param value The value to check for primitive wrapper
 * @returns true if it is a primitive wrapper and false else
 */
export function isPrimitiveWrapper(value) {
    if (!isValue(value)) return false;
    return [String, Number, Boolean, Symbol].includes(value);
}

/**
 * Checks if a given value is a mongo id format. Will also check if it is a string
 * or not (what the original function does not...).
 *
 * @export
 * @param {any} value
 * @returns {boolean}
 */
export function isMongoId(value) {
    if (typeof value !== "string") return false;
    return validatorIsMongoId(value);
}

/**
 * converts an svg string to base64 png using the domUrl
 * @param {string} svgText the svgtext
 * @return {Promise<File>} a promise to the bas64 png image
 */
export function svgToPng(svgText, options = {}) {
    // convert an svg text to png using the browser
    return new Promise((resolve, reject) => {
        try {
            // it needs a namespace
            if (!svgText.match(/xmlns="/mi)) svgText = svgText.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ');

            // make a blob from the svg, convert it to a url and assign this url to an image
            const svg = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" });

            imageCompression(svg, Object.assign({
                fileType: "image/png",
                maxWidthOrHeight: 500,
                maxSizeMB: 2,
                initialQuality: 0.5
            }, options)).then((file) => {
                resolve(file);
            });
        } catch (err) {
            reject(err);
        }
    });
}

/**
 * sorts and filters a given list with given search string
 *
 * @export
 * @param {import("~common/lib/BaseModel").default[]} list
 * @param {string} search
 */
export function itemFilterAndSort(list, search = "") {
    const levenshteinValues = {};
    return list.filter((item) => {
        if (!search) return true;

        /** @type {string} */
        const name = item.getName().toLowerCase();
        const distance = levenshtein.get(name, search) / name.length;
        const exactSearch = name.search(search);

        let bonus = 0;
        if (exactSearch >= 0) bonus = 1 - exactSearch / name.length;
        levenshteinValues[name] = { distance, bonus };

        return true;
    }).filter((item) => {
        if (!search) return true;
        const name = item.getName().toLowerCase();
        const minDistance = Math.min(...Object.values(levenshteinValues).map((value) => value.distance));
        const distance = levenshteinValues[name].distance;
        const bonus = levenshteinValues[name].bonus;
        return distance - bonus <= minDistance;
    }).sort((a, b) => {
        if (search) {
            const aName = a.getName().toLowerCase();
            const bName = b.getName().toLowerCase();

            const aDistance = levenshteinValues[aName].distance;
            const aBonus = levenshteinValues[aName].bonus;
            const aLevVal = aDistance - aBonus;

            const bDistance = levenshteinValues[bName].distance;
            const bBonus = levenshteinValues[bName].bonus;
            const bLevVal = bDistance - bBonus;

            return aLevVal - bLevVal;
        }

        if (b === window.activeUser) return 1;
        return b.isAdmin - a.isAdmin || b.isConfirmed - a.isConfirmed || b.isActive - a.isActive || natSort()(a.getName(), b.getName());
    });
}
