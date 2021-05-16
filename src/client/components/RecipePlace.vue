<template>
    <Avatar :class="`recipePlace ${align}Aligned`" :model="model" :fitImage="true" ratio="1:1">
        <input type="number"
               name="amount"
               class="amount"
               v-model="model.amount"
               :max="`${model.getMaximumAmount()}`"
               :min="`${model.getMinimumAmount()}`"
               :disabled="!changeable"
        />
        <div v-if="changeable" class="removeButton" :title="$t('remove')">
            <close-icon @click="remove" />
        </div>
        <div class="location" @click="openItemSelector" ref="location" v-if="!model.scene && !model.file && !model.knowledge">
            <Item :model="this[`${model.location}Model`]" :compactMode="true" :showTooltip="false" draggable="false" />
        </div>
        <ItemSelector
            v-if="itemSelectorCreated && changeable"
            ref="itemSelector"
            :model="model"
            :attribute="'location'"
            :selectionFunction="itemFilter"
            :showAddButton="false"
            :attachTo="$refs.location"
            :autoSave="false"
            :showTooltip="false"
            :itemClickFunction="setLocation"
        />
    </Avatar>
</template>

<script>
import ClientModel from "~client/lib/ClientModel";
import RecipeItem from "~client/models/RecipeItem";
import Inventory from "~client/models/Inventory";
import Hand from "~client/models/Hand";
import Scene from "~client/models/Scene";

import Avatar from "~client/components/Avatar";
import Item from "~client/components/Item";
import ItemSelector from "~client/components/ItemSelector";

export default {
    components: {
        Avatar,
        Item,
        ItemSelector
    },
    props: {
        model: {
            type: RecipeItem.RawClass,
            required: true
        },
        changeable: {
            type: Boolean,
            default: false
        },
        parentModel: {
            type: ClientModel,
            required: true
        },
        prop: {
            type: String,
            required: true
        },
        align: {
            type: String,
            required: true
        },
        itemFilter: {
            type: Function,
            required: true
        }
    },
    computed: {
    },
    watch: {
        model() {
            this.itemSelectorCreated = false;
        }
    },
    data() {
        return {
            itemSelectorCreated: false,
            inventoryModel: new Inventory.Model(),
            handModel: new Hand.Model(),
            sceneModel: new Scene.Model({ name: this.$t("scene") })
        };
    },
    methods: {
        highlight() {
            this.$el.classList.add("highlight");
        },

        removeHighlight() {
            this.$el.classList.remove("highlight");
        },

        remove() {
            const itemIndex = this.parentModel[this.prop].indexOf(this.model);
            if (itemIndex < 0) return;
            this.parentModel[this.prop].splice(itemIndex, 1);
        },

        openItemSelector() {
            if (!this.changeable) return;
            this.itemSelectorCreated = true;
        },

        setLocation(model) {
            this.model.location = model.className.toLowerCase();
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/RecipePlace.less"></style>
