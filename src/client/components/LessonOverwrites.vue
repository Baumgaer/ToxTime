<template>
    <div class="lessonsOverwrites">
        <div class="title">{{ model.getName() }}</div>
        <div class="field" v-for="(field, index) of allowedFields(model)" :key="`field_${field.name}_${index}`">
            <div class="key">{{ $t(field.name) }}</div>
            <div class="value">
                <input
                    :type="field.type"
                    :list="`datalist_${field.name}_${index}`"
                    :name="field.name"
                    :min="field.min"
                    :max="field.max"
                    :value="field.value"
                    :checked="field.value"
                    :disabled="field.disabled"
                    @change="overwriteValue(model, $event)"
                    :ref="`field_${field.name}_${index}`"
                />
                <datalist :id="`datalist_${field.name}_${index}`">
                    <option value="1">test</option>
                </datalist>
            </div>
        </div>
        <div v-for="(subObject, index) of model.getSubObjects(true)" :key="`sub_${subObject._id}_${index}`" class="subObject">
            <div class="title">{{ subObject.getName() }}</div>
            <div class="field" v-for="(field, index) of allowedFields(subObject)" :key="`field_${field.name}_${index}`">
                <div class="key">{{ $t(field.name) }}</div>
                <div class="value">
                    <input
                        :type="field.type"
                        :list="`datalist_${field.name}_${index}`"
                        :name="field.name"
                        :min="field.min"
                        :max="field.max"
                        :value="field.type !== 'model' ? field.value : field.value.getName()"
                        :checked="field.value"
                        :disabled="field.disabled"
                        @change="overwriteValue(subObject, $event)"
                        :ref="`field_${field.name}_${index}`"
                    />
                    <datalist :id="`datalist_${field.name}_${index}`">
                        <option value="1">test</option>
                    </datalist>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Lesson from "~client/models/Lesson";
import ActionObject from "~client/models/ActionObject";
import SceneObject from "~client/models/SceneObject";
import ClickArea from "~client/models/ClickArea";
import RecipeItem from "~client/models/RecipeItem";
import Scene from "~client/models/Scene";
import Requisite from "~client/models/Requisite";
import File from "~client/models/File";
import Label from "~client/models/Label";
import ClientModel from "~client/lib/ClientModel";

import ApiClient from "~client/lib/ApiClient";


export default {
    props: {
        lesson: {
            type: Lesson.RawClass,
            required: true
        },
        model: {
            type: ClientModel,
            required: true
        }
    },
    data() {
        return {
            amount: Object.freeze({ name: "amount", type: 'number', value: null, min: 0, max: Infinity, disabled: false }),
            activated: Object.freeze({ name: "activated", type: 'checkbox', value: true, disabled: false }),
            object: Object.freeze({ name: "object", type: 'model', value: null, disabled: false})
        };
    },
    methods: {
        allowedFields(model) {
            const amountValue = this.lesson.overwrites[model._id]?.amount ?? 1;
            if (model instanceof ActionObject.RawClass) return [{ ...this.amount, value: amountValue, disabled: true }, this.activated];
            if (model instanceof SceneObject.RawClass) return [{ ...this.amount, value: amountValue, min: 1 }];
            if (model instanceof ClickArea.RawClass) return [{ ...this.amount, value: amountValue }, this.activated];
            if (model instanceof RecipeItem.RawClass) return this.getRecipeItemFields(model);
            return [];
        },

        getRecipeItemFields(model) {
            const isRequisite = model.object instanceof Requisite.RawClass;
            const isScene = model.object instanceof Scene.RawClass;
            const isFile = model.object instanceof File.RawClass;
            const isActionObject = model.object instanceof ActionObject.RawClass;
            const isSceneObject = model.object instanceof SceneObject.RawClass;
            const isLabel = model.object instanceof Label.RawClass;

            const inScene = model.location === "scene";
            const isUnique = isScene || isFile || isActionObject || isSceneObject && inScene;

            const overwriteObject = this.lesson.overwrites[model._id];
            const amountValue = overwriteObject?.amount ?? model.amount;
            const objectValue = overwriteObject?.object ? ApiClient.store.getModelById(overwriteObject.object.split("_")[0], overwriteObject.object.split("_")[1]) : model.object;

            return [{
                ...this.amount,
                value: amountValue,
                min: isScene || isFile || isActionObject ? 1 : 0,
                max: isUnique ? 1 : Infinity,
                disabled: isActionObject || isScene || isFile
            }, {
                ...this.object,
                value: objectValue,
                disabled: !isRequisite && !isLabel || isScene || isFile
            }];
        },

        overwriteValue(model, event) {
            if (!(model._id in this.lesson.overwrites)) this.lesson.overwrites[model._id] = {};
            const input = event.target;
            let valueField = "value";
            if (input.type === "checkbox") valueField = "checked";

            let value = event.target.value;
            if (input.type !== "model") value = JSON.parse(input[valueField]);
            this.lesson.overwrites[model._id][input.name] = value;
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/LessonOverwrites.less"></style>
