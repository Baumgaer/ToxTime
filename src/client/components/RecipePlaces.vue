<template>
    <div class="recipePlaces">
        <div v-for="item in model[prop]" :key="item._id" class="place">
            <Avatar :model="item.object" :fitImage="true" ratio="1:1">
                <input type="text" name="amount" v-model="item.amount" />
            </Avatar>
        </div>
    </div>
</template>

<script>
import Avatar from "~client/components/Avatar";
import Recipe from "~client/models/Recipe";

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
    }
};
</script>

<style lang="less" scoped src="~client/less/RecipePlaces.less"></style>
