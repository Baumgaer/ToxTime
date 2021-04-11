<template>
    <div class="recipeEditor" @drop="onInternalDrop($event)" @dragover.prevent @dragenter.prevent>
        <EditorHead ref="editorHead" name="addRecipe" :model="model" :onSaveButtonClick="onSaveButtonClick" />
        <RecipePlaces :model="model" prop="input" />
        <div class="transition"></div>
        <RecipePlaces :model="model" prop="output" />
    </div>
</template>

<script>
import EditorHead from "~client/components/EditorHead";
import RecipePlaces from "~client/components/RecipePlaces";

import Recipe from "~client/models/Recipe";

export default {
    components: {
        EditorHead,
        RecipePlaces
    },
    props: {
        model: {
            type: Recipe.RawClass,
            required: true
        }
    },
    methods: {
        onInternalDrop(event) {
            console.log(event);
        },

        onSaveButtonClick() {}
    }
};
</script>

<style lang="less" scoped src="~client/less/RecipeEditor.less"></style>
