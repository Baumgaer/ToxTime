<template>
    <div class="lessonEditor" @drop="onInternalDrop($event)" @dragover.prevent @dragenter.prevent>
        <EditorHead ref="editorHead" name="addLesson" :model="model" :onSaveButtonClick="onSaveButtonClick.bind(this)" />
        <LessonOverwrites ref="lessonOverwrites" v-if="selectedModel" :lesson="model" :model="selectedModel" />
        <section class="editorBody" @click.stop="onModelSelection(null)">
            <h3>{{ $t("description") }}</h3>
            <section><textarea-autosize
                class="description"
                :placeholder="$t('description')"
                v-model="model.description"
                :min-height="100"
            /></section>
            <h3>{{ $t("scenes") }}</h3>
            <section class="itemList">
                <Avatar
                    v-for="(scene, index) of model.scenes"
                    :key="scene._id"
                    :model="scene"
                    ratio="1:1"
                    draggable
                    :class="scene.isSelected ? 'selected' : ''"
                    @dragstart="onDragStart($event, scene, 'scene')"
                    @dragend="onDragEnd($event, 'scene')"
                    @dragover="onDragOver($event, index, 'scene')"
                    @dragleave="onDragLeave($event, index, 'scene')"
                    @drop.prevent.stop="onInternalDrop($event, index)"
                    @click.stop="onModelSelection(scene)"
                    :ref="`scene${index}`"
                >
                    <div class="scenePicture" :style="`background-image: url(${scene.getAvatar().name})`"></div>
                    <div class="closeIcon" :title="$t('remove')">
                        <component :is="'close-icon'" @click="onSceneRemoveClick(scene)"/>
                    </div>
                    <div class="name">{{ scene.name }}</div>
                </Avatar>
            </section>
            <h3>{{ $t("inventory") }}</h3>
            <section class="itemList">
                <Avatar
                    v-for="(item, index) of model.inventory"
                    :key="item._id"
                    :model="item"
                    ratio="1:1"
                    :fitImage="true"
                    draggable
                    :class="item.isSelected ? 'selected' : ''"
                    @dragstart="onDragStart($event, item, 'item')"
                    @dragend="onDragEnd($event, 'item')"
                    @dragover="onDragOver($event, index, 'item')"
                    @dragleave="onDragLeave($event, index, 'item')"
                    @drop.prevent.stop="onInternalDrop($event, index)"
                    @click.stop="onModelSelection(item)"
                    :ref="`item${index}`"
                >
                    <div class="itemPicture" :style="`background-image: url(${item.getAvatar().name})`"></div>
                    <div class="closeIcon" :title="$t('remove')">
                        <component :is="'close-icon'" class="closeIcon" @click="onItemRemoveClick(item)"/>
                    </div>
                    <div class="name">{{ item.name }}</div>
                </Avatar>
            </section>
            <h3>{{ $t("recipes") }} <Button name="reCalculate" class="calcRecipesButton" @click="onCalculateButtonClick"><calculator-icon /></Button></h3>
            <section class="recipeList">
                <RecipeViewer
                    v-for="(recipe, index) of model.getRecipes()"
                    :key="recipe._id"
                    :model="recipe"
                    draggable
                    :class="`${model.addedRecipes.includes(recipe) ? 'added ' : ''}${model.excludedRecipes.includes(recipe) ? 'excluded ' : ''}${recipe.isSelected ? 'selected' : ''}`"
                    @dragstart="onDragStart($event, recipe, 'recipe')"
                    @dragend="onDragEnd($event, 'recipe')"
                    @dragover="onDragOver($event, index, 'recipe')"
                    @dragleave="onDragLeave($event, index, 'recipe')"
                    @drop.prevent.stop="onInternalDrop($event, index)"
                    @click.stop="onModelSelection(recipe)"
                    :ref="`recipe${index}`"
                >
                    <div class="closeIcon" :title="!model.excludedRecipes.includes(recipe) ? $t('remove') : $t('restore')">
                        <component v-if="!model.excludedRecipes.includes(recipe)" :is="'close-icon'" class="closeIcon" @click.stop="onRecipeRemoveClick(recipe)"/>
                        <component v-else :is="'delete-restore-icon'" class="closeIcon" @click.stop="onRecipeRestoreClick(recipe)"/>
                    </div>
                    <div class="name">{{ recipe.name }}</div>
                </RecipeViewer>
            </section>
            <h3>{{ $t("goals") }}</h3>
            <section></section>
        </section>
    </div>
</template>

<script>
import EditorHead from "~client/components/EditorHead";
import Avatar from "~client/components/Avatar";
import RecipeViewer from "~client/components/RecipeViewer";
import Button from "~client/components/Button";
import LessonOverwrites from "~client/components/LessonOverwrites";

import ApiClient from "~client/lib/ApiClient";
import Scene from "~client/models/Scene";
import SceneObject from "~client/models/SceneObject";
import Recipe from "~client/models/Recipe";

import { parseEventModelData } from "~client/utils";

