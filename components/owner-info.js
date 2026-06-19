import "/components/svg-icon.js";
class OwnerInfo extends HTMLElement {
  connectedCallback() {
    const shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = `
      <style>
        .owner-info {
          display: flex;
          align-items: center;
          gap: 1rem;
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
          font-size: 2rem;
          color: #666;
        }
      </style>
      <div class="owner-info">
          <img
              class="avatar"
              src="/assets/avatar/charon_anime.webp"
              alt="卡戎的头像"
          />
          <div class="text">
              <div class="name">卡戎Charon</div>
              <div class="description">
                  IT从业者，业余设计师，自由意志主义者。
              </div>
          </div>
      </div>
      <div class="contacts">
          <svg-icon src="/assets/icons/mail.svg"></svg-icon>
          <svg-icon src="/assets/icons/qq.svg"></svg-icon>
          <svg-icon src="/assets/icons/github.svg"></svg-icon>
          <svg-icon src="/assets/icons/zhihu.svg"></svg-icon>
      </div>
    `;
  }
}

customElements.define("owner-info", OwnerInfo);
