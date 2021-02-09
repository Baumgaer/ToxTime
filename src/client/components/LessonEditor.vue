<template>
    <div class="lessonEditor" @drop="onInternalDrop($event)" @dragover.prevent @dragenter.prevent>
        <EditorHead ref="editorHead" name="addLesson" :onSaveButtonClick="onSaveButtonClick.bind(this)"/>
        <section class="editorBody">
            <h3>{{ $t("scenes") }}</h3>
            <section class="scenes">
                <div class="scene"
                     v-for="(scene, index) of model.scenes"
                     :key="index"
                     draggable
                     @dragstart="onDragStart($event, scene)"
                     @dragend="onDragEnd($event)"
                     @dragover="onDragOver($event, index)"
                     @dragleave="onDragLeave($event, index)"
                     @drop="onInternalDrop($event, index)"
                     :ref="`scene${index}`"
                >
                    <div class="scenePicture" :style="`background-image: url(${scene.getAvatar().name})`"></div>
                    <component :is="'close-icon'" class="closeIcon" @click="onSceneRemoveClick(scene)"/>
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

        /**
         * @param {DragEvent} event
         * @param {number} [index]
         */
        onInternalDrop(event, index) {
            if (!ApiClient.store.collection("localStorage").isInternalDnD) return;

            event.preventDefault();
            event.stopPropagation();

            let eventData = event.dataTransfer.getData("model");
            if (eventData) eventData = JSON.parse(eventData);
            if (eventData) {
                const model = ApiClient.store.getModelById(eventData.collection, eventData._id);
                if (!model || !(model instanceof Scene.RawClass)) return;

                if (typeof index === "number") {
                    const element = this.$refs[`scene${index}`][0];
                    const elementRect = element.getBoundingClientRect();
                    let indexOfDraggedModel = this.model.scenes.indexOf(model);

                    let indexAddition = 0;
                    if (elementRect.x + elementRect.width / 2 <= event.clientX) indexAddition = 1;

                    element.classList.remove("rightDropTarget");
                    element.classList.remove("leftDropTarget");

                    if (indexOfDraggedModel >= 0) {
                        this.model.scenes.splice(indexOfDraggedModel, 1);
                    } else indexOfDraggedModel = index;
                    this.model.scenes.splice(indexOfDraggedModel + indexAddition, 0, model);
                } else this.model.scenes.push(model);

            }
        },

        onSceneRemoveClick(scene) {
            const index = this.model.scenes.indexOf(scene);
            if (index < 0) return;
            this.model.scenes.splice(index, 1);
        },

        /**
         * @param {DragEvent} event
         */
        onDragStart(event, model) {
            event.stopPropagation();
            ApiClient.store.collection("localStorage").isInternalDnD = true;
            event.dataTransfer.setData("model", JSON.stringify({collection: model.collection, _id: model._id}));
        },

        onDragEnd() {
            ApiClient.store.collection("localStorage").isInternalDnD = false;
        },

        /**
         * @param {DragEvent} event
         * @param {number} index
         */
        onDragOver(event, index) {
            event.preventDefault();
            event.stopPropagation();

            /** @type {HTMLElement} */
            const element = this.$refs[`scene${index}`][0];
            const elementRect = element.getBoundingClientRect();

            if (elementRect.x + elementRect.width / 2 > event.clientX) {
                element.classList.add("leftDropTarget");
                element.classList.remove("rightDropTarget");
            } else {
                element.classList.remove("leftDropTarget");
                element.classList.add("rightDropTarget");
            }
        },

        onDragLeave(event, index) {
            event.preventDefault();
            event.stopPropagation();

            /** @type {HTMLElement} */
            const element = this.$refs[`scene${index}`][0];
            element.classList.remove("rightDropTarget");
            element.classList.remove("leftDropTarget");
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/LessonEditor.less"></style>
