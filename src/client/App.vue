<template>
    <div id="app">
        <router-view></router-view>
    </div>
</template>

<script>
import "vue-material-design-icons/styles.css";
import sweetAlert from "sweetalert";
import ApiClient from "~client/lib/ApiClient";

export default {
    name: "App",
    beforeCreate() {
        window.$t = this.$t.bind(this);
        window.$toasted = this.$toasted;

        window.missingRequirementsMessageTrigger = (model) => {
            sweetAlert({
                title: this.$t("missingRequirementsTitle"),
                text: this.$t("missingRequirementsText", {
                    name: model.name
                }),
                className: "alert",
                buttons: {
                    ok: {
                        text: this.$t("ok"),
                        className: "info",
                        value: true
                    }
                }
            });
        };

        if (Object.keys(window.userInformation).length) {
            ApiClient.handleModels(window.userInformation);
            window.activeUser = ApiClient.store.getModelById(window.userInformation.dataCollectionName, window.userInformation._id);
        }
    }
};
</script>

<style lang="less" src="~client/less/App.less"></style>
