<template>
    <div class="itemSelector">
        <div class="search">
            <input v-model="search" type="text" name="search" autocomplete="disable" :placeholder="$t('search')" />
        </div>
        <div class="items">
            <item-component
                v-for="item in items"
                :key="item._dummyId || item._id"
                :model="item"
                :preventTooltipHiding="true"
                :showTooltip="showTooltip"
                draggable="false"
                :compactMode="true"
                :showSubObjects="false"
                @click="onItemClick(item)"
            ></item-component>
            <Button v-if="search && showAddButton && staticModelType" :name="$t('addCertainItem', {type: staticModelType.RawClass.className, name: search})" :nameIsTranslated="true" @click="onAddItemButtonClick">
                <Avatar :model="new staticModelType.RawClass()" ratio="1:1" :fitImage="true" />
            </Button>
        </div>
    </div>
</template>

<script>
import ClientModel from "~client/lib/ClientModel";
import Button from "~client/components/Button.vue";
import Avatar from "~client/components/Avatar";
import ApiClient from '~client/lib/ApiClient';
import { itemFilterAndSort } from "~client/utils";
import { isArray } from "~common/utils";

import tippy, { sticky } from "tippy.js";
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/material.css';

export default {
    components: {
        Button,
        Avatar
    },
    props: {
        model: {
            type: ClientModel,
            required: true
        },
        attribute: {
            type: String,
            required: true
        },
        selectionFunction: {
            type: Function,
            required: true
        },
        itemClickFunction: {
            type: Function,
            required: false
        },
        showAddButton: {
            type: Boolean,
            default: true
        },
        attachTo: {
            type: HTMLElement,
            required: true
        },
        autoSave: {
            type: Boolean,
            default: true
        },
        showTooltip: {
            type: Boolean,
            default: true
        }
    },
    data() {
        return {
            tippy: null,
            search: "",
            staticModelType: null
        };
    },
    computed: {
        items() {
            const items = this.selectionFunction(this.model, this.attribute).filter((item) => {
                return !this.model[this.attribute]?.includes?.(item) || true;
            });
            return itemFilterAndSort(items, this.search);
        }
    },
    mounted() {
        this.staticModelType = this.getModelExportToCreate();

        this.tippy = tippy(this.attachTo, {
            appendTo: this.$root.$el,
            content: this.$el,
            placement: "auto",
            theme: "material",
            sticky: true,
            interactive: true,
            interactiveBorder: 20,
            plugins: [sticky],
            zIndex: 20,
            hideOnClick: true,
            trigger: "click",
            showOnCreate: true,
            onHide: () => this.$emit("hide")
        });
    },
    beforeDestroy() {
        if (!this.tippy) return;
        this.tippy.destroy();
    },
    methods: {

        hide() {
            if (!this.tippy) return;
            this.tippy.hide();
        },

        onItemClick(item) {
            if (!this.itemClickFunction) {
                const attribute = this.model[this.attribute];
                if (isArray(attribute)) {
                    attribute.push(item);
                } else this.model[this.attribute] = item;
                if (this.autoSave) this.model.save();
            } else this.itemClickFunction(item);
            this.tippy.hide();
        },

        onAddItemButtonClick() {
            if (!this.staticModelType) return;
            const item = ApiClient.store.addModel(new this.staticModelType.Model({ name: this.search }));
            this.onItemClick(item);
        },

        getModelExportToCreate() {
            let className = null;
            const allItems = this.selectionFunction(this.model, this.attribute);
            for (const item of allItems) {
                if (!className) {
                    className = item.className;
                } else if (item.className !== className) return null;
            }
            return global._modelMap[className];
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/ItemSelector.less"></style>
