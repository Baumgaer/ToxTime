<template>
    <div class="lessonEditor" @drop="onInternalDrop($event)" @dragover.prevent @dragenter.prevent>
        <EditorHead ref="editorHead" name="addLesson" :model="model" :onSaveButtonClick="onSaveButtonClick.bind(this)" />
        <section class="editorBody">
            <h3>{{ $t("scenes") }}</h3>
            <section class="itemList">
                <Avatar
                    v-for="(scene, index) of model.scenes"
                    :key="scene._id"
                    draggable
                    :model="scene"
                    ratio="1:1"
                    @dragstart="onDragStart($event, scene, 'scene')"
                    @dragend="onDragEnd($event, 'scene')"
                    @dragover="onDragOver($event, index, 'scene')"
                    @dragleave="onDragLeave($event, index, 'scene')"
                    @drop.prevent.stop="onInternalDrop($event, index)"
                    :ref="`scene${index}`"
                >
                    <div class="scenePicture" :style="`background-image: url(${scene.getAvatar().name})`"></div>
                    <component :is="'close-icon'" class="closeIcon" @click="onSceneRemoveClick(scene)"/>
                    <div class="name">{{ scene.name }}</div>
                </Avatar>
            </section>
            <h3>{{ $t("inventory") }}</h3>
            <section class="itemList">
                <Avatar
                    v-for="(item, index) of model.inventory"
                    :key="item._id"
                    draggable
                    :model="item"
                    ratio="1:1"
                    :fitImage="true"
                    @dragstart="onDragStart($event, item, 'item')"
                    @dragend="onDragEnd($event, 'item')"
                    @dragover="onDragOver($event, index, 'item')"
                    @dragleave="onDragLeave($event, index, 'item')"
                    @drop.prevent.stop="onInternalDrop($event, index)"
                    :ref="`item${index}`"
                >
                    <div class="itemPicture" :style="`background-image: url(${item.getAvatar().name})`"></div>
                    <component :is="'close-icon'" class="closeIcon" @click="onItemRemoveClick(item)"/>
                    <div class="name">{{ item.name }}</div>
                </Avatar>
            </section>
            <h3>{{ $t("description") }}</h3>
            <section><textarea-autosize
                class="description"
                :placeholder="$t('description')"
                v-model="model.description"
                :min-height="100"
            /></section>
            <h3>{{ $t("recipes") }}</h3>
            <section></section>
            <h3>{{ $t("goals") }}</h3>
            <section></section>
        </section>
    </div>
</template>

<script>
import EditorHead from "~client/components/EditorHead";
import Avatar from "~client/components/Avatar";
import ApiClient from "~client/lib/ApiClient";
import Scene from "~client/models/Scene";
import SceneObject from "~client/models/SceneObject";

export default {
    components: {
        EditorHead,
        Avatar
    },
    data() {
        return {
            model: window.activeUser.editingModel
        };
    },
    methods: {
        async onSaveButtonClick() {
            const result = await this.model.save();
            if (!result || result instanceof Error) return;
            this.$toasted.success(this.$t("saved", { name: this.model.getName() }), { className: "successToaster" });
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
            if (!eventData) return;

            const model = ApiClient.store.getModelById(eventData.collection, eventData._id);
            if (!model || !(model instanceof Scene.RawClass) && !(model instanceof SceneObject.RawClass)) return;

            const field = model instanceof Scene.RawClass ? "scenes" : "inventory";
            const type = model instanceof Scene.RawClass ? "scene" : "item";

            if (typeof index === "number") {
                const element = this.$refs[`${type}${index}`][0].$el;
                const elementRect = element.getBoundingClientRect();
                let indexOfDraggedModel = this.model[field].indexOf(model);

                let indexAddition = 0;
                if (elementRect.x + elementRect.width / 2 <= event.clientX) indexAddition = 1;
                if (index > indexOfDraggedModel) indexAddition = 0;

                element.classList.remove("rightDropTarget");
                element.classList.remove("leftDropTarget");

                if (indexOfDraggedModel >= 0) {
                    this.model[field].splice(indexOfDraggedModel, 1);
                } else indexOfDraggedModel = index;
                this.model[field].splice(index + indexAddition, 0, model);
            } else this.model[field].push(model);
        },

        onSceneRemoveClick(scene) {
            const index = this.model.scenes.indexOf(scene);
            if (index < 0) return;
            this.model.scenes.splice(index, 1);
        },

        onItemRemoveClick(item) {
            const index = this.model.inventory.indexOf(item);
            if (index < 0) return;
            this.model.inventory.splice(index, 1);
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
         * @param {"scene" | "item"} type
         */
        onDragOver(event, index, type) {
            event.preventDefault();
            event.stopPropagation();

            /** @type {HTMLElement} */
            const element = this.$refs[`${type}${index}`][0].$el;
            const elementRect = element.getBoundingClientRect();

            if (elementRect.x + elementRect.width / 2 > event.clientX) {
                element.classList.add("leftDropTarget");
                element.classList.remove("rightDropTarget");
            } else {
                element.classList.remove("leftDropTarget");
                element.classList.add("rightDropTarget");
            }
        },

        onDragLeave(event, index, type) {
            event.preventDefault();
            event.stopPropagation();

            /** @type {HTMLElement} */
            const element = this.$refs[`${type}${index}`][0].$el;
            element.classList.remove("rightDropTarget");
            element.classList.remove("leftDropTarget");
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/LessonEditor.less"></style>
