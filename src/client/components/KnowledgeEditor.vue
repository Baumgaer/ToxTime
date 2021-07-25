<template>
    <div class="knowledgeEditor">
        <EditorHead ref="editorHead" :model="model" :name="`addKnowledge`" :onSaveButtonClick="onSaveButtonClick.bind(this)" />
        <div class="editorBody">
            <h4 class="documentationButton" @click="onExpandCollapseButtonClick">
                <menu-down-icon v-if="openDoc" class="expandCollapseButton" :title="null" />
                <menu-right-icon v-else class="expandCollapseButton" :title="null" />
                {{ $t('documentation') }}
            </h4>
            <VariableProgramming v-show="openDoc" />
            <MultiLingualDescribedEditor :model="model" />
        </div>
    </div>
</template>

<script>
import EditorHead from "~client/components/EditorHead";
import VariableProgramming from "~client/components/VariableProgramming";
import MultiLingualDescribedEditor from "~client/components/MultiLingualDescribedEditor";

export default {
    components: {
        EditorHead,
        VariableProgramming,
        MultiLingualDescribedEditor
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

        onExpandCollapseButtonClick() {
            this.openDoc = !this.openDoc;
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/KnowledgeEditor.less"></style>
