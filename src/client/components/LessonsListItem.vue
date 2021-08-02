<template>
    <div class="lessonsListItem">
        <div class="avatarWrapper">
            <Avatar :model="model" :fitImage="true" />
            <Button :name="model.actions.play.name" @click="model.actions.play.func()">
                <component :is="model.actions.play.symbol.name" />
            </Button>
            <Button v-if="isRemovable" :name="'delete'" @click="window.activeUser.deleteGameSessionByLesson(model)">
                <component :is="'delete-icon'" />
            </Button>
        </div>
        <div class="text">
            <h2 class="title">{{ model.getName() }}</h2>
            <div class="scenes">
                <div v-for="scene in model.scenes" :key="scene._id" class="scene">
                    <div class="scenePicture" :style="`background-image: url(${scene.getAvatar().name})`"></div>
                </div>
            </div>
            <h3>{{ $t('description') }}</h3>
            <div class="description">{{ description }}</div>
        </div>
    </div>
</template>

<script>
import Lesson from "~client/models/Lesson";
import Button from "~client/components/Button";
import Avatar from "~client/components/Avatar";
import { unescape } from "~common/utils";

export default {
    components: {
        Button,
        Avatar
    },
    props: {
        model: {
            type: Lesson.RawClass,
            required: true
        },
        isRemovable: {
            type: Boolean,
            default: true
        }
    },
    computed: {
        description() {
            return unescape(this.model[`description_${window.activeUser.locale}`]);
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/LessonsListItem.less"></style>
