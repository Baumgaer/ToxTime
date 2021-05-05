<template>
    <div :class="`recipePlaces ${align}Aligned`" @dragend="onDragEnd()">
        <div v-for="item in model[prop]"
             :key="item._id || item._dummyId"
             class="item"
             @dragover="onDragOver($event, item)"
             @drop="onDrop($event, item)"
             @dragleave="onDragLeave($event, item)"
        >
            <RecipePlace :changeable="changeable" class="item" :model="item" :prop="prop" :align="align" :parentModel="model" :ref="`place_${item._id}`" :itemFilter="itemFilter" />
        </div>
        <div v-if="changeable" class="item placeholder"
             ref="placeholder"
             @dragover="onDragOver($event, 'placeholder')"
             @drop="onDrop($event, 'placeholder')"
             @dragleave="onDragLeave($event, 'placeholder')"
        >
            <component v-if="placeholderAvatarData && placeholderAvatarData.type === 'component'" :is="placeholderAvatarData.name" />
            <plus-icon v-else />
            <div class="amount"></div>
        </div>
        <div class="spreader"></div>
    </div>
</template>

<script>
import RecipePlace from "~client/components/RecipePlace";

import Recipe from "~client/models/Recipe";
import RecipeItem from "~client/models/RecipeItem";
import ActionObject from "~client/models/ActionObject";
import Scene from "~client/models/Scene";
import GameObject from "~client/models/GameObject";
import Label from "~client/models/Label";
import File from "~client/models/File";

import ApiClient from "~client/lib/ApiClient";
import { parseEventModelData } from "~client/utils";

export default {
    components: {
        RecipePlace
    },
    props: {
        model: {
            type: Recipe.RawClass,
            required: true
        },
        changeable: {
            type: Boolean,
            default: false
        },
        prop: {
            type: String,
            required: true
        },
        align: {
            type: String,
            default: "left"
        },
        forbiddenModels: {
            type: Array,
            default: () => []
        },
        itemFilter: {
            type: Function,
            required: true
        }
    },
    data() {
        return {
            placeholderAvatarData: null
        };
    },
    methods: {

        /**
         * Highlights the corresponding place to give feedback what will happen
         *
         * @param {DragEvent} event
         * @param {string | import("~client/models/RecipeItem")["default"]["RawClass"]}
         */
        onDragOver(event, place) {
            if (!ApiClient.store.collection("localStorage").isInternalDnD) return;

            event.preventDefault();
            event.stopPropagation();

            let model = parseEventModelData(event);
            if (!model) return;

            if (place === "placeholder") {
                this.highlightPlaceholder(model);
            } else this.$refs[`place_${place._id}`][0].highlight();
        },

        onDragLeave(event, place) {
            if (!ApiClient.store.collection("localStorage").isInternalDnD) return;

            event.preventDefault();
            event.stopPropagation();

            if (place === "placeholder") {
                this.removePlaceholderHighlight();
            } else this.$refs[`place_${place._id}`][0].removeHighlight();
        },

        /**
         * Adds or replaces a place with the data in the event
         *
         * @param {DragEvent} event
         * @param {string | import("~client/models/RecipeItem")["default"]["Model"]}
         */
        onDrop(event, place) {
            if (!ApiClient.store.collection("localStorage").isInternalDnD) return;

            event.preventDefault();
            event.stopPropagation();

            let model = parseEventModelData(event);
            if (!model) return;

            if (place === "placeholder") {
                this.addNewItem(model);
            } else this.replaceItem(place, model);
        },

        onDragEnd() {
            ApiClient.store.collection("localStorage").isInternalDnD = false;
            ApiClient.store.collection("localStorage").internalDnDData = null;
        },

        highlightPlaceholder(model) {
            const isTextLikeAvatar = ["text", "component"].includes(model.getAvatar().type);
            if (!isTextLikeAvatar) {
                this.$refs.placeholder.style.backgroundImage = `url(${model.getAvatar().name})`;
                this.$refs.placeholder.firstElementChild.style.opacity = 0;
            } else this.placeholderAvatarData = model.getAvatar();
        },

        removePlaceholderHighlight() {
            this.$refs.placeholder.style.backgroundImage = "none";
            this.placeholderAvatarData = null;
            this.$refs.placeholder.firstElementChild.style.opacity = 1;
        },

        isAllowed(model) {
            const defaultAllowed = [GameObject.RawClass, Label.RawClass, File.RawClass];
            const isAllowed = defaultAllowed.some((type) => model instanceof type);
            if (!isAllowed) return false;

            const isDefinedForbidden = this.forbiddenModels.some((type) => model instanceof type);
            if (isDefinedForbidden) return false;

            return true;
        },

        addNewItem(model) {
            this.removePlaceholderHighlight();

            if (!this.isAllowed(model)) return;
            const alreadyAvailable = this.model[this.prop].find((item) => item.object === model);
            if (alreadyAvailable) return;

            const recipeItem = ApiClient.store.addModel(new RecipeItem.Model({ object: model }));
            this.model[this.prop].push(recipeItem);
        },

        replaceItem(place, model) {
            this.$refs[`place_${place._id}`][0].removeHighlight();
            if (!this.isAllowed(model)) return;
            place.object = model;
            if (model instanceof ActionObject.RawClass) place.amount = Math.min(place.amount, 1);
            if (model instanceof Scene.RawClass) place.amount = 1;
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/RecipePlaces.less"></style>
