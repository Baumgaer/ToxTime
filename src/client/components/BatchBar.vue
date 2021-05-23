<template>
    <div class="batchBar">
        <input type="checkbox" class="checkbox" :checked="`${allChecked ? 'checked' : ''}`" @click="onCheckboxClick" ref="checkbox">
        <div class="actions">
            <div v-for="action of actions" :key="action.name" class="action">
                <Button
                    class="action"
                    :name="action.name"
                    :showLabel="false"
                    @click="action.needsConfirmation ? showConfirmation(action) : action.func()"
                >
                    <component :is="action.symbol.name"></component>
                </Button>
            </div>
        </div>
    </div>
</template>

<script>
import ApiClient from "~client/lib/ApiClient";
import { intersectionBy } from "~common/utils";

import Button from "~client/components/Button";
import sweetAlert from "sweetalert";

export default {
    components: {
        Button
    },
    props: {
        items: {
            type: Array,
            required: true
        }
    },
    computed: {
        checkedItems() {
            const checkedItems = [];
            for (const item of this.items) {
                if (this.$parent.$refs[item._dummyId || item._id][0].checked) checkedItems.push(item);
            }
            return checkedItems;
        },

        allChecked() {
            return this.checkedItems && this.checkedItems.length === this.items.length;
        },

        actions() {
            const allActions = [];
            for (const checkedItem of this.checkedItems) {
                const actions = Object.values(checkedItem.actions).filter((action) => action.condition);
                for (const actionName in checkedItem.actions) {
                    if (checkedItem.actions[actionName].condition) actions.push(checkedItem.actions[actionName]);
                }
                allActions.push(actions);
            }
            const multiActions = intersectionBy(...allActions, "name");
            return multiActions.filter((action) => action.name in this).map((action) => {
                return {
                    name: action.name,
                    func: this[action.name],
                    symbol: action.symbol,
                    needsConfirmation: action.needsConfirmation
                };
            });
        }
    },
    methods: {
        logout() {
            ApiClient.post("/batch/logout", { identities: this.getIdentities() });
        },

        lock() {
            ApiClient.post("/batch/toggleLock", { identities: this.getIdentities() });
        },

        unlock() {
            ApiClient.post("/batch/toggleLock", { identities: this.getIdentities() });
        },

        resentConfirm() {
            ApiClient.post("/batch/resentConfirm", { identities: this.getIdentities() });
        },

        copy() {
            console.log(this.checkedItems);
        },

        delete() {
            ApiClient.post("/batch/delete", { identities: this.getIdentities() });
        },

        download() {

        },

        onCheckboxClick() {
            const value = this.$refs.checkbox.checked;
            for (const item of this.items) {
                this.$parent.$refs[item.dummyId || item._id][0].checked = value;
            }
        },

        async showConfirmation(action) {
            const answer = await sweetAlert({
                title: this.$t("confirmTitle", { type: this.$t(action.name) }),
                text: this.$t("confirmQuestion", {
                    name: this.$t("xElements", { count: this.checkedItems.length }),
                    type: this.$t(action.name).toLowerCase()
                }),
                className: "alert",
                buttons: {
                    yes: {
                        text: this.$t("true"),
                        className: "confirm",
                        value: true
                    },
                    no: {
                        text: this.$t("false"),
                        className: "reject",
                        value: false
                    }
                }
            });
            if (!answer) return;
            action.func();
        },

        getIdentities() {
            return this.checkedItems.map((item) => {
                return {
                    _id: item._id,
                    className: item.className,
                    dataCollectionName: item.dataCollectionName
                };
            });
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/BatchBar.less"></style>
