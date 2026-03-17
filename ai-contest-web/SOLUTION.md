# AI创意大赛网站 - 后端服务改造方案

## 一、技术选型

### 1.1 后端技术栈
| 技术 | 选型 | 说明 |
|-----|------|------|
| 运行时 | Node.js 18+ | 与前端技术栈统一，便于维护 |
| 框架 | Express.js | 轻量级，快速开发 |
| 数据库 | MySQL 8.0 | 企业级关系型数据库，稳定可靠 |
| ORM | Sequelize | 成熟的Node.js ORM，支持MySQL |
| 身份认证 | JWT | 管理员登录认证 |
| 文件上传 | Multer | 处理封面图片上传 |

### 1.2 项目结构
```
ai-contest-web/
├── src/                    # 前端源码
├── server/                 # 后端源码（新增）
│   ├── config/            # 配置文件
│   │   └── database.js    # 数据库配置
│   ├── models/            # 数据模型
│   │   ├── index.js       # 模型入口
│   │   ├── Training.js    # 培训资料模型
│   │   ├── Registration.js # 报名信息模型
│   │   ├── ContestInfo.js # 大赛信息模型
│   │   ├── Stage.js       # 比赛阶段模型
│   │   ├── AiTool.js      # AI工具模型
│   │   └── Admin.js       # 管理员模型
│   ├── routes/            # 路由
│   │   ├── index.js       # 路由入口
│   │   ├── training.js    # 培训资料API
│   │   ├── registration.js # 报名API
│   │   ├── contest.js     # 大赛信息API
│   │   ├── tools.js       # AI工具API
│   │   └── auth.js        # 认证API
│   ├── middleware/        # 中间件
│   │   └── auth.js        # JWT认证中间件
│   ├── uploads/           # 上传文件目录
│   └── app.js             # 应用入口
├── package.json
└── .env                   # 环境变量
```

---

## 二、数据库设计

### 2.1 ER图
```
┌─────────────────┐     ┌─────────────────┐
│   trainings     │     │  registrations  │
├─────────────────┤     ├─────────────────┤
│ id (PK)         │     │ id (PK)         │
│ name            │     │ work_name       │
│ video_url       │     │ work_description│
│ cover_image     │     │ user_name       │
│ sort_order      │     │ user_employee_id│
│ status          │     │ status          │
│ created_at      │     │ created_at      │
│ updated_at      │     │ updated_at      │
└─────────────────┘     └─────────────────┘

┌─────────────────┐     ┌─────────────────┐
│   contest_info  │     │     stages      │
├─────────────────┤     ├─────────────────┤
│ id (PK)         │     │ id (PK)         │
│ title           │     │ name            │
│ subtitle        │     │ description     │
│ badge_text      │     │ time_range      │
│ stat_phases     │     │ sort_order      │
│ stat_trainings  │     │ status          │
│ stat_creative   │     │ created_at      │
│ poster_url      │     │ updated_at      │
│ created_at      │     └─────────────────┘
│ updated_at      │
└─────────────────┘

┌─────────────────┐     ┌─────────────────┐
│    ai_tools     │     │     admins      │
├─────────────────┤     ├─────────────────┤
│ id (PK)         │     │ id (PK)         │
│ category        │     │ username        │
│ category_icon   │     │ password_hash   │
│ name            │     │ role            │
│ url             │     │ created_at      │
│ rank            │     │ updated_at      │
│ recommend       │     └─────────────────┘
│ description     │
│ sort_order      │
│ status          │
│ created_at      │
│ updated_at      │
└─────────────────┘
```

### 2.2 数据表详细设计

#### 2.2.1 培训资料表 (trainings)
| 字段名 | 类型 | 约束 | 说明 |
|-------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | 主键 |
| name | VARCHAR(200) | NOT NULL | 培训名称 |
| video_url | VARCHAR(500) | NOT NULL | 视频链接 |
| cover_image | VARCHAR(500) | NULL | 封面图片URL |
| sort_order | INT | DEFAULT 0 | 排序序号 |
| status | TINYINT | DEFAULT 1 | 状态：1-启用，0-禁用 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

