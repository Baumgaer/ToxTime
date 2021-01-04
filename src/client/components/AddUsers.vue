<template>
    <div class="addUsers">
        <header><h2>{{ $t('addUsers') }}</h2></header>
        <form class="form">
            <div class="head email">{{ $t('email') }}</div>
            <div class="head matriculationNumber">{{ $t('matriculationNumber') }}</div>
            <div class="head isAdmin">{{ $t('isAdmin') }}</div>
            <div class="row" v-for="(item, index) in this.tempUserList" :key="index">
                <input type="text" :name="`email${index}`" :ref="`email${index}`" class="input email" v-on:focus="onInputFieldFocus(index)" v-on:change="onInputFieldChange(index, 'email')" />
                <input type="text" :name="`matriculationNumber${index}`" :ref="`matriculationNumber${index}`" class="input matriculationNumber" v-on:focus="onInputFieldFocus(index)" v-on:change="onInputFieldChange(index, 'matriculationNumber')" />
                <ToggleSwitch :name="`isAdmin${index}`" :ref="`isAdmin${index}`" class="input isAdmin" v-on:focus="onInputFieldFocus(index)" v-on:change="onInputFieldChange(index, 'isAdmin')" />
            </div>
        </form>
    </div>
</template>

<script>
import ToggleSwitch from "~client/components/ToggleSwitch";
export default {
    components: {
        ToggleSwitch
    },
    data() {
        return {
            tempUserList: [{}]
        };
    },
    methods: {
        onInputFieldFocus(index) {
            if ((index + 1) === this.tempUserList.length) this.tempUserList.push({});
        },

        onInputFieldChange(index, name) {
            this.tempUserList[index][name] = this.$refs[`${name}${index}`].value;
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/AddUsers.less"></style>
