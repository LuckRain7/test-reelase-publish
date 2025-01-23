const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

function getLatestTag() {
  try {
    return execSync("git describe --tags --abbrev=0").toString().trim();
  } catch (error) {
    console.log("No tags found");
    return null;
  }
}

function getCommitsSinceLastTag() {
  const latestTag = getLatestTag();
  if (!latestTag) {
    return execSync('git log --pretty=format:"%h - %s (%an)"').toString();
  }

  return execSync(
    `git log ${latestTag}..HEAD --pretty=format:"%h - %s (%an)"`
  ).toString();
}

function generateChangelog(version) {
  const changelogDir = path.join(__dirname, "../changelog");

  // 确保 changelog 目录存在
  if (!fs.existsSync(changelogDir)) {
    fs.mkdirSync(changelogDir);
  }

  const commits = getCommitsSinceLastTag();
  const date = new Date().toISOString().split("T")[0];
  const filename = path.join(changelogDir, `v${version}.md`);

  const content = `# Changelog (${date})\n\n${commits}`;
  fs.writeFileSync(filename, content);

  console.log(`Changelog has been generated at: changelog/${filename}`);
}

module.exports = {
  generateChangelog,
};
