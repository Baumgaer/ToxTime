<template>
    <div class="lessonsListItem">
        <div class="avatar" :style="`background-image: url(${model.getAvatar().name})`"></div>
        <div class="text">
            <div class="title">{{ model.getName() }}</div>
            <div class="scenes">
                <div v-for="scene in model.scenes" :key="scene._id" class="scene">
                    <div class="scenePicture" :style="`background-image: url(${scene.getAvatar().name})`"></div>
                </div>
            </div>
            <div class="description">{{ model.description }}</div>
            <div class="difficulty">{{ model.difficulty }}</div>
        </div>
    </div>
</template>

<script>
import Lesson from "~client/models/Lesson";
export default {
    props: {
        model: {
            type: Lesson.RawClass,
            required: true
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/LessonsListItem.less"></style>
