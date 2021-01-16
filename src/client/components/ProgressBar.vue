<template>
    <div v-if="watchedModel.loadingStatus" :class="`loader ${watchedModel.loadingStatus === -1 ? 'pending' : 'loading'}`">
        <div class="bar" :style="`width: ${watchedModel.loadingStatus}%`"></div>
    </div>
</template>

<script>
export default {
    props: {
        model: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            watchedModel: {}
        };
    },
    mounted() {
        this.watchedModel = this.model;
    }
};
</script>

<style lang="less" scoped src="~client/less/ProgressBar.less"></style>
