<template>
    <section
        :class="`item ${activeClass}${model.isSelected ? ' isSelected' : ''}${hasSubObjects ? ' withChildren' : ''}`"
        draggable
        @dragstart="onDragStart($event)"
        @dragend="onDragEnd($event)"
        @mouseenter="onMouseEnter"
        @mouseover.stop
        v-on="$listeners"
        ref="itemRoot"
    >
        <menu-down-icon v-if="opened && hasSubObjects" class="expandCollapseButton" @click="onExpandCollapseButtonClick" :title="null" />
        <menu-right-icon v-else-if="hasSubObjects" class="expandCollapseButton" @click="onExpandCollapseButtonClick" :title="null" />
        <Avatar :model="model" ratio="1:1" :fitImage="true" :overlayIcons="overlayIcons" />
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
                <strong class="fixedName" v-else>{{ model.getName() ? model.getName() : $t("unnamed") }}</strong>
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
            type: Object,
            required: true
        },
        nameEditDBField: String,
        overlayIcons: String,
        compactMode: Boolean,
        preventTooltipHiding: Boolean
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
            return Boolean(this.model?.getSubObjects().length);
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
