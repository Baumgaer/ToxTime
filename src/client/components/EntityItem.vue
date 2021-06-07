<template>
    <div class="entityItem">
        <Item class="entity" :model="model" draggable="false" :showCheckbox="false" :showSubObjects="false" :nameEditDBField="'name'" :compactMode="true" />
        <div class="closeIcon" :title="$t('remove')">
            <component :is="'delete-icon'" class="deleteIcon" :title="$t('remove')" @click="onRemoveButtonClick()"/>
        </div>
        <Item v-for="subObject of model.getSubObjects()" :key="subObject._id" class="subObject" :model="subObject" :compactMode="true" :showCheckbox="false" :collapse="true">
            <component :is="'delete-icon'" class="deleteIcon" :title="$t('remove')" @click="onObjectRemoveButtonClick(subObject)"/>
        </Item>
        <Button class="addObject" name="addObject" ref="addObject" @click="onAddObjectButtonClick">
            <identifier-icon />
        </Button>
        <ItemSelector
            v-if="itemSelectorCreated"
            ref="itemSelector"
            :model="model"
            :attribute="'objects'"
            :showAddButton="false"
            :autoSave="false"
            :selectionFunction="itemFilter"
            :itemClickFunction="onItemSelect"
            :attachTo="$refs.addObject.$el"
        />
    </div>
</template>

<script>
import Item from "~client/components/Item";
import Button from "~client/components/Button";
import ItemSelector from "~client/components/ItemSelector";

import { flatten, uniq } from "~common/utils";

import Entity from "~client/models/Entity";
import Lesson from "~client/models/Lesson";
import ActionObject from "~client/models/ActionObject";
import ClickArea from "~client/models/ClickArea";

export default {
    components: {
        Item,
        Button,
        ItemSelector
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
    data() {
        return {
            itemSelectorCreated: false
        };
    },
    methods: {
        onAddObjectButtonClick() {
            this.itemSelectorCreated = true;
        },

        onRemoveButtonClick() {
            const index = this.parentModel.entities.indexOf(this.model);
            if (index < 0) return;
            this.parentModel.entities.splice(index, 1);
        },

        onObjectRemoveButtonClick(subObject) {
            let fieldName;
            if (subObject instanceof ActionObject.RawClass) fieldName = "actionObjects";
            if (subObject instanceof ClickArea.RawClass) fieldName = "clickAreas";

            const index = this.model[fieldName].indexOf(subObject);
            if (index < 0) return;
            this.model[fieldName].splice(index, 1);
        },

        onItemSelect(item) {
            if (item instanceof ActionObject.RawClass) this.model.actionObjects.push(item);
            if (item instanceof ClickArea.RawClass) this.model.clickAreas.push(item);
        },

        itemFilter() {
            const resources = [...this.parentModel.getResources(), ...uniq(flatten(this.parentModel.getRecipes().map((recipe) => recipe.getResources())))];
            const actionObjects = resources.filter((resource) => resource instanceof ActionObject.RawClass);
            const clickAreas = resources.filter((resource) => {
                return resource instanceof ClickArea.RawClass && !actionObjects.some((actionObject) => {
                    return actionObject.getResources().includes(resource);
                });
            });

            return uniq([...actionObjects, ...clickAreas]).filter((model) => {
                return !this.parentModel.entities.some((entity) => entity.objects.includes(model));
            });
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/EntityItem.less"></style>
