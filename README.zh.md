# 🖨️ 3D Printer Calculator App

> **🌍 语言选择**
> 
> [🇬🇧 English](README.en.md) | [🇭🇺 Magyar](README.hu.md) | [🇩🇪 Deutsch](README.de.md) | [🇪🇸 Español](README.es.md) | [🇮🇹 Italiano](README.it.md) | [🇵🇱 Polski](README.pl.md) | [🇨🇿 Čeština](README.cs.md) | [🇸🇰 Slovenčina](README.sk.md) | [🇵🇹 Português](README.pt.md) | [🇫🇷 Français](README.fr.md) | [🇨🇳 中文](README.zh.md)

一个用于计算3D打印成本的现代桌面应用程序。使用 Tauri v2、React 前端和 Rust 后端构建。

## ✨ 功能

- 📊 **成本计算** - 自动计算耗材、电力、干燥和磨损成本
- 🧵 **耗材管理** - 添加、编辑、删除耗材（品牌、类型、颜色、价格）
- 🖨️ **打印机管理** - 管理打印机和 AMS 系统
- 💰 **利润计算** - 可选择的利润百分比（10%、20%、30%、40%、50%）
- 📄 **报价** - 保存、管理和导出 PDF 报价（客户名称、联系方式、描述）
- 🧠 **过滤器预设** - 保存报价过滤器，应用快速预设，基于日期/时间的自动过滤器
- 🗂️ **状态仪表板** - 状态卡片、快速过滤器和最近状态更改的时间线
- 📝 **状态备注** - 每次状态更改都带有可选备注和历史记录
- 👁️ **PDF 预览和模板** - 内置 PDF 预览、可选模板和企业品牌块
- 🎨 **耗材颜色库** - 超过 2000 种工厂颜色，具有基于品牌和类型的可选面板
- 💾 **耗材库编辑器** - 基于模态的添加/编辑、重复警告和持久保存到 `filamentLibrary.json`
- 🖼️ **PDF 中的耗材图像** - 在生成的 PDF 中显示耗材徽标和颜色样本
- 🧾 **G-code 导入和草稿创建** - 从计算器中的模态加载 G-code/JSON 导出（Prusa、Cura、Orca、Qidi），包含详细摘要和自动报价草稿生成
- 📈 **统计** - 耗材消耗、收入、利润的摘要仪表板
- 🌍 **多语言** - 完整翻译为匈牙利语、英语、德语、法语、简体中文、捷克语、西班牙语、意大利语、波兰语、葡萄牙语和斯洛伐克语（12 种语言，每种语言 813 个翻译键）
- 💱 **多种货币** - EUR、HUF、USD
- 🔄 **自动更新** - 检查 GitHub Releases 以获取新版本
- 🧪 **Beta 版本** - Beta 分支和 Beta 构建支持
- ⚙️ **Beta 检查** - 可配置的 Beta 版本检查
- 🎨 **响应式布局** - 所有应用程序元素动态适应窗口大小
- ✅ **确认对话框** - 删除前请求确认
- 🔔 **Toast 通知** - 成功操作后的通知
- 🔍 **搜索和过滤** - 搜索耗材、打印机和报价
- 🔎 **在线价格比较** - 一键打开所选耗材的 Google/Bing 搜索结果，价格可立即更新
- 📋 **复制** - 轻松复制报价
- 🖱️ **拖放** - 通过拖拽重新排序报价、耗材和打印机
- 📱 **上下文菜单** - 右键菜单用于快速操作（编辑、删除、复制、导出）

## 📸 截图

应用程序包括:
- 带统计信息的主页仪表板
- 耗材管理
- 打印机管理
- 成本计算计算器
- 报价列表和详细视图
- 状态仪表板和时间线
- PDF 导出和内置预览

## 🚀 安装

### 先决条件

