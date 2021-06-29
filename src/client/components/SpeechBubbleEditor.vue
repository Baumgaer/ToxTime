<template>
    <div class="speechBubbleEditor">
        <EditorHead :model="model" :name="`addSpeechBubble`" :onSaveButtonClick="onSaveButtonClick.bind(this)" />
        <div class="editorBody">
            <h4 class="documentationButton" @click="onExpandCollapseButtonClick">
                <menu-down-icon v-if="openDoc" class="expandCollapseButton" :title="null" />
                <menu-right-icon v-else class="expandCollapseButton" :title="null" />
                {{ $t('documentation') }}
            </h4>
            <SpeechBubbleProgramming v-show="openDoc" />
            <div class="explanation">{{ $t('normalSpeechCase') }}</div>
            <MultiLingualDescribedEditor :model="model" />
            <h3>{{ $t('recipeAfterClickOnNext') }}</h3>
            <Item v-if="model.recipe"
                  ref="recipe"
                  :model="model.recipe"
                  :compactMode="true"
                  :showSubObjects="false"
                  draggable="false"
                  @drop="onInternalDrop($event, 'recipe')"
                  @dragover.prevent="onInternalDragOver($event, 'recipe')"
                  @dragenter.prevent
                  @dragleave.prevent="onInternalDragLeave('recipe')"
            >
                <div class="removeRecipeButton">
                    <component :is="'delete-icon'" class="deleteIcon" :title="$t('remove')" @click="onRecipeRemoveButtonClick('recipe')"/>
                </div>
            </Item>
            <div v-else
                 ref="recipe"
                 class="noRecipe"
                 @drop="onInternalDrop($event, 'recipe')"
                 @dragover.prevent="onInternalDragOver($event, 'recipe')"
                 @dragenter.prevent
                 @dragleave.prevent="onInternalDragLeave('recipe')"
            >{{ $t('noRecipeSelected') }}</div>
            <div v-if="model.recipe">
                <div class="explanation">{{ $t('errorSpeechCase') }}</div>
                <MultiLingualDescribedEditor :model="model" :prefix="'error'" />
            </div>
            <h3>{{ $t('recipeAfterClickOnClose') }}</h3>
            <Item v-if="model.exitRecipe"
                  ref="exitRecipe"
                  :model="model.exitRecipe"
                  :compactMode="true"
                  :showSubObjects="false"
                  draggable="false"
                  @drop="onInternalDrop($event, 'recipe')"
                  @dragover.prevent="onInternalDragOver($event, 'exitRecipe')"
                  @dragenter.prevent
                  @dragleave.prevent="onInternalDragLeave('exitRecipe')"
            >
                <div class="removeRecipeButton">
                    <component :is="'delete-icon'" class="deleteIcon" :title="$t('remove')" @click="onRecipeRemoveButtonClick('exitRecipe')"/>
                </div>
            </Item>
            <div v-else
                 ref="exitRecipe"
                 class="noRecipe"
                 @drop="onInternalDrop($event, 'exitRecipe')"
                 @dragover.prevent="onInternalDragOver($event, 'exitRecipe')"
                 @dragenter.prevent
                 @dragleave.prevent="onInternalDragLeave('exitRecipe')"
            >{{ $t('noRecipeSelected') }}</div>
        </div>
    </div>
</template>

<script>
import EditorHead from "~client/components/EditorHead";
import MultiLingualDescribedEditor from "~client/components/MultiLingualDescribedEditor";
import SpeechBubbleProgramming from "~client/components/SpeechBubbleProgramming";
import Item from "~client/components/Item";

import Recipe from "~client/models/Recipe";
import ApiClient from "~client/lib/ApiClient";
import { parseEventModelData } from "~client/utils";

export default {
    components: {
        EditorHead,
        MultiLingualDescribedEditor,
        SpeechBubbleProgramming,
        Item
    },
    data() {
        return {
            model: window.activeUser.editingModel,
            openDoc: false
        };
    },
    methods: {
        async onSaveButtonClick() {
            const result = await this.model.save();
            if (result instanceof Error) return;
            this.$toasted.success(this.$t("saved", { name: this.model.getName() }), { className: "successToaster" });
        },
        onRecipeRemoveButtonClick(property) {
            this.model[property] = null;
        },
        onInternalDragOver(event, property) {
            if (!ApiClient.store.collection("localStorage").isInternalDnD) return;
            event.preventDefault();
            event.stopPropagation();

            const model = parseEventModelData(event);
            if (!model || !(model instanceof Recipe.RawClass) || model.getResources().includes(this.model)) {
                event.dataTransfer.dropEffect = "none";
                return false;
            }
            event.dataTransfer.dropEffect = "link";

            let highlight = this.$refs[property];
            if (!highlight.classList) highlight = highlight.$el;
            highlight.classList.add("highlighted");
            return true;
        },
        onInternalDragLeave(property) {
            let highlight = this.$refs[property];
            if (!highlight.classList) highlight = highlight.$el;
            highlight.classList.remove("highlighted");
        },
        onInternalDrop(event, property) {
            if (!ApiClient.store.collection("localStorage").isInternalDnD) return;

            event.preventDefault();
            event.stopPropagation();

            let model = parseEventModelData(event);
            if (!model || !(model instanceof Recipe.RawClass) || model.getResources().includes(this.model)) return;
            this.model[property] = model;
        },
        onExpandCollapseButtonClick() {
            this.openDoc = !this.openDoc;
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/SpeechBubbleEditor.less"></style>
