<template>
    <div id="app">
        <router-view></router-view>
    </div>
</template>

<script>
import "vue-material-design-icons/styles.css";
import ApiClient from "~client/lib/ApiClient";

export default {
    name: "App",
    beforeCreate() {
        window.$t = this.$t.bind(this);
        window.$toasted = this.$toasted;

        if (Object.keys(window.userInformation).length) {
            ApiClient.handleModels(window.userInformation);
            window.activeUser = ApiClient.store.getModelById(window.userInformation.collection, window.userInformation._id);
        }
    }
};
</script>

<style lang="less" src="~client/less/App.less"></style>
