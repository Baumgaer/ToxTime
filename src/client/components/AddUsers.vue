<template>
    <div class="addUsers">
        <header>
            <h2>{{ $t('addUsers') }}</h2>
            <div class="buttons">
                <Button ref="send" class="sendButton" name="addUsers" v-on:click="onSendButtonClick()" >
                    <content-save-icon />
                </Button>
            </div>
        </header>
        <form class="form">
            <ProgressBar :model="progressModel" class="progressBar" />
            <!-- this head is used for the empty corner in the top left -->
            <div class="head clear">
                <Button ref="clear" @click="onDeleteButtonClick(-1)" name="clear" :showLabel="false" class="deleteButton">
                    <close-thick-icon />
                </Button>
            </div>
            <div v-for="(field, fieldKey) of fieldList" :key="`header${fieldKey}`">
                <div :class="`head ${field.name}`">{{ $t(field.name) }}</div>
            </div>
            <div class="row" v-for="(item, index) in model.tempUserList" :key="index">
                <Button :ref="`delete${index}`" @click="onDeleteButtonClick(index)" name="remove" :showLabel="false" class="deleteButton">
                    <close-thick-icon />
                </Button>
                <div v-for="(field, fieldKey) of fieldList" :key="fieldKey">
                    <input
                        v-if="field.type === 'text'"
                        type="text"
                        :name="`${field.name}${index}`"
                        :value="item[field.name]"
                        :ref="`${field.name}${index}`"
                        :class="`input ${field.name}`"
                        @focus="onInputFieldFocus(index)"
                        @change="onInputFieldChange(index, field.name)"
                    />
                    <ToggleSwitch
                        v-if="field.type === 'toggle'"
                        :name="`${field.name}${index}`"
                        :ref="`${field.name}${index}`"
                        :checked="field.value != null ? field.value : item[field.name]"
                        :class="`input ${field.name}`"
                        @focus="onInputFieldFocus(index)"
                        @change="onInputFieldChange(index, field.name)"
                    />
                </div>
                <div class="errors" v-for="(error, errorIndex) of item.errors" :key="`error${errorIndex}`">
                    <div class="space">{{ `${errorIndex + 1}.` }}</div>
                    <div class="error">{{ error }}</div>
                </div>
            </div>
        </form>
        <UploadHint :ownUploadHandling="onDrop.bind(this)" />
    </div>
</template>

<script>
import UploadHint from "~client/components/UploadHint";
import ToggleSwitch from "~client/components/ToggleSwitch";
import Button from "~client/components/Button";
import ProgressBar from "~client/components/ProgressBar";
import ApiClient from "~client/lib/ApiClient";
import { csvToObject } from "~common/utils";
import i18n from "~client/lib/i18n";

window._apiClient = ApiClient;

export default {
    components: {
        ToggleSwitch,
        Button,
        UploadHint,
        ProgressBar
    },
    data() {
        return {
            model: {},
            progressModel: {
                loadingStatus: 0
            },
            fieldList: [
                {name: "email", type: "text"},
                {name: "nickname", type: "text"},
                {name: "firstName", type: "text"},
                {name: "lastName", type: "text"},
                {name: "isAdmin", type: "toggle"},
                {name: "isConfirmed", type: "toggle"},
                {name: "isActive", type: "toggle", value: true}
            ]
        };
    },
    mounted() {
        const storeLocalStorage = ApiClient.store.collection("localStorage");
        if (!storeLocalStorage.tempUserList) storeLocalStorage.tempUserList = [{ errors: [] }];
        this.model = storeLocalStorage;
    },
    methods: {
        onInputFieldFocus(index) {
            if ((index + 1) === this.model.tempUserList.length) this.model.tempUserList.push({ errors: [] });
        },

        onInputFieldChange(index, name) {
            this.model.tempUserList[index][name] = this.$refs[`${name}${index}`][0].value;
        },

        onDeleteButtonClick(index) {
            if (this.model.tempUserList.length <= 1 || index === -1) {
                this.model.tempUserList = [{ errors: [] }];
            } else this.model.tempUserList.splice(index, 1);
        },

        async onSendButtonClick() {
            this.progressModel.loadingStatus = -1;
            // Destroy reference and filter items
            const users = JSON.parse(JSON.stringify(this.model.tempUserList.filter((user) => {
                user.errors = [];
                return Boolean(Object.keys(user).length - 1);
            })));
            const result = await ApiClient.post("/users/register", users);

            let subtract = 0;
            let errorOccurred = false;
            for (const [index, model] of result.data.models.entries()) {
                if (model instanceof Error) {
                    let errorToPush = i18n.t("unknownError");
                    if (model.name === "MongoError" && model.code === 11000 || model.name === "UserExistsError") {
                        errorToPush = i18n.t("userAlreadyExists");
                    } else if (model.name === "notAnEmail") errorToPush = i18n.t("notAnEmail");
                    this.model.tempUserList[index - subtract].errors.push(errorToPush);
                    errorOccurred = true;
                } else {
                    this.model.tempUserList.splice(index - subtract, 1);
                    subtract++;
                }
            }
            if (errorOccurred) {
                this.$toasted.error(this.$t("errorAddingUsers"), { className: "errorToaster" });
            } else this.$toasted.info(this.$t("usersAdded"), { className: "infoToaster" });
            if (!this.model.tempUserList.length) this.model.tempUserList = [{ errors: [] }];
            this.progressModel.loadingStatus = 0;
        },

        /**
         * @param {DragEvent} event
         */
        async onDrop(event) {
            if(!event.dataTransfer?.files?.length) return;
            /** @type {Promise<string>[]} */
            const awaitingFileContents = [];
            for (const file of Array.from(event.dataTransfer.files)) {
                if (file.type !== "application/vnd.ms-excel") continue;
                awaitingFileContents.push(file.text());
            }

            /** @type {string[]} */
            const adminConditions = global.process.environment.ECAMPUS_ADMIN_CONDITION.split(",").map((condition) => condition.trim());
            /** @type {string} */
            const /** @type {string} */ emailDomain = global.process.environment.ECAMPUS_USERNAME_EMAIL_DOMAIN.trim();
            /** @type {string} */
            const userNameFieldName = global.process.environment.ECAMPUS_MEMBER_CSV_USER_NAME_FIELD_NAME.trim();
            /** @type {string} */
            const roleFieldName = global.process.environment.ECAMPUS_MEMBER_CSV_ROLE_FIELD_NAME.trim();
            /** @type {Record<string, string>} */
            const fieldMappings = Object.fromEntries(global.process.environment.ECAMPUS_FIELD_MAPPING.split(",").map((mapping) => mapping.trim()).map((mapping) => mapping.split(":")));

            let tempUserList = [];
            const fileContents = await Promise.all(awaitingFileContents);

            // iterate files
            for (const fileContent of fileContents) {
                const usersData = csvToObject(fileContent, {
                    onData: (data) => {
                        for (const key in data) {
                            if (Object.hasOwnProperty.call(data, key)) {
                                const value = data[key];
                                if (key === userNameFieldName) data.email = `${value}@${emailDomain}`;
                                if (key === roleFieldName) data.isAdmin = adminConditions.includes(value);
                                if (fieldMappings[key]) {
                                    data[fieldMappings[key]] = value;
                                    delete data[key];
                                }
                            }
                        }
                        data.errors = [];
                        delete data[roleFieldName];
                        delete data[userNameFieldName];
                    }
                });
                tempUserList = tempUserList.concat(usersData);
            }
            this.model.tempUserList = tempUserList;
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/AddUsers.less"></style>
