const fs = require("graceful-fs");
const path = require("path");
const arp = require("app-root-path");
//const Wizard = require("wizard").default;

const ecosystem = fs.readFileSync(path.resolve(arp.path, "ecosystem.config.js")).toString();
const defaultsRegEx = /const defaults = (.*?);/gis;
const defaults = defaultsRegEx.exec(ecosystem)[1];
const questionsRegEx = /\/\*(?<question>.*?)\*\/\n(?<id>.*?):\s(?<default>.*?),/gis;
const questions = [];

let matches = questionsRegEx.exec(defaults);
while (matches) {
    try {
        questions.push({
            id: JSON.parse(matches.groups.id.trim()),
            question: matches.groups.question.split("*").join("").trim(),
            default: JSON.parse(matches.groups.default)
        });
    } catch (error) {
        questions.push({
            id: JSON.parse(matches.groups.id.trim()),
            question: matches.groups.question.split("*").join("").trim(),
            default: matches.groups.default
        });
    }
    matches = questionsRegEx.exec(defaults);
}

console.log(JSON.parse(JSON.stringify(questions)));
// const wizard = new Wizard();

// wizard.init().then((selections) => {
//     console.log(selections);
//     process.exit(0);
// });
