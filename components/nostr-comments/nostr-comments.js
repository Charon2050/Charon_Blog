import "/components/svg-icon.js"
import * as api from "/components/nostr-comments/comments-api.js";

const ADMINS = ["17e9537a30382e7f4827714669dee433209c1e4ce87327c3d3e17fb6bdf35570"];
const RELAYS = ["wss://relay.damus.io", "wss://nos.lol", "wss://relay.nostr.band"];
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
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
      this.shadowRoot.innerHTML = `
        <link rel="stylesheet" href="/style.css" />
        <style>
          :host {
            display: block;
            margin: 5rem 0;
          }
          p {
            margin: 0;
            transform: translateY(-0.13rem);
          }
          .comment-bar #content {
            width: 100%;
          }
          .comment-bar {
            display: flex;
            gap: 1rem;
            align-items: flex-start;
            margin: 3rem 0;
          }
          .field {
            width: 100%;
            display: flex;
            gap: 1rem;
            justify-content: space-between;
            align-items: center;
            min-width: 24rem;
          }
          .advancedOptionsContent {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            align-items: center;
          }
          .advancedOptionsContent #close {
            font-size: 1.2rem;
            color: #888;
            position: absolute;
            top: 1rem;
            right: 1rem;
            cursor: pointer;
          }
          .advancedOptionsContent .avatar {
            font-size: 8rem;
            color: #888;
            cursor: not-allowed; /* 懒得做头像功能 */
          }
          .help {
            color: #888;
            cursor: help;
            font-size: 1.2rem;
          }
          .advancedOptionsContent #save, .advancedOptionsContent #cancle {
            width: 100%
          }
          #comments-list {
            list-style: none;
            margin: 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }
          #comments-list .comment {
            padding: 1rem;
            border-radius: 1rem;
          }
          #comments-list .comment:hover {
            background-color: #8888881A;
          }
          #comments-list .comment .userinfo {
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }
          #comments-list .comment .userinfo .avatar {
            width: 2rem;
            height: 2rem;
            border-radius: 50%;
            color: #888;
            font-size: 2rem;
          }
          #comments-list .comment .userinfo .nickname {
            flex: 1;
            font-weight: bold;
          }
          #comments-list .comment .userinfo .time {
            font-size: 0.8rem;
            color: #888;
          }
          #comments-list .comment .userinfo .delete {
            color: #C33;
            cursor: pointer;
            font-size: 1.2rem;
            transform: translateY(0.1rem);
          }
          #comments-list .comment .content {
            margin: 0 2.5rem;
            font-size: 0.9rem;
          }
        </style>
        <div class="comment-bar">
          <input type="text" id="content" placeholder="说点什么吧"></input>
          <button class="primary" id="submit">评论</button>
          <button id="advanced">···</button>
        </div>
        <dialog id="advancedOptions">
          <form class="advancedOptionsContent">
            <svg-icon id="close" src="/assets/icons/close_24dp_FFFFFF_FILL0_wght400_GRAD0_opsz24.svg"></svg-icon>
            <svg-icon class="avatar" src="/assets/icons/account_circle_24dp_FFFFFF_FILL1_wght400_GRAD0_opsz24.svg"></svg-icon>
            <div class="field">
              <label for="nickname">昵称</label>
              <input id="nickname" name="nickname" placeholder="匿名"></input>
            </div>
            <div class="field">
              <label for="secretKey">私钥</label>
              <svg-icon class="help" src="/assets/icons/help_24dp_FFFFFF_FILL0_wght400_GRAD0_opsz24.svg" title="您的账户凭据。如果希望在多台设备使用同一身份，请复制相同的私钥。"></svg-icon>
              <input id="secretKey" name="secretKey" placeholder="c492...2ef3"></input>
            </div>
            <div class="field">
              <label for="contact">联系方式</label>
              <input id="contact" name="contact" placeholder="非必填"></input>
            </div>
            <div></div>
            <button class="primary" id="save" type="submit">保存</button>
            <button id="cancle" type="button">取消</button>
          </form>
        </dialog>
        <ul id="comments-list">
        </ul>
      `;
    }
    // 打开高级选项
    this.shadowRoot.getElementById("advanced").addEventListener("click", () => {
      // 此处待补充初始化操作
      const secretKeyEl = this.shadowRoot.getElementById("secretKey");
      secretKeyEl.value = localStorage.getItem("__nostr_comments_sk__");
      this.shadowRoot.getElementById("advancedOptions").showModal();
    });
    // 关闭高级选项（点击X）
    this.shadowRoot.getElementById("close").addEventListener("click", () => {
      this.shadowRoot.getElementById("advancedOptions").close();
    });
    // 保存高级选项
    this.shadowRoot.getElementById("save").addEventListener("click", () => {
      const nickname = this.shadowRoot.getElementById("nickname").innerText;
      const secretKey = this.shadowRoot.getElementById("secretKey").innerText;
      const contact = this.shadowRoot.getElementById("contact").innerText;
      // 校验 secretKey 应为 lenth = 64 由 0123456789abcdef 组成，且不能为 64 个 0
      if (secretKey.length !== 64 || !/^[0-9a-f]+$/.test(secretKey) || secretKey === "0".repeat(64)) {
        alert("secretKey 格式不正确");
        return;
      }
      // 待补充保存逻辑
    });
    // 关闭高级选项
    this.shadowRoot.getElementById("cancle").addEventListener("click", () => {
      this.shadowRoot.getElementById("advancedOptions").close();
    });
    this.render();
    this._load();
  }
  attributeChangedCallback(name, oldVal, newVal) {
    if (name === "article-id" && oldVal !== newVal) {
      this._load();
    }
  }

  get topic() {
    return this.getAttribute("article-id");
  }

  // 初始化：获取并插入评论
  async _load() {
    // 如果还没加载好则不执行
    if (!this.topic) {
      return;
    }
    // 初始化客户端
    const ctx = await getCtx();
    const listEl = this.shadowRoot.getElementById("comments-list");
    listEl.textContent = "加载中...";

    // 获取评论
    const comments = await api.fetchComments(ctx, this.topic);
    // 如果没获取到，则判断是网络问题还是确实没评论
    if (comments.length === 0) {
      const canConnectAnyRelay = await api.canConnectAnyRelay(ctx);
      if (!canConnectAnyRelay) {
        listEl.textContent = "连接失败";
        return;
      } else {
        listEl.textContent = "还没有评论哦";
        return;
      }
    }

    // 插入评论
    listEl.innerHTML = "";
    for (const c of comments) {
      // 构造评论El
      const comment = document.createElement("li");
      comment.className = "comment";
      const userinfo = document.createElement("div");
      userinfo.className = "userinfo";
      const content = document.createElement("div");
      content.className = "content";
      const avatar = document.createElement("svg-icon");
      avatar.className = "avatar";
      avatar.setAttribute("src", "/assets/icons/account_circle_24dp_FFFFFF_FILL1_wght400_GRAD0_opsz24.svg");
      const nickname = document.createElement("span");
      nickname.className = "nickname";
      nickname.textContent = c.profile?.nickname || c.pubkey.slice(0, 8);
      const time = document.createElement("span");
      time.className = "time";
      time.textContent = new Date(c.created_at * 1000).toLocaleString().replace(/\//g, "-");
      userinfo.appendChild(avatar);
      userinfo.appendChild(nickname);
      userinfo.appendChild(time);
      comment.appendChild(userinfo);
      const p = document.createElement("p");
      p.textContent = `${c.content}`;
      content.appendChild(p);
      comment.appendChild(content);
      // 自己的评论，或自己是管理员 → 显示删除按钮
      if (c.mine || ctx.admins.has(ctx.pk)) {
        const deleteIcon = document.createElement("svg-icon");
        deleteIcon.className = "delete";
        deleteIcon.setAttribute("src", "/assets/icons/delete_24dp_FFFFFF_FILL0_wght200_GRAD0_opsz24.svg");
        deleteIcon.onclick = async () => {
          // 先二次确认
          if (!confirm("确定要删除这条评论吗？")) return;
          if (c.mine) {
            await api.deleteComment(ctx, c.id, this.topic);
          } else {
            await api.adminDeleteComment(ctx, c.id, this.topic);
          }
          this._load();
        };
        userinfo.appendChild(deleteIcon);
      }
      listEl.appendChild(comment);
    }
    // 添加提交按钮事件
    const submitButton = this.shadowRoot.getElementById("submit");
    submitButton.onclick = () => this._submit();
  }
  async _submit() {
    const ctx = await getCtx();
    const input = this.shadowRoot.getElementById("content");
    const text = input.value.trim();
    if (!text) return;

    await api.postComment(ctx, this.topic, text);
    input.value = "";
    this._load();
  }

  render() {
    if (!this.shadowRoot) return;
  }
}

customElements.define("nostr-comments", NostrComments);
