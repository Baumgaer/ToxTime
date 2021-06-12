import { Schema } from "mongoose";
import { uniq, isValue } from "~common/utils";
import natSort from "natsort";

/**
 * @typedef {import("~common/lib/BaseModel")["default"]} BaseModel
 */

/**
 * Creates a new class with the returned class extended by the MixinClass
 *
 * @export
 * @template T
 * @param {T} MixinClass
 * @returns {Entity & T}
 */
export function EntityMixinClass(MixinClass) {
    class Entity extends MixinClass {

        static className = "Entity";
        static dataCollectionName = "entities";

        /** @type {import("mongoose").SchemaDefinition} */
        static schemaDefinition = {
            name: {
                default: `Entity`
            },
            actionObjects: {
                type: [{ type: Schema.Types.ObjectId, ref: "ActionObject", autopopulate: true }],
                default: [],
                sticky: true,
                ignoreOnIteration: true
            },
            clickAreas: {
                type: [{ type: Schema.Types.ObjectId, ref: "ClickArea", autopopulate: true }],
                default: [],
                sticky: true,
                ignoreOnIteration: true
            },
            currentPhenotype: {
                type: Schema.Types.ObjectId,
                ref: "ActionObject",
                default: null,
                autopopulate: true,
                sticky: true,
                ignoreOnIteration: true
            },
            overwrites: {
                type: Schema.Types.Mixed,
                required: true,
                default: {}
            }
        };

        getSubObjects() {
            return this.actionObjects.concat(this.clickAreas);
        }

        getLabels() {
            const resources = [];
            const subObjects = this.getSubObjects();
            for (const subObject of subObjects) {
                resources.push(...subObject.getResources());
            }
            return uniq(resources).filter((resource) => resource._getClassName() === "Label");
        }

        /**
         * Returns the overwrite value of the property based on the models best
         * bucket or in case of property "activated" based on schema field
         * "currentPhenotype".
         *
         * @param {BaseModel} model
         * @param {"amount" | "activated"} property
         * @returns {number | boolean | null}
         * @memberof Entity
         */
        getOverwrite(model, property) {
            if (property === "activated") return this.currentPhenotype === model;
            const bucket = this.getBestBucket(model);
            if (!this.overwrites[bucket] && !isValue(this.overwrites[bucket])) this.overwrites[bucket] = {};
            return this.overwrites[bucket][property] ?? null;
        }

        /**
         * Sets the overwrite value of the property based on the models best
         * bucket or in case of property "activated" based on schema field
         * "currentPhenotype" and returns the set value where null means "not set"
         *
         * @param {BaseModel} model
         * @param {"amount" | "activated"} property
         * @param {number | boolean} value
         * @returns
         * @memberof Entity
         */
        setOverwrite(model, property, value) {
            if (property != "amount" && property !== "activated") return null;
            if (property === "activated") {
                if (this.actionObjects.includes(model)) {
                    this.currentPhenotype = value ? model : null;
                    return value ? true : false;
                }
                return null;
            }
            const bucket = this.getBestBucket(model);
            if (!this.overwrites[bucket] && !isValue(this.overwrites[bucket])) this.overwrites[bucket] = {};
            this.overwrites[bucket][property] = value;
            return value;
        }

        getBestBucket(model) {
            const modelLabels = model._getClassName() === "label" ? [model] : model.getLabels();
            const resources = [];
            const subObjects = this.getSubObjects();
            for (const subObject of subObjects) {
                resources.push(...subObject.getResources());
            }

            const labels = resources.filter((resource) => resource._getClassName() === "Label");
            /** @type {[name: string]: number} */
            const buckets = {};
            for (const label of labels) {
                if (!buckets[label._id]) buckets[label._id] = 0;
                buckets[label._id]++;
            }

            const sortedBuckets = Object.keys(buckets).sort((key1, key2) => natSort()(buckets[key2], buckets[key1]) || natSort()(key1, key2));
            for (const bucket of sortedBuckets) {
                if (modelLabels.map((label) => label._id).includes(bucket)) return bucket;
            }

            return '__$$no_bucket$$__';
        }
    }
    return Entity;
}
