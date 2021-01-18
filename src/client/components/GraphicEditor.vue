<template>
    <div class="graphicEditor">
        <header>
            <h2>{{ $t('addUsers') }}</h2>
            <div class="buttons">
                <Button ref="send" class="sendButton" name="addUsers" v-on:click="onSendButtonClick()" >
                    <content-save-icon />
                </Button>
            </div>
        </header>
        <canvas ref="canvas" resize @drop="onInternalDrop($event)" class="canvas"></canvas>
        <UploadHint v-if="type !== 'scene'" ref="uploadHint" :uploadReadyFunc="onUploadReady.bind(this)" />
    </div>
</template>

<script>
import Button from "~client/components/Button";
import UploadHint from "~client/components/UploadHint";
import ApiClient from "~client/lib/ApiClient";
import paper from "paper";
import SceneObject from "~client/models/SceneObject";


export default {
    components: {
        Button,
        UploadHint
    },
    props: {
        type: {
            type: String,
            required: true,
            default: "scene"
        }
    },
    data() {
        return {
            paper: new paper.PaperScope(),
            model: {}
        };
    },
    mounted() {
        this.model = ApiClient.store.addModel(new SceneObject.Model());
        this.paper.install(this);
        this.paper.setup(this.$refs.canvas);
    },
    beforeDestroy() {
        console.log("save it!");
        if (this.model.hasChanges()) {
            this.$toasted.success(window.vm.$t("saved", { name: this.model.getName() }), { className: "successToaster" });
            return this.model.save();
        }
        this.model.destroy();
    },
    methods: {
        /**
         * @param {DragEvent} event
         */
        onInternalDrop(event) {
            if (!ApiClient.store.collection("localStorage").isInternalDnD) return;
            ApiClient.store.collection("localStorage").isInternalDnD = false;

            event.preventDefault();
            event.stopPropagation();

            if (event.model) this.addObject(event.model);
        },

        /**
         * @param {import("~client/models/File")["default"]["Model"]} files
         */
        onUploadReady(files) {
            for (const file of files) {
                if (!file.mime.startsWith("image")) continue;
                this.addObject(file);
                break;
            }
        },

        addObject(model) {
            console.log(model);
        }
    }
};
</script>

<style lang="less" scoped></style>
