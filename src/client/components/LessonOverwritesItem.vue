<template>
    <div class="lessonOverwritesItem">
        <div class="title">{{ model.getName() }}</div>
        <div class="field" v-for="(field, index) of model.getOverwritableFields(lesson)" :key="`field_${field.name}_${index}`">
            <div class="key">{{ $t(field.name) }}</div>
            <div class="value">
                <input
                    v-if="field.type !== 'model'"
                    :type="field.type"
                    :name="field.name"
                    :min="field.min"
                    :max="field.max"
                    :value="field.value"
                    :checked="field.value"
                    :disabled="field.disabled"
                    @change="overwriteValue(model, $event)"
                    :ref="`field_${field.name}_${index}`"
                />
                <div v-else class="specificObjectSelector" @click="openItemSelector(`specify_${model._id}_${index}`)">
                    <Item
                        :model="field.value"
                        :compactMode="true"
                        :showTooltip="false"
                        :showSubObjects="false"
                        draggable="false"
                        :ref="`specify_${model._id}_${index}`"
                        :style="`${field.disabled ? 'opacity: 0.8; pointer-events: none' : ''}`"
                    />
                    <ItemSelector
                        v-if="itemSelector === `specify_${model._id}_${index}` && !field.disabled"
                        :model="model"
                        :attribute="'object'"
                        :attachTo="$refs[`specify_${model._id}_${index}`][0].$el"
                        :selectionFunction="getSpecificObject"
                        :showAddButton="false"
                        :autoSave="false"
                        :itemClickFunction="(selection) => { onSpecification(model, selection) }"
                    />
                </div>
            </div>
        </div>
        <div class="subObjects">
            <lesson-overwrites-item v-for="(subObject, index) of subObjects" :key="`${model._id}_${subObject._id}_${index}`" :model="subObject" :lesson="lesson"/>
        </div>
    </div>
</template>

<script>
import ClientModel from "~client/lib/ClientModel";
import Lesson from "~client/models/Lesson";
import Recipe from "~client/models/Recipe";
import RecipeItem from "~client/models/RecipeItem";
import ActionObject from "~client/models/ActionObject";

import ItemSelector from "~client/components/ItemSelector";
import Item from "~client/components/Item";

export default {
    name: "lesson-overwrites-item",
    components: {
        Item,
        ItemSelector
    },
    props: {
        model: {
            type: ClientModel,
            required: true
        },
        lesson: {
            type: Lesson.RawClass,
            required: true
        }
    },
    data() {
        return {
            itemSelector: ""
        };
    },
    computed: {
        subObjects() {
            const recursiveSubObjects = (recursiveModel) => {
                const result = [];
                const subObjects = recursiveModel.getSubObjects(recursiveModel instanceof Recipe.RawClass);
                for (const subObject of subObjects) {
                    if (subObject instanceof RecipeItem.RawClass) {
                        if (subObject.speechBubble) result.push(subObject.speechBubble);
                        else if (subObject.recipe) result.push(subObject.recipe);
                        else if (this.model instanceof Recipe.RawClass) result.push(subObject);
                        else result.push(...recursiveSubObjects(subObject));
                    } else result.push(subObject);
                }
                return result;
            };
            if (this.model instanceof RecipeItem.RawClass && !this.model.speechBubble && !this.model.recipe) return [];
            return recursiveSubObjects(this.model);
        }
    },

    methods: {
        openItemSelector(name) {
            this.itemSelector = name;
        },

        getSpecificObject(model) {
            let specificObjects = this.lesson.getSpecificObjectsFor(model.object).filter((specificObject) => {
                const isActionObject = specificObject instanceof ActionObject.RawClass;
                const amountTooHigh = (this.lesson.getOverwrite(model, "amount") ?? model.amount) > 1;
                if (isActionObject && amountTooHigh) return false;
                return true;
            });
            specificObjects.push(model.object);
            return specificObjects;
        },

        overwriteValue(model, event) {
            const input = event.target;
            let valueField = "value";
            if (input.type === "checkbox") valueField = "checked";

            let value = event.target.value;
            if (input.type !== "model") value = JSON.parse(input[valueField]);
            this.lesson.setOverwrite(model, input.name, value);
            for (const entity of this.lesson.entities) {
                entity.overwrites.__ob__?.dep.notify();
            }
            this.lesson.overwrites.__ob__?.dep.notify();
        },

        onSpecification(model, selection) {
            if (model instanceof RecipeItem.RawClass && selection instanceof ActionObject.RawClass) {
                this.lesson.setOverwrite(model, "amount", Math.min(model.amount, 1));
            }
            this.lesson.setOverwrite(model, "object", `${selection.dataCollectionName}_${selection._id}`);
            this.lesson.overwrites.__ob__.dep.notify();
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/LessonOverwritesItem.less"></style>
