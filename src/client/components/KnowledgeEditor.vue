<template>
    <div class="knowledgeEditor">
        <EditorHead ref="editorHead" :model="model" :name="`addKnowledge`" :onSaveButtonClick="onSaveButtonClick.bind(this)" />
        <div class="editorBody">
            <MultiLingualDescribedEditor :model="model" />
        </div>
    </div>
</template>

<script>
import EditorHead from "~client/components/EditorHead";
import MultiLingualDescribedEditor from "~client/components/MultiLingualDescribedEditor";

export default {
    components: {
        EditorHead,
        MultiLingualDescribedEditor
    },
    data() {
        return {
            model: window.activeUser.editingModel
        };
    },
    methods: {
        async onSaveButtonClick() {
            const result = await this.model.save();
            if (result instanceof Error) return;
            this.$toasted.success(this.$t("saved", { name: this.model.getName() }), { className: "successToaster" });
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/KnowledgeEditor.less"></style>
