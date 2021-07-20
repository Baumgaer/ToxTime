<template>
    <div class="lessonEditor" @drop="onInternalDrop($event)" @dragover.prevent="onInternalDragOver($event)" @dragenter.prevent>
        <EditorHead ref="editorHead" name="addLesson" :model="model" :onSaveButtonClick="onSaveButtonClick.bind(this)" />
        <LessonOverwrites ref="lessonOverwrites" v-if="selectedModel" :lesson="model" :model="selectedModel" />
        <section class="editorBody" ref="editorBody" @click.stop="onModelSelection($event, null)" @wheel="updateOverwritePosition($event)" @scroll="updateOverwritePosition($event)">
            <h3>{{ $t("description") }}</h3>
            <section><textarea-autosize
                class="description"
                :placeholder="$t('description')"
                v-model="description"
                :min-height="100"
            /></section>
            <h3>{{ $t("entities") }}</h3>
            <section class="entityList">
                <EntityItem v-for="entity of model.entities" :key="entity._dummyId || entity._id" :model="entity" :parentModel="model" />
                <Button name="addEntity" class="addEntity" @click="onAddEntityButtonClick">
                    <identifier-icon />
                </Button>
            </section>
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
                    @click.stop="onModelSelection($event, scene)"
                    :ref="`scene${index}`"
                >
                    <div class="scenePicture" :style="`background-image: url(${scene.getAvatar().name})`"></div>
                    <div class="modifiedIndicator" :title="$t('modified')" v-if="hasOverwrites(scene)"></div>
                    <div class="closeIcon" :title="$t('remove')" @click.stop="onSceneRemoveClick(scene)">
                        <component :is="'close-icon'"/>
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
                    @click.stop="onModelSelection($event, item)"
                    :ref="`item${index}`"
                >
                    <div class="itemPicture" :style="`background-image: url(${item.getAvatar().name})`"></div>
                    <div class="modifiedIndicator" :title="$t('modified')" v-if="hasOverwrites(item)"></div>
                    <div class="closeIcon" :title="$t('remove')" @click.stop="onItemRemoveClick(item)">
                        <component :is="'close-icon'" class="closeIcon"/>
                    </div>
                    <div class="name">{{ item.name }}</div>
                </Avatar>
            </section>
            <h3>{{ $t("recipes") }} <Button name="reCalculate" class="calcRecipesButton" @click="onCalculateButtonClick"><calculator-icon /></Button> <span class="points">{{ $t("points") }}: {{ model.getRecipePoints() }}</span></h3>
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
                    @click.stop="onModelSelection($event, recipe)"
                    :ref="`recipe${index}`"
                >
                    <div class="modifiedIndicator" :title="$t('modified')" v-if="hasOverwrites(recipe)"></div>
                    <div class="closeIcon" :title="!model.excludedRecipes.includes(recipe) ? $t('remove') : $t('restore')">
                        <component v-if="!model.excludedRecipes.includes(recipe)" :is="'close-icon'" class="closeIcon" @click.stop="onRecipeRemoveClick(recipe)"/>
                        <component v-else :is="'delete-restore-icon'" class="closeIcon" @click.stop="onRecipeRestoreClick(recipe)"/>
                    </div>
                    <div class="name">{{ recipe.name }}</div>
                </RecipeViewer>
            </section>
            <h3>{{ $t("goals") }} <span class="points">{{ $t("points") }}: {{ model.getGoalPoints() }}</span></h3>
            <section class="goalList">
                <div class="goalsHead">
                    <div class="action"></div>
                    <div class="names">{{ $t('description') }}</div>
                    <div class="points">{{ $t('points') }}</div>
                </div>
                <div v-for="(goal, index) of model.goals" :key="`goal_${index}`" class="goal">
                    <div class="action" @click="onGoalRemoveButtonClick(index)"><close-thick-icon /></div>
                    <div class="name">
                        <input type="text" v-model="model.goals[index]['name_de-de']" :ref="`goal_${index}_name_de-de`" :placeholder="$t('goalDescriptionDe')">
                        <input type="text" v-model="model.goals[index]['name_en-us']" :ref="`goal_${index}_name_en-us`" :placeholder="$t('goalDescriptionEn')">
                    </div>
                    <div class="points">
                        <input type="number" v-model="model.goals[index].points" :ref="`goal_${index}_points`" value="0">
                    </div>
                </div>
                <div class="goal" ref="goalPlaceholder">
                    <div class="action"><close-thick-icon /></div>
                    <div class="name">
                        <input type="text" :placeholder="$t('goalDescriptionDe')" @focus="onGoalPlaceholderClick('name_de-de')">
                        <input type="text" :placeholder="$t('goalDescriptionEn')" @focus="onGoalPlaceholderClick('name_en-us')">
                    </div>
                    <div class="points">
                        <input type="number" value="0" @focus="onGoalPlaceholderClick('points')">
                    </div>
                </div>
            </section>
            <h3>{{ $t("abstract") }}</h3>
            <section class="abstract">
                <div class="stats">
                    <div>
                        <div>{{ $t("recipePoints") }}:</div><div>{{ model.getRecipePoints() }} | {{ model.getRecipePoints("negative") }}</div>
                    </div>
                    <div>
                        <div>{{ $t("goalPoints") }}:</div><div>{{ model.getGoalPoints() }} | {{ model.getGoalPoints("min") }}</div>
                    </div>
                    <div>
                        <div>{{ $t("totalPoints") }}:</div><div>{{ model.getTotalPoints() }} | {{ model.getRecipePoints("negative") + model.getGoalPoints("min") }}</div>
                    </div>
                    <div>
                        <div>{{ $t("entities") }}:</div><div>{{ model.entities.length }}</div>
                    </div>
                    <div>
                        <div>{{ $t("scenes") }}:</div><div>{{ model.scenes.length }}</div>
                    </div>
                    <div>
                        <div>{{ $t("inventoryObjects") }}:</div><div>{{ model.inventory.reduce((total, sceneObject) => total + model.getOverwrite(sceneObject, "amount") || 1, 0) }}</div>
                    </div>
                    <div>
                        <div>{{ $t("recipes") }}:</div><div>{{ model.getRecipes(true).length }}</div>
                    </div>
                    <div>
                        <div>{{ $t("goals") }}:</div><div>{{ model.goals.length }}</div>
                    </div>
                </div>
                <div class="punish">
                    <div class="row">
                        <input type="number" v-model="model.punishClicks">
                        <span>{{ $t('clicks') }}</span>
                    </div>
                    <div class="row">
                        <input type="number" v-model="model.punishSeconds">
                        <span>{{ $t('seconds') }}</span>
                    </div>
                    <div class="row">
                        <input type="number" v-model="model.punishPoints">
                        <span>{{ $t('punishPoints') }}</span>
                    </div>
                </div>
            </section>
        </section>
    </div>
