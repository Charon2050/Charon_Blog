import "/components/svg-icon.js";
import "/components/hover-tooltip.js"
class OwnerInfo extends HTMLElement {
  connectedCallback() {
    const shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = `
      <link rel="stylesheet" href="/style.css" />
      <style>
        .owner-info {
          display: flex;
          align-items: center;
          gap: 1rem;
          width: 16rem;
        }
        .owner-info .avatar {
          width: 5rem;
          height: 5rem;
          border-radius: 50%;
        }
        .owner-info .text .name {
          font-size: 1.5rem;
          margin-bottom: 0.3rem;
        }
        .owner-info .text .description {
          color: #666;
          font-size: 0.9rem;
        }
        .contacts {
          margin-top: 1.5rem;
          display: flex;
          gap: 2rem;
          justify-content: space-around;
        }
        .contacts svg-icon {
          font-size: 1.8rem;
          color: #666;
        }
      </style>
      <div class="owner-info">
          <img
              class="avatar"
              src="/assets/avatar/charon_anime.webp"
              alt="卡戎的头像"
              aria-hidden="true"
          />
          <div class="text">
              <div class="name">卡戎Charon</div>
              <div class="description">
                  IT从业者，业余设计师，自由意志主义者。
              </div>
          </div>
      </div>
      <div class="contacts">
          <hover-tooltip tip="点击复制：Charon2050@qq.com" id="email">
            <a href="mailto:Charon2050@qq.com" target="_blank">
                <svg-icon alt="邮箱" src="/assets/icons/mail.svg"></svg-icon>
            </a>
          </hover-tooltip>

          <hover-tooltip tip="点击复制：1476730781" id="qq">
            <a href="tencent://message/?uin=1476730781&Site=&Menu=yes" target="_blank">
                <svg-icon alt="QQ" src="/assets/icons/qq.svg"></svg-icon>
            </a>
          </hover-tooltip>


          <a href="https://github.com/Charon2050" target="_blank">
              <svg-icon alt="GitHub" src="/assets/icons/github.svg"></svg-icon>
          </a>

          <a href="https://www.zhihu.com/people/charon2050" target="_blank">
              <svg-icon alt="知乎" src="/assets/icons/zhihu.svg"></svg-icon>
          </a>
      </div>
    `;
    // 监听 email、qq 点击事件，点击时将联系方式复制到剪贴板
    const email = this.shadowRoot.getElementById("email");
    const qq = this.shadowRoot.getElementById("qq");
    email.addEventListener("click", () => {
      navigator.clipboard.writeText("Charon2050@qq.com");
    });
    qq.addEventListener("click", () => {
      navigator.clipboard.writeText("1476730781");
    });
  }
}

customElements.define("owner-info", OwnerInfo);
