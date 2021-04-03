<template>
    <div class="recipeEditor">
        <EditorHead ref="editorHead" name="addRecipe" :model="model" />
        <div class="input"></div>
        <div class="transition"></div>
        <div class="output"></div>
    </div>
</template>

<script>
import EditorHead from "~client/components/EditorHead";

export default {
    components: {
        EditorHead
    },
    data() {
        return {
            model: window.activeUser.editingModel
        };
    },
    methods: {
        onInputDrop() {
            console.log("InputDrop");
        },

        onOutputDrop() {
            console.log("OutputDrop");
        },

        /**
         * @see https://stackoverflow.com/questions/14560302/html-line-drawing-without-canvas-just-js
         */
        lineDraw(ax,ay,bx,by) {
            if(ay>by) {
                bx=ax+bx;
                ax=bx-ax;
                bx=bx-ax;
                by=ay+by;
                ay=by-ay;
                by=by-ay;
            }
            let calc=Math.atan((ay-by)/(bx-ax));
            calc=calc*180/Math.PI;
            let length=Math.sqrt((ax-bx)*(ax-bx)+(ay-by)*(ay-by));
            document.body.innerHTML += "<div id='line' style='height:" + length + "px;width:1px;background-color:black;position:absolute;top:" + (ay) + "px;left:" + (ax) + "px;transform:rotate(" + calc + "deg);-ms-transform:rotate(" + calc + "deg);transform-origin:0% 0%;-moz-transform:rotate(" + calc + "deg);-moz-transform-origin:0% 0%;-webkit-transform:rotate(" + calc  + "deg);-webkit-transform-origin:0% 0%;-o-transform:rotate(" + calc + "deg);-o-transform-origin:0% 0%;'></div>";
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/RecipeEditor.less"></style>
