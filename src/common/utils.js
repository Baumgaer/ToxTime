/**
 * Removes multiple slashes from a path part and converts the result to a
 * correct part starting with a "/" and ending with not a "/".
 *
 * @param {string} value The "path" of an URL
 * @returns {string} The corrected path of an "URL"
 */
export function toURIPathPart(value) {
    console.log("JA NE:", value);
    value = value.replace(/\/+/g, "/");
    if (!value.startsWith("/")) value = `/${value}`;
    if (value.endsWith("/") && value.length > 1) {
        value = value.slice(0, -1);
    }
    return value;
}
