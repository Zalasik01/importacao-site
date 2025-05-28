const fs = require("fs");
const path = require("path");

const packageJsonPath = path.join(__dirname, "package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

packageJson.buildDate = new Date().toISOString();

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
