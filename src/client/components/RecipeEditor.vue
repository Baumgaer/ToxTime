<template>
    <div class="recipeEditor">
        <EditorHead ref="editorHead" name="addRecipe" :model="model" :onSaveButtonClick="onSaveButtonClick" />
        <div class="recipe">
            <RecipePlaces :model="model" prop="input" :forbiddenModels="forbiddenInputTypes" :itemFilter="itemFilter" />
            <div class="transitionInputLine"></div>
            <div class="transition">
                <div>
                    <div class="left">{{ $t("delay") }}</div>
                    <div class="right"><input type="number" name="delay" min="0" v-model="model.transitionSettings.delay"></div>
                </div>

                <div>
                    <div class="left">{{ $t("ingredientsExact") }}</div>
                    <div class="right">
                        <ToggleSwitch ref="ingredientsExact" @change="onToggleSwitched('ingredientsExact')" name="ingredientsExact" :checked="model.transitionSettings.ingredientsExact"/>
                    </div>
                </div>

                <div>
                    <div class="left">{{ $t("quantityExact") }}</div>
                    <div class="right">
                        <ToggleSwitch ref="quantityExact" @change="onToggleSwitched('quantityExact')" name="quantityExact" :checked="model.transitionSettings.quantityExact"/>
                    </div>
                </div>
            </div>
            <div class="transitionOutputLine"></div>
            <RecipePlaces :model="model" prop="output" align="right" :forbiddenModels="forbiddenOutputTypes" :itemFilter="itemFilter" />
        </div>
        <textarea-autosize
            class="description"
            :placeholder="$t('description')"
            v-model="model.description"
            :min-height="100"
        />
    </div>
</template>

<script>
import EditorHead from "~client/components/EditorHead";
import RecipePlaces from "~client/components/RecipePlaces";
import ToggleSwitch from "~client/components/ToggleSwitch";

import Recipe from "~client/models/Recipe";
import ClickArea from "~client/models/ClickArea";
import File from "~client/models/File";
import Scene from "~client/models/Scene";
import Inventory from "~client/models/Inventory";
import Hand from "~client/models/Hand";

export default {
    components: {
        EditorHead,
        RecipePlaces,
        ToggleSwitch
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
        onToggleSwitched(name) {
            this.model.transitionSettings[name] = this.$refs[name].$refs.input.checked;
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
