<template>
    <header>
        <h2>{{ nameIsTranslated ? this.name : $t(name) }}</h2>
        <div class="buttons">
            <Button class="close" name="close" :showLabel="false" @click="onCloseButtonClick" >
                <close-icon />
            </Button>
            <Button class="save" name="save" :showLabel="false" @click="onSaveClick" >
                <content-save-icon />
            </Button>
            <slot></slot>
        </div>
    </header>
</template>

<script>
import Button from "~client/components/Button";
import ClientModel from "~client/lib/ClientModel";
import sweetAlert from "sweetalert";

export default {
    components: {
        Button
    },
    props:{
        model: {
            type: ClientModel
        },
        name: {
            type: String,
            required: true
        },
        nameIsTranslated: Boolean,
        onSaveButtonClick:{
            type: Function,
            required: true
        }
    },
    data() {
        return {
            closeButtonClicked: false,
            finishedDestroy: false,
            hasChanges: null
        };
    },
    async beforeDestroy() {
        if (!this.model) {
            this.finishedDestroy = true;
            return;
        }
        this.hasChanges = this.hasChanges === null ? this.model.hasChangesDeep() : this.hasChanges;
        if (!this.closeButtonClicked) {
            // Cases editor was closed unexpected
            if (this.hasChanges || this.model.isNew()) {
                const result = await this.model.save();
                if (!result || result instanceof Error) {
                    if (this.model.isNew()) this.model.destroy();
                    this.finishedDestroy = true;
                    return this.$emit("notSaved");
                }
                this.$toasted.success(this.$t("saved", { name: this.model.getName() }), { className: "successToaster" });
                this.$emit("saved");
            }
        } else {
            if (!this.model.isNew()) {
                if (this.hasChanges) {
                    this.$toasted.info(this.$t("discarded", { name: this.model.getName() }), { className: "infoToaster" });
                    this.model.discardDeep();
                    this.$emit("discarded");
                }
            } else {
                this.model.destroy();
                this.$toasted.info(this.$t("discarded", { name: this.model.getName() }), { className: "infoToaster" });
                this.$emit("discarded");
            }
        }
        this.finishedDestroy = true;
    },
    methods: {
        async onSaveClick() {
            if (!this.model || this.model.isValid()) return this.onSaveButtonClick();
            window.missingRequirementsMessageTrigger(this.model);
        },

        async onCloseButtonClick() {
            this.$emit("preCloseButtonClickConfirm");
            this.hasChanges = this.model?.hasChangesDeep();
            if (this.hasChanges) {
                const answer = await sweetAlert({
                    title: this.$t("closeItTitle"),
                    text: this.$t("closeItQuestion", {
                        name: this.model.getName()
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
            }
            this.closeButtonClicked = true;
            this.$emit("closeButtonClick");
            window.activeUser.activeEditor = null;
            window.activeUser.editingModel = null;
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/EditorHead.less"></style>
