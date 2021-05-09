<template>
    <div class="lessonsOverwrites">
        <div class="title">{{ model.getName() }}</div>
        <div class="field" v-for="(field, index) of allowedFields(model)" :key="`field_${field.name}_${index}`">
            <div class="key">{{ $t(field.name) }}</div>
            <div class="value">
                <input
                    :type="field.type.name.toLowerCase()"
                    :name="field.name"
                    :min="field.min"
                    :max="field.max"
                    :value="field.value"
                    :disabled="field.disabled"
                />
            </div>
        </div>
        <div v-for="(subObject, index) of model.getSubObjects(true)" :key="`sub_${subObject._id}_${index}`" class="subObject">
            <div class="title">{{ subObject.getName() }}</div>
            <div class="field" v-for="(field, index) of allowedFields(subObject)" :key="`field_${field.name}_${index}`">
                <div class="key">{{ $t(field.name) }}</div>
                <div class="value">
                    <input
                        :type="field.type.name.toLowerCase()"
                        :name="field.name"
                        :min="field.min"
                        :max="field.max"
                        :value="field.value"
                        :disabled="field.disabled"
                    />
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
            amount: Object.freeze({ name: "amount", type: Number, value: 1, min: 0, max: Infinity, disabled: false }),
            activated: Object.freeze({ name: "activated", type: Boolean, value: true, disabled: false }),
            specialization: Object.freeze({ name: "specialization", type: ClientModel, value: "lol", disabled: false})
        };
    },
    methods: {
        allowedFields(model) {
            if (model instanceof ActionObject.RawClass) return [{...this.amount, value: 1, disabled: true}, this.activated];
            if (model instanceof SceneObject.RawClass) return [this.amount];
            if (model instanceof ClickArea.RawClass) return [this.amount, this.activated];
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

            const amountValue = this.lesson.overwrites[model._id]?.amount ?? model.amount;
            return [{
                ...this.amount,
                value: amountValue,
                min: isScene || isFile || isActionObject ? 1 : 0,
                max: isUnique ? 1 : Infinity,
                disabled: isActionObject || isScene || isFile
            }, {
                ...this.specialization,
                disabled: !isRequisite && !isLabel || isScene || isFile
            }];
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/LessonOverwrites.less"></style>