export default {
    components: {
        EditorHead,
        Avatar,
        RecipeViewer,
        Button,
        LessonOverwrites
    },
    data() {
        return {
            model: window.activeUser.editingModel,
            selectedModel: null
        };
    },
    mounted() {
        ApiClient.get("/recipes");
    },
    methods: {
        async onSaveButtonClick() {
            const result = await this.model.save();
            if (!result || result instanceof Error) return;
            this.$toasted.success(this.$t("saved", { name: this.model.getName() }), { className: "successToaster" });
        },

        /**
         * @param {DragEvent} event
         * @param {number} [index]
         */
        onInternalDrop(event, index) {
            if (!ApiClient.store.collection("localStorage").isInternalDnD) return;

            event.preventDefault();
            event.stopPropagation();

            let model = parseEventModelData(event);
            if (!model || !(model instanceof Scene.RawClass) && !(model instanceof SceneObject.RawClass) && !(model instanceof Recipe.RawClass)) return;

            let field = "inventory";
            if (model instanceof Scene.RawClass) field = "scenes";
            if (model instanceof Recipe.RawClass) field = "autoDetectedRecipes";

            let type = "item";
            if (model instanceof Scene.RawClass) type = "scene";
            if (model instanceof Recipe.RawClass) type = "recipe";

            if (typeof index === "number") {
                const element = this.$refs[`${type}${index}`][0].$el;
                const elementRect = element.getBoundingClientRect();
                let indexOfDraggedModel = this.model[field].indexOf(model);

                let indexAddition = 0;
                if (elementRect.x + elementRect.width / 2 <= event.clientX) indexAddition = 1;
                if (index > indexOfDraggedModel) indexAddition = 0;

                element.classList.remove("rightDropTarget");
                element.classList.remove("leftDropTarget");

                if (indexOfDraggedModel >= 0) {
                    this.model[field].splice(indexOfDraggedModel, 1);
                } else indexOfDraggedModel = index;
                this.model[field].splice(index + indexAddition, 0, model);
            } else {
                if (field === "autoDetectedRecipes") {
                    field = "addedRecipes";

                    const index = this.model.excludedRecipes.indexOf(model);
                    if (index >= 0) this.model.excludedRecipes.splice(index, 1);
                }
                this.model[field].push(model);
            }
            if (!(model instanceof Recipe.RawClass)) this.onCalculateButtonClick();
        },

        onModelSelection(model) {
            if (this.selectedModel) this.selectedModel.isSelected = false;
            this.selectedModel = model;
            if (model) model.isSelected = true;
        },

        onSceneRemoveClick(scene) {
            const index = this.model.scenes.indexOf(scene);
            if (index < 0) return;
            this.model.scenes.splice(index, 1);
        },

        onItemRemoveClick(item) {
            const index = this.model.inventory.indexOf(item);
            if (index < 0) return;
            this.model.inventory.splice(index, 1);
        },

        onRecipeRemoveClick(recipe) {
            const addedRecipes = this.model.addedRecipes;
            if (addedRecipes.includes(recipe)) {
                addedRecipes.splice(addedRecipes.indexOf(recipe), 1);
            } else this.model.excludedRecipes.push(recipe);
        },

        onRecipeRestoreClick(recipe) {
            const excludedRecipes = this.model.excludedRecipes;
            if (!excludedRecipes.includes(recipe)) return;
            excludedRecipes.splice(excludedRecipes.indexOf(recipe), 1);
        },

        /**
         * @param {DragEvent} event
         */
        onDragStart(event, model) {
            event.stopPropagation();
            ApiClient.store.collection("localStorage").isInternalDnD = true;
            event.dataTransfer.setData("model", JSON.stringify({collection: model.collection, _id: model._id}));
        },

        onDragEnd() {
            ApiClient.store.collection("localStorage").isInternalDnD = false;
            ApiClient.store.collection("localStorage").internalDnDData = null;
        },

        /**
         * @param {DragEvent} event
         * @param {number} index
         * @param {"scene" | "item"} type
         */
        onDragOver(event, index, type) {
            event.preventDefault();
            event.stopPropagation();

            /** @type {HTMLElement} */
            const element = this.$refs[`${type}${index}`][0].$el;
            const elementRect = element.getBoundingClientRect();

            if (elementRect.x + elementRect.width / 2 > event.clientX) {
                element.classList.add("leftDropTarget");
                element.classList.remove("rightDropTarget");
            } else {
                element.classList.remove("leftDropTarget");
                element.classList.add("rightDropTarget");
            }
        },

        onDragLeave(event, index, type) {
            event.preventDefault();
            event.stopPropagation();

            /** @type {HTMLElement} */
            const element = this.$refs[`${type}${index}`][0].$el;
            element.classList.remove("rightDropTarget");
            element.classList.remove("leftDropTarget");
        },

        onCalculateButtonClick() {
            const result = this.model.findRecipes();
            this.model.autoDetectedRecipes = result.filter((recipe) => !this.model.excludedRecipes.includes(recipe));
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/LessonEditor.less"></style>
