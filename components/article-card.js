import "/components/article-tag.js"

class ArticleCard extends HTMLElement {
  static get observedAttributes() {
    return ["cover", "title", "preview", "tags", "time", "link"];
  }

  connectedCallback() {
    if (!this.shadowRoot) {
      const shadow = this.attachShadow({ mode: "open" });

      shadow.innerHTML = `
        <style>
          :host {
              display: block;
              width: fit-content;
              max-width: 100%;
          }
          .article-card {
              display: flex;
              padding: 1rem;
              gap: 1rem;
              max-width: 42rem;
              border-radius: 1.5rem;
              transition: background-color 0.2s;
          }
          .article-card:hover {
              background-color: #88888820;
              cursor: pointer;
          }
          .article-card .cover {
              width: 10rem;
              height: 7.25rem;
              object-fit: cover;
              border-radius: 1rem;
              flex-shrink: 0;
          }
          .article-card .text-area {
              min-width: 0;
              display: flex;
              flex-direction: column;
              gap: 0.5rem;
          }
          .article-card .text-area h2,
          .article-card .text-area p {
              margin: 0;
          }
          .article-card .text-area h2 {
              font-size: 1.2rem;
              overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;
          }
          .article-card .text-area p {
              font-size: small;
              overflow: hidden;
              line-clamp: 2;
              display: -webkit-box;
              -webkit-box-orient: vertical;
              -webkit-line-clamp: 2;
              color: #888888;
          }
          .article-card .text-area .info {
              display: flex;
              gap: 0.5rem;
              align-items: center;
              margin-top: 0.5rem;
              font-size: 0.75rem;
              line-height: 0.75rem;
          }
          .article-card .text-area .info .time {
              margin-left: auto;
              color: #888888;
          }
        </style>
        <div class="article-card"></div>
      `;
      shadow.querySelector(".article-card").addEventListener("click", () => {
        const title = this.getAttribute("title") || "";
        const link = this.getAttribute("link") || `/articles/${encodeURIComponent(title)}`;
        window.location.href = link;
      });
    }
    this.render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.render();
    }
  }

  render() {
    if (!this.shadowRoot) return;

    const cover = this.getAttribute("cover") || "";
    const title = this.getAttribute("title") || "";
    const preview = this.getAttribute("preview") || "";
    const time = this.getAttribute("time") || "";

    const tags = (this.getAttribute("tags") || "")
      .split(",")
      .map(tag => tag.trim())
      .filter(Boolean);

    this.shadowRoot.querySelector(".article-card").innerHTML = `
      ${cover ? `<img class="cover" src="${cover}" alt="Article Cover">` : ""}
      <div class="text-area">
        <h2>${title}</h2>
        <p>${preview}</p>
        <div class="info">
          ${tags
            .map(tag => `<article-tag>${tag}</article-tag>`)
            .join("")}
          <div class="time">${time}</div>
        </div>
      </div>
    `;
  }
}

customElements.define("article-card", ArticleCard);
