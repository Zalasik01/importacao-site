const fs = require("fs");
const execSync = require("child_process").execSync;

const commitDate = execSync("git log -1 --format=%cd --date=iso").toString().trim();

const packageJson = require("./package.json");

packageJson.buildDate = commitDate;

fs.writeFileSync("./package.json", JSON.stringify(packageJson, null, 2));

console.log(`Build Date atualizado para: ${commitDate}`);
