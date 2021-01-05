const fs = require("graceful-fs");
const path = require("path");
const arp = require("app-root-path");
const prompts = require("prompts");
const yaml = require("yaml");

const configFilePath = path.resolve(arp.path, "config.yaml");

const ecosystemString = fs.readFileSync(path.resolve(arp.path, "ecosystem.config.js")).toString();
const defaultsRegEx = /const defaults = (.*?);/gis;
const defaults = defaultsRegEx.exec(ecosystemString)[1];
const questionsRegEx = /\/\*(?<question>.*?)\*\/\n(?<id>.*?):\s(?<default>.*?),/gis;
const selectRegex = /@property \{(?<value>.*?)\} (?<title>.*?) (?<description>.*?)\n/gis;

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
        question.initial = JSON.parse(matches.groups.default);
    } catch (error) {
        question.initial = matches.groups.default;
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
        question.choices = choices;
        question.initial = 0;
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

(async () => {
    const results = await prompts(questions);

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

    console.info(`Writing config to ${configFilePath}`);

    const config = yaml.stringify(results);
    fs.writeFileSync(configFilePath, config, { encoding: "utf-8" });

    console.info("FINISHED!");
})();
