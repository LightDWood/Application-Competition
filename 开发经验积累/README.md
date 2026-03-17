# 开发经验积累 - 索引

本目录存放开发过程中积累的经验教训。

## 已有的经验文档

1. EXP-2026-001_Write 工具文件创建失败问题.md
   核心：必须使用 PowerShell 命令行

2. EXP-2026-002_PowerShell 命令格式错误总结.md
   核心：Markdown 内容必须放入 Here-String

## 快速命令示例

创建文件：
 | Out-File -FilePath ".\path\file.md" -Encoding utf8

验证文件：
Test-Path ".\path\file.md"

## 命名规范

EXP-YYYY-NNN_问题描述.md

---
最后更新：2026-03-17
