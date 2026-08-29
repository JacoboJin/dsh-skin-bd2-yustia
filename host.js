/**
 * 棕色尘埃2 · 悠丝缇亚 — DSH 动态皮肤插件（Host 半体，对应 pkg-13）
 *
 * 职责：通过包私有 RPC（harness.handle）为 Client 提供背景图能力：
 *   - bg-list        列出 backgrounds 背景库
 *   - bg-read-file   读取本地图片（绝对路径 / 背景库文件名 / 相对路径）→ base64 data URI
 *   - bg-load-default 读取默认背景（bg-default.* 优先，其次 bg-01-holy-light.jpg，最后 assets/default-bg.jpg）
 *
 * 关键坑（已修复）：动态插件宿主上下文里 sandboxPolicy.workspaceRoot 指向的是 DSH 宿主进程
 * 的工作目录（本机为 C:\Windows\System32），并非会话工作区。因此这里使用固定的会话工作区
 * 路径 BASE；若迁移到其他机器/工作区，改这一处即可。
 *
 * 二进制安全：宿主内建 btoa 按 UTF-8 文本编码，直接编码二进制会损坏字节，
 * 因此使用纯 ASCII 位运算的 bytesToBase64。
 */

const MIME_BY_EXT = {
  png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg',
  webp: 'image/webp', gif: 'image/gif', avif: 'image/avif',
  bmp: 'image/bmp', svg: 'image/svg+xml',
}

function mimeOf(path) {
  const m = /\.([a-z0-9]+)$/i.exec(path)
  return m ? (MIME_BY_EXT[m[1].toLowerCase()] || 'application/octet-stream') : 'application/octet-stream'
}

function bytesToBase64(bytes) {
  const table = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
  let out = ''
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i]
    const b1 = i + 1 < bytes.length ? bytes[i + 1] : undefined
    const b2 = i + 2 < bytes.length ? bytes[i + 2] : undefined
    out += table[b0 >> 2]
    out += table[((b0 & 3) << 4) | (b1 === undefined ? 0 : b1 >> 4)]
    out += b1 === undefined ? '=' : table[((b1 & 15) << 2) | (b2 === undefined ? 0 : b2 >> 6)]
    out += b2 === undefined ? '=' : table[b2 & 63]
  }
  return out
}

const MAX_BYTES = 8 * 1024 * 1024
/* 会话工作区固定路径（sandboxPolicy.workspaceRoot 指向宿主进程目录，不可用） */
const BASE = 'D:/dsh_ai_workspace'

export function apply(ctx) {
  const fs = ctx.get('fs')
  if (fs === undefined) {
    console.log('bd2-yustia: fs service NOT available, background handlers disabled')
    return
  }

  const bgDirPath = BASE + '/bd2-yustia-skin/backgrounds'

  async function readImage(path) {
    let resolvedPath = path
    if (!/^[A-Za-z]:[\\/]/.test(path) && !path.startsWith('/')) {
      resolvedPath = BASE + '/' + path
    }
    const target = await fs.resolve(resolvedPath, {})
    const bytes = await fs.readBytes(target, undefined, MAX_BYTES)
    return { path: resolvedPath, bytes, mime: mimeOf(resolvedPath) }
  }

  async function listBgNames() {
    try {
      const target = await fs.resolve(bgDirPath, {})
      const entries = await fs.listDir(target, undefined)
      return (entries || [])
        .filter((e) => e && e.type === 'file' && typeof e.name === 'string' && /^bg-.*\.(png|jpe?g|webp|gif|avif|bmp|svg)$/i.test(e.name))
        .map((e) => e.name)
    } catch (e) {
      return []
    }
  }

  function pickDefaultName(names) {
    const designated = names.find((n) => /^bg-default\.(png|jpe?g|webp|gif|avif|bmp|svg)$/i.test(n))
    if (designated) return designated
    if (names.indexOf('bg-01-holy-light.jpg') !== -1) return 'bg-01-holy-light.jpg'
    return null
  }

  harness.handle('bg-list', async () => {
    const names = await listBgNames()
    return { ok: true, dir: bgDirPath, names }
  })

  harness.handle('bg-read-file', async (args) => {
    try {
      let path = args && typeof args.path === 'string' ? args.path.trim() : ''
      if (!path) return { ok: false, error: '路径为空' }
      const isBare = !/[\\/]/.test(path) && !/^[A-Za-z]:/.test(path)
      if (isBare) {
        const names = await listBgNames()
        let hit
        if (/\.[a-z0-9]+$/i.test(path)) hit = names.find((n) => n.toLowerCase() === path.toLowerCase())
        else hit = names.find((n) => n.toLowerCase().startsWith(path.toLowerCase()))
        if (!hit) return { ok: false, error: '背景库中找不到 "' + path + '"（命名格式 bg-xxx.jpg，放入 ' + bgDirPath + ' 后点刷新）' }
        path = 'bd2-yustia-skin/backgrounds/' + hit
      }
      const img = await readImage(path)
      return { ok: true, mime: img.mime, data: bytesToBase64(img.bytes), size: img.bytes.length, path: img.path }
    } catch (e) {
      return { ok: false, error: String(e && e.message ? e.message : e) }
    }
  })

  harness.handle('bg-load-default', async () => {
    try {
      const names = await listBgNames()
      const pick = pickDefaultName(names)
      let img
      if (pick) img = await readImage('bd2-yustia-skin/backgrounds/' + pick)
      else img = await readImage('bd2-yustia-skin/assets/default-bg.jpg')
      return { ok: true, mime: img.mime, data: bytesToBase64(img.bytes), size: img.bytes.length, path: img.path, name: pick }
    } catch (e) {
      return { ok: false, error: String(e && e.message ? e.message : e) }
    }
  })

  /* 设置记忆：settings.json（读/写） */
  const settingsPath = BASE + '/bd2-yustia-skin/settings.json'

  harness.handle('bg-load-settings', async () => {
    try {
      const target = await fs.resolve(settingsPath, {})
      const text = await fs.readText(target, undefined)
      return { ok: true, settings: JSON.parse(text) }
    } catch (e) {
      return { ok: false, error: String(e && e.message ? e.message : e) }
    }
  })

  harness.handle('bg-save-settings', async (args) => {
    try {
      const settings = args && typeof args.settings === 'object' && args.settings !== null ? args.settings : {}
      const target = await fs.resolve(settingsPath, {})
      await fs.writeText(target, JSON.stringify(settings, null, 2))
      return { ok: true }
    } catch (e) {
      return { ok: false, error: String(e && e.message ? e.message : e) }
    }
  })
}
