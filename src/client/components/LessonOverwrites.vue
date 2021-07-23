<template>
    <div class="lessonsOverwrites">
        <div class="lessonsOverwritesAnchor" ref="tippyReference"></div>
        <div class="lessonsOverwritesContent" ref="tippyContent">
            <div class="title">{{ model.getName() }} <close-icon @click="hide" /></div>
            <div class="field" v-for="(field, index) of allowedFields(model)" :key="`field_${field.name}_${index}`">
                <div class="key">{{ $t(field.name) }}</div>
                <div class="value">
                    <input
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
                </div>
            </div>
            <div v-for="(subObject, index) of resources" :key="`sub_${subObject._id}_${index}`" class="subObject">
                <div class="title">{{ subObject.getName() }}</div>
                <div class="field" v-for="(field, index) of allowedFields(subObject)" :key="`field_${field.name}_${index}`">
                    <div class="key">{{ $t(field.name) }}</div>
                    <div class="value">
                        <input
                            v-if="field.type !== 'model'"
                            :type="field.type"
                            :name="field.name"
                            :min="field.min"
                            :max="field.max"
                            :value="field.type !== 'model' ? field.value : field.value.getName()"
                            :checked="field.value"
                            :disabled="field.disabled"
                            @change="overwriteValue(subObject, $event)"
                            :ref="`field_${field.name}_${index}`"
                        />
                        <div v-else class="specificObjectSelector" @click="openItemSelector(`specify_${subObject._id}_${index}`)">
                            <Item
                                :model="field.value"
                                :compactMode="true"
                                :showTooltip="false"
                                :showSubObjects="false"
                                draggable="false"
                                :ref="`specify_${subObject._id}_${index}`"
                                :style="`${field.disabled ? 'opacity: 0.8; pointer-events: none' : ''}`"
                            />
                            <ItemSelector
                                v-if="itemSelector === `specify_${subObject._id}_${index}` && !field.disabled"
                                :model="subObject"
                                :attribute="'object'"
                                :attachTo="$refs[`specify_${subObject._id}_${index}`][0].$el"
                                :selectionFunction="getSpecificObject"
                                :showAddButton="false"
                                :autoSave="false"
                                :itemClickFunction="(selection) => { onSpecification(subObject, selection) }"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Lesson from "~client/models/Lesson";
import ActionObject from "~client/models/ActionObject";
import Recipe from "~client/models/Recipe";
import RecipeItem from "~client/models/RecipeItem";
import Scene from "~client/models/Scene";
import ClientModel from "~client/lib/ClientModel";

import ItemSelector from "~client/components/ItemSelector";
import Item from "~client/components/Item";

import tippyJS, { sticky, hideAll } from "tippy.js";

export default {
    components: {
        ItemSelector,
        Item
    },
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
            itemSelector: "",
            lastAttachPoint: null,
            lastTimeout: null
        };
    },
    watch: {
        model() {
            this.itemSelector = "";
        }
    },
    computed: {
        resources() {
            const recursiveSubObjects = (model, ...args) => {
                const result = [];
                const subObjects = model.getSubObjects(...args);
                result.push(...subObjects);
                for (const subObject of subObjects) {
                    result.push(...recursiveSubObjects(subObject, ...args));
                }
                return result;
            };
            if (this.model instanceof Recipe.RawClass) return this.model.getSubObjects(true);
            if (this.model instanceof Scene.RawClass) {
                return recursiveSubObjects(this.model);
            }
            return [];
        },

        allowedFields() {
            return (model) => {
                return model.getOverwritableFields(this.lesson);
            };
        }
    },
    mounted() {
        const editorBody = this.$parent.$refs.editorBody;
        editorBody.appendChild(this.$refs.tippyReference);
        this.tippy = tippyJS(this.$refs.tippyReference, {
            appendTo: this.$root.$el,
            content: this.$refs.tippyContent,
            theme: "material lessonOverwrites",
            showOnCreate: false,
            arrow: true,
            sticky: true,
            interactive: true,
            interactiveBorder: 20,
            plugins: [sticky],
            hideOnClick: false,
            zIndex: 10,
            trigger: "manual",
            placement: "auto",
            onHidden: () => hideAll(this.tippy)
        });
    },
    methods: {

        /**
         * @param {Event} event
         */
        updatePosition(event) {
            setTimeout(() => {
                const ele = this.$refs.tippyReference;
                let attachPoint = event.target;
                if (["scroll", "wheel"].includes(event.type)) {
                    if (!this.lastAttachPoint) return;
                    attachPoint = this.lastAttachPoint;
                }
                this.lastAttachPoint = attachPoint;
                const parentRect = this.$parent.$refs.editorBody.getBoundingClientRect();
                const rect = attachPoint.getBoundingClientRect();
                ele.style.top = `${rect.top - parentRect.top + 50}px`;
                ele.style.left = `${rect.left - parentRect.left}px`;
                ele.style.width = `${rect.width}px`;
                ele.style.height = `${rect.height}px`;
                this.tippy.show();
            }, 50);
        },

        hide() {
            this.tippy.hide();
            this.model.isSelected = false;
            this.lastAttachPoint = null;
        },

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

        onSpecification(model, selection) {
            if (model instanceof RecipeItem.RawClass && selection instanceof ActionObject.RawClass) {
                this.lesson.setOverwrite(model, "amount", Math.min(model.amount, 1));
            }
            this.lesson.setOverwrite(model, "object", `${selection.dataCollectionName}_${selection._id}`);
            this.lesson.overwrites.__ob__.dep.notify();
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
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/LessonOverwrites.less"></style>
