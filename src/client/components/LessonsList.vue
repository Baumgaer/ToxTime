<template>
    <div class="lessonsList">
        <LessonsListItem v-for="lesson in lessons" :key="lesson._id" :model="lesson" />
    </div>
</template>

<script>
import LessonsListItem from "~client/components/LessonsListItem";
import ApiClient from "~client/lib/ApiClient";

export default {
    components: {
        LessonsListItem
    },
    data() {
        return {
            lessons: ApiClient.store.collection("lessons")
        };
    }
};
</script>

<style lang="less" scoped src="~client/less/LessonsList.less"></style>
