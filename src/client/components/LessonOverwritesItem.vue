<template>
    <div class="lessonOverwritesItem">
        <div class="title">{{ model.getName() }} <close-icon @click="hide" /></div>
        <div class="field" v-for="(field, index) of model.getOverwritableFields(lesson)" :key="`field_${field.name}_${index}`">
            <div class="key">{{ $t(field.name) }}</div>
            <div class="value">
                <input
                    :type="field.type"
                    :name="field.name"
                    :min="field.min"
                    :max="field.max"
                    :value="field.value"
                    :checked="field.value"
                    :disabled="field.disabled"
                    @change="overwriteValue(model, $event)"
                    :ref="`field_${field.name}_${index}`"
                />
            </div>
        </div>
    </div>
</template>

<script>
import ClientModel from "~client/lib/ClientModel";
import Lesson from "~client/models/Lesson";

export default {
    name: "lesson-overwrites-item",
    props: {
        model: {
            type: ClientModel,
            required: true
        },
        lesson: {
            type: Lesson.RawClass,
            required: true
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/LessonOverwritesItem.less"></style>
