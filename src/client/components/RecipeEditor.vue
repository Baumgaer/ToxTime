<template>
    <div class="recipeEditor">
        <EditorHead ref="editorHead" name="addRecipe" :model="model" :onSaveButtonClick="onSaveButtonClick" />
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
            forbiddenOutputTypes: [ClickArea.RawClass],
            forbiddenInputTypes: [File.RawClass, Scene.RawClass]
        };
    },
    methods: {
        onToggleSwitched(name, value) {
            this.model.transitionSettings[name] = value;
        },

        async onSaveButtonClick() {
            const result = await this.model.save();
            if (!result || result instanceof Error) return;
            this.$toasted.success(this.$t("saved", { name: this.model.getName() }), { className: "successToaster" });
        },

        itemFilter() {
            return [
                new Inventory.Model(),
                new Hand.Model(),
                new Scene.Model({ name: this.$t("scene") })
            ];
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/RecipeEditor.less"></style>
