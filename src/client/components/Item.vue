<template>
    <section
        :class="`item ${activeClass}${model.isSelected ? ' isSelected' : ''}${hasSubObjects ? ' withChildren' : ''}`"
        draggable
        @dragstart="onDragStart($event)"
        @dragend="onDragEnd($event)"
        @mouseenter="onMouseEnter"
        @mouseover.stop
        ref="itemRoot"
    >
        <menu-down-icon v-if="opened && hasSubObjects" class="expandCollapseButton" @click="onExpandCollapseButtonClick" :title="null" />
        <menu-right-icon v-else-if="hasSubObjects" class="expandCollapseButton" @click="onExpandCollapseButtonClick" :title="null" />
        <div class="avatar" v-if="hasAvatar" :title="model.getAvatar().title">
            <div v-if="hasImageAvatar" :style="`background-image: url(${model.getAvatar().name})`"></div>
            <component v-else :is="model.getAvatar().name" :title="model.getAvatar().title"></component>
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
                    autocomplete="off"
                    :value="model.getName() ? model.getName() : $t('unnamed')"
                    @change="onNameChange($event, model)"
                    @mousedown="onMouseDown($event)"
                    @mouseup="onMouseUp($event)"
                />
                <strong v-else>{{ model.getName() ? model.getName() : $t("unnamed") }}</strong>
            </div>
            <div class="actions" v-if="!compactMode">
                <div v-for="action of model.actions" :key="`${model._id || model._dummyId}${action.name}`" class="action">
                    <Button  v-if="action.symbol.type === 'component' && action.condition" class="action" :name="action.name" :showLabel="false" @click="action.func()">
                        <component :is="action.symbol.name"></component>
                    </Button>
                </div>
            </div>
        </div>
        <ProgressBar :model="model" class="progressBar" />
        <div :class="`subObjects${opened ? ' opened' : ''}`">
            <item-component
                v-for="(subObject, index) of model.getSubObjects()"
                :key="index"
                :model="subObject"
                :nameEditDBField="['User', 'SystemUser'].includes(subObject.className) ? 'email' : 'name'"
                :compactMode="true"
            />
        </div>
        <Tooltip v-if="tooltipCreated"
                 :model="model"
                 :nameEditDBField="nameEditDBField"
                 :overlayIcons="overlayIcons"
                 :autoCreate="true"
                 ref="tooltip"
        />
    </section>
</template>

<script>
import Button from "~client/components/Button";
import ProgressBar from "~client/components/ProgressBar";
import ApiClient from "~client/lib/ApiClient";
import Tooltip from "~client/components/Tooltip";

export default {
    name: "item-component",
    components: {
        Button,
        ProgressBar,
        Tooltip
    },
    props: {
        model: {
            type: Object,
            required: true
        },
        nameEditDBField: String,
        overlayIcons: String,
        compactMode: Boolean
    },
    data() {
        this.isItem = true;
        return {
            opened: true,
            tooltipCreated: false
        };
    },
    computed: {
        hasSubObjects() {
            return Boolean(this.model.getSubObjects().length);
        },

        hasAvatar() {
            return Boolean(this.model.getAvatar());
        },

        hasImageAvatar() {
            const avatarData = this.model.getAvatar();
            if (!avatarData) return false;
            if (avatarData.type === "image") return true;
            return false;
        },

        activeClass() {
            return window.activeUser.editingModel && this.model._id === window.activeUser.editingModel._id ? "active" : "";
        }
    },
    methods: {
        onMouseEnter() {
            this.tooltipCreated = true;
        },

        onExpandCollapseButtonClick() {
            this.opened = !this.opened;
        },

        onMouseDown(event) {
            event.stopPropagation();
            this.$refs.itemRoot.setAttribute("draggable", "false");
            let parent = this.$parent;
            while (parent?.isItem) {
                parent.$refs.itemRoot.setAttribute("draggable", "false");
                parent = parent.$parent;
            }
        },

        onMouseUp(event) {
            event.stopPropagation();
            this.$refs.itemRoot.setAttribute("draggable", "true");
            let parent = this.$parent;
            while (parent?.isItem) {
                parent.$refs.itemRoot.setAttribute("draggable", "true");
                parent = parent.$parent;
            }
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
         * @param {import("~client/lib/ClientModel").default} model
         */
        async onNameChange(event, model) {
            if (!this.nameEditDBField) return;
            model[this.nameEditDBField] = event.target.value;
            const result = await model.save();
            if (result instanceof Error) return;
            this.$toasted.success(this.$t("saved", { name: model.getName() }), { className: "successToaster" });
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/Item.less"></style>
