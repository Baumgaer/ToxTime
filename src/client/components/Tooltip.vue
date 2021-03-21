<template>
    <div class="tooltip">
        <Avatar :model="model" ratio="16:9" :fitImage="true" :overlayIcons="overlayIcons" />
        <div class="name">
            <input
                v-if="nameEditDBField"
                type="text" name="name"
                ref="nameInput"
                autocomplete="off"
                :value="model.getName() ? model.getName() : $t('unnamed')"
                @change="onNameChange($event, model)"
            />
            <strong v-else>{{ model.getName() ? model.getName() : $t("unnamed") }}</strong>
        </div>
        <div class="info">
            <div v-if="model.firstName" class="left">{{ $t("firstName") }}</div>
            <div v-if="model.firstName" class="right">{{ model.firstname }}</div>

            <div v-if="model.lastName" class="left">{{ $t("lastName") }}</div>
            <div v-if="model.lastName" class="right">{{ model.lastName }}</div>

            <div v-if="model.creator" class="left">{{ $t("creator") }}</div>
            <div v-if="model.creator" class="right">{{ model.creator.getName() }}</div>

            <div class="left">{{ $t("creationDate") }}</div>
            <div class="right">{{ new Date(model.creationDate).toLocaleDateString() }} - {{ new Date(model.creationDate).toLocaleTimeString() }}</div>

            <div class="left">{{ $t("lastModifiedDate") }}</div>
            <div class="right">{{ new Date(model.lastModifiedDate).toLocaleDateString() }} - {{ new Date(model.lastModifiedDate).toLocaleTimeString() }}</div>

            <div v-if="model.isAdmin !== undefined" class="left">{{ $t("isAdmin") }}</div>
            <div v-if="model.isAdmin !== undefined" class="right">{{ $t(model.isAdmin.toString()) }}</div>

            <div v-if="model.isConfirmed !== undefined" class="left">{{ $t("isConfirmed") }}</div>
            <div v-if="model.isConfirmed !== undefined" class="right">{{ $t(model.isConfirmed.toString()) }}</div>

            <div v-if="model.isActive !== undefined" class="left">{{ $t("isActive") }}</div>
            <div v-if="model.isActive !== undefined" class="right">{{ $t(model.isActive.toString()) }}</div>

            <div v-if="model.mime" class="left">{{ $t("fileType") }}</div>
            <div v-if="model.mime" class="right">{{ model.mime }}</div>

            <div v-if="model.size" class="left">{{ $t("fileSize") }}</div>
            <div v-if="model.size" class="right">{{ Math.round(((model.size / 100000) + Number.EPSILON) * 100) / 100 }}MB</div>
        </div>
        <div class="labels"></div>
        <div class="closeButton" @click.prevent.stop="onPinButtonClick($event)" ref="pinButton">
            <pin-icon :title="$t('pin')"/>
        </div>
    </div>
</template>

<script>
import ClientModel from "~client/lib/ClientModel";
import Avatar from "~client/components/Avatar";
import tippy, { sticky, hideAll, animateFill } from "tippy.js";
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/translucent.css';
import 'tippy.js/dist/backdrop.css';
import 'tippy.js/animations/shift-away.css';

export default {
    components: {
        Avatar
    },
    props: {
        model: {
            type: ClientModel,
            required: true
        },
        nameEditDBField: String,
        overlayIcons: String,
        autoCreate: Boolean
    },
    data() {
        return {
            tippy: null,
            pinned: false
        };
    },
    beforeDestroy() {
        if (!this.tippy) return;
        this.tippy.destroy();
    },
    mounted() {
        if (this.autoCreate) this.attachTo(this.$parent.$el);
    },
    methods: {
        onShow(instance) {
            hideAll({ exclude: instance, duration: 0 });
        },

        onPinButtonClick() {
            if (this.$refs.pinButton.classList.contains("active")) {
                this.$refs.pinButton.classList.remove("active");
            } else this.$refs.pinButton.classList.add("active");
            this.toggleActiveState();
        },

        /**
         * @param {Event} event
         * @param {import("~client/lib/ClientModel").default} model
         */
        async onNameChange(event, model) {
            if (!this.nameEditDBField) return;
            model[this.nameEditDBField] = event.target.value;
            const result = await model.save();
            if (result instanceof Error) return;
            this.$toasted.success(this.$t("saved", { name: model.getName() }), { className: "successToaster" });
        },

        onHide() {
            if (this.pinned) return false;
        },

        attachTo(element) {
            if (this.tippy) return;
            this.tippy = tippy(element, {
                appendTo: this.$root.$el,
                content: this.$el,
                placement: "right-start",
                theme: "translucent",
                arrow: false,
                animateFill: true,
                sticky: true,
                interactive: true,
                plugins: [sticky, animateFill],
                zIndex: 10,
                delay: [1000, 0],
                onShow: this.onShow.bind(this),
                showOnCreate: this.autoCreate,
                onHide: this.onHide.bind(this),
                hideOnClick: false,
                trigger: "mouseenter mouseover focus"
            });
        },

        toggleActiveState() {
            if (!this.tippy) return;
            this.pinned = !this.pinned;
            this.$el.parentElement.previousElementSibling.classList[this.pinned ? "add" : "remove"]("keepOpen");
        },

        show() {
            if (!this.tippy) return;
            this.tippy.show();
        },

        hide() {
            if (!this.tippy) return;
            this.tippy.hide();
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/Tooltip.less"></style>
