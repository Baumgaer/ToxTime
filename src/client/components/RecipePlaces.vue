<template>
    <div :class="`recipePlaces ${align}Aligned`" @dragend="onDragEnd()">
        <div v-for="item in model[prop]" :key="item._id" class="item">
            <Avatar class="item"
                    :model="item.object"
                    :fitImage="true"
                    ratio="1:1"
                    @dragover="onDragOver($event, item)"
                    @drop="onDrop($event, item)"
                    @dragleave="onDragLeave($event, item)"
            >
                <input type="number" name="amount" class="amount" v-model="item.amount" />
            </Avatar>
        </div>
        <div class="item placeholder"
             ref="placeholder"
             @dragover="onDragOver($event, 'placeholder')"
             @drop="onDrop($event, 'placeholder')"
             @dragleave="onDragLeave($event, 'placeholder')"
        >
            <gamepad-variant-icon />
            <div class="amount"></div>
        </div>
        <div class="spreader"></div>
    </div>
</template>

<script>
import Avatar from "~client/components/Avatar";
import Recipe from "~client/models/Recipe";
import RecipeItem from "~client/models/RecipeItem";

import ApiClient from "~client/lib/ApiClient";

import { parseEventModelData } from "~client/utils";

export default {
    components: {
        Avatar
    },
    props: {
        model: {
            type: Recipe.RawClass,
            required: true
        },
        prop: {
            type: String,
            required: true
        },
        align: {
            type: String,
            default: "left"
        }
    },
    data() {
        return {
            hoveringObject: null
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
            } else this.highlightItem(place, model);
        },

        onDragLeave(event, place) {
            if (!ApiClient.store.collection("localStorage").isInternalDnD) return;

            event.preventDefault();
            event.stopPropagation();

            if (place === "placeholder") {
                this.removePlaceholderHighlight();
            } else this.removeItemHighlight(place);
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
            this.$refs.placeholder.style.backgroundImage = `url(${model.getAvatar().name})`;
            this.$refs.placeholder.firstElementChild.style.opacity = 0;
        },

        removePlaceholderHighlight() {
            this.$refs.placeholder.style.backgroundImage = "none";
            this.$refs.placeholder.firstElementChild.style.opacity = 1;
        },

        highlightItem(place, model) {
            console.log(place, model);
        },

        removeItemHighlight(place) {
            console.log(place);
        },

        addNewItem(model) {
            const recipeItem = ApiClient.store.addModel(new RecipeItem.Model({ object: model }));
            this.model[this.prop].push(recipeItem);
        },

        replaceItem(place, model) {
            console.log(place, model);
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/RecipePlaces.less"></style>