#### 2.2.2 大赛报名表 (registrations)
| 字段名 | 类型 | 约束 | 说明 |
|-------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | 主键 |
| work_name | VARCHAR(100) | NOT NULL | 作品名称 |
| work_description | TEXT | NOT NULL | 作品概述 |
| user_name | VARCHAR(50) | NOT NULL | 参赛人姓名 |
| user_employee_id | VARCHAR(50) | NOT NULL | 参赛人工号 |
| status | TINYINT | DEFAULT 0 | 状态：0-待审核，1-通过，2-驳回 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 提交时间 |
| updated_at | DATETIME | ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

#### 2.2.3 大赛信息表 (contest_info)
| 字段名 | 类型 | 约束 | 说明 |
|-------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | 主键 |
| title | VARCHAR(100) | NOT NULL | 大赛标题 |
| subtitle | VARCHAR(200) | NULL | 副标题 |
| badge_text | VARCHAR(50) | NULL | 徽章文字 |
| stat_phases | VARCHAR(20) | DEFAULT '5' | 统计-比赛阶段数 |
| stat_trainings | VARCHAR(20) | DEFAULT '10+' | 统计-培训场次 |
| stat_creative | VARCHAR(20) | DEFAULT '∞' | 统计-创意可能 |
| poster_url | VARCHAR(500) | NULL | 海报图片URL |
| info_participants | TEXT | NULL | 参赛对象信息 |
| info_rewards | TEXT | NULL | 奖励机制信息 |
| info_highlights | TEXT | NULL | 大赛亮点信息 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

#### 2.2.4 比赛阶段表 (stages)
| 字段名 | 类型 | 约束 | 说明 |
|-------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | 主键 |
| name | VARCHAR(100) | NOT NULL | 阶段名称 |
| description | VARCHAR(500) | NULL | 阶段描述 |
| time_range | VARCHAR(50) | NULL | 时间范围 |
| sort_order | INT | DEFAULT 0 | 排序序号 |
| status | TINYINT | DEFAULT 1 | 状态：1-进行中，0-未开始，2-已结束 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

#### 2.2.5 AI工具表 (ai_tools)
| 字段名 | 类型 | 约束 | 说明 |
|-------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | 主键 |
| category | VARCHAR(50) | NOT NULL | 分类名称 |
| category_icon | VARCHAR(10) | NULL | 分类图标 |
| name | VARCHAR(50) | NOT NULL | 工具名称 |
| url | VARCHAR(500) | NOT NULL | 工具链接 |
| rank | INT | DEFAULT 0 | 排名 |
| recommend | VARCHAR(20) | NULL | 推荐标签 |
| description | VARCHAR(200) | NULL | 工具描述 |
| sort_order | INT | DEFAULT 0 | 排序序号 |
| status | TINYINT | DEFAULT 1 | 状态：1-启用，0-禁用 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

#### 2.2.6 管理员表 (admins)
| 字段名 | 类型 | 约束 | 说明 |
|-------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | 主键 |
| username | VARCHAR(50) | UNIQUE, NOT NULL | 用户名 |
| password_hash | VARCHAR(255) | NOT NULL | 密码哈希 |
| role | VARCHAR(20) | DEFAULT 'admin' | 角色 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

---

## 三、API接口设计

### 3.1 接口概览

