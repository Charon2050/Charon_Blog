/**
 * comments-api.js
 *
 * 纯前端 Nostr 评论 API，基于 nostr-tools (esm.sh CDN)，无需打包工具。
 *
 * Kind 约定：
 *   30100  评论 (parameterized replaceable，d tag = topic，content = 纯文本)
 *   30101  用户 Profile (d tag = pubkey，content = JSON { nickname, avatar, contact })
 *   5      NIP-09 删除请求
 *
 * 用法示例：
 *   import * as api from './comments-api.js'
 *
 *   const ctx = api.init({
 *     relays: ['wss://nos.lol'],
 *     admins: ['<admin-hex-pubkey>'],
 *   })
 *
 *   const comments = await api.fetchComments(ctx, 'charon-blog-0002')
 *   await api.postComment(ctx, 'charon-blog-0002', '这是一条评论')
 *   await api.updateProfile(ctx, { nickname: 'Alice', avatar: 'https://...', contact: '@alice' })
 *   await api.deleteComment(ctx, eventId, 'charon-blog-0002')
 *   await api.adminDeleteComment(ctx, eventId, 'charon-blog-0002')
 *   const skHex = api.exportSecretKey(ctx)
 *   const ctx2  = api.importSecretKey(ctx, skHex)
 *   const ctx3  = api.rotateSecretKey(ctx)
 *   api.close(ctx)
 */

import {
  generateSecretKey,
  getPublicKey,
  finalizeEvent,
  verifyEvent,
} from "https://esm.sh/nostr-tools@2.23.3/pure";
import { SimplePool } from "https://esm.sh/nostr-tools@2.23.3/pool";
import { bytesToHex, hexToBytes } from "https://esm.sh/@noble/hashes@1.4.0/utils";

// ─── Kind 常量 ────────────────────────────────────────────────────────────────

const KIND_COMMENT = 30100;
const KIND_PROFILE = 30101;
const KIND_DELETE  = 5;

// ─── 内部工具 ─────────────────────────────────────────────────────────────────

const SK_KEY = "__nostr_comments_sk__";

function _loadOrCreateSK() {
  const hex = localStorage.getItem(SK_KEY);
  if (hex) { try { return hexToBytes(hex); } catch {} }
  const sk = generateSecretKey();
  localStorage.setItem(SK_KEY, bytesToHex(sk));
  return sk;
}

function _saveSK(sk) {
  localStorage.setItem(SK_KEY, bytesToHex(sk));
}

async function _publish(pool, relays, event) {
  if (!verifyEvent(event)) throw new Error("事件签名验证失败");
  await Promise.any(pool.publish(relays, event));
  return event;
}

// ─── 初始化 ───────────────────────────────────────────────────────────────────

/**
 * 初始化上下文。所有 API 函数均以此 ctx 作为第一参数。
 *
 * @param {object}   opts
 * @param {string[]} [opts.relays]  relay 地址列表（留空使用内置默认）
 * @param {string[]} [opts.admins]  管理员公钥 hex 列表（写死在调用方）
 * @returns {object} ctx
 */
export function init(opts = {}) {
  const relays = opts.relays?.length
    ? opts.relays
    : ["wss://relay.damus.io", "wss://nos.lol", "wss://relay.nostr.band"];

  const admins = new Set(opts.admins ?? []);
  const pool   = new SimplePool();
  const sk     = _loadOrCreateSK();
  const pk     = getPublicKey(sk);

  return { relays, admins, pool, sk, pk };
}

// ─── 密钥管理 ─────────────────────────────────────────────────────────────────

/**
 * 导出当前私钥（hex），供用户备份或迁移。
 * @param {object} ctx
 * @returns {string}
 */
export function exportSecretKey(ctx) {
  return bytesToHex(ctx.sk);
}

/**
 * 导入已有私钥（hex），覆盖 localStorage 并返回新 ctx。
 * 调用方需用返回的新 ctx 替换旧 ctx。
 * @param {object} ctx
 * @param {string} skHex
 * @returns {object} 新 ctx
 */
export function importSecretKey(ctx, skHex) {
  const sk = hexToBytes(skHex);
  const pk = getPublicKey(sk);
  _saveSK(sk);
  return { ...ctx, sk, pk };
}

