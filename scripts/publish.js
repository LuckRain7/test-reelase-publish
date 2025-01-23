const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// 读取 package.json
const packagePath = path.resolve(__dirname, "../package.json");
const packageJson = fs.readFileSync(packagePath, "utf8");
let packageObj = JSON.parse(packageJson);

// 解析当前版本号
const [major, minor, patch] = packageObj.version.split(".").map(Number);

// 增加补丁版本号
const newVersion = `${major}.${minor}.${patch + 1}`;

// 更新 packageObj.json
packageObj.version = newVersion;
fs.writeFileSync(packagePath, JSON.stringify(packageObj, null, 2) + "\n");
console.log("✨ Successfully create version " + newVersion);

try {
  // 提交更改
  execSync("git add package.json");
  execSync(`git commit -m "chore: bump version to ${newVersion}"`);

  // 创建新的 tag
  execSync(`git tag v${newVersion}`);

  // 推送更改和 tag
  execSync("git push");
  execSync("git push --tags");

  console.log(`✨ Successfully published version ${newVersion}`);
} catch (error) {
  console.error("❌ Failed to publish:", error.message);
  process.exit(1);
}
