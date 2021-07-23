<template>
    <section
        :class="`item ${
            activeClass
        }${
            model.isSelected ? ' isSelected' : ''
        }${
            hasSubObjects && showSubObjects ? ' withChildren' : ''
        }${
            model.deleted ? ' deleted' : ''
        }${
            showCheckbox ? ' withCheckBox' : ''
        }${
            checked ? ' checked' : ''
        }`"
        draggable
        @dragstart="onDragStart($event)"
        @dragend="onDragEnd($event)"
        @mouseenter="onMouseEnter"
        @mouseover.stop
        v-on="$listeners"
        ref="itemRoot"
    >
        <menu-down-icon v-if="opened && hasSubObjects && showSubObjects" class="expandCollapseButton" @click="onExpandCollapseButtonClick" :title="null" />
        <menu-right-icon v-else-if="hasSubObjects && showSubObjects" class="expandCollapseButton" @click="onExpandCollapseButtonClick" :title="null" />
        <Avatar :model="model" ratio="1:1" :fitImage="true" :overlayIcons="overlayIconString" />
        <input v-if="showCheckbox" type="checkbox" class="checkbox" v-model="checked" />
        <div class="info">
            <div class="name">
                <input
                    v-if="nameEditDBField"
                    type="text" name="name"
                    ref="nameInput"
                    autocomplete="off"
                    :value="model.getName() ? model.getName() : $t('unnamed')"
                    @change="onNameChange($event)"
                    @keyup.stop.prevent="onNameKeyUp($event)"
                    @mousedown="onMouseDown($event)"
                    @mouseup="onMouseUp($event)"
                    @blur="onNameBlur($event)"
                />
                <strong class="fixedName" v-else>{{ model.getName() ? model.getName() : $t("unnamed") }}</strong>
            </div>
            <div v-if="!$parent.isItem && model.getParent()" class="parentName">{{ model.getParent().getName() }}</div>
            <div class="actions" v-if="!compactMode">
                <div v-for="action of model.actions" :key="`${model._id || model._dummyId}${action.name}`" class="action">
                    <Button v-if="action.symbol.type === 'component' && action.condition"
                            class="action"
                            :name="action.name"
                            :showLabel="false"
                            @click="action.needsConfirmation ? confirm(action) : action.func()"
                    >
                        <component :is="action.symbol.name"></component>
                    </Button>
                </div>
            </div>
        </div>
        <ProgressBar :model="model" class="progressBar" />
        <div v-if="showSubObjects" :class="`subObjects${opened ? ' opened' : ''}`">
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
                 :overlayIcons="overlayIconString"
                 :autoCreate="true"
                 :preventTooltipHiding="preventTooltipHiding"
                 ref="tooltip"
        />
        <div class="slotted">
            <slot></slot>
        </div>
    </section>
</template>

<script>
import Button from "~client/components/Button";
import ProgressBar from "~client/components/ProgressBar";
import ApiClient from "~client/lib/ApiClient";
import Tooltip from "~client/components/Tooltip";
import Avatar from "~client/components/Avatar";
import sweetAlert from "sweetalert";
import { hideAll } from "tippy.js";

import ClientModel from "~client/lib/ClientModel";

export default {
    name: "item-component",
    components: {
        Button,
        ProgressBar,
        Tooltip,
        Avatar
    },
    props: {
        model: {
            type: ClientModel,
            required: true
        },
        showTooltip: {
            type: Boolean,
            default: true
        },
        showSubObjects: {
            type: Boolean,
            default: true
        },
        nameEditDBField: String,
        overlayIcons: {
            type: String,
            default: ""
        },
        compactMode: Boolean,
        preventTooltipHiding: Boolean,
        showCheckbox: Boolean,
        collapse: Boolean
    },
    data() {
        this.isItem = true;
        return {
            opened: true,
            checked: false,
            tooltipCreated: false
        };
    },
    computed: {
        hasSubObjects() {
            return Boolean(this.model.getSubObjects().length);
        },

        activeClass() {
            return window.activeUser.editingModel && this.model._id === window.activeUser.editingModel._id ? "active" : "";
        },

        overlayIconString() {
            return this.overlayIcons || this.model.getOverlayIcons();
        }
    },
    beforeMount() {
        this.opened = !this.collapse;
    },
    methods: {
        onMouseEnter() {
            if (!this.showTooltip) return;
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
            this.model.isSelected = true;
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
            this.$refs.tooltip?.tippy?.clearDelayTimeouts?.();
            this.$refs.tooltip?.tippy?.hide?.();

            // NOTE: This timeout is important because the tooltips appear with a delay.
            // It can happen that a tooltip is set to hidden before the animation is triggered.
            // In this case the tooltip would not be hidden.
            this.hideAllTimeout = setTimeout(hideAll, 500);

            ApiClient.store.collection("localStorage").isInternalDnD = true;

            const data = {dataCollectionName: this.model.dataCollectionName, _id: this.model._id};
            event.dataTransfer.setData("model", JSON.stringify(data));
            ApiClient.store.collection("localStorage").internalDnDData = data;
        },

        onDragEnd() {
            // Ugly FireFox hack because FF is unable to sort onDrop BEFORE dragEnd event
            setTimeout(() => {
                ApiClient.store.collection("localStorage").isInternalDnD = false;
                ApiClient.store.collection("localStorage").internalDnDData = null;
                clearTimeout(this.hideAllTimeout);
            });
        },

        onNameKeyUp(event) {
            this.model.isSelected = false;
            if (event.key === "Escape") {
                this.$refs.nameInput.value = this.model.getName();
                this.$refs.nameInput.blur();
            }
            if (event.key === "Enter") this.$refs.nameInput.blur();
        },

        async confirm(action) {
            const answer = await sweetAlert({
                title: this.$t("confirmTitle", { type: this.$t(action.name) }),
                text: this.$t("confirmQuestion", {
                    name: this.model.getName(),
                    type: this.$t(action.name).toLowerCase()
                }),
                className: "alert",
                buttons: {
                    yes: {
                        text: this.$t("true"),
                        className: "confirm",
                        value: true
                    },
                    no: {
                        text: this.$t("false"),
                        className: "reject",
                        value: false
                    }
                }
            });
            if (!answer) return;
            action.func();
        },

        /**
         * @param {Event} event
         */
        async onNameChange(event) {
            this.model.isSelected = false;
            if (!this.nameEditDBField) return;
            this.model[this.nameEditDBField] = event.target.value;
            this.$refs.nameInput.blur();

            // Do not save model when user is currently editing this model because
            // it might happen that not all requirements are fulfilled
            if (this.model === window.activeUser.editingModel) return;

            // Determine top most model to have recursive save.
            // Important to have more consistency when creating new objects
            // and renaming sub objects while current creating object is not
            // stored
            let modelToSave = this.model;
            if (this.$parent?.isItem && this.$parent.model?.hasChanges()) modelToSave = this.$parent.model;

            const result = await modelToSave.save();
            if (result instanceof Error) return;
            this.$toasted.success(this.$t("saved", { name: this.model.getName() }), { className: "successToaster" });
        },

        onNameBlur() {
            this.model.isSelected = false;
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/Item.less"></style>
