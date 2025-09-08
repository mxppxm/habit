# 多端同步设置指南

## 🌟 概述

本项目现已支持多端同步功能，可以在不同设备间实时同步您的习惯追踪数据。同步支持两种方式：

- Firebase Firestore（现有方案，使用“同步 ID”命名空间）
- LeanCloud（新增方案，邮箱登录/注册 + LiveQuery 实时）

## 🚀 快速开始

### 1. 创建 Firebase 项目

1. 访问 [Firebase Console](https://console.firebase.google.com/)
2. 点击"创建项目"或"添加项目"
3. 输入项目名称（如：`habit-tracker-sync`）
4. 可选择是否启用 Google Analytics
5. 创建完成后进入项目控制台

### 2. 启用 Firestore 数据库

1. 在 Firebase 控制台左侧菜单中点击"Firestore Database"
2. 点击"创建数据库"
3. 选择启动模式：
   - **测试模式**：30 天内允许读写（推荐开发测试）
   - **生产模式**：需要配置安全规则
4. 选择数据库位置（建议选择距离用户较近的区域）

### 3. 获取 Firebase 配置

1. 在 Firebase 控制台中，点击齿轮图标 → "项目设置"
2. 滚动到"您的应用"部分
3. 点击"Web 应用"图标 (`</>`)
4. 输入应用昵称（如：`habit-tracker-web`）
5. 复制显示的配置信息

### 4. 配置环境变量（Firebase）

在项目根目录创建 `.env` 文件（参考 `.env.example`）：

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

### 5. 配置环境变量（LeanCloud）

```env
VITE_LEANCLOUD_APP_ID=your_app_id
VITE_LEANCLOUD_APP_KEY=your_app_key
VITE_LEANCLOUD_SERVER_URL=https://xxx.xxx.lc-cn-n1-shared.com
```

### 6. 安装依赖并启动

```bash
npm install
npm run dev
```

## 📱 使用指南

### 启用同步

1. 打开应用，进入"设置"页面
2. 在"多端同步"部分点击"同步设置"
3. 开启"启用多端同步"开关
4. 选择“同步方式”：
   - 选择 Firebase：设置一个唯一的“同步 ID”，点击“保存”
   - 选择 LeanCloud：输入邮箱和密码，未注册会自动注册后登录

### 首次同步

**在主要设备上：**

1. 点击"上传到云端"按钮
2. 等待上传完成

**在其他设备上：**

1. 若选择 Firebase：使用相同的同步 ID
1. 若选择 LeanCloud：在其他设备同样使用邮箱和密码登录
1. 点击"从云端下载"按钮
1. 等待下载完成

### 自动同步

启用同步后，以下操作会自动同步：

- 新增/编辑/删除习惯分类
- 新增/编辑/删除习惯项目
- 新增/编辑/删除打卡记录
- 实时双向同步，无需手动操作

## 🔒 安全规则设置

为了提高安全性，建议在 Firebase 控制台设置 Firestore 安全规则：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 用户只能访问自己的数据
    match /users/{userId}/{document=**} {
      allow read, write: if true; // 简单规则，实际部署时可以添加更严格的验证
    }
  }
}
```

## 🌐 离线支持

- 应用会自动检测网络状态
- 离线时数据会保存在本地
- 网络恢复后自动同步未同步的数据
- 支持冲突解决（以最新修改时间为准）

## 🔧 故障排除

### 同步失败

1. **检查网络连接**：确保设备已连接到互联网
2. **检查配置**：确认 Firebase 配置信息正确
3. **检查同步 ID**：确保在所有设备上使用相同的同步 ID
4. **重新同步**：尝试手动"从云端下载"或"上传到云端"

### 数据冲突

- 系统会自动处理大部分冲突
- 冲突时以最后修改的数据为准
- 如需恢复特定版本，可以使用导出/导入功能

## 🧭 LeanCloud 控制台准备

1. 新建应用，记录 AppID、AppKey、Server URL
2. 启用 LiveQuery 服务
3. 配置 Web 安全域名（包含你的站点域名/本地调试域名）
4. 在「数据存储」创建 Class：
   - Category：id(String, unique)、name(String)、lastModified(Number)
   - Habit：id(String)、categoryId(String)、name(String)、reminderTime(String, 可空)、lastModified(Number)
   - HabitLog：id(String)、habitId(String)、timestamp(Number)、note(String, 可空)、isMakeup(Boolean, 可选)、originalDate(Number, 可选)、lastModified(Number)

### 配额限制

Firebase 免费计划限制：

- 每天 50,000 次读取
- 每天 20,000 次写入
- 1GB 存储空间

对于个人使用，这些限制通常足够。

## 🔄 数据迁移

### 从本地迁移到云端

1. 在原设备上启用同步
2. 点击"上传到云端"
3. 在新设备上使用相同同步 ID
4. 点击"从云端下载"

### 云端数据迁移

如需更换 Firebase 项目：

1. 导出当前数据（设置 → 导出数据）
2. 配置新的 Firebase 项目
3. 导入数据（设置 → 导入数据）
4. 重新上传到云端

## 💡 最佳实践

1. **定期备份**：即使有云端同步，建议定期导出数据作为备份
2. **唯一同步 ID**：使用邮箱等唯一标识作为同步 ID
3. **网络稳定**：在网络稳定时进行首次同步
4. **及时更新**：保持应用版本更新以获得最佳同步体验

## 📞 技术支持

如果遇到问题，可以：

1. 查看浏览器开发者工具的控制台错误信息
2. 检查 Firebase 控制台的使用情况和日志
3. 尝试重新配置同步设置

---

**注意**：同步功能需要稳定的网络连接。建议在 Wi-Fi 环境下进行首次大量数据同步。