/**
 * 生成全新私钥并返回新 ctx。
 * ⚠️ 旧身份（及其评论的删除权）将丢失，请谨慎调用。
 * @param {object} ctx
 * @returns {object} 新 ctx
 */
export function rotateSecretKey(ctx) {
  const sk = generateSecretKey();
  const pk = getPublicKey(sk);
  _saveSK(sk);
  return { ...ctx, sk, pk };
}

// ─── 用户 Profile ─────────────────────────────────────────────────────────────

/**
 * 发布 / 更新当前用户的个人信息。
 *
 * 使用 kind 30101 + d=pubkey（parameterized replaceable），
 * 遵守协议的 relay 会自动保留最新一条，旧版本被覆盖。
 * 每次调用需携带完整字段（即使部分字段未修改）。
 *
 * @param {object} ctx
 * @param {{ nickname?: string, avatar?: string, contact?: string }} profile
 * @returns {Promise<object>} 已发布的事件
 */
export async function updateProfile(ctx, { nickname = "", avatar = "", contact = "" } = {}) {
  const event = finalizeEvent({
    kind: KIND_PROFILE,
    created_at: Math.floor(Date.now() / 1000),
    tags: [["d", ctx.pk]],
    content: JSON.stringify({ nickname, avatar, contact }),
  }, ctx.sk);

  return _publish(ctx.pool, ctx.relays, event);
}

/**
 * 获取指定公钥的最新 Profile。
 * @param {object} ctx
 * @param {string} pubkey
 * @returns {Promise<{ nickname: string, avatar: string, contact: string } | null>}
 */
export async function fetchProfile(ctx, pubkey) {
  const events = await ctx.pool.querySync(ctx.relays, {
    kinds: [KIND_PROFILE],
    "#d": [pubkey],
    authors: [pubkey],
    limit: 1,
  });

  if (!events.length) return null;

  events.sort((a, b) => b.created_at - a.created_at);
  try {
    const { nickname = "", avatar = "", contact = "" } = JSON.parse(events[0].content);
    return { nickname, avatar, contact };
  } catch {
    return null;
  }
}

/**
 * 获取当前用户的最新 Profile（fetchProfile 的快捷方式）。
 * @param {object} ctx
 * @returns {Promise<{ nickname: string, avatar: string, contact: string } | null>}
 */
export function fetchMyProfile(ctx) {
  return fetchProfile(ctx, ctx.pk);
}

// ─── 评论 ─────────────────────────────────────────────────────────────────────

/**
 * 发表评论。content 为纯文本，用户信息通过 Profile（kind 30101）独立管理。
 *
 * @param {object} ctx
 * @param {string} topic   - 文章 / 频道 ID，如 'charon-blog-0002'
 * @param {string} content - 评论纯文本
 * @returns {Promise<object>} 已发布的事件
 */
export async function postComment(ctx, topic, content) {
  if (typeof content !== "string" || !content.trim()) {
    throw new Error("评论内容不能为空");
  }

  const event = finalizeEvent({
    kind: KIND_COMMENT,
    created_at: Math.floor(Date.now() / 1000),
    tags: [["d", topic]],
    content: content.trim(),
  }, ctx.sk);

  return _publish(ctx.pool, ctx.relays, event);
}

/**
 * 读取某 topic 下的评论列表，自动关联最新 Profile，过滤已删除评论。
 *
 * 删除有效性规则（客户端侧执行，不依赖 relay 是否遵守 NIP-09）：
 *   ✓ 评论作者本人发出的 kind 5 → 有效删除
 *   ✓ ctx.admins 中的公钥发出的 kind 5 → 有效删除（无论目标评论归属于谁）
 *   ✗ 其他人发出的 kind 5 → 忽略
 *
 * @param {object} ctx
 * @param {string} topic
 * @returns {Promise<Array<{
 *   id:         string,
 *   pubkey:     string,
 *   created_at: number,
 *   content:    string,
 *   mine:       boolean,
 *   isAdmin:    boolean,
 *   profile:    { nickname: string, avatar: string, contact: string } | null,
 *   raw:        object,
 * }>>}
 */
