<template>
    <div class="recipeEditor" @drop="onInternalDrop($event)" @dragover.prevent @dragenter.prevent>
        <EditorHead ref="editorHead" name="addRecipe" :model="model" />
        <canvas ref="canvas" resize></canvas>
    </div>
</template>

<script>
import EditorHead from "~client/components/EditorHead";
import paper from "paper";

export default {
    components: {
        EditorHead
    },
    data() {
        return {
            model: window.activeUser.editingModel,
            paper: new paper.PaperScope()
        };
    },
    mounted() {
        this.paper.setup(this.$refs.canvas);
        this.paper.activate();
        this.paper.settings.handleSize = 10;
        this.paper.project.activeLayer.applyMatrix = false;
        this.paper.project.currentStyle.strokeScaling = false;
    },
    methods: {
        onInternalDrop(event) {
            this.paper.activate();
            console.log(event);
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/RecipeEditor.less"></style>
