<template>
    <div>{{ model.getName() }}</div>
</template>

<script>
import ClientModel from "~client/lib/ClientModel";
import { createPopper, preventOverflow } from "@popperjs/core";

export default {
    props: {
        model: {
            type: ClientModel,
            required: true
        }
    },
    mounted() {
        this.manager = createPopper(this.$parent.$el, this.$el, {
            placement: "right",
            strategy: "absolute",
            modifiers: [preventOverflow]
        });
    }
};
</script>

<style lang="less" scoped></style>
