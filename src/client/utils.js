import natSort from "natsort";
import levenshtein from "fast-levenshtein";
import ApiClient from "~client/lib/ApiClient";

/**
 * parses "model" data from a drop event
 *
 * @export
 * @param {DragEvent} event
 * @returns {null | import("~client/lib/ClientModel").default}
 */
export function parseEventModelData(event) {
    let eventData = event.dataTransfer.getData("model");

    try {
        if (eventData) eventData = JSON.parse(eventData);
    } catch (error) {
        console.error(error);
        return null;
    }

    if (!eventData) eventData = ApiClient.store.collection("localStorage").internalDnDData;

    if (!eventData) return null;
    return ApiClient.store.getModelById(eventData.dataCollectionName, eventData._id);
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
        const exactSearch = search.toLocaleLowerCase().split(" ").filter((part) => {
            return Boolean(part);
        }).map((part) => {
            return name.search(part);
        }).reduce((total, value, index, array) => {
            if (index === array.length - 1) return (total + value) / name.length;
            return total + value;
        }, 0);

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
        if (bonus) return true;
        return distance <= minDistance;
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
