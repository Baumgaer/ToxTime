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
import { unescape, escape } from "~common/utils";

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
    data() {
        return {
            "en-us": {
                cache: "",
                timeout: null
            },
            "de-de": {
                cache: "",
                timeout: null
            }
        };
    },
    computed: {
        enDescription: {
            get() {
                return this.getValue("en-us");
            },
            set(value) {
                this.setValue(value, "en-us");
            }
        },
        deDescription: {
            get() {
                return this.getValue("de-de");
            },
            set(value) {
                this.setValue(value, "de-de");
            }
        }
    },
    methods: {
        getValue(language) {
            const str = this.model[`${this.prefix}_${language}`];
            if (this[language].timeout || str === this[language].cache) return this[language].cache;
            return unescape(str);
        },
        setValue(value, language) {
            this[language].cache = value;
            if (this[language].timeout) clearTimeout(this[language].timeout);
            this[language].timeout = setTimeout(() => {
                const str = this.model[`${this.prefix}_${language}`];
                if (str !== escape(value)) this.model[`${this.prefix}_${language}`] = value;
                this[language].timeout = null;
            }, 300);
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/MultiLingualDescribedEditor.less"></style>
