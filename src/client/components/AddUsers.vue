<template>
    <div class="addUsers" v-cloak @drop.prevent="onDrop($event)" @dragover.prevent>
        <header>
            <h2>{{ $t('addUsers') }}</h2>
            <div class="buttons">
                <Button ref="send" class="sendButton" name="addUsers" v-on:click="onSendButtonClick()" >
                    <check-bold-icon />
                </Button>
            </div>
        </header>
        <form class="form">
            <div class="head"></div>
            <div v-for="(field, fieldKey) of fieldList" :key="`header${fieldKey}`">
                <div :class="`head ${field.name}`">{{ $t(field.name) }}</div>
            </div>
            <div class="row" v-for="(item, index) in this.tempUserList" :key="index">
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
    </div>
</template>

<script>
import ToggleSwitch from "~client/components/ToggleSwitch";
import Button from "~client/components/Button";
import ApiClient from "~client/lib/ApiClient";
import { csvToObject } from "~common/utils";
import i18n from "~client/lib/i18n";

export default {
    components: {
        ToggleSwitch,
        Button
    },
    data() {
        return {
            tempUserList: [{ errors: [] }],
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
    methods: {
        onInputFieldFocus(index) {
            if ((index + 1) === this.tempUserList.length) this.tempUserList.push({ errors: [] });
        },

        onInputFieldChange(index, name) {
            this.tempUserList[index][name] = this.$refs[`${name}${index}`][0].value;
        },

        onDeleteButtonClick(index) {
            if (this.tempUserList.length <= 1) {
                this.tempUserList = [{ errors: [] }];
            } else this.tempUserList.splice(index, 1);
        },

        async onSendButtonClick() {
            // Destroy reference and filter items
            const users = JSON.parse(JSON.stringify(this.tempUserList)).filter((user) => {
                user.errors = [];
                return Boolean(Object.keys(user).length - 1);
            });
            const result = await ApiClient.post("/users/register", users);

            let subtract = 0;
            for (const [index, model] of result.data.models.entries()) {
                if (model instanceof Error) {
                    let errorToPush = i18n.t("unknownError");
                    if (model.name === "MongoError" && model.code === 11000 || model.name === "UserExistsError") {
                        errorToPush = i18n.t("userAlreadyExists");
                    } else if (model.name === "notAnEmail") errorToPush = i18n.t("notAnEmail");
                    this.tempUserList[index - subtract].errors.push(errorToPush);
                } else {
                    this.tempUserList.splice(index - subtract, 1);
                    subtract++;
                }
            }
            if (!this.tempUserList.length) this.tempUserList = [{ errors: [] }];
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
            this.tempUserList = tempUserList;
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/AddUsers.less"></style>
