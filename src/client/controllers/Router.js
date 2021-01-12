import Vue from 'vue';
import VueRouter from 'vue-router';
import i18n from "~client/controllers/i18n";

// import components
import Login from "~client/components/Login.vue";
import PasswordReset from "~client/components/PasswordReset.vue";

let routes = [
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
    },
    {
        name: "loginresetWithToken",
        meta: {
            title: i18n.tc("resetPassword")
        },
        path: "/login/reset/:token",
        component: PasswordReset
    },
    {
        name: "loginConfirm",
        meta: {
            title: i18n.tc("resetPassword")
        },
        path: "/login/confirm/:token",
        component: PasswordReset
    }
];

Vue.use(VueRouter);

export default class Router {

    static extendRoutes(theRoutes) {
        this.routes = this.routes.concat(theRoutes);
    }

    static init() {
        const router = new VueRouter({ mode: "history", routes: this.routes });
        router.beforeEach((to, _from, next) => {
            let title = to.meta.title;
            const component = to.matched.find((item) => {
                if (item.name === to.name) return true;
                return false;
            });
            if (component?.components?.default?.props?.subTitle) {
                title = `${component.components.default.props.subTitle} - ${title}`;
            }
            document.title = `${title} - ${global.process.environment.APP_NAME}`;
            next();
        });
        return router;
    }
}
Router.routes = routes;
