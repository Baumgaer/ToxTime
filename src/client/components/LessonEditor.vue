<template>
    <div class="lessonEditor" @drop="onInternalDrop($event)" @dragover.prevent @dragenter.prevent>
        <EditorHead ref="editorHead" name="addLesson" :onSaveButtonClick="onSaveButtonClick.bind(this)"/>
        <section></section>
    </div>
</template>

<script>
import EditorHead from "~client/components/EditorHead";
export default {
    components: {
        EditorHead
    },
    async beforeDestroy() {
        if (!this.$refs.editorHead.closeButtonClicked) {
            // Cases editor was closed unexpected
            if (this.model.hasChanges() || !this.model._id) {
                const result = await this.model.save();
                if (!result || result instanceof Error) return;
                this.$toasted.success(window.vm.$t("saved", { name: this.model.getName() }), { className: "successToaster" });
            }
        } else {
            if (this.model._id) {
                if (this.model.hasChanges()) {
                    this.$toasted.info(window.vm.$t("discarded", { name: this.model.getName() }), { className: "infoToaster" });
                    this.model.discard();
                }
            } else {
                this.model.destroy();
                this.$toasted.info(window.vm.$t("discarded", { name: this.model.getName() }), { className: "infoToaster" });
            }
        }
    },
    data() {
        return {
            model: window.activeUser.editingModel
        };
    },
    methods: {
        onSaveButtonClick() {
            console.log("SAVE!");
        },

        onInternalDrop(event) {
            console.log(event);
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/LessonEditor.less"></style>
