<template>
    <section class="login">
        <form action="/login/reset" v-on:submit="doReset($event)">
            <div ref="hintBox" class="fail hintBox"></div>
            <input
                type="text"
                name="email"
                ref="email"
                class="email"
                :placeholder="$t('email')"
                v-on:keydown="resetField()"
            />
            <button type="submit" class="resetButton">
                {{ $t("resetPassword") }}
            </button>
            <router-link :to="{ name: 'loginreset' }" class="backToLogin">
                {{ $t("backToLogin") }}
            </router-link>
        </form>
    </section>
</template>

<script>
import ApiClient from "~client/controllers/ApiClient";
import { isEmail } from "validator";
import i18n from "~client/controllers/i18n";

export default {
    methods: {
        resetField() {
            this.$refs.email.classList.remove("fail");
            this.$refs.hintBox.innerText = "";
            this.$refs.hintBox.style.display = "none";
        },

        async doReset(event) {
            event.preventDefault();
            const email = this.$refs.email.value;
            if (!email || !isEmail(email)) {
                this.$refs.email.classList.add("fail");
                this.$refs.hintBox.innerText = i18n.t("emailIncorrect");
                this.$refs.hintBox.style.display = "block";
                return;
            }
            const result = await ApiClient.post("/login/reset", { email });
            console.log(result);
            if (!result.success) {
                this.$refs.hintBox.classList.add("fail");
                this.$refs.hintBox.innerText = i18n.t("errorWhileSendingEmail");
            } else {
                this.$refs.hintBox.classList.remove("fail");
                this.$refs.hintBox.classList.add("success");
                this.$refs.hintBox.innerText = i18n.t("passwordResetSuccess", {
                    email
                });
            }
            this.$refs.hintBox.style.display = "block";
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/Login.less"></style>
