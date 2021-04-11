<template>
    <div class="recipePlaces" @dragenter="onDragEnter($event)">
        <div v-for="item in model[prop]" :key="item._id" class="place">
            <Avatar :model="item.object" :fitImage="true" ratio="1:1">
                <input type="text" name="amount" v-model="item.amount" />
            </Avatar>
        </div>
        <div class="placeholder" ref="placeholder">
            <gamepad-variant-icon />
        </div>
    </div>
</template>

<script>
import Avatar from "~client/components/Avatar";
import Recipe from "~client/models/Recipe";
import ApiClient from "~client/lib/ApiClient";

export default {
    components: {
        Avatar
    },
    props: {
        model: {
            type: Recipe.RawClass,
            required: true
        },
        prop: {
            type: String,
            required: true
        }
    },
    data() {
        return {
            hoveringObject: null
        };
    },
    methods: {
        onDragEnter(event) {
            console.log(event);
            if (!ApiClient.store.collection("localStorage").isInternalDnD) return;

            event.preventDefault();
            event.stopPropagation();

            let eventData = event.dataTransfer.getData("model");
            if (eventData) eventData = JSON.parse(eventData);
            if (eventData) this.hoveringObject = ApiClient.store.getModelById(eventData.collection, eventData._id);
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/RecipePlaces.less"></style>