| 模块 | 方法 | 路径 | 说明 | 权限 |
|-----|------|------|------|------|
| **认证** | POST | /api/auth/login | 管理员登录 | 公开 |
| **培训资料** | GET | /api/trainings | 获取培训列表 | 公开 |
| | GET | /api/trainings/:id | 获取培训详情 | 公开 |
| | POST | /api/trainings | 新增培训 | 管理员 |
| | PUT | /api/trainings/:id | 更新培训 | 管理员 |
| | DELETE | /api/trainings/:id | 删除培训 | 管理员 |
| **大赛报名** | GET | /api/registrations | 获取报名列表 | 管理员 |
| | POST | /api/registrations | 提交报名 | 公开 |
| | PUT | /api/registrations/:id/status | 更新审核状态 | 管理员 |
| | DELETE | /api/registrations/:id | 删除报名 | 管理员 |
| | GET | /api/registrations/export | 导出Excel | 管理员 |
| **大赛信息** | GET | /api/contest/info | 获取大赛信息 | 公开 |
| | PUT | /api/contest/info | 更新大赛信息 | 管理员 |
| **比赛阶段** | GET | /api/stages | 获取阶段列表 | 公开 |
| | POST | /api/stages | 新增阶段 | 管理员 |
| | PUT | /api/stages/:id | 更新阶段 | 管理员 |
| | DELETE | /api/stages/:id | 删除阶段 | 管理员 |
| **AI工具** | GET | /api/tools | 获取工具列表 | 公开 |
| | POST | /api/tools | 新增工具 | 管理员 |
| | PUT | /api/tools/:id | 更新工具 | 管理员 |
| | DELETE | /api/tools/:id | 删除工具 | 管理员 |
| **文件上传** | POST | /api/upload/image | 上传图片 | 管理员 |

### 3.2 接口详细设计

#### 3.2.1 认证接口

**POST /api/auth/login**
```json
// Request
{
  "username": "admin",
  "password": "123456"
}

// Response
{
  "code": 0,
  "message": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "admin": {
      "id": 1,
      "username": "admin",
      "role": "admin"
    }
  }
}
```

#### 3.2.2 培训资料接口

**GET /api/trainings**
```json
// Response
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "name": "AI说-AI赋能法律人工作",
        "videoUrl": "https://...",
        "coverImage": "https://...",
        "sortOrder": 1,
        "status": 1,
        "createdAt": "2024-03-01T00:00:00.000Z"
      }
    ],
    "total": 14
  }
}
```

**POST /api/trainings**
```json
// Request
{
  "name": "新培训课程",
  "videoUrl": "https://...",
  "coverImage": "https://...",
  "sortOrder": 1
}

// Response
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 15,
    "name": "新培训课程",
    "videoUrl": "https://...",
    "coverImage": "https://...",
    "sortOrder": 1,
    "status": 1,
    "createdAt": "2024-03-01T00:00:00.000Z"
  }
}
```

#### 3.2.3 大赛报名接口

**POST /api/registrations**
```json
// Request
{
  "workName": "智能合同审查助手",
  "workDescription": "利用AI技术实现合同自动审查...",
  "userName": "张三",
  "userEmployeeId": "EMP001"
}

// Response
{
  "code": 0,
  "message": "报名提交成功",
  "data": {
    "id": 1,
    "workName": "智能合同审查助手",
    "workDescription": "利用AI技术实现合同自动审查...",
    "userName": "张三",
    "userEmployeeId": "EMP001",
    "status": 0,
    "createdAt": "2024-03-01T00:00:00.000Z"
  }
}
```

**GET /api/registrations/export**
- 返回 Excel 文件流

#### 3.2.4 大赛信息接口

**GET /api/contest/info**
```json
// Response
{
  "code": 0,
  "message": "success",
  "data": {
    "title": "法务\"AI副驾驶\"设计大赛",
    "subtitle": "让法务拥有自己的\"AI副驾驶\"！",
    "badgeText": "海尔集团法务数字化创新",
    "statPhases": "5",
    "statTrainings": "10+",
    "statCreative": "∞",
    "posterUrl": "/poster.jpg",
    "infoCards": [
      {
        "icon": "👥",
        "title": "参赛对象",
        "content": "海尔集团所有法务人员"
      }
    ],
    "stages": [...],
    "aiTools": [...]
  }
}
```

---

## 四、前端改造方案

### 4.1 改造内容

| 页面 | 改造内容 |
|-----|---------|
| Home.vue | 从API获取大赛信息、阶段信息、AI工具列表 |
| Training.vue | 从API获取培训资料列表 |
| Registration.vue | 提交报名改为调用API |
| TrainingAdmin.vue | 培训管理、报名管理改为调用API；新增登录功能 |

### 4.2 新增功能

1. **管理员登录页面** - 新增 Login.vue
2. **大赛信息管理** - 在后台增加大赛信息配置功能
3. **阶段管理** - 在后台增加比赛阶段管理功能
4. **AI工具管理** - 在后台增加AI工具管理功能

