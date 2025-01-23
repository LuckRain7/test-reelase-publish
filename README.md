# Test-Release-Publish

测试 GitHub Actions 自动化发布 release 功能

## 创建 GitHub Actions

文件：[release.yml](https://github.com/LuckRain7/test-release-publish/blob/main/.github/workflows/release.yml)

```yml
name: Release

on:
  push:
    tags:
      - "v*" # 识别推送 v 开头的 tag 时触发

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"

      - name: Get version from tag
        id: get_version
        run: echo "VERSION=${GITHUB_REF#refs/tags/v}" >> $GITHUB_OUTPUT

      - name: Install dependencies
        run: npm install

      - name: Build
        run: npm run build

      - name: Rename and Compress dist
        run: |
          mv dist timeline-todolist-v${{ steps.get_version.outputs.VERSION }}
          tar -czf timeline-todolist-v${{ steps.get_version.outputs.VERSION }}.tar.gz timeline-todolist-v${{ steps.get_version.outputs.VERSION }}
          zip -r timeline-todolist-v${{ steps.get_version.outputs.VERSION }}.zip timeline-todolist-v${{ steps.get_version.outputs.VERSION }}

      - name: Create Release
        uses: softprops/action-gh-release@v1
        with:
          token: ${{ secrets.GITHUBTOKEN }}
          name: "Version ${{ steps.get_version.outputs.VERSION }} 🚀"
          draft: false
          prerelease: false
          generate_release_notes: true
          body_path: CHANGELOG.md
          files: |
            timeline-todolist-v${{ steps.get_version.outputs.VERSION }}.tar.gz
            timeline-todolist-v${{ steps.get_version.outputs.VERSION }}.zip
```

## 创建发布脚本

文件：[publish.js](https://github.com/LuckRain7/test-release-publish/blob/main/scripts/publish.js)

```js
const fs = require("fs");
const path = require("path");
const {
    execSync
} = require("child_process");

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
```

## 发布

`package.json` 增加 `"pub": "node scripts/publish.js"` 命令

执行 `pnpm pub` 命令