export async function fetchComments(ctx, topic) {
  // 1. 并行拉取评论 + 删除事件
  const [commentEvents, deletionEvents] = await Promise.all([
    ctx.pool.querySync(ctx.relays, {
      kinds: [KIND_COMMENT],
      "#d": [topic],
    }),
    ctx.pool.querySync(ctx.relays, {
      kinds: [KIND_DELETE],
      "#d": [topic],
    }),
  ]);

  // 2. 构建"有效删除"集合
  const commentById = new Map(commentEvents.map(ev => [ev.id, ev]));
  const deletedIds  = new Set();

  for (const del of deletionEvents) {
    const deleterIsAdmin = ctx.admins.has(del.pubkey);
    for (const tag of del.tags) {
      if (tag[0] !== "e") continue;
      const target   = commentById.get(tag[1]);
      const isAuthor = target && target.pubkey === del.pubkey;
      if (deleterIsAdmin || isAuthor) {
        deletedIds.add(tag[1]);
      }
    }
  }

  // 3. 存活评论 → 收集唯一 pubkeys
  const aliveEvents = commentEvents.filter(ev => !deletedIds.has(ev.id));
  const pubkeys     = [...new Set(aliveEvents.map(ev => ev.pubkey))];

  // 4. 批量拉取 Profile（每个 pubkey 只保留最新一条）
  const profileMap = new Map();
  if (pubkeys.length) {
    const profileEvents = await ctx.pool.querySync(ctx.relays, {
      kinds: [KIND_PROFILE],
      "#d": pubkeys,
      authors: pubkeys,
    });

    for (const ev of profileEvents) {
      const existing = profileMap.get(ev.pubkey);
      if (!existing || ev.created_at > existing._ts) {
        try {
          const { nickname = "", avatar = "", contact = "" } = JSON.parse(ev.content);
          profileMap.set(ev.pubkey, { nickname, avatar, contact, _ts: ev.created_at });
        } catch {}
      }
    }
  }

  // 5. 组装最终结果
  return aliveEvents
    .sort((a, b) => a.created_at - b.created_at)
    .map(ev => {
      const p = profileMap.get(ev.pubkey);
      return {
        id:         ev.id,
        pubkey:     ev.pubkey,
        created_at: ev.created_at,
        content:    ev.content,
        mine:       ev.pubkey === ctx.pk,
        isAdmin:    ctx.admins.has(ev.pubkey),
        profile:    p ? { nickname: p.nickname, avatar: p.avatar, contact: p.contact } : null,
        raw:        ev,
      };
    });
}

// ─── 删除 ─────────────────────────────────────────────────────────────────────

/**
 * 普通用户删除自己的评论（NIP-09）。
 * fetchComments 会校验"发起人 == 评论作者"，其他人的删除请求会被客户端忽略。
 *
 * @param {object} ctx
 * @param {string} eventId - 要删除的评论 event id
 * @param {string} topic   - 评论所属 topic（用于 d tag 以便 relay/客户端过滤）
 * @returns {Promise<object>} 删除事件
 */
export async function deleteComment(ctx, eventId, topic) {
  const event = finalizeEvent({
    kind: KIND_DELETE,
    created_at: Math.floor(Date.now() / 1000),
    tags: [
      ["e", eventId],
      ["d", topic],
    ],
    content: "deleted",
  }, ctx.sk);

  return _publish(ctx.pool, ctx.relays, event);
}

/**
 * 管理员删除任意评论。
 * 若当前用户公钥不在 ctx.admins 中，直接抛出错误，不发送任何事件。
 * fetchComments 识别管理员 pubkey，将其发出的 kind 5 视为对任意评论的有效删除。
 *
 * @param {object} ctx
 * @param {string} eventId
 * @param {string} topic
 * @returns {Promise<object>} 删除事件
 */
export async function adminDeleteComment(ctx, eventId, topic) {
  if (!ctx.admins.has(ctx.pk)) {
    throw new Error(`当前用户 (${ctx.pk}) 不在管理员列表中，无权执行管理员删除`);
  }
  return deleteComment(ctx, eventId, topic);
}

// ─── 关闭连接 ─────────────────────────────────────────────────────────────────

/**
 * 关闭所有 relay 连接，释放资源。
 * @param {object} ctx
 */
export function close(ctx) {
  ctx.pool.close(ctx.relays);
}
