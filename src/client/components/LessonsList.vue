<template>
    <div class="lessonsList" v-if="lessons.length">
        <LessonsListItem v-for="lesson in lessons" :key="lesson._id" :model="lesson" :isRemovable="itemsAreRemovable" />
    </div>
    <div class="lessonsList" style="text-align: center; display: block" v-else>{{ $t('noLessonsYet') }}</div>
</template>

<script>
import LessonsListItem from "~client/components/LessonsListItem";

export default {
    components: {
        LessonsListItem
    },
    props: {
        lessons: {
            type: Array,
            default: () => []
        },
        itemsAreRemovable: {
            type: Boolean,
            default: true
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/LessonsList.less"></style>
