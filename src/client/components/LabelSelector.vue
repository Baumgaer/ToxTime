<template>
    <div class="labelSelector">
        <div class="search">
            <input v-model="search" type="text" name="search" autocomplete="disable" :placeholder="$t('search')" />
        </div>
        <div class="labels">
            <item-component v-for="label in labels" :key="label._id" :model="label" :preventTooltipHiding="true" draggable="false" :compactMode="true" @click="onItemClick(label)"></item-component>
            <Button v-if="search" :name="$t('addCertainLabel', {label: search})" :nameIsTranslated="true" @click="onAddLabelButtonClick"><label-icon /></Button>
        </div>
    </div>
</template>

<script>
import ClientModel from "~client/lib/ClientModel";
import Button from "~client/components/Button.vue";
import ApiClient from '~client/lib/ApiClient';
import { itemFilterAndSort } from "~common/utils";

import Label from "~client/models/Label";

import tippy, { sticky } from "tippy.js";
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/material.css';

export default {
    components: {
        Button
    },
    props: {
        model: {
            type: ClientModel,
            required: true
        },
        attachTo: {
            type: HTMLElement,
            required: true
        }
    },
    data() {
        return {
            tippy: null,
            search: "",
            allLabels: ApiClient.store.collection("labels")
        };
    },
    computed: {
        labels() {
            const items = Object.values(this.allLabels).filter((label) => {
                return !this.model.getLabels().includes(label);
            });
            return itemFilterAndSort(items, this.search);
        }
    },
    created() {
        ApiClient.get("/labels");
    },
    mounted() {
        this.tippy = tippy(this.attachTo, {
            appendTo: this.$root.$el,
            content: this.$el,
            placement: "bottom",
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

        onItemClick(label) {
            this.model.labels.push(label);
            this.model.save();
            this.tippy.hide();
        },

        onAddLabelButtonClick() {
            const label = ApiClient.store.addModel(new Label.Model({ name: this.search }));
            this.onItemClick(label);
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/LabelSelector.less"></style>
