import Vue from 'vue';
import VueI18n from "vue-i18n";

Vue.use(VueI18n);

/**
 * requires all locales and adds them to an object
 *
 * @returns {Record<string, Record<string, string>>} the locale messages
 */
function loadLocaleMessages() {
    const locales = require.context('~client/locales', true, /[A-Za-z0-9-_,\s]+\.json$/i);
    /** @type {Record<string, Record<string, string>>} */
    const messages = {};
    locales.keys().forEach(key => {
        const matched = key.match(/\.\/([A-Za-z0-9-_]+)/i);
        if (matched && matched.length > 1) {
            const locale = matched[1];
            messages[locale] = locales(key);
        }
    });
    return messages;
}

export default new VueI18n({
    locale: navigator.language.toLowerCase(),
    fallbackLocale: "en-us",
    messages: loadLocaleMessages()
});
