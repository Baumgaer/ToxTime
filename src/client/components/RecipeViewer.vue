<template>
    <div class="recipeViewer">
        <RecipePlaces :model="model" :changeable="changeable" prop="input" :forbiddenModels="forbiddenInputTypes" :itemFilter="itemFilter" />
        <div class="transitionInputLine"></div>
        <div class="transition">
            <div>
                <div class="left">{{ $t("delay") }}</div>
                <div class="right"><input :disabled="!changeable" type="number" name="delay" min="0" v-model="model.transitionSettings.delay"></div>
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
        <RecipePlaces :model="model" :changeable="changeable" prop="output" align="right" :forbiddenModels="forbiddenOutputTypes" :itemFilter="itemFilter" />
    </div>
</template>

<script>
import RecipePlaces from "~client/components/RecipePlaces";
import ToggleSwitch from "~client/components/ToggleSwitch";
import Recipe from "~client/models/Recipe";

export default {
    components: {
        RecipePlaces,
        ToggleSwitch
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
        forbiddenInputTypes: {
            type: Array,
            default: () => []
        },
        forbiddenOutputTypes: {
            type: Array,
            default: () => []
        },
        itemFilter: {
            type: Function,
            default: () => []
        }
    },
    methods: {
        onToggleSwitched(name) {
            const input = this.$refs[name].$refs.input;
            if (!this.changeable) return input.checked = !input.checked;
            this.$emit(`settingsChange`, name, input.checked);
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/RecipeViewer.less"></style>
