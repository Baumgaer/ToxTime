<template>
    <div id="app">
        <router-view></router-view>
    </div>
</template>

<script>
import "vue-material-design-icons/styles.css";
import sweetAlert from "sweetalert";
import ApiClient from "~client/lib/ApiClient";
import { capitalize } from "~common/utils";

export default {
    name: "App",
    beforeCreate() {
        window.$t = this.$t.bind(this);
        window.$toasted = this.$toasted;

        window.missingRequirementsMessageTrigger = (model) => {
            const errorList = Object.keys(model.lastOccurredErrors).map((errorKey, index) => {
                const props = model.lastOccurredErrors[errorKey].properties;

                let name = props.name || props.path;
                if (errorKey.includes(".")) name = errorKey.split(".")[0] + capitalize(name);
                return `\t${index + 1}. ${this.$t(name)} (${this.$t(props.type)})`;
            }).join("\n");

            sweetAlert({
                titleText: this.$t("missingRequirementsTitle"),
                text: `${this.$t("missingRequirementsText", {
                    name: model.name
                })}${ errorList.length ? '\n\n' : ''}${errorList}`,
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
