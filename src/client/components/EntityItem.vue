<template>
    <div class="entityItem">
        <Item class="entity" :model="model" draggable="false" :showCheckbox="false" :showSubObjects="false" :nameEditDBField="'name'" :compactMode="true" />
        <div class="closeIcon" :title="$t('remove')">
            <component :is="'delete-icon'" class="deleteIcon" :title="$t('remove')" @click="onRemoveButtonClick()"/>
        </div>
        <Item v-for="subObject of model.getSubObjects()" :key="subObject._id" class="subObject" :model="subObject" :compactMode="true" :showCheckbox="false" :collapse="true" />
        <Button class="addObject" name="addObject" @click="onAddObjectButtonClick">
            <identifier-icon />
        </Button>
    </div>
</template>

<script>
import Item from "~client/components/Item";
import Button from "~client/components/Button";

import Entity from "~client/models/Entity";
import Lesson from "~client/models/Lesson";

export default {
    components: {
        Item,
        Button
    },
    props: {
        model: {
            type: Entity.RawClass,
            required: true
        },
        parentModel: {
            type: Lesson.RawClass,
            required: true
        }
    },
    methods: {
        onAddObjectButtonClick() {
            console.log("add an object");
        },

        onRemoveButtonClick() {
            const index = this.parentModel.entities.indexOf(this.model);
            if (index < 0) return;
            this.parentModel.entities.splice(index, 1);
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/EntityItem.less"></style>
