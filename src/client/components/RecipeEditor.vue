<template>
    <div class="recipeEditor" @dragover.prevent.stop="onInternalDragOver($event)" @dragleave.prevent.stop="onInternalDragLeave">
        <EditorHead ref="editorHead" name="addRecipe" :model="model" :onSaveButtonClick="onSaveButtonClick" />
        <div class="editorBody">
            <RecipeViewer
                ref="viewer"
                :model="model"
                :itemFilter="itemFilter"
                :forbiddenOutputTypes="forbiddenOutputTypes"
                :forbiddenInputTypes="forbiddenInputTypes"
                :changeable="true"
                @settingsChange="onToggleSwitched"
            />
            <textarea-autosize class="description" :placeholder="$t('description')" v-model="model.description" :min-height="100" />
        </div>
    </div>
</template>

<script>
import EditorHead from "~client/components/EditorHead";
import RecipeViewer from "~client/components/RecipeViewer";

import Recipe from "~client/models/Recipe";
import ClickArea from "~client/models/ClickArea";
import File from "~client/models/File";
import Scene from "~client/models/Scene";
import Inventory from "~client/models/Inventory";
import Hand from "~client/models/Hand";
import Lesson from "~client/models/Lesson";
import User from "~client/models/User";
import SpeechBubble from "~client/models/SpeechBubble";

import ApiClient from "~client/lib/ApiClient";
import { parseEventModelData } from "~client/utils";

export default {
    components: {
        EditorHead,
        RecipeViewer
    },
    props: {
        model: {
            type: Recipe.RawClass,
            required: true
        }
    },
    data() {
        return {
            forbiddenOutputTypes: [ClickArea.RawClass, Lesson.RawClass, User.RawClass],
            forbiddenInputTypes: [File.RawClass, Scene.RawClass, Recipe.RawClass, Lesson.RawClass, User.RawClass, SpeechBubble.RawClass]
        };
    },
    methods: {
        onInternalDragOver(event) {
            if (!ApiClient.store.collection("localStorage").isInternalDnD) return;

            event.preventDefault();
            event.stopPropagation();

            event.dataTransfer.dropEffect = "none";
            let model = parseEventModelData(event);
            if (!model) return;
            if (model.getResources().includes(this.model)) return;

            const targets = [];
            let highlightInput = !this.forbiddenInputTypes.some((type) => model instanceof type);
            let highlightOutput = !this.forbiddenOutputTypes.some((type) => model instanceof type);

            if (highlightInput) targets.push("input");
            if (highlightOutput) targets.push("output");

            for (const target of targets) {
                this.$refs.viewer.$refs[target].highlightAllowedPlaces = true;
            }
        },

        onInternalDragLeave() {
            this.$refs.viewer.$refs.input.highlightAllowedPlaces = false;
            this.$refs.viewer.$refs.output.highlightAllowedPlaces = false;
        },

        onToggleSwitched(name, value) {
            this.model.transitionSettings[name] = value;
        },

        async onSaveButtonClick() {
            const result = await this.model.save();
            if (!result || result instanceof Error) return;
            this.$toasted.success(this.$t("saved", { name: this.model.getName() }), { className: "successToaster" });
        },

        itemFilter(model) {
            const locations = [ new Hand.Model(), new Scene.Model({ name: this.$t("scene") }) ];
            if (this.model.output.includes(model)) locations.unshift(new Inventory.Model());
            return locations;
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/RecipeEditor.less"></style>
