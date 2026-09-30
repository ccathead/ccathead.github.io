---
title: 大语言模型基础：从 Token 到语言模型
date: "2026-09-30 13:50:00"
updated: "2026-09-30 13:50:00"
lang: zh-CN
translation_key: llm-foundations
permalink: posts/llm-foundations/
categories:
  - 学习笔记
  - LLM
tags:
  - LLM
  - NLP
  - Tokenization
  - 语言模型
description: 从 NLP 的发展出发，理解文本如何经过 Tokenization、Embedding 和语言模型生成下一个 Token。
published: true
---

<!-- 此文件由 PARA/Resources/Notes 自动生成，请勿直接编辑。 -->
<!-- 来源：LLM/01-Foundations/语言模型基础.md -->

## 1. 从 NLP 到语言模型

### 1.1 什么是自然语言处理

自然语言处理（Natural Language Processing，NLP）研究如何让计算机分析、表示、理解和生成自然语言。常见任务包括文本分类、信息抽取、机器翻译、阅读理解、摘要和对话生成。

这些任务表面上不同，但都需要解决两个基础问题：

1. 如何把离散、可变长度的语言转换成可计算的表示；
2. 如何利用上下文判断一个词或一段文本的含义与后续内容。

NLP 的发展可以粗略概括为：
详见:[第一章 NLP 基础概念](https://datawhalechina.github.io/happy-llm/#/./chapter1/%E7%AC%AC%E4%B8%80%E7%AB%A0%20NLP%E5%9F%BA%E7%A1%80%E6%A6%82%E5%BF%B5)

1. 早期探索(1940-1960)
2. 符号主义与统计方法(1970-1990)
3. 机器学习与深度学习(2000-至今)

### 1.2 什么是语言模型

语言模型（Language Model）是对 token 序列的概率分布进行建模的模型。

设一段文本经过 tokenizer 后得到序列：
{% raw %}
<div class="math-display">
\[
x_1,x_2,\ldots,x_T
\]
</div>
{% endraw %}
语言模型希望估计整个序列出现的概率：
{% raw %}
<div class="math-display">
\[
P(x_1,x_2,\ldots,x_T)
\]
</div>
{% endraw %}
根据概率链式法则，联合概率可以分解为：
{% raw %}
<div class="math-display">
\[
P(x_{1:T})
=
\prod_{t=1}^{T}P(x_t\mid x_{<t})
\]
</div>
{% endraw %}
其中，$x_{<t}$表示位置 $t$之前的全部 token。

因此，对整个文本序列建模可以转化为一系列条件概率问题：给定已有上下文，预测下一个 token 的概率分布。

例如：

```text
输入：我
目标：喜欢

输入：我 喜欢
目标：学习

输入：我 喜欢 学习
目标：语言模型
```

现代生成式 LLM 的直接训练目标通常仍然是预测下一个 token。
为了更准确地完成这一目标，模型需要从数据中学习语法、搭配、语义关联、文本结构以及部分事实模式。

## 2. 文本如何变成模型输入

### 2.1 从文本到 Token

神经网络不能直接对字符串进行矩阵运算，因此首先需要使用 tokenizer 将文本编码为 token 序列。

Token 定义是：

> Token 是 tokenizer 按照既定词表和编码规则切分文本后得到的基本处理单位。


Token 与字符、汉字、单词之间不存在固定换算关系。英文中一个 token 可能是一个单词，也可能只是单词的一部分；中文中一个汉字可能对应一个或多个 token。实际切分结果取决于模型的 tokenizer、词表、训练语料和具体输入。具体 token 计算方式,特别是汉字和英文单词的 token 区别，具体可参考[(4 封私信 / 6 条消息) ChatGPT如何计算token数？ - 知乎](https://www.zhihu.com/question/594159910)

### 2.2 常见的切分粒度

按照基本单位，文本表示方式可以粗略分为：

| 方法 | 基本单位 | 优点 | 局限 |
|---|---|---|---|
| Word-level | 单词 | 单位通常具有较完整语义 | 词表大，未登录词问题明显 |
| Character-level | 字符 | 词表较小，几乎没有未登录词 | 序列更长，单个单位语义较弱 |
| Subword-level | 子词 | 在词表规模和语义表达之间折中 | 切分结果依赖算法与语料 |
| Byte-level | 字节 | 能覆盖任意文本 | 序列可能更长，可读性较弱 |

现代语言模型通常采用子词或字节相关方法。常见方法包括 BPE、WordPiece 和 Unigram。它们的共同目标是在有限词表下复用高频片段，同时将低频词拆成可组合的基本单位。

例如，一个低频英文单词可能被拆成词根和词缀；常见单词则可能保留为一个 token。中文文本也可能按单字、常见词片段或字节组合切分。SentencePiece 进一步提供了可以直接从原始文本训练的语言无关子词处理方案。

### 2.3 Vocabulary、Token 和 Token ID

Vocabulary 是 tokenizer 能够识别的 token 集合。
每个 token 在词表中对应一个整数编号，即 Token ID。

三者关系为：

```text
文本
  → Tokenizer 切分
Tokens
  → Vocabulary 查表
Token IDs
```

假设词表中存在如下映射：

```text
"我"   → 105
"喜欢" → 892
"模型" → 2301
```

文本“我喜欢模型”经过编码后，可能得到：

```text
Tokens:    ["我", "喜欢", "模型"]
Token IDs: [105, 892, 2301]
```

这个例子只用于说明过程，真实切分及编号取决于具体 tokenizer。

Tokenizer 还可能加入特殊 token，例如序列开始、序列结束、填充或未知字符标记。不同模型对特殊 token 的定义和使用方式并不完全相同。

### 2.4 从 Token ID 到 Embedding

Embedding： [第2章 相似匹配——万物皆可Embedding](https://datawhalechina.github.io/hugging-llm/#/chapter2/chapter2)

Token ID 只是词表中的索引。编号 2000 并不比编号 1000 具有更大的语义，因此不能直接把编号大小当作模型输入的含义。

模型使用 Embedding Matrix 将离散 Token ID 映射为连续向量。设词表大小为 $|V|$，隐藏维度为 $d$，Embedding Matrix 为：

{% raw %}
<div class="math-display">
\[
E\in\mathbb{R}^{|V|\times d}
\]
</div>
{% endraw %}
给定 Token ID $i$，Embedding Lookup 取出矩阵的第 $i$ 行：

{% raw %}
<div class="math-display">
\[
e_i=E[i]\in\mathbb{R}^{d}
\]
</div>
{% endraw %}
对于 batch 中的 token 序列，常见形状变化为：

```text
Token IDs:        [batch_size, sequence_length]
Embedding Matrix: [vocab_size, hidden_size]
Hidden States:    [batch_size, sequence_length, hidden_size]
```

Embedding 让模型可以在连续空间中学习 token 的表示。初始向量不必天然具有明确语义，它们会和模型的其他参数一起通过训练更新。经过多层网络后，同一个 token 在不同上下文中的隐藏状态也会发生变化，因此 Token Embedding 与<font color="#4bacc6">上下文化</font>（一个token的最终向量不仅表示它本身，还融合了它所在的句子中其他token提供的信息）表示不能混为一谈。

## 3. 语言模型如何学习和预测

### 3.1 从隐藏状态到词表概率

输入向量经过语言模型后，每个位置得到一个隐藏状态。模型再将隐藏状态映射到整个词表，产生一组 logits：

{% raw %}
<div class="math-display">
\[
z\in\mathbb{R}^{|V|}
\]
</div>
{% endraw %}
Logit 是模型对候选 token 的未归一化分数。通过 Softmax 可以将其转换为概率：
{% raw %}
<div class="math-display">
\[
P(x_t=i\mid x_{<t})
=
\frac{\exp(z_i)}{\sum_{j=1}^{|V|}\exp(z_j)}
\]
</div>
{% endraw %}
得到的概率分布满足：
{% raw %}
<div class="math-display">
\[
\sum_{i=1}^{|V|}P(x_t=i\mid x_{<t})=1
\]
</div>
{% endraw %}
模型为词表中的每个候选 token 分配概率。

### 3.2 模型如何学习

<font color="#4bacc6">训练数据</font>提供上下文和真实的下一个 token。模型需要提高真实 token 的预测概率。

自回归语言模型通常最大化训练序列的对数似然：

{% raw %}
<div class="math-display">
\[
\sum_{t=1}^{T}\log P_\theta(x_t\mid x_{<t})
\]
</div>
{% endraw %}
等价地，可以最小化负对数似然：

{% raw %}
<div class="math-display">
\[
\mathcal{L}(\theta)
=
-\sum_{t=1}^{T}\log P_\theta(x_t\mid x_{<t})
\]
</div>
{% endraw %}
在分类视角下，这对应词表上的交叉熵损失。训练过程可以概括为：

```text
输入 Token IDs
  → 前向传播
  → 得到词表概率
  → 与真实 Token 比较
  → 计算 Loss
  → 反向传播
  → 更新参数
```

模型经过大量文本训练后，会逐步调整 Embedding、网络层和输出层的参数，使训练数据中的合理后续 token 获得更高概率。

### 3.3 训练、推理与生成

这三个概念相关但不同：

- **训练**：已知正确目标，根据损失更新模型参数。
- **推理**：使用固定的模型参数完成计算，不更新参数。
- **生成**：推理的一种形式，根据模型给出的概率分布选择 token，并重复这一过程。

生成过程为：

```text
已有上下文
  → 模型预测下一个 Token 的概率分布
  → 解码策略选出一个 Token
  → 将 Token 追加到上下文
  → 再次预测
```

单次前向计算只产生当前位置的候选概率。完整回答来自多轮自回归预测，而不是模型一次性写出整段文本。

### 3.4 自回归与掩码语言建模

自回归语言模型根据左侧上下文预测下一个 token：

{% raw %}
<div class="math-display">
\[
P(x_t\mid x_{<t})
\]
</div>
{% endraw %}
这种目标与从左到右生成文本自然一致，GPT 类 Decoder-only 模型通常使用这一方式。

掩码语言模型遮盖输入中的部分 token，并根据可见上下文恢复它们：

```text
巴黎是 [MASK] 的首都
```

它通常能够同时利用被遮盖位置左右两侧的信息。BERT 是这一训练范式的代表。掩码语言建模适合学习双向表示，但并不直接等同于从左到右的序列生成。

## 4. 如何选择下一个 Token

模型负责给出候选 token 的概率分布，解码策略负责从分布中选择具体 token。

### 4.1 Greedy Search

贪心搜索每一步都选择当前概率最高的 token：

{% raw %}
<div class="math-display">
\[
x_t=\arg\max_i P(x_t=i\mid x_{<t})
\]
</div>
{% endraw %}
它计算简单、输出稳定，但局部最优选择不保证整个序列最优，也容易产生机械或重复的文本。

### 4.2 Beam Search

集束搜索在每一步保留若干个累计得分最高的候选序列，再继续扩展。Beam Width 决定同时保留多少条路径。

它比贪心搜索考察更多候选序列，常用于机器翻译等目标较明确的条件生成任务。但在开放式对话中，较强的确定性不一定带来更自然的文本。

### 4.3 Sampling

采样方法按照模型给出的概率随机选择 token，因此可以产生更加多样的结果。

常见控制方法包括：

- **Temperature**：调节概率分布的平滑程度；
- **Top-k**：只在概率最高的 \(k\) 个 token 中采样；
- **Top-p**：在累计概率达到阈值 \(p\) 的最小候选集合中采样。

这些方法不会改变模型参数，只会影响生成时如何使用概率分布。

## 5. 语言模型的发展历程

语言模型的发展可以理解为不断改进“如何表示 token”以及“如何利用上下文”。

### 5.1 N-gram：固定窗口中的统计规律

完整条件概率可能依赖非常长的历史。N-gram 使用马尔可夫假设，预测当前 token 时，只考虑它前面最近的 $n-1$ 个 token，更早的历史暂时忽略。

{% raw %}
<div class="math-display">
\[
P(x_t\mid x_1,\ldots,x_{t-1})
\approx
P(x_t\mid x_{t-n+1},\ldots,x_{t-1})
\]
</div>
{% endraw %}
以 Bigram 为例：

{% raw %}
<div class="math-display">
\[
P(x_t\mid x_{t-1})
=
\frac{\operatorname{Count}(x_{t-1},x_t)}
{\operatorname{Count}(x_{t-1})}
\]
</div>
{% endraw %}
N-gram 直观、容易实现，但存在明显限制：

- 只能使用固定长度的局部上下文；
- 随着 n增大，组合数量迅速增长；
- 未出现的组合可能得到零概率，需要平滑处理；
- 离散统计难以利用词语之间的语义相似性。

### 5.2 神经概率语言模型：从离散统计到连续表示

神经概率语言模型使用 Embedding 表示词语，再通过神经网络预测后续词。连续向量使语义相近的词能够共享统计信息，缓解了纯离散 N-gram 的部分数据稀疏问题。

但早期前馈神经语言模型仍然依赖固定大小的上下文窗口，无法自然处理任意长度的历史。

### 5.3 RNN、LSTM 与 GRU：递归表示序列

RNN 按顺序处理 token，并通过隐藏状态传递历史信息：
{% raw %}
<div class="math-display">
\[
h_t=f(h_{t-1},x_t)
\]
</div>
{% endraw %}
理论上，$h_t$ 可以概括此前的整个序列，因此 RNN 不再受固定 N-gram 窗口限制。

但普通 RNN 在长序列上容易受到梯度消失或梯度爆炸影响，难以稳定保留长期信息。LSTM 和 GRU 通过门控机制控制信息的写入、保留和遗忘，改善了长期依赖建模。

循环结构仍然存在一个重要工程限制：时间步之间具有依赖关系，必须按顺序计算，难以充分并行训练。

### 5.4 Seq2Seq：从一个序列生成另一个序列

Encoder–Decoder 架构将输入序列编码为表示，再由 Decoder 生成目标序列。这种结构使机器翻译、摘要等任务可以统一为序列到序列问题。

早期 Seq2Seq 通常将整个输入压缩到固定长度向量。随着输入变长，单一向量容易成为信息瓶颈。

### 5.5 Attention：动态读取相关信息

Attention 允许 Decoder 在生成每个输出时，根据当前状态动态选择输入序列中更相关的位置，而不是只依赖一个固定长度向量。

这缓解了 Encoder–Decoder 的信息压缩问题，也提供了更加直接的上下文访问方式。但早期 Attention 通常仍然建立在 RNN Encoder 和 Decoder 之上，没有消除循环计算。

### 5.6 Transformer：使用 Attention 建模序列

Transformer 进一步移除循环结构，主要依靠 Attention 在不同位置之间传递信息。相比按时间步递归计算的 RNN，Transformer 更适合在训练阶段并行处理序列。

### 5.7 从预训练语言模型到 LLM

预训练语言模型先在大规模文本上学习通用语言规律，再通过微调或提示完成下游任务。Transformer 为大规模并行训练提供了合适的结构基础。

随着参数规模、数据规模和计算量增长，模型逐渐表现出更强的通用生成与任务适配能力，形成今天通常所说的大语言模型。LLM 并不是脱离语言模型目标的全新类别，而是在模型结构、训练数据、计算规模和训练方法等方面共同扩展的结果。

整体演进可以概括为：

| 阶段 | 上下文建模方式 | 主要进步 | 主要限制 |
|---|---|---|---|
| N-gram | 固定长度统计窗口 | 建立概率语言建模形式 | 数据稀疏，无法使用长上下文 |
| 神经概率语言模型 | 固定窗口与连续向量 | 学习分布式表示 | 上下文仍然固定 |
| RNN | 循环隐藏状态 | 支持变长序列 | 长距离依赖和串行计算 |
| LSTM / GRU | 门控循环状态 | 改善长期信息保留 | 训练仍难并行 |
| Seq2Seq | Encoder–Decoder | 统一条件序列生成 | 固定长度表示形成瓶颈 |
| Attention | 动态访问输入位置 | 缓解信息压缩问题 | 通常仍依赖循环结构 |
| Transformer | Self-Attention | 并行训练与全局交互 | 长序列计算成本较高 |
| LLM | Transformer 与规模化训练 | 通用生成和任务适配 | 成本、幻觉、可靠性与对齐问题 |

## 6. 小结

1. Token 是 tokenizer 的基本处理单位。
2. Token ID 是词表索引，Embedding 才是模型实际计算的连续表示。
3. 语言模型学习的是 token 序列的概率关系。
4. 自回归语言模型通过条件概率分解预测下一个 token。
5. 模型预测概率，解码策略是从概率分布中选择 token。
6. N-gram、神经语言模型和循环网络的演进，核心都是改善表示方式和上下文建模。

## 参考资料

### 教程与课程

- [Datawhale：Happy-LLM](https://github.com/datawhalechina/happy-llm)
- [Datawhale：HuggingLLM](https://datawhalechina.github.io/hugging-llm/)
- 李宏毅老师机器学习与生成式人工智能相关课程

### 代表性论文

- [Bengio et al., A Neural Probabilistic Language Model, 2003](https://www.jmlr.org/papers/v3/bengio03a.html)
- [Cho et al., Learning Phrase Representations using RNN Encoder–Decoder for Statistical Machine Translation, 2014](https://arxiv.org/abs/1406.1078)
- [Bahdanau et al., Neural Machine Translation by Jointly Learning to Align and Translate, 2014](https://arxiv.org/abs/1409.0473)
- [Sennrich et al., Neural Machine Translation of Rare Words with Subword Units, 2015](https://arxiv.org/abs/1508.07909)
- [Vaswani et al., Attention Is All You Need, 2017](https://arxiv.org/abs/1706.03762)
- [Kudo and Richardson, SentencePiece, 2018](https://arxiv.org/abs/1808.06226)
- [Devlin et al., BERT, 2018](https://arxiv.org/abs/1810.04805)
