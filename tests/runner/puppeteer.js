const util = require("util");
const path = require("path");
const exec = util.promisify(require("child_process").exec);

module.exports = async function module() {
  const { stdout, stderr } = await exec("yarn global dir");
  const glob = stdout.trim();

  return require(path.join(glob, "node_modules", "puppeteer"));
}