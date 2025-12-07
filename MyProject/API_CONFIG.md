# API配置说明

## 问题：注册时显示 Network Error

如果遇到网络错误，通常是因为前端无法连接到后端服务器。请按照以下步骤检查：

## 解决方案

### 1. 确保后端服务已启动

在 `server` 目录下运行：

```bash
cd server
npm install
npm run dev
```

后端应该显示：`API server listening on http://0.0.0.0:4000`

### 2. 配置前端API地址

根据您的访问方式配置API地址：

#### 方式一：本地访问（推荐开发时使用）

如果前端和后端都在同一台机器上运行，无需额外配置。默认使用：
```
http://localhost:4000/api
```

#### 方式二：局域网访问

如果通过局域网IP访问（例如：`192.168.99.187:5173`），需要创建 `.env.local` 文件：

**在项目根目录创建 `.env.local` 文件：**

```env
# 将 localhost 替换为您的实际IP地址
VITE_API_BASE_URL=http://192.168.99.187:4000/api
```

**重要提示：**
- 将 `192.168.99.187` 替换为您实际的IP地址
- 确保后端也运行在同一台机器的4000端口
- 端口4000必须与后端配置一致

### 3. 检查防火墙

确保防火墙允许：
- 后端端口：4000
- 前端端口：5173

### 4. 验证连接

访问后端健康检查接口：
- 本地：http://localhost:4000/
- 局域网：http://192.168.99.187:4000/

如果看到 `{"status":"ok"}` 表示后端正常运行。

## 快速修复步骤

1. **检查后端是否运行**
   ```bash
   # 在 server 目录
   npm run dev
   ```

2. **获取本机IP地址**
   - Windows: `ipconfig` 查看 IPv4 地址
   - Mac/Linux: `ifconfig` 或 `ip addr`

3. **创建 `.env.local` 文件**（仅局域网访问需要）
   ```env
   VITE_API_BASE_URL=http://您的IP地址:4000/api
   ```

4. **重启前端开发服务器**
   ```bash
   # 在项目根目录
   npm run dev
   ```

## 示例配置

### 本地开发（同一台机器）
无需配置，使用默认值。

### 局域网开发（不同设备）
`.env.local` 内容：
```env
VITE_API_BASE_URL=http://192.168.1.100:4000/api
```

### 生产环境
`.env.production` 内容：
```env
VITE_API_BASE_URL=https://api.yourdomain.com/api
```

## 常见错误

- **Network Error**: 后端未启动或API地址配置错误
- **ERR_CONNECTION_REFUSED**: 后端未启动或端口被占用
- **CORS Error**: 后端CORS配置问题（已默认配置，通常不会出现）

## 需要帮助？

如果问题仍然存在，请检查：
1. 后端控制台是否有错误信息
2. 浏览器开发者工具（F12）的 Network 标签页
3. 防火墙和杀毒软件设置