- **Rust**: [安装 Rust](https://rustup.rs/)
- **Node.js**: [安装 Node.js](https://nodejs.org/) (版本 20+)
- **pnpm**: `npm install -g pnpm`
- **Tauri CLI**: `cargo install tauri-cli`

### macOS 特定

```bash
# Xcode Command Line Tools
xcode-select --install
```

### Linux 特定 (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install libwebkit2gtk-4.1-dev \
    build-essential \
    curl \
    wget \
    file \
    libssl-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev
```

### Windows 特定

- Visual Studio Build Tools (C++ 构建工具)
- Windows SDK

## 📦 构建

### 开发模式运行

```bash
cd src-tauri
cargo tauri dev
```

### 生产构建（创建独立应用程序）

```bash
cd src-tauri
cargo tauri build
```

独立应用程序将位于:
- **macOS**: `src-tauri/target/release/bundle/macos/3DPrinterCalcApp.app`
- **Linux**: `src-tauri/target/release/bundle/deb/` 或 `appimage/`
- **Windows**: `src-tauri/target/release/bundle/msi/`

### Beta 构建

项目包含一个配置用于单独构建的 `beta` 分支:

```bash
# 切换到 beta 分支
git checkout beta

# 本地 beta 构建
./build-frontend.sh
cd src-tauri
cargo tauri build
```

Beta 构建自动设置 `VITE_IS_BETA=true` 变量，因此菜单中会出现 "BETA"。

**GitHub Actions**: 推送到 `beta` 分支时，`.github/workflows/build-beta.yml` 工作流自动运行，为所有三个平台构建 beta 版本。

详细指南: [BUILD.md](BUILD.md) 和 [HOW_TO_BUILD_APP.md](HOW_TO_BUILD_APP.md)

## 💻 开发

### 项目结构

```
3DPrinterCalcApp/
├── frontend/          # React + TypeScript 前端
│   ├── src/
│   │   ├── components/    # React 组件
│   │   ├── utils/        # 辅助函数
│   │   └── types.ts      # TypeScript 类型
│   └── package.json
├── src-tauri/         # Rust 后端
│   ├── src/           # Rust 源代码
│   ├── Cargo.toml     # Rust 依赖项
│   └── tauri.conf.json # Tauri 配置
└── README.md
```

### 前端开发

```bash
cd frontend
pnpm install
pnpm dev
```

### 依赖项

**前端:**
- React 19
- TypeScript
- Vite

**后端:**
- Tauri v2
- tauri-plugin-store (数据存储)
- tauri-plugin-log (日志记录)

## 📖 使用

1. **添加打印机**: 打印机菜单 → 添加新打印机
2. **添加耗材**: 耗材菜单 → 添加新耗材
3. **计算成本**: 计算器菜单 → 选择打印机和耗材
4. **保存报价**: 在计算器中点击"保存为报价"按钮
5. **PDF 导出**: 报价菜单 → 选择报价 → PDF 导出
6. **检查 Beta 版本**: 设置菜单 → 启用"检查 Beta 更新"选项

## 🔄 版本管理和更新

应用程序自动检查 GitHub Releases 以获取新版本:

- **启动时**: 自动检查更新
- **每 5 分钟**: 自动重新检查
- **通知**: 如果有新版本可用，右上角会出现通知

### Beta 版本检查

要检查 Beta 版本:

1. 转到 **设置** 菜单
2. 启用 **"检查 Beta 更新"** 选项
3. 应用程序立即检查 Beta 版本
4. 如果有更新的 Beta 版本可用，会出现通知
5. 点击"下载"按钮转到 GitHub Release 页面

**示例**: 如果您使用 RELEASE 版本（例如 0.1.0）并启用 Beta 检查，应用程序会找到最新的 Beta 版本（例如 0.2.0-beta），如果有更新的版本会通知您。

详细指南: [VERSIONING.md](VERSIONING.md)

## 🛠️ 技术栈

- **前端**: React 19、TypeScript、Vite
- **后端**: Rust、Tauri v2
- **数据存储**: Tauri Store Plugin (JSON 文件)
- **样式**: 内联样式 (commonStyles)
- **i18n**: 自定义翻译系统
- **CI/CD**: GitHub Actions (自动构建 macOS、Linux、Windows)
- **版本管理**: GitHub Releases API 集成

## 📝 许可证

此项目在 **MIT 许可证**下授权，但 **商业使用需要许可**。

应用程序的完整版权: **Lekszikov Miklós (LexyGuru)**

- ✅ **个人和教育用途**: 允许
- ❌ **商业用途**: 仅需明确的书面许可

详细信息: [LICENSE](LICENSE) 文件

## 👤 作者

Lekszikov Miklós (LexyGuru)

## 🙏 致谢

- [Tauri](https://tauri.app/) - 跨平台桌面应用程序框架
- [React](https://react.dev/) - 前端框架
- [Vite](https://vitejs.dev/) - 构建工具

## 📚 其他文档

- [BUILD.md](BUILD.md) - 所有平台的详细构建指南
- [HOW_TO_BUILD_APP.md](HOW_TO_BUILD_APP.md) - 创建独立应用程序
- [VERSIONING.md](VERSIONING.md) - 版本管理和更新
- [CREATE_FIRST_RELEASE.md](CREATE_FIRST_RELEASE.md) - 创建第一个 GitHub Release

## 🌿 分支结构

- **`main`**: 稳定发布版本 (RELEASE 构建)
- **`beta`**: Beta 版本和开发 (BETA 构建)

推送到 `beta` 分支时，GitHub Actions 工作流自动运行，构建 Beta 版本。

## 📋 版本历史

### v0.5.56 (2025)
- 🌍 **完整语言翻译** – 完成了 6 个剩余语言文件的完整翻译：捷克语 (cs)、西班牙语 (es)、意大利语 (it)、波兰语 (pl)、葡萄牙语 (pt) 和斯洛伐克语 (sk)。每个文件包含所有 813 个翻译键，因此应用程序现在完全支持这些语言。
- 🔒 **Tauri 权限修复** – `update_filamentLibrary.json` 文件现在在 Tauri 功能文件中明确启用读取、写入和创建操作，确保耗材库更新可靠工作。

### v0.5.55 (2025)
- 🧵 **报价编辑增强** – 保存的报价现在允许直接选择或修改打印机，成本随耗材更改自动重新计算。
- 🧮 **准确性和日志记录** – 详细日志记录有助于跟踪成本计算步骤（耗材、电力、干燥、使用），使查找导入的 G-code 文件中的错误更容易。
- 🌍 **翻译补充** – 为打印机选择器添加了新的 i18n 键和标签，确保在所有支持的语言中编辑器 UI 一致。
- 📄 **文档更新** – README 扩展了新功能描述，v0.5.55 版本添加到版本历史中。

---

**版本**: 0.5.56

如果您有任何问题或发现错误，请在 GitHub 存储库中打开一个问题！

