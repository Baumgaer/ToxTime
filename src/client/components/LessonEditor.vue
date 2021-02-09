<template>
    <div class="lessonEditor" @drop="onInternalDrop($event)" @dragover.prevent @dragenter.prevent>
        <EditorHead ref="editorHead" name="addLesson" :onSaveButtonClick="onSaveButtonClick.bind(this)"/>
        <section class="editorBody">
            <h3>{{ $t("scenes") }}</h3>
            <section class="scenes">
                <div class="scene" v-for="(scene, index) of model.scenes" :key="index">
                    <div class="scenePicture" :style="`background-image: url(${scene.getAvatar().name})`"></div>
                    <component :is="'close-icon'" class="closeIcon"/>
                    <div class="name">{{ scene.name }}</div>
                </div>
            </section>
            <h3>{{ $t("recipes") }}</h3>
            <section></section>
            <h3>{{ $t("goals") }}</h3>
            <section></section>
        </section>
    </div>
</template>

<script>
import EditorHead from "~client/components/EditorHead";
import ApiClient from "~client/lib/ApiClient";
import Scene from "~client/models/Scene";

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
            if (!ApiClient.store.collection("localStorage").isInternalDnD) return;

            event.preventDefault();
            event.stopPropagation();

            let eventData = event.dataTransfer.getData("model");
            if (eventData) eventData = JSON.parse(eventData);
            if (eventData) {
                const model = ApiClient.store.getModelById(eventData.collection, eventData._id);
                if (!model || !(model instanceof Scene.RawClass)) return;
                this.model.scenes.push(model);
            }
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/LessonEditor.less"></style>
