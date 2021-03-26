<template>
    <header>
        <h2>{{ nameIsTranslated ? this.name : $t(name) }}</h2>
        <div class="buttons">
            <Button class="close" name="close" :showLabel="false" @click="onCloseButtonClick" >
                <close-icon />
            </Button>
            <Button class="save" name="save" :showLabel="false" @click="onSaveButtonClick()" >
                <content-save-icon />
            </Button>
            <slot></slot>
        </div>
    </header>
</template>

<script>
import Button from "~client/components/Button";
import ClientModel from "~client/lib/ClientModel";

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
            closeButtonClicked: false
        };
    },
    async beforeDestroy() {
        if (!this.model) return;
        const hasChanges = this.model.hasChangesDeep();
        if (!this.closeButtonClicked) {
            // Cases editor was closed unexpected
            if (hasChanges || this.model.isNew()) {
                const result = await this.model.save();
                if (!result || result instanceof Error) return this.$emit("notSaved");
                this.$toasted.success(this.$t("saved", { name: this.model.getName() }), { className: "successToaster" });
                this.$emit("saved");
            }
        } else {
            if (!this.model.isNew()) {
                if (hasChanges) {
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
    },
    methods: {
        onCloseButtonClick() {
            this.closeButtonClicked = true;
            this.$emit("closeButtonClick");
            window.activeUser.activeEditor = null;
            window.activeUser.editingModel = null;
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/EditorHead.less"></style>
