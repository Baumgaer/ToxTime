const fs = require("graceful-fs");
const path = require("path");
const arp = require("app-root-path");
const prompts = require("prompts");
const yaml = require("yaml");
const pm2 = require("pm2");
const childProcess = require("child_process");
const commandLineArgs = require("command-line-args");
const ecosystem = require("./ecosystem.config");

const configFilePath = path.resolve(arp.path, "config.yaml");
const options = commandLineArgs([{ name: "config", alias: "c", type: Boolean }, { name: "register", alias: "r", type: Boolean }]);

/**
 *
 *
 */
function getDefaults() {
    return ecosystem.defaults;
}

/**
 *
 *
 */
function getConfig() {
    const config = {};
    if (fs.existsSync(configFilePath)) {
        const configYml = fs.readFileSync(configFilePath).toString();
        Object.assign(config, yaml.parse(configYml));
    }
    return config;
}

/**
 *
 *
 */
function getConfigQuestions() {

    const ecosystemString = fs.readFileSync(path.resolve(arp.path, "ecosystem.config.js")).toString();
    const defaultsRegEx = /const defaults = (.*?);/gis;
    const defaults = defaultsRegEx.exec(ecosystemString)[1];
    const questionsRegEx = /\/\*(?<question>.*?)\*\/\n(?<id>.*?):\s(?<default>.*?)(,|$)/gis;
    const selectRegex = /@property \{(?<value>.*?)\} (?<title>.*?) (?<description>.*?)\n/gis;

    const alreadyConfigured = getConfig();

    // Match questions
    const questions = [];
    let matches = questionsRegEx.exec(defaults);
    while (matches) {

        // Set base data
        const question = {
            name: JSON.parse(matches.groups.id.trim()),
            message: matches.groups.question.replace(/\* @.*?\n/gis, "").split("*").join("").trim()
        };

        // Set initial value
        try {
            question.initial = alreadyConfigured[question.name] !== undefined ? alreadyConfigured[question.name] : JSON.parse(matches.groups.default);
        } catch (error) {
            question.initial = alreadyConfigured[question.name] !== undefined ? alreadyConfigured[question.name] : matches.groups.default;
        }

        // Select type
        if (matches.groups.question.includes("* @type {select}")) {
            question.type = "select";
            const choices = [];
            let selections = selectRegex.exec(matches.groups.question);
            while (selections) {
                choices.push(selections.groups);
                selections = selectRegex.exec(matches.groups.question);
            }

            const preChosenIndex = choices.findIndex((choice) => {
                return JSON.parse(choice.value) === alreadyConfigured[question.name];
            });
            question.choices = choices;
            question.initial = preChosenIndex >= 0 ? preChosenIndex : 0;
        } else if (typeof question.initial === "boolean") {
            question.type = "confirm";
        } else if (question.name.includes("PASSWORD")) {
            question.type = "text";
            question.style = "password";
        } else if (typeof question.initial === "number") {
            question.type = "number";
        } else question.type = "text";

        question.onRender = function () { this.msg = `${question.name}\n\n      ${question.message}\n\n>`; };
        questions.push(question);

        // Match next question
        matches = questionsRegEx.exec(defaults);
    }

    return questions;
}

/**
 *
 *
 */
async function configure() {

    const alreadyConfigured = getConfig();
    const questions = getConfigQuestions();

    console.log(questions);
    const results = await prompts(questions);

    if (Object.keys(results).length !== questions.length) {
        console.info("ABORTED!");
        process.exit(0);
    }

    // Fix types
    for (const question of questions) {
        if (question.type !== "select") continue;
        results[question.name] = JSON.parse(results[question.name]);
    }

    // Remove default results
    for (const key in results) {
        if (Object.hasOwnProperty.call(results, key)) {
            const value = results[key];
            const defaultValue = questions.find((question) => {
                return question.name === key;
            }).initial;
            if (value === defaultValue) delete results[key];
        }
    }

    console.info(`\n\nWriting config to ${configFilePath}`);

    const config = yaml.stringify(Object.assign(alreadyConfigured, results));
    fs.writeFileSync(configFilePath, config, { encoding: "utf-8" });
}

/**
 *
 *
 * @returns
 */
async function register() {
    console.log("Now the administration user will be created. Please enter an email address and a password");

    const config = Object.assign({}, getDefaults(), getConfig());

    const adminUserQuestions = [{
        name: "email",
        message: "E-Mail",
        type: "text"
    }, {
        name: "password",
        message: "Password",
        type: "text",
        style: "password"
    }];

    const adminResults = await prompts(adminUserQuestions);

    if (!adminResults.email || !adminResults.password) {
        console.info("ABORTED!");
        process.exit(0);
    }
    pm2.connect((error) => {
        if (error) {
            console.error(error);
            pm2.disconnect();
            process.exit(1);
        }

        const ecoSystem = require("./ecosystem.config");
        // eslint-disable-next-line
        ecoSystem.apps[0].wait_ready = true;

        console.info("starting server");

        pm2.start(ecoSystem.apps[0], (error) => {
            if (error) {
                console.error(error);
                pm2.disconnect();
                process.exit(1);
            }

            console.info(`registering admin user`);

            const data = Object.assign(adminResults, {
                isAdmin: true,
                isConfirmed: true,
                isActive: true
            });

            try {
                childProcess.execSync(`npx pm2 trigger ${config.APP_NAME} register:user "${JSON.stringify(data).replace(/"/g, "'")}"`, { stdio: "inherit" });
            } catch (error) {
                console.error(error);
                process.exit(1);
            }

            pm2.disconnect();
        });

    });
}

(async () => {
    if (options.config) await configure();
    if (options.register) await register();
    console.info("FINISHED!");
})();
