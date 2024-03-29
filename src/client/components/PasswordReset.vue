<template>
    <section class="login">
        <div class="welcomeBox">{{ $t("resetPassword") }}</div>
        <form v-on:submit="doReset($event)" v-if="!$route.params.token">
            <div ref="hintBox" class="fail hintBox"></div>
            <input type="email" name="email" ref="email" class="email" :placeholder="$t('email')" v-on:keydown="resetField('email')" />
            <div class="buttons">
                <button type="submit" class="resetButton">
                    {{ $t("resetPassword") }}
                </button>
                <router-link :to="{ name: 'login' }" class="backToLogin">
                    {{ $t("backToLogin") }}
                </router-link>
            </div>
        </form>
        <form v-on:submit="setPassword($event)" v-else>
            <div ref="hintBox" class="fail hintBox"></div>
            <section>
                <input type="password" autocomplete="new-password" name="password" class="password" ref="password" :placeholder="$t('password')" v-on:keydown="resetField('password')" />
                <input type="password" autocomplete="new-password" name="repeatPassword" class="password" ref="repeatPassword" :placeholder="$t('repeatPassword')" v-on:keydown="resetField('repeatPassword')" />
                <div class="buttons">
                    <button type="submit" class="setPasswordButton">
                        {{ $t("setPassword") }}
                    </button>
                </div>
            </section>
        </form>
    </section>
</template>

<script>
import ApiClient from "~client/lib/ApiClient";
import { isEmail } from "validator";
import i18n from "~client/lib/i18n";

export default {
    methods: {
        resetField(fieldName) {
            this.$refs[fieldName].classList.remove("fail");
            this.$refs[fieldName].classList.remove("success");
            this.$refs.hintBox.innerText = "";
            this.$refs.hintBox.style.display = "none";
        },

        hint(type, fieldName, message) {
            if (type === "error") {
                if (fieldName) this.$refs[fieldName].classList.add("fail");
                this.$refs.hintBox.innerText = message;
                this.$refs.hintBox.classList.add("fail");
                this.$refs.hintBox.classList.remove("success");
                this.$refs.hintBox.style.display = "block";
            } else {
                this.$refs.hintBox.innerText = message;
                this.$refs.hintBox.classList.add("success");
                this.$refs.hintBox.classList.remove("fail");
                this.$refs.hintBox.style.display = "block";
            }
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
            if (result instanceof Error) {
                this.hint("error", null, i18n.t("errorWhileSendingEmail"));
            } else this.hint("success", null, i18n.t("passwordResetSuccess", { email }));
        },

        async setPassword(event) {
            event.preventDefault();
            const password = this.$refs.password.value;
            const repeatPassword = this.$refs.repeatPassword.value;
            if (!password) return this.hint("error", "password", i18n.t("passwordNotFilled"));
            if (!repeatPassword) return this.hint("error", "repeatPassword", i18n.t("passwordNotFilled"));
            if (password !== repeatPassword) {
                this.hint("error", "password", i18n.t("passwordsNotEqual"));
                this.hint("error", "repeatPassword", i18n.t("passwordsNotEqual"));
                return;
            }
            const result = await ApiClient.post(this.$route.path, {password, repeatPassword });
            if (result instanceof Error) return this.hint("error", result.error.field, i18n.t(result.error.name));
            this.hint("success", null, i18n.t("passwordSuccessfullySet"));
            setTimeout(() => this.$router.push("/"), 2000);
        }
    }
};
</script>

<style lang="less" scoped src="~client/less/Login.less"></style>
