# Notes 到个人网站的发布流程

`PARA/Resources/Notes` 是唯一原稿库，Hexo 的 `source/_posts` 保存可提交和部署的生成稿。

## 发布一篇笔记

在 Notes 中的 Markdown 文件顶部添加：

```yaml
---
title: 文章标题
slug: stable-url-slug
date: 2026-09-30 13:50:00
updated: 2026-09-30 13:50:00
lang: zh-CN
translation_key: stable-url-slug
categories:
  - 学习笔记
tags:
  - LLM
description: 页面摘要
published: true
website: true
---
```

只有同时设置 `published: true` 和 `website: true` 的笔记才会同步。不要直接修改生成稿。

## 同步和检查

```bash
pnpm sync:notes
pnpm check:notes
pnpm preview:notes
```

- `sync:notes`：从 Notes 生成 Hexo 文章。
- `check:notes`：检查生成稿是否与原稿一致，不修改文件。
- `preview:notes`：同步后启动本地预览。

确认页面、引用、公式、图片和隐私信息后，再提交并推送 Git。推送 `main` 后由 GitHub Actions 部署。

## 内容转换规则

- 网站文章标题和元数据来自原稿 YAML。
- 原稿第一个一级标题会被移除，避免与 Hexo 页面标题重复。
- 指向已发布笔记的 Obsidian 双链会变成网站链接。
- 指向未发布笔记的双链会变成普通文本。
- 当前同步器遇到 Obsidian 嵌入或未处理的本地图片会停止，避免发布损坏页面。
- 生成稿含“请勿直接编辑”标记；修改应回到 Notes 原稿完成。
