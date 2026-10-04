import { promises as fs } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const blogRoot = path.resolve(scriptDir, '..')
const notesRoot = process.env.NOTES_ROOT
  ? path.resolve(process.env.NOTES_ROOT)
  : path.resolve(blogRoot, '..', 'PARA', 'Resources', 'Notes')
const postsRoot = path.join(blogRoot, 'source', '_posts')
const checkOnly = process.argv.includes('--check')

async function listMarkdownFiles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue
    const fullPath = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...await listMarkdownFiles(fullPath))
    if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) files.push(fullPath)
  }
  return files
}

function scalar(value) {
  const trimmed = value.trim()
  if (trimmed === 'true') return true
  if (trimmed === 'false') return false
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1)
  }
  return trimmed
}

function parseFrontMatter(content, sourcePath) {
  const normalized = content
    .replace(/^\uFEFF/, '')
    .replace(/\r\n/g, '\n')
    .replace(/^\s+(?=---\n)/, '')
  if (!normalized.startsWith('---\n')) {
    return { attributes: {}, body: normalized }
  }
  const end = normalized.indexOf('\n---\n', 4)
  if (end < 0) throw new Error(`Front matter 未闭合：${sourcePath}`)

  const attributes = {}
  let currentList = null
  for (const line of normalized.slice(4, end).split('\n')) {
    const item = line.match(/^\s+-\s+(.+)$/)
    if (item && currentList) {
      attributes[currentList].push(scalar(item[1]))
      continue
    }
    const pair = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/)
    if (!pair) continue
    const [, key, rawValue] = pair
    if (rawValue === '') {
      attributes[key] = []
      currentList = key
    } else {
      attributes[key] = scalar(rawValue)
      currentList = null
    }
  }
  return { attributes, body: normalized.slice(end + 5) }
}

function yamlString(value) {
  const text = String(value)
  if (/[:#\[\]{},&*!|>'"%@`]|^\s|\s$/.test(text)) return JSON.stringify(text)
  return text
}

function yamlList(key, values) {
  if (!Array.isArray(values) || values.length === 0) return []
  return [`${key}:`, ...values.map(value => `  - ${yamlString(value)}`)]
}

function outputFrontMatter(meta) {
  return [
    '---',
    `title: ${yamlString(meta.title)}`,
    `date: ${yamlString(meta.date)}`,
    `updated: ${yamlString(meta.updated || meta.date)}`,
    `lang: ${yamlString(meta.lang || 'zh-CN')}`,
    `translation_key: ${yamlString(meta.translation_key || meta.slug)}`,
    `permalink: posts/${meta.slug}/`,
    ...yamlList('categories', meta.categories),
    ...yamlList('tags', meta.tags),
    `description: ${yamlString(meta.description || '')}`,
    'published: true',
    '---',
  ].join('\n')
}

function noteKey(value) {
  return value.replace(/\\/g, '/').replace(/\.md$/i, '').trim().toLowerCase()
}

function convertWikiLinks(body, publishedNotes, sourcePath) {
  if (/!\[\[[^\]]+\]\]/.test(body)) {
    throw new Error(`暂不自动发布 Obsidian 嵌入资源，请先处理：${sourcePath}`)
  }

  return body.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, rawTarget, rawLabel) => {
    const targetWithoutHeading = rawTarget.split('#')[0]
    const heading = rawTarget.includes('#') ? rawTarget.slice(rawTarget.indexOf('#') + 1) : ''
    const label = rawLabel || heading || path.basename(targetWithoutHeading)
    const target = publishedNotes.get(noteKey(targetWithoutHeading)) || publishedNotes.get(noteKey(path.basename(targetWithoutHeading)))
    if (!target) return label
    const anchor = heading
      ? `#${encodeURIComponent(heading.trim().toLowerCase().replace(/\s+/g, '-'))}`
      : ''
    return `[${label}](/posts/${target.slug}/${anchor})`
  })
}

function assertPortable(body, sourcePath) {
  const localImage = body.match(/!\[[^\]]*\]\((?!https?:\/\/|\/|data:)([^)]+)\)/)
  if (localImage) throw new Error(`发现尚未复制的本地图片 ${localImage[1]}：${sourcePath}`)
  if (/\b[A-Za-z]:\\/.test(body)) throw new Error(`正文含本地绝对路径：${sourcePath}`)
}

function protectDisplayMath(body, sourcePath) {
  const protectedBody = body.replace(/^\$\$\s*\n([\s\S]*?)\n\$\$\s*$/gm, (_, formula) => {
    const escapedFormula = formula
      .trim()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
    return `{% raw %}\n<div class="math-display">\n\\[\n${escapedFormula}\n\\]\n</div>\n{% endraw %}`
  })
  const remainingFences = protectedBody.match(/^\$\$\s*$/gm)
  if (remainingFences) throw new Error(`存在未配对或未转换的块级公式：${sourcePath}`)
  return protectedBody
}

function renderPost(note, publishedNotes) {
  let body = note.body.trimStart()
  body = body.replace(/^#\s+[^\n]+\n+/, '')
  body = protectDisplayMath(body, note.sourcePath)
  body = convertWikiLinks(body, publishedNotes, note.sourcePath)
  assertPortable(body, note.sourcePath)

  const sourceRelative = path.relative(notesRoot, note.sourcePath).replace(/\\/g, '/')
  return `${outputFrontMatter(note.meta)}\n\n<!-- 此文件由 PARA/Resources/Notes 自动生成，请勿直接编辑。 -->\n<!-- 来源：${sourceRelative} -->\n\n${body.trim()}\n`
}

async function main() {
  const files = await listMarkdownFiles(notesRoot)
  const notes = []
  for (const sourcePath of files) {
    const parsed = parseFrontMatter(await fs.readFile(sourcePath, 'utf8'), sourcePath)
    if (parsed.attributes.website !== true || parsed.attributes.published !== true) continue
    for (const key of ['title', 'slug', 'date']) {
      if (!parsed.attributes[key]) throw new Error(`缺少发布字段 ${key}：${sourcePath}`)
    }
    notes.push({ sourcePath, body: parsed.body, meta: parsed.attributes })
  }

  const publishedNotes = new Map()
  for (const note of notes) {
    const relative = path.relative(notesRoot, note.sourcePath)
    publishedNotes.set(noteKey(relative), note.meta)
    publishedNotes.set(noteKey(path.basename(note.sourcePath)), note.meta)
    publishedNotes.set(noteKey(note.meta.title), note.meta)
  }

  let changed = 0
  for (const note of notes) {
    const languageSuffix = String(note.meta.lang || 'zh-CN').toLowerCase().startsWith('zh') ? 'zh' : 'en'
    const destination = path.join(postsRoot, note.meta.slug, `index.${languageSuffix}.md`)
    const output = renderPost(note, publishedNotes)
    let current = null
    try { current = await fs.readFile(destination, 'utf8') } catch (error) {
      if (error.code !== 'ENOENT') throw error
    }
    if (current === output) continue
    changed += 1
    if (!checkOnly) {
      await fs.mkdir(path.dirname(destination), { recursive: true })
      await fs.writeFile(destination, output, 'utf8')
      process.stdout.write(`已同步：${path.relative(blogRoot, destination)}\n`)
    } else {
      process.stdout.write(`需要同步：${path.relative(blogRoot, destination)}\n`)
    }
  }

  if (checkOnly && changed > 0) process.exitCode = 1
  if (changed === 0) process.stdout.write(`已是最新状态，共检查 ${notes.length} 篇公开笔记。\n`)
}

main().catch(error => {
  process.stderr.write(`${error.message}\n`)
  process.exitCode = 1
})
