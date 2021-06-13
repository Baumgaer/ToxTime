<template>
    <div class="knowledgeEditor">
        <EditorHead ref="editorHead" :model="model" :name="`addKnowledge`" :onSaveButtonClick="onSaveButtonClick.bind(this)" />
        <div class="editorBody">
            <h3>{{ $t("knowledgeDescriptionDe") }}</h3>
            <section><textarea-autosize
                class="description"
                :placeholder="$t('description')"
                v-model="deDescription"
                :min-height="100"
            /></section>
            <h3>{{ $t("knowledgeDescriptionEn") }}</h3>
            <section><textarea-autosize
                class="description"
                :placeholder="$t('description')"
                v-model="enDescription"
                :min-height="100"
            /></section>
        </div>
    </div>
</template>

<script>
import EditorHead from "~client/components/EditorHead";
import { unescape } from "~common/utils";

export default {
    components: {
        EditorHead
    },
    data() {
        return {
            model: window.activeUser.editingModel
        };
    },
    computed: {
        enDescription: {
            get() {
                return unescape(this.model['description_en-us']);
            },
            set(value) {
                this.model['description_en-us'] = value;
            }
        },
        deDescription: {
            get() {
                return unescape(this.model['description_de-de']);
            },
            set(value) {
                this.model['description_de-de'] = value;
            }
        }
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
