import Vue from 'vue';
import VueRouter from 'vue-router';
import i18n from "~client/controllers/i18n";

// import components
import HelloWorld from "~client/components/HelloWorld.vue";
import Login from "~client/components/Login.vue";
import PasswordReset from "~client/components/PasswordReset.vue";

const routes = [
    {
        name: "admin",
        meta: {
            title: i18n.tc("helloAdmin")
        },
        path: "/admin",
        component: HelloWorld
    },
    {
        name: "public",
        meta: {
            title: i18n.tc("helloWorld")
        },
        path: "/public",
        component: HelloWorld
    },
    {
        name: "login",
        meta: {
            title: i18n.tc("login")
        },
        path: "/",
        component: Login
    },
    {
        name: "loginreset",
        meta: {
            title: i18n.tc("forgotPassword")
        },
        path: "/login/reset",
        component: PasswordReset
    }
];

Vue.use(VueRouter);
export default new VueRouter({ mode: "history", routes });