</template>

<script>
import EditorHead from "~client/components/EditorHead";
import Avatar from "~client/components/Avatar";
import RecipeViewer from "~client/components/RecipeViewer";
import Button from "~client/components/Button";
import LessonOverwrites from "~client/components/LessonOverwrites";
import EntityItem from "~client/components/EntityItem";

import ApiClient from "~client/lib/ApiClient";
import Scene from "~client/models/Scene";
import SceneObject from "~client/models/SceneObject";
import Recipe from "~client/models/Recipe";
import Label from "~client/models/Label";
import User from "~client/models/User";
import File from "~client/models/File";
import Entity from "~client/models/Entity";

import { parseEventModelData } from "~client/utils";
import { unescape } from "~common/utils";

export default {
    components: {
        EditorHead,
        Avatar,
        RecipeViewer,
        Button,
        LessonOverwrites,
        EntityItem
    },
    data() {
        return {
            model: window.activeUser.editingModel,
            selectedModel: null
        };
    },
    computed: {
        description: {
            get() {
                return unescape(this.model.description);
            },
            set(value) {
                this.model.description = value;
            }
        },
        hasOverwrites() {
            return (model) => {
                const recursiveSubObjects = (model, ...args) => {
                    const result = [];
                    const subObjects = model.getSubObjects(...args);
                    result.push(...subObjects);
                    for (const subObject of subObjects) {
                        result.push(...recursiveSubObjects(subObject, ...args));
                    }
                    return result;
                };

                let resources = [];
                if (model instanceof Recipe.RawClass) resources = model.getSubObjects(true);
                if (model instanceof Scene.RawClass) resources = recursiveSubObjects(model);
                const properties = ["amount", "points", "object", "activated"];

                for (const property of properties) {
                    if (this.model.getOverwrite(model, property)) return true;
                    for (const resource of resources) {
                        if (this.model.getOverwrite(resource, property)) return true;
                    }
                }
            };
        }
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
         * @param {"recipe" | "item" | "scene"} [type]
         */
        onInternalDragOver(event, type) {
            if (!ApiClient.store.collection("localStorage").isInternalDnD) return;
            event.preventDefault();
            event.stopPropagation();

            const model = parseEventModelData(event);
            if (!model) {
                event.dataTransfer.dropEffect = "none";
                return false;
            }

            if (!type && (model instanceof File.RawClass || model instanceof Label.RawClass || model instanceof User.RawClass) || model === this.model || model.deleted) {
                event.dataTransfer.dropEffect = "none";
                return false;
            } else if(type === "recipe" && !(model instanceof Recipe.RawClass)) {
                event.dataTransfer.dropEffect = "none";
                return false;
            } else if(type === "item" && !(model instanceof SceneObject.RawClass)) {
                event.dataTransfer.dropEffect = "none";
                return false;
            } else if(type === "scene" && !(model instanceof Scene.RawClass)) {
                event.dataTransfer.dropEffect = "none";
                return false;
            } else event.dataTransfer.dropEffect = "link";
            return true;
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

        onAddEntityButtonClick() {
            this.model.entities.push(ApiClient.store.addModel(new Entity.Model()));
        },

        onModelSelection(event, model) {
            if (this.selectedModel) this.selectedModel.isSelected = false;
            this.selectedModel = model;
            if (model) {
                model.isSelected = true;
                if (!this.$refs.lessonOverwrites) {
                    setTimeout(() => this.$refs.lessonOverwrites.updatePosition(event), 10);
                } else this.$refs.lessonOverwrites.updatePosition(event);
            }
        },

        updateOverwritePosition(event) {
            if (!this.$refs.lessonOverwrites) return;
            this.$refs.lessonOverwrites.updatePosition(event);
        },

        onSceneRemoveClick(scene) {
            const index = this.model.scenes.indexOf(scene);
            if (index < 0) return;
            this.model.scenes.splice(index, 1);
            this.onCalculateButtonClick();
        },

        onItemRemoveClick(item) {
            const index = this.model.inventory.indexOf(item);
            if (index < 0) return;
            this.model.inventory.splice(index, 1);
            this.onCalculateButtonClick();
        },

        onRecipeRemoveClick(recipe) {
            const addedRecipes = this.model.addedRecipes;
            if (addedRecipes.includes(recipe)) {
                addedRecipes.splice(addedRecipes.indexOf(recipe), 1);
            } else this.model.excludedRecipes.push(recipe);
            this.onCalculateButtonClick();
        },

        onRecipeRestoreClick(recipe) {
            const excludedRecipes = this.model.excludedRecipes;
            if (!excludedRecipes.includes(recipe)) return;
            excludedRecipes.splice(excludedRecipes.indexOf(recipe), 1);
            this.onCalculateButtonClick();
        },

        /**
         * @param {DragEvent} event
         */
        onDragStart(event, model) {
            event.stopPropagation();
            const data = {dataCollectionName: model.dataCollectionName, _id: model._id};
            ApiClient.store.collection("localStorage").isInternalDnD = true;
            ApiClient.store.collection("localStorage").internalDnDData = data;
            event.dataTransfer.setData("model", JSON.stringify(data));
        },

        onDragEnd() {
            // Ugly FireFox hack because FF is unable to sort onDrop BEFORE dragEnd event
            setTimeout(() => {
                ApiClient.store.collection("localStorage").isInternalDnD = false;
                ApiClient.store.collection("localStorage").internalDnDData = null;
            });
        },

        /**
         * @param {DragEvent} event
         * @param {number} index
         * @param {"scene" | "item"} type
         */
        onDragOver(event, index, type) {

            if (!this.onInternalDragOver(event, type)) return;

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
        },

        onGoalPlaceholderClick(field) {
            this.model.goals.push({
                "name_de-de": "",
                "name_en-us": "",
                points: 0
            });
            setTimeout(() => {
                this.$refs.goalPlaceholder.scrollIntoView();
                this.$refs[`goal_${this.model.goals.length - 1}_${field}`][0].focus();
            });
        },

        onGoalRemoveButtonClick(index) {
            this.model.goals.splice(index, 1);
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/LessonEditor.less"></style>
