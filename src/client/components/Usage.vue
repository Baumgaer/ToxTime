<template>
    <div class="usage">
        <UserUsage v-if="category === 'users'" />
        <SceneUsage v-if="category === 'scenes'" />
    </div>
</template>

<script>
import UserUsage from "~client/components/UserUsage.vue";
import SceneUsage from "~client/components/SceneUsage.vue";

export default {
    components: {
        UserUsage,
        SceneUsage
    },
    props: {
        category: {
            type: String,
            required: true
        }
    }
};
</script>
