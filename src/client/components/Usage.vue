<template>
    <div class="usage">
        <UserUsage v-if="category === 'users'" />
        <SceneUsage v-if="category === 'scenes'" />
        <SceneObjectUsage v-if="category === 'sceneObjects'" />
    </div>
</template>

<script>
import UserUsage from "~client/components/UserUsage.vue";
import SceneUsage from "~client/components/SceneUsage.vue";
import SceneObjectUsage from "~client/components/SceneObjectUsage.vue";

export default {
    components: {
        UserUsage,
        SceneUsage,
        SceneObjectUsage
    },
    props: {
        category: {
            type: String,
            required: true
        }
    }
};
</script>
