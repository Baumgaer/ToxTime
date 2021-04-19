<template>
    <Avatar :class="`recipePlace ${align}Aligned`" :model="model" :fitImage="true" ratio="1:1">
        <input type="number"
               name="amount"
               class="amount"
               v-model="model.amount"
               :max="`${model.actionObject ? 1 : model.scene ? 1 : Infinity}`"
               :min="`${model.scene ? 1 : 0}`"
        />
        <div class="removeButton" @click="remove">X</div>
        <div class="location" @click="openItemSelector" ref="location">
            <Item v-if="model.location !== 'inventory'" :model="model.location" :compactMode="true" />
            <Item v-else :model="inventoryModel" :compactMode="true" />
        </div>
        <ItemSelector v-if="itemSelectorCreated" ref="itemSelector" :model="model" :attribute="'location'" :selectionFunction="itemFilter" :attachTo="$refs.location" />
    </Avatar>
</template>

<script>
import ClientModel from "~client/lib/ClientModel";
import RecipeItem from "~client/models/RecipeItem";
import Inventory from "~client/models/Inventory";

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
        }
    },
    data() {
        return {
            itemSelectorCreated: false,
            inventoryModel: new Inventory.Model()
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
            const locationDom = this.$refs.location;
            const itemSelector = this.$refs.itemSelector;
            console.log(locationDom, itemSelector);
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/RecipePlace.less"></style>
