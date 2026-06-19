// /components/nostr-comments/nostr-comments.js
//
// 最小示例：演示如何在 Web Component 中使用 comments-api.js
// 不含样式，仅展示核心调用流程。
//
// 用法：
//   <script type="module" src="/components/nostr-comments/nostr-comments.js"></script>
//   <nostr-comments article-id="charon-blog-0002"></nostr-comments>
//
// 切换文章：
//   document.querySelector('nostr-comments').setAttribute('article-id', 'xxx')

import * as api from "/components/nostr-comments/comments-api.js";

// 写死的管理员公钥、relays（按需替换）
const ADMINS = ["<管理员hex公钥>"];
const RELAYS = ["wss://nos.lol"];

// ctx 的初始化是异步的，且只需要做一次，
// 用一个模块级 Promise 在所有组件实例间共享。
let ctxPromise = null;
function getCtx() {
  if (!ctxPromise) {
    ctxPromise = api.init({ relays: RELAYS, admins: ADMINS });
  }
  return ctxPromise;
}

class NostrComments extends HTMLElement {
  static get observedAttributes() {
    return ["article-id"];
  }

  connectedCallback() {
    this._render(); // 先渲染骨架（输入框 + 列表容器）
    this._load();
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (name === "article-id" && oldVal !== newVal && this.isConnected) {
      this._load();
    }
  }

  get topic() {
    return this.getAttribute("article-id");
  }

  _render() {
    this.innerHTML = `
      <div data-list>加载中...</div>
      <textarea data-input placeholder="说点什么..."></textarea>
      <button data-submit>发表</button>
    `;
    this.querySelector("[data-submit]").addEventListener("click", () => this._submit());
  }

  async _load() {
    const ctx = await getCtx();
    const listEl = this.querySelector("[data-list]");
    listEl.textContent = "加载中...";


    const comments = await api.fetchComments(ctx, this.topic);

    listEl.innerHTML = "";
    for (const c of comments) {
      const nickname = c.profile?.nickname || c.pubkey.slice(0, 8);
      const div = document.createElement("div");
      div.textContent = `${nickname}: ${c.content}`;

      // 自己的评论，或自己是管理员 → 显示删除按钮
      if (c.mine || ctx.admins.has(ctx.pk)) {
        const delBtn = document.createElement("button");
        delBtn.textContent = "删除";
        delBtn.onclick = async () => {
          if (c.mine) {
            await api.deleteComment(ctx, c.id, this.topic);
          } else {
            await api.adminDeleteComment(ctx, c.id, this.topic);
          }
          this._load();
        };
        div.appendChild(delBtn);
      }

      listEl.appendChild(div);
    }
  }

  async _submit() {
    const ctx = await getCtx();
    const input = this.querySelector("[data-input]");
    const text = input.value.trim();
    if (!text) return;

    await api.postComment(ctx, this.topic, text);
    input.value = "";
    this._load();
  }
}

customElements.define("nostr-comments", NostrComments);
