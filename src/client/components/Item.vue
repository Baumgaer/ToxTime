<template>
    <section class="item" draggable @dragstart="onDragStart($event)" @dragend="onDragEnd($event)" ref="itemRoot">
        <div class="avatar" v-if="hasAvatar">
            <div v-if="hasImageAvatar" :style="`background-image: url(${model.getAvatar().name})`"></div>
            <component v-else :is="model.getAvatar().name"></component>
            <div class="overlayIcons" v-if="overlayIcons">
                <component v-for="overlayIcon of overlayIcons.split(' ')" :is="overlayIcon" :key="overlayIcon" class="overlayIcon"></component>
            </div>
        </div>
        <div class="info">
            <div class="name">
                <input
                    v-if="nameEditDBField"
                    type="text" name="name"
                    ref="nameInput"
                    :value="model.getName() ? model.getName() : $t('unnamed')"
                    @change="onNameChange($event)"
                    @mousedown="onMouseDown($event)"
                    @mouseup="onMouseUp($event)"
                />
                <strong v-else>{{ model.getName() ? model.getName() : $t("unnamed") }}</strong>
            </div>
            <div class="actions">
                <div v-for="action of model.actions" :key="`${model._id || model._dummyId}${action.name}`" class="action">
                    <Button  v-if="action.symbol.type === 'component' && action.condition" class="action" :name="action.name" :showLabel="false" @click="action.func()">
                        <component :is="action.symbol.name"></component>
                    </Button>
                </div>
            </div>
        </div>
        <ProgressBar :model="model" class="progressBar" />
    </section>
</template>

<script>
import Button from "~client/components/Button";
import ProgressBar from "~client/components/ProgressBar";
import ApiClient from "~client/lib/ApiClient";

export default {
    components: {
        Button,
        ProgressBar
    },
    props: {
        model: {
            type: Object,
            required: true
        },
        nameEditDBField: String,
        overlayIcons: String
    },
    computed: {
        hasAvatar() {
            return Boolean(this.model.getAvatar());
        },

        hasImageAvatar() {
            const avatarData = this.model.getAvatar();
            if (!avatarData) return false;
            if (avatarData.type === "image") return true;
            return false;
        }
    },
    methods: {
        onMouseDown(event) {
            event.stopPropagation();
            this.$refs.itemRoot.setAttribute("draggable", "false");
        },

        onMouseUp(event) {
            event.stopPropagation();
            this.$refs.itemRoot.setAttribute("draggable", "true");
        },

        /**
         * @param {DragEvent} event
         */
        onDragStart(event) {
            event.stopPropagation();
            ApiClient.store.collection("localStorage").isInternalDnD = true;
            event.dataTransfer.setData("model", JSON.stringify({collection: this.model.collection, _id: this.model._id}));
        },

        onDragEnd() {
            ApiClient.store.collection("localStorage").isInternalDnD = false;
        },

        /**
         * @param {Event} event
         */
        onNameChange(event) {
            if (!this.nameEditDBField) return;
            this.model[this.nameEditDBField] = event.target.value;
            this.model.save();
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/Item.less"></style>
