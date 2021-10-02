<template>
    <div class="multiLingualDescribedEditor">
        <h3>{{ $t("description_de-de") }}</h3>
        <section><textarea-autosize
            :class="`description ${model.lastOccurredErrors[`${prefix}_de-de`] ? 'errorField' : ''}`"
            :placeholder="$t('description_de-de')"
            v-model="deDescription"
            :min-height="100"
        /></section>
        <h3>{{ $t("description_en-us") }}</h3>
        <section><textarea-autosize
            :class="`description ${model.lastOccurredErrors[`${prefix}_de-de`] ? 'errorField' : ''}`"
            :placeholder="$t('description_en-us')"
            v-model="enDescription"
            :min-height="100"
        /></section>
    </div>
</template>

<script>
import MultiLingualDescribed from "~client/models/MultiLingualDescribed";
import { unescape } from "~common/utils";

export default {
    props: {
        model: {
            type: MultiLingualDescribed.RawClass,
            required: true
        },
        prefix: {
            type: String,
            default: "description"
        }
    },
    computed: {
        enDescription: {
            get() {
                return unescape(this.model[`${this.prefix}_en-us`]);
            },
            set(value) {
                this.model[`${this.prefix}_en-us`] = value;
            }
        },
        deDescription: {
            get() {
                return unescape(this.model[`${this.prefix}_de-de`]);
            },
            set(value) {
                this.model[`${this.prefix}_de-de`] = value;
            }
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/MultiLingualDescribedEditor.less"></style>
