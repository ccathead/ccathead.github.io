---
title: 众包（Crowdsourcing）是什么？从“把任务交给大众”说起
date: "2026-10-05 00:00:00"
updated: "2026-10-05 00:00:00"
lang: zh-CN
translation_key: crowdsourcing-explained
permalink: posts/crowdsourcing-explained/
categories:
  - 学习笔记
tags:
  - 概念解释
  - 人工智能
  - 数据标注
description: 用论文中的数据标注场景解释众包的含义、流程、质量控制与常见术语。
published: true
---

<!-- 此文件由 PARA/Resources/Notes 自动生成，请勿直接编辑。 -->
<!-- 来源：众包（Crowdsourcing）是什么.md -->

阅读人工智能、自然语言处理或情感计算论文时，我们经常会看到 *crowdsourcing*、*crowd workers*、*crowdsourced annotation* 等词。它们都围绕同一个概念：**众包**。

## 一句话理解

众包，就是把原本由组织内部员工或少数专家完成的任务，通过公开招募交给一群人协作完成。

这个词由 *crowd*（大众）和 *outsourcing*（外包）组合而成。2006 年，《Wired》杂志作者 Jeff Howe 用它描述一种由互联网推动的工作方式：企业把过去由员工完成的职能，交给一个身份未必预先确定、人数通常较多的群体。

众包的重点不只是“参与者很多”，而是以下几个环节同时存在：

> 发起者提出任务 → 通过平台招募参与者 → 多人分别贡献结果 → 对结果进行筛选、聚合或评估

## 在 AI 论文里，众包通常用来做什么？

在机器学习研究中，众包最常见的用途是**收集数据和标注数据**。

假设研究者收集了 10,000 个视频片段，需要判断每段视频中人物的情绪。研究团队可以把任务发布到众包平台，让多位参与者分别观看视频并选择标签：

| 标注者 | 判断结果 |
|---|---|
| A | 开心 |
| B | 开心 |
| C | 中性 |
| D | 开心 |
| E | 开心 |

如果采用多数投票，最终标签就是“开心”。这就是典型的**众包标注（crowdsourced annotation）**。

除了图像、文本、语音和视频标注，众包还可以用于问卷调查、内容创作、翻译、转写、产品设计、科学问题求解和用户评价等任务。

## 为什么情感计算尤其常用众包？

情绪判断往往具有主观性。同一句“Fine. Do whatever you want.”，有人可能理解为愤怒，有人觉得是难过，也有人会标为中性。

因此，只让一个人标注容易把个人偏好当成标准答案。研究者通常会让多个人判断同一个样本，再用多数投票、平均分或更复杂的统计模型聚合结果。有时，研究者也会保留完整的标签分布：

```text
愤怒：0.60
难过：0.20
中性：0.20
```

这种分布不只告诉我们“最可能的标签”，还保留了样本本身的模糊性。标注者之间的不一致也不一定意味着有人做错了；它有时恰恰说明文本、声音或表情存在多种合理解释。

## 众包不等于“随便找网友”

可靠的众包项目通常会设计完整的质量控制流程，例如：

- 给出清晰的任务说明和示例；
- 设置资格测试或注意力检查；
- 让多个标注者处理同一个样本；
- 使用多数投票或可靠性加权来聚合答案；
- 检查标注者之间的一致性；
- 由专家复核争议较大的样本。

众包的优势是速度快、扩展性强，并且能够汇集不同人的判断；它的局限也很明显：参与者能力不同，任务可能被误解，报酬和任务设计还可能带来偏差。因而，真正决定数据质量的并不是“人多”，而是任务设计、参与者管理和结果聚合是否合理。

## 几个常见术语

- **crowd workers / crowdworkers**：众包参与者、众包工作者
- **crowd annotators**：众包标注者
- **crowdsourced data**：通过众包获得的数据
- **crowdsourced annotation**：众包标注
- **Human Intelligence Task（HIT）**：需要人类完成的具体任务，常见于 Amazon Mechanical Turk 等平台
- **majority voting**：多数投票，用出现次数最多的答案作为最终结果

## 它和外包、志愿协作有什么区别？

传统外包通常把任务交给一家确定的公司或一组已知承包者；众包则面向更广泛、成员可能事先并不确定的人群公开招募。众包参与者既可能获得报酬，也可能出于兴趣、公益或社区认同自愿贡献。因此，付费微任务平台和维基式协作都可能属于广义众包，但它们的组织方式和参与动机并不相同。

## 小结

可以把众包理解为一种“借助互联网组织大规模人类协作”的方法。在 AI 论文中，它通常意味着研究者通过众多参与者收集或标注数据，再通过质量控制和结果聚合形成可用的数据集。

下次看到 *crowdsourced dataset* 时，不妨继续追问三个问题：谁完成了任务？每个样本由多少人处理？研究者如何处理分歧？这些信息往往比“使用了众包”本身更能说明数据是否可靠。

## 参考资料

1. Jeff Howe, [The Rise of Crowdsourcing](https://www.wired.com/2006/06/crowds/), *Wired*, 2006.
2. Yuan Jin, Mark Carman, Ye Zhu, Yong Xiang, [A Technical Survey on Statistical Modelling and Design Methods for Crowdsourcing Quality Control](https://doi.org/10.1016/j.artint.2020.103351), *Artificial Intelligence*, 2020.
3. Verena Rieser et al., [Analyzing Dataset Annotation Quality Management in the Wild](https://direct.mit.edu/coli/article/50/3/817/120233/Analyzing-Dataset-Annotation-Quality-Management-in), *Computational Linguistics*, 2024.
4. Marta Sabou et al., [Crowdsourcing Ground Truth for Semantic Annotation](https://doi.org/10.3233/SW-200415), *Semantic Web*, 2021.
