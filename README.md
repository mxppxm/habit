# 习惯的力量 - AI 智能习惯管理系统

<div align="center">
  <img src="https://img.shields.io/badge/Version-2.0.0-blue.svg" alt="Version">
  <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License">
  <img src="https://img.shields.io/badge/React-18.2-61dafb.svg" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.2-blue.svg" alt="TypeScript">
  <img src="https://img.shields.io/badge/AI-Powered-purple.svg" alt="AI Powered">
</div>

<div align="center">
  <h3>🎯 目标是习惯的领导 · 📈 习惯是目标的支撑 · 🏆 成功是习惯的必然</h3>
</div>

## ✨ 简介

**习惯的力量** 是一款 AI 驱动的智能习惯管理系统，帮助您将远大的目标分解为可执行的日常习惯，通过科学的方法追踪和培养好习惯，最终实现人生目标。

> 习惯的力量源于目标的指引，成功的必然来自坚持的积累

## 🚀 核心特性

### 🧠 AI 智能习惯生成

- **个性化建议**：根据目标智能生成 10 个贴合的习惯建议
- **科学分级**：自动分类简单、中等、困难三个难度等级
- **本地化适配**：专为中国用户的生活场景优化
- **多维度覆盖**：涵盖行为、心态、技能、健康等各个方面

### 🎯 目标导向管理

- 以终为始，将大目标分解为可执行的每日习惯
- 清晰的目标分类和进度追踪
- 支持多目标并行管理

### 📊 数据分析洞察

- 直观的可视化图表展示习惯完成情况
- 连续打卡统计，见证习惯的复利效应
- 多维度数据分析，发现成长规律

### 🛡️ 隐私安全保障

- **100% 本地存储**：所有数据都保存在您的设备上
- **无需注册**：保护个人信息，立即使用
- **离线可用**：无需联网即可正常使用
- **数据导出**：支持随时备份和恢复数据

### ⚡ 更多亮点功能

- 📅 灵活的习惯频率设置（每日、每周、自定义）
- 🏷️ 习惯分类管理，快速筛选查找
- ⌨️ 丰富的键盘快捷键支持
- 📱 响应式设计，支持各种设备
- 🎨 优雅的用户界面，舒适的使用体验

## 🖥️ 技术栈

- **前端框架**：React 18.2 + TypeScript 5.2
- **UI 框架**：Tailwind CSS 3.3
- **状态管理**：Zustand 4.4
- **AI 集成**：Vercel AI SDK + OpenAI GPT-4
- **数据存储**：IndexedDB (通过 idb)
- **图表可视化**：Recharts 2.10
- **路由管理**：React Router 6.21
- **构建工具**：Vite 5.0

## 🚀 快速开始

### 环境要求

- Node.js 18.0+
- npm 或 yarn 或 pnpm

### 安装步骤

1. **克隆项目**

```bash
git clone https://github.com/yourusername/habit-tracker.git
cd habit-tracker
```

2. **安装依赖**

```bash
npm install
# 或
yarn install
# 或
pnpm install
```

3. **配置 AI 功能（可选）**

如需使用 AI 习惯生成功能：

- 复制 `.env.example` 为 `.env.local`
- 在 `.env.local` 中填入您的 OpenAI API Key

```env
VITE_OPENAI_API_KEY=your-api-key-here
```

> 💡 提示：即使没有配置 API Key，也可以使用通用示例功能

4. **启动开发服务器**

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

5. **访问应用**

打开浏览器访问 `http://localhost:5173`

### 构建生产版本

```bash
npm run build
# 或
yarn build
# 或
pnpm build
```

构建后的文件将在 `dist` 目录中。

## 📖 使用指南

### 1. 设定目标

- 在"管理"页面创建您的长期目标
- 目标名称越具体，AI 生成的习惯越精准

### 2. 添加习惯

- 手动添加或使用 AI 智能生成习惯建议
- 从简单习惯开始，逐步增加难度
- 选择适合的执行频率

### 3. 每日打卡

- 在首页查看今日待完成的习惯
- 完成后点击打卡，记录您的坚持
- 保持连续打卡，培养习惯的力量

### 4. 查看进度

- 在"统计"页面查看习惯完成情况
- 分析数据，发现成长规律
- 用数据见证习惯的复利效应

## ⌨️ 键盘快捷键

| 功能 | 快捷键  | 说明               |
| ---- | ------- | ------------------ |
| 首页 | `1`     | 快速跳转到首页     |
| 管理 | `2`     | 快速跳转到管理页面 |
| 统计 | `3`     | 快速跳转到统计页面 |
| 设置 | `4`     | 快速跳转到设置页面 |
| 关于 | `5`     | 快速跳转到关于页面 |
| 保存 | `Enter` | 在对话框中保存内容 |
| 取消 | `Esc`   | 关闭当前对话框     |

## 🎯 设计理念

### AI 赋能习惯

- 智能分析目标，生成个性化习惯建议
- 多维度覆盖，从易到难科学规划
- 本地化适配，贴合中国用户场景
- 即使无 AI，也有通用示例支持

### 习惯驱动成功

- 将远大目标分解为可执行的微习惯
- 通过日积月累的坚持实现质的飞跃
- 用数据见证习惯的复利效应
- 让成功成为必然而非偶然

### 隐私安全至上

- 所有数据都保存在您的设备上
- API Key 本地存储，保护隐私
- 无需注册账号，保护个人信息
- 可以离线使用，无需联网

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本项目
2. 创建您的功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 📝 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

特别感谢以下开源项目：

- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vercel AI SDK](https://sdk.vercel.ai/)
- [Lucide Icons](https://lucide.dev/)

## 📮 联系方式

如有问题或建议，欢迎通过以下方式联系：

- 提交 [Issue](https://github.com/mxppxm/habit-tracker/issues)

---

<div align="center">
  <p>
    <strong>习惯的力量，目标的实现</strong>
  </p>
  <p>
    Made with ❤️ by developers who believe in the power of habits
  </p>
</div>