### 4.3 API服务封装

新增 `src/api/` 目录：
```
src/api/
├── index.js        # API入口，axios配置
├── auth.js         # 认证API
├── training.js     # 培训资料API
├── registration.js # 报名API
├── contest.js      # 大赛信息API
└── tools.js        # AI工具API
```

---

## 五、实施计划

### 5.1 阶段一：后端基础搭建（预计工作量：中等）
1. 创建 server 目录结构
2. 配置数据库连接
3. 创建数据模型（Models）
4. 实现基础 CRUD 接口
5. 实现 JWT 认证中间件

### 5.2 阶段二：前端API对接（预计工作量：中等）
1. 封装 API 服务层
2. 改造 Training.vue
3. 改造 Registration.vue
4. 改造 Home.vue
5. 改造 TrainingAdmin.vue

### 5.3 阶段三：管理功能完善（预计工作量：较小）
1. 新增管理员登录页面
2. 新增大赛信息管理
3. 新增阶段管理
4. 新增AI工具管理

---

## 六、环境配置

### 6.1 环境变量 (.env)
```env
# 服务配置
PORT=3000
NODE_ENV=development

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=ai_contest
DB_USER=root
DB_PASSWORD=your_password

# JWT配置
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h

# 上传配置
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
```

### 6.2 数据库初始化SQL
```sql
CREATE DATABASE IF NOT EXISTS ai_contest DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE ai_contest;

-- 创建培训资料表
CREATE TABLE trainings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL,
  video_url VARCHAR(500) NOT NULL,
  cover_image VARCHAR(500),
  sort_order INT DEFAULT 0,
  status TINYINT DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 创建报名表
CREATE TABLE registrations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  work_name VARCHAR(100) NOT NULL,
  work_description TEXT NOT NULL,
  user_name VARCHAR(50) NOT NULL,
  user_employee_id VARCHAR(50) NOT NULL,
  status TINYINT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 创建大赛信息表
CREATE TABLE contest_info (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(100) NOT NULL,
  subtitle VARCHAR(200),
  badge_text VARCHAR(50),
  stat_phases VARCHAR(20) DEFAULT '5',
  stat_trainings VARCHAR(20) DEFAULT '10+',
  stat_creative VARCHAR(20) DEFAULT '∞',
  poster_url VARCHAR(500),
  info_participants TEXT,
  info_rewards TEXT,
  info_highlights TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 创建比赛阶段表
CREATE TABLE stages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(500),
  time_range VARCHAR(50),
  sort_order INT DEFAULT 0,
  status TINYINT DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 创建AI工具表
CREATE TABLE ai_tools (
  id INT PRIMARY KEY AUTO_INCREMENT,
  category VARCHAR(50) NOT NULL,
  category_icon VARCHAR(10),
  name VARCHAR(50) NOT NULL,
  url VARCHAR(500) NOT NULL,
  rank INT DEFAULT 0,
  recommend VARCHAR(20),
  description VARCHAR(200),
  sort_order INT DEFAULT 0,
  status TINYINT DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 创建管理员表
CREATE TABLE admins (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'admin',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 插入默认管理员（密码：admin123）
INSERT INTO admins (username, password_hash) VALUES 
('admin', '$2a$10$YourHashedPasswordHere');
```

---

## 七、安全考虑

1. **密码安全**：使用 bcrypt 加密存储
2. **接口鉴权**：管理接口需要 JWT Token 验证
3. **SQL注入防护**：使用 ORM 参数化查询
4. **XSS防护**：前端输入过滤，后端输出转义
5. **文件上传**：限制文件类型和大小，重命名文件
6. **CORS配置**：限制允许的请求来源

---

## 八、部署建议

### 8.1 开发环境
- 前端：`npm run dev` (Vite Dev Server)
- 后端：`npm run server:dev` (Nodemon 热重载)
- 数据库：本地 MySQL

### 8.2 生产环境
- 前端：构建静态文件，部署到 Nginx
- 后端：PM2 管理 Node.js 进程
- 数据库：MySQL 主从或云数据库

---

**请审核以上方案，确认后我将开始实施开发。**
