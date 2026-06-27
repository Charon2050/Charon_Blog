class LinkCard extends HTMLElement {
  static get observedAttributes() {
    return ["icon", "title", "preview", "link"];
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
            margin: 0 auto;
          }
          .link-card {
            text-decoration-line: none;
            color: inherit;
            display: flex;
            padding: 1rem 2rem;
            gap: 1rem;
            max-width: 42rem;
            border-radius: 1.5rem;
            background-color: #88888811;
            transition: background-color 0.2s;
          }
          .link-card:hover {
            background-color: #88888833;
            cursor: pointer;
          }
          .link-card .icon {
            width: 4rem;
            height: 4rem;
            object-fit: cover;
            border-radius: 1rem;
            flex-shrink: 0;
          }
          .link-card .text-area {
            min-width: 0;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }
          .link-card .text-area h2,
          .link-card .text-area p {
            margin: 0;
          }
          .link-card .text-area h2 {
            font-size: 1.2rem;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
          }
          .link-card .text-area p {
            font-size: small;
            overflow: hidden;
            line-clamp: 2;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
            color: #888888;
          }
          .link-card .text-area .info {
            display: flex;
            gap: 0.5rem;
            align-items: center;
            margin-top: 0.5rem;
            font-size: 0.75rem;
            line-height: 0.75rem;
          }
          .link-card .text-area .info .time {
            margin-left: auto;
            color: #888888;
          }
        </style>
        <a class="link-card" target='_blank'></a>
      `;
      const link = this.getAttribute("link") || ``;
      if (link) {
        shadow.querySelector(".link-card").setAttribute("href", link);
      }
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

    const icon = this.getAttribute("icon") || "";
    const title = this.getAttribute("title") || "";
    const preview = this.getAttribute("preview") || "";

    this.shadowRoot.querySelector(".link-card").innerHTML = `
      ${icon ? `<img class="icon" src="${icon}" alt="Page Icon">` : ""}
      <div class="text-area">
        <h2>${title}</h2>
        <p>${preview}</p>
      </div>
    `;
  }
}

customElements.define("link-card", LinkCard);
