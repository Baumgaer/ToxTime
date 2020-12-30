declare module '*.vue' {
    import Vue from 'vue'
    export default Vue
}

declare module '*.njk' {
    const value: import("nunjucks").Template;
    export default value;
}
