# 30 分钟技术分享材料：AI Comic Builder 技术架构现状与演进

## 0. 目标与产出（1 页 / 2 分钟）

- 目标
  - 让团队对“当前架构是什么、为什么这样设计、短板在哪里”形成共同认知
  - 对齐下一阶段演进优先级（P0/P1/P2）与落地责任边界
- 本次分享的产出
  - 一张拓扑图 + 一条关键流程
  - 一份风险 Top 清单（含优先级）
  - 一条可执行的演进路线图（按阶段）

## 1. 一句话架构（1 页 / 2 分钟）

- 形态：同仓单体（Next.js App Router）+ 内置任务队列（SQLite 表）+ 本地文件存储 + 外部 AI/FFmpeg
- 适用场景：单机/小规模快速迭代、模型能力验证
- 主要约束：生产多租户、安全与横向扩展能力不足

## 2. 系统拓扑（1 页 / 3 分钟）

讲解要点：
- UI、API、Worker、Pipeline、Provider、DB/文件存储之间的边界
- 外部依赖（OpenAI/Gemini/Veo/Kling/Seedance、FFmpeg）

可直接引用报告中的 Mermaid 图：
- `docs/tech-architecture-analysis-report.md` → 1.3 系统拓扑图

## 3. 关键流程：generate → task → pipeline → assemble（1 页 / 4 分钟）

讲解要点：
- 为什么有同步流式（文本）与异步任务（图像/视频/合成）两类路径
- `tasks` 表队列的好处（轻量、零依赖）与局限（单机、吞吐、可观测性）

可直接引用报告中的 Mermaid 图：
- `docs/tech-architecture-analysis-report.md` → 1.4 关键流程

## 4. 数据与状态模型（1 页 / 3 分钟）

讲解要点：
- 6 张核心表：projects / storyboard_versions / shots / characters / dialogues / tasks
- 产物存储：DB 记录路径/URL，真实内容在 `UPLOAD_DIR`
- 典型状态流：
  - project.status：draft → processing → completed
  - shot.status：pending → generating → completed/failed
  - task.status：pending → running → completed/failed（含 retry）

参考链接：
- Schema：[schema.ts](file:///Users/yxtwang/dev/gitee/person/AIComicBuilder/src/lib/db/schema.ts)

## 5. 技术栈速览 + 技术雷达（2 页 / 6 分钟）

第 1 页：技术栈速览（按层）
- Next.js 16 / React 19 / Tailwind 4 / next-intl / Zustand
- SQLite + Drizzle + better-sqlite3
- Vercel AI SDK + OpenAI/Google GenAI SDK
- FFmpeg + fluent-ffmpeg

第 2 页：技术雷达（Adopt/Trial/Assess/Hold）
- Adopt：当前最适合的“稳定底座”
- Trial/Assess：可控试点的范围与边界
- Hold：生产风险点（需要治理再上）

参考：报告 2.1~2.3

## 6. 六维度非功能差距（2 页 / 6 分钟）

第 1 页：现状 vs 基准（摘要）
- 性能：CRUD OK；异步吞吐受限（单 worker + 2s poll）
- 可用性：单点明显（DB/磁盘/实例）
- 伸缩性：本地 uploads + SQLite 限制横向扩展

第 2 页：工程化能力缺口（重点）
- 安全：无认证授权、无配额限流（成本型风险）
- 可维护性：缺少测试与契约；IO 同步读写存在隐患
- 可观测性：缺少结构化日志/指标/追踪

参考：报告第 4 章

## 7. 风险 Top 清单（1 页 / 3 分钟）

讲解要点：
- 先讲“会出事且影响大”的：鉴权、成本、单点
- 再讲“会拖慢迭代/稳定性”的：观测、吞吐
- 最后讲“合规与细节”：FFmpeg 许可、资源枚举、DB-文件一致性

参考：报告 5.1

## 8. 演进路线图（2 页 / 7 分钟）

第 1 页：P0（必须先做）
- 认证授权与资源隔离
- 限流/配额/预算控制（成本治理）
- 可观测性底座（日志/指标/追踪最小闭环）

第 2 页：P1/P2（扩展与提效）
- worker 解耦 + 队列治理
- uploads → 对象存储（签名 URL）
- SQLite → Postgres（当容量/并发触发阈值时）
- 任务幂等/回放、供应商治理、SBOM/许可扫描

参考：报告 5.2

## 9. 需要团队当场对齐的决策（1 页 / 2 分钟）

- 部署目标：仅单机自托管，还是面向多租户/公网？
- 身份体系：接入现有 SSO/OIDC，还是自建账号体系？
- 存储策略：是否必须支持多实例与跨机容灾？
- 供应商策略：允许哪些模型进入“默认推荐”，如何做成本与稳定性兜底？

## 10. 讨论与 Q&A（预留 / 2 分钟）

- 建议讨论顺序：P0 安全与成本 → 可观测性 → 任务与存储演进

