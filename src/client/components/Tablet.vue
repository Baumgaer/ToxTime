<template>
    <div class="tablet">
        <div class="button" ref="button"><tablet-android-icon /></div>
        <div class="device" ref="device">
            <div class="screen">
                <nav>
                    <Button :name="'information'" :active="category === 'information'" @click="onNavButtonClick('information')">
                        <information-icon />
                    </Button>
                    <Button :name="'knowledge'" :active="category === 'knowledge'" @click="onNavButtonClick('knowledge')">
                        <head-lightbulb-icon />
                    </Button>
                    <Button :name="'notes'" :active="category === 'notes'" @click="onNavButtonClick('notes')">
                        <notebook-icon />
                    </Button>
                    <Button :name="'protocol'" :active="category === 'protocol'" @click="onNavButtonClick('protocol')">
                        <text-icon />
                    </Button>
                    <Button v-if="showingFile" :name="'files'" :active="category === 'files'" @click="onNavButtonClick('files')">
                        <file-document-icon />
                    </Button>
                </nav>
                <main>
                    <section v-show="category === 'information'">
                        <h2>{{ $t("description") }}</h2>
                        {{ lessonDescription }}
                        <h2>{{ $t("finishLesson") }}</h2>
                        {{ $t('finishLessonDescription') }}<br /><br />
                        <ol>
                            <li v-for="(goal, index) of model.lesson.goals" :key="`goal_${index}`" class="goal" @click="onGoalClick(index)">
                                {{ goal[`name_${window.activeUser.locale}`] }}
                            </li>
                        </ol>
                    </section>
                    <section v-show="category === 'notes'">
                        <ol>
                            <li v-for="(note, index) of model.notes" :key="`note_${index}`" class="note">
                                <input type="text" :placeholder="$t('newNote')" :ref="`note_${index}`" v-model="model.notes[index]" />
                                <div class="removeNote" @click="onNoteRemoveClick(index)"><close-thick-icon /></div>
                            </li>
                            <li class="note">
                                <input type="text" :placeholder="$t('addNote')" @focus="onNotePlaceholderFocus" />
                            </li>
                        </ol>
                    </section>
                    <section v-show="category === 'protocol'">
                        <ul>
                            <li v-for="(entry, index) of model.protocol" :key="`protocol_${index}`">
                                <strong>{{ new Date(entry.time).toLocaleString() }}:</strong> {{ $t(`protocol_${entry.type}`, { name: modelStringToModelName(entry.object), location: $t(entry.location) }) }}
                            </li>
                        </ul>
                    </section>
                    <section v-show="category === 'knowledge'">
                        <ul>
                            <li v-for="knowledge of knowledgeBase" :key="`knowledge_${knowledge._id}`">
                                <strong>{{ knowledge.getName() }}</strong><br />
                                {{ knowledge[`description_${window.activeUser.locale}`] }}
                            </li>
                        </ul>
                    </section>
                    <iframe v-if="category === 'files'"
                            :src="`/files/${showingFile._id}/avatar?v=${showingFile.getModifyHash()}`"
                            frameborder="0"
                            class="fileFrame"
                    ></iframe>
                </main>
            </div>
            <div class="button" @click="onDeviceButtonClick"></div>
        </div>
    </div>
</template>

<script>
import GameSession from "~client/models/GameSession";

import Button from "~client/components/Button";

import ApiClient from "~client/lib/ApiClient";
import { uniq, unescape } from "~common/utils";
import sweetAlert from "sweetalert";
import tippy from "tippy.js";
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/material.css';

export default {
    components: {
        Button
    },
    props: {
        model: {
            type: GameSession.RawClass,
            required: true
        }
    },
    data() {
        return {
            category: "information",
            showingFile: null
        };
    },
    computed: {
        lessonDescription() {
            return unescape(this.model.lesson.description);
        },
        knowledgeBase() {
            return uniq(this.model.knowledgeBase);
        }
    },
    mounted() {
        this.tippy = tippy(this.$refs.button, {
            appendTo: this.$parent.$el,
            content: this.$refs.device,
            placement: "auto",
            theme: "material tablet",
            interactive: true,
            interactiveBorder: 20,
            zIndex: 20,
            hideOnClick: true,
            trigger: "click",
            showOnCreate: false
        });
    },
    methods: {
        onNavButtonClick(category) {
            this.category = category;
        },
        onDeviceButtonClick() {
            this.tippy.hide();
        },
        modelStringToModelName(modelString) {
            const [className, id] = modelString.split("_");
            const modelClass = global._modelMap[className].RawClass;
            const model = ApiClient.store.getModelById(modelClass.dataCollectionName, id);
            if (!model) return "";
            return model.getName();
        },
        onNotePlaceholderFocus() {
            this.model.notes.push("");
            setTimeout(() => this.$refs[`note_${this.model.notes.length - 1}`][0].focus());
        },
        onNoteRemoveClick(index) {
            this.model.notes.splice(index, 1);
        },
        async onGoalClick(index) {
            await this.model.finish(index);
            ApiClient.get(`users/${window.activeUser._id}`);
            await sweetAlert({
                title: this.$t("finishedLessonTitle"),
                text: this.$t("finishedLessonText", {
                    grade: Math.round(this.model.grade)
                }),
                className: "alert",
                buttons: {
                    ok: {
                        text: this.$t("ok"),
                        className: "info",
                        value: true
                    }
                }
            });
            window.activeUser.editingModel = null;
            window.activeUser.activeEditor = null;
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/Tablet.less"></style>
