-- AI创意大赛数据库初始化脚本

-- 创建数据库
CREATE DATABASE IF NOT EXISTS ai_contest DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE ai_contest;

-- 创建培训资料表
CREATE TABLE IF NOT EXISTS trainings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL COMMENT '培训名称',
  video_url VARCHAR(500) NOT NULL COMMENT '视频链接',
  cover_image VARCHAR(500) COMMENT '封面图片URL',
  sort_order INT DEFAULT 0 COMMENT '排序序号',
  status TINYINT DEFAULT 1 COMMENT '状态：1-启用，0-禁用',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='培训资料表';

-- 创建报名表
CREATE TABLE IF NOT EXISTS registrations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  work_name VARCHAR(100) NOT NULL COMMENT '作品名称',
  work_description TEXT NOT NULL COMMENT '作品概述',
  user_name VARCHAR(50) NOT NULL COMMENT '参赛人姓名',
  user_employee_id VARCHAR(50) NOT NULL COMMENT '参赛人工号',
  status TINYINT DEFAULT 0 COMMENT '状态：0-待审核，1-通过，2-驳回',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='大赛报名表';

-- 创建大赛信息表
CREATE TABLE IF NOT EXISTS contest_info (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(100) NOT NULL DEFAULT '法务AI副驾驶设计大赛' COMMENT '大赛标题',
  subtitle VARCHAR(200) DEFAULT '让法务拥有自己的AI副驾驶' COMMENT '副标题',
  badge_text VARCHAR(50) DEFAULT '海尔集团法务数字化创新' COMMENT '徽章文字',
  stat_phases VARCHAR(20) DEFAULT '5' COMMENT '统计-比赛阶段数',
  stat_trainings VARCHAR(20) DEFAULT '10+' COMMENT '统计-培训场次',
  stat_creative VARCHAR(20) DEFAULT '∞' COMMENT '统计-创意可能',
  poster_url VARCHAR(500) COMMENT '海报图片URL',
  info_participants TEXT COMMENT '参赛对象信息',
  info_rewards TEXT COMMENT '奖励机制信息',
  info_highlights TEXT COMMENT '大赛亮点信息',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='大赛信息表';

-- 创建比赛阶段表
CREATE TABLE IF NOT EXISTS stages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL COMMENT '阶段名称',
  description VARCHAR(500) COMMENT '阶段描述',
  time_range VARCHAR(50) COMMENT '时间范围',
  sort_order INT DEFAULT 0 COMMENT '排序序号',
  status TINYINT DEFAULT 1 COMMENT '状态：1-进行中，0-未开始，2-已结束',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='比赛阶段表';

-- 创建AI工具表
CREATE TABLE IF NOT EXISTS ai_tools (
  id INT PRIMARY KEY AUTO_INCREMENT,
  category VARCHAR(50) NOT NULL COMMENT '分类名称',
  category_icon VARCHAR(10) COMMENT '分类图标',
  name VARCHAR(50) NOT NULL COMMENT '工具名称',
  url VARCHAR(500) NOT NULL COMMENT '工具链接',
  `rank` INT DEFAULT 0 COMMENT '排名',
  recommend VARCHAR(20) COMMENT '推荐标签',
  description VARCHAR(200) COMMENT '工具描述',
  sort_order INT DEFAULT 0 COMMENT '排序序号',
  status TINYINT DEFAULT 1 COMMENT '状态：1-启用，0-禁用',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI工具表';

-- 创建管理员表
CREATE TABLE IF NOT EXISTS admins (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL COMMENT '用户名',
  password_hash VARCHAR(255) NOT NULL COMMENT '密码哈希',
  role VARCHAR(20) DEFAULT 'admin' COMMENT '角色',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='管理员表';

-- 插入默认大赛信息
INSERT INTO contest_info (title, subtitle, badge_text, stat_phases, stat_trainings, stat_creative, info_participants, info_rewards, info_highlights) VALUES
('法务AI副驾驶设计大赛', '让法务拥有自己的AI副驾驶', '海尔集团法务数字化创新', '5', '10+', '∞', 
'海尔集团所有法务人员',
'最终漏出作品，优先录入三金奖、月度奖等集团奖项，并优先获得发展。',
'零门槛参与，全程培训指导；创意无限，设计专属AI副驾驶；优秀创意落地实施。');

-- 插入默认比赛阶段
INSERT INTO stages (name, description, time_range, sort_order, status) VALUES
('AI应用技巧培训', '系统学习AI应用技能，掌握主流AI工具使用方法', '3月-4月', 1, 1),
('创意提交与评审', '发挥创意，提出AI副驾驶应用场景构想', '5月初', 2, 0),
('智能体培训实战', '学习构建复杂智能体，掌握Agent模板', '6月-8月', 3, 0),
('作品提交与评审', '提交复杂智能体设计作品，展示实战成果', '9月初', 4, 0),
('应用开发与上线', '进阶实战，打造高质量应用成果', '10月-12月', 5, 0);

-- 插入默认培训资料
INSERT INTO trainings (name, video_url, sort_order, status) VALUES
('AI说-AI赋能法律人工作：原理、工具', 'https://live-og3lg6.vhall.cn/v3/lives/watch/763568303', 1, 1),
('圆桌论坛：生成式AI对企业合规的挑战', 'https://t.568live.cn/FK1YtW', 2, 1),
('主题演讲：全球视角下的AI合规与监管趋势', 'https://live.vhall.com/v3/lives/watch/686916117', 3, 1),
('专家视角：通用型AI与法律AI的差异与融合', 'https://live.vhall.com/v3/lives/watch/560575636', 4, 1),
('圆桌讨论：法务部门如何使用AI赋能工作场景', 'https://live.vhall.com/v3/lives/watch/626184781', 5, 1),
('圆桌讨论：生成式AI对企业合规的挑战与风险防控', 'https://live.vhall.com/v3/lives/watch/580655488', 6, 1),
('生成式AI法律治理：全球热点、法律挑战与合规实践', 'https://live.vhall.com/v3/lives/watch/627813242', 7, 1),
('AI+应用出海合规风险', 'https://live.vhall.com/v3/lives/watch/254857703', 8, 1),
('人工智能的法律边界与出海路径之一', 'https://live.vhall.com/v3/lives/watch/617378607', 9, 1),
('未来法律AI说-跨境出海中的AI法律应用', 'https://live-og3lg6.vhall.cn/v3/lives/watch/998354907', 10, 1),
('未来法律AI说-企业法务如何高效使用AI', 'https://live-og3lg6.vhall.cn/v3/lives/watch/959768469', 11, 1),
('未来法律AI说-AIGC应用中的法律挑战', 'https://live-og3lg6.vhall.cn/v3/lives/watch/178631583', 12, 1),
('未来法律AI说-法律人共创畅想法律AI的未来', 'https://live-og3lg6.vhall.cn/v3/lives/watch/433075047', 13, 1),
('未来法律AI说-律所与企业双重视角下的人机协同', 'https://live-og3lg6.vhall.cn/v3/lives/watch/293362594', 14, 1);

-- 插入默认AI工具
INSERT INTO ai_tools (category, category_icon, name, url, `rank`, recommend, description, sort_order, status) VALUES
('AI对话助手', 'K', 'Kimi', 'https://kimi.moonshot.cn', 1, '推荐', '长文本处理能力强', 1, 1),
('AI对话助手', 'K', '通义千问', 'https://tongyi.aliyun.com', 2, '推荐', '阿里出品，功能全面', 2, 1),
('AI对话助手', 'K', '文心一言', 'https://yiyan.baidu.com', 3, '推荐', '百度出品，中文理解好', 3, 1),
('AI对话助手', 'K', '豆包', 'https://www.doubao.com', 4, NULL, '字节跳动出品', 4, 1),
('AI对话助手', 'K', '智谱清言', 'https://chatglm.cn', 5, NULL, '清华技术背景', 5, 1),
('AI写作工具', 'W', 'Kimi', 'https://kimi.moonshot.cn', 1, '推荐', '文档处理能力强', 1, 1),
('AI写作工具', 'W', '通义千问', 'https://tongyi.aliyun.com', 2, '推荐', '写作辅助功能丰富', 2, 1),
('AI写作工具', 'W', '秘塔写作猫', 'https://xiezuocat.com', 3, NULL, '专业写作助手', 3, 1),
('AI写作工具', 'W', '讯飞写作', 'https://writing.iflyrec.com', 4, NULL, '语音转写写作', 4, 1),
('AI绘图工具', 'D', '即梦AI', 'https://jimeng.jianying.com', 1, '推荐', '字节出品，中文理解好', 1, 1),
('AI绘图工具', 'D', '通义万相', 'https://tongyi.aliyun.com/wanxiang', 2, '推荐', '阿里出品，功能强大', 2, 1),
('AI绘图工具', 'D', '文心一格', 'https://yige.baidu.com', 3, NULL, '百度出品', 3, 1),
('AI绘图工具', 'D', '混元助手', 'https://hunyuan.tencent.com', 4, NULL, '腾讯出品', 4, 1),
('AI办公工具', 'O', 'Kimi', 'https://kimi.moonshot.cn', 1, '推荐', '文档分析能力强', 1, 1),
('AI办公工具', 'O', '飞书智能伙伴', 'https://www.feishu.cn/product/feishu-ai', 2, '推荐', '企业协作首选', 2, 1),
('AI办公工具', 'O', '通义千问', 'https://tongyi.aliyun.com', 3, NULL, '文档处理功能全', 3, 1),
('AI办公工具', 'O', 'WPS AI', 'https://ai.wps.cn', 4, NULL, '办公文档智能', 4, 1);
