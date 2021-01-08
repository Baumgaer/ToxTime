const fs = require("graceful-fs");
const path = require("path");
const arp = require("app-root-path");
const prompts = require("prompts");
const yaml = require("yaml");
const pm2 = require("pm2");
const childProcess = require("child_process");

const configFilePath = path.resolve(arp.path, "config.yaml");

const ecosystemString = fs.readFileSync(path.resolve(arp.path, "ecosystem.config.js")).toString();
const defaultsRegEx = /const defaults = (.*?);/gis;
const defaults = defaultsRegEx.exec(ecosystemString)[1];
const questionsRegEx = /\/\*(?<question>.*?)\*\/\n(?<id>.*?):\s(?<default>.*?),/gis;
const selectRegex = /@property \{(?<value>.*?)\} (?<title>.*?) (?<description>.*?)\n/gis;

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

    console.info(`\n\nWriting config to ${configFilePath}`);

    const config = yaml.stringify(results);
    fs.writeFileSync(configFilePath, config, { encoding: "utf-8" });

    console.log("Now the administration user will be created. Please enter an email address and a password");

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
                isActive: true,
                matriculationNumber: 0,
                locale: "en-us"
            });

            try {
                childProcess.execSync(`npx pm2 trigger ${results.APP_NAME || questions.filter((question) => question.name === "APP_NAME")[0].initial} register:user "${JSON.stringify(data).replace(/"/g, "'")}"`, { stdio: "inherit" });
                console.info("FINISHED!");
            } catch (error) {
                console.error(error);
                process.exit(1);
            }

            pm2.disconnect();
        });

    });
})();