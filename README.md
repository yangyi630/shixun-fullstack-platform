# 敏感数据加密与接口安全防护开发

## 项目简介

本项目是一个信息安全专业课设，实现了敏感数据加密与接口安全防护的完整解决方案，包含：

- 敏感数据AES-256-GCM字段级加密
- JWT认证与Refresh Token轮换
- 防重放攻击（Nonce + Timestamp）
- 接口限流保护
- CSRF防护
- 数据脱敏
- 安全HTTP头
- 可视化安全仪表板

## 技术栈

- **后端**：Python 3.10+ + FastAPI
- **数据库**：SQLite + SQLAlchemy 2.0
- **缓存**：Redis（支持fakeredis回退）
- **前端**：纯原生HTML/CSS/JS + Chart.js
- **部署**：Uvicorn

## 项目结构

```
project/
├── requirements.txt      # 依赖文件
├── .env                  # 环境配置
├── main.py               # FastAPI入口
├── config.py             # 配置管理
├── database.py           # 数据库配置
├── models.py             # ORM模型
├── schemas.py            # Pydantic模型
├── auth/                 # 认证模块
├── security/             # 安全模块
├── routers/              # API路由
├── utils/                # 工具函数
├── static/               # 前端静态文件
└── tests/                # 测试文件
```

## 快速开始

### 1. 安装依赖

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
```

### 2. 配置环境变量

复制 `.env` 文件并根据实际情况修改：

```bash
# 生成密钥示例
openssl rand -base64 32  # CURRENT_KEY
openssl rand -base64 64  # JWT_SECRET
```

### 3. 启动服务

```bash
uvicorn main:app --reload
```

服务将在 `http://localhost:8000` 启动。

### 4. 访问仪表板

打开浏览器访问：
- **安全仪表板**：http://localhost:8000/dashboard
- **API文档**：http://localhost:8000/docs

## 核心功能

### 1. 敏感数据加密
- 密码使用bcrypt哈希
- 敏感字段（手机号、身份证、银行卡）使用AES-256-GCM加密
- 支持密钥轮换

### 2. 接口安全防护
- JWT认证（15分钟access token，7天refresh token）
- Refresh Token轮换防止重用攻击
- 防重放攻击（Nonce + Timestamp）
- 接口限流（100次/分钟通用，5次/分钟敏感接口）
- CSRF双重提交Cookie防护
- 安全HTTP头

### 3. 可视化界面
- 加密工坊：加密/解密演示
- 脱敏秀：用户数据脱敏展示
- 攻击防御动画：重放攻击、限流、CSRF测试
- 安全态势仪表：实时安全状态
- 审计日志流：安全事件记录

## 安全特性

- **SQL注入防护**：使用SQLAlchemy ORM参数化查询
- **XSS防护**：输出编码和CSP策略
- **敏感数据保护**：自动脱敏和加密
- **结构化日志**：自动脱敏敏感信息
- **审计追踪**：所有安全事件记录

## 测试账号

- **用户名**：admin
- **密码**：Admin123!

## 注意事项

1. 本项目为教学演示，生产环境需进一步配置：
   - 使用HTTPS
   - 配置强密钥
   - 启用Redis
   - 设置合理的限流策略

2. 如需禁用Redis，系统会自动使用内存存储作为回退，但生产环境不建议。

3. 首次运行时会自动创建数据库表结构。