<template>
    <div class="usage">
        <UserUsage v-if="category === 'users'" />
        <SceneUsage v-if="category === 'scenes'" />
        <SceneObjectUsage v-if="category === 'sceneObjects'" />
        <FileUsage v-if="category === 'files'" />
    </div>
</template>

<script>
import UserUsage from "~client/components/UserUsage.vue";
import SceneUsage from "~client/components/SceneUsage.vue";
import SceneObjectUsage from "~client/components/SceneObjectUsage.vue";
import FileUsage from "~client/components/FilesUsage.vue";

export default {
    components: {
        UserUsage,
        SceneUsage,
        SceneObjectUsage,
        FileUsage
    },
    props: {
        category: {
            type: String,
            required: true
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/Usage.less"></style>
