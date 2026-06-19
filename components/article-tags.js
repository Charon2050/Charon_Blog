import "/components/article-tag.js";

class ArticleTags extends HTMLElement {
  static get observedAttributes() {
    return ["tags"];
  }

  connectedCallback() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
      this.shadowRoot.innerHTML = `
        <style>
          h2 {
            font-weight: normal;
            font-size: 1.2rem;
            margin: 0 0 0.5rem 0;
          }
          .tags {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
          }
        </style>
        <h2>本文标签 Tags</h2>
        <div class="tags"></div>
      `;
    }

    this.render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "tags" && oldValue !== newValue) {
      this.render();
    }
  }

  render() {
    if (!this.shadowRoot) return;

    const tags = (this.getAttribute("tags") || "")
      .split(",")
      .map(tag => tag.trim())
      .filter(Boolean);

    this.shadowRoot.querySelector(".tags").innerHTML =
      tags.map(tag => `<article-tag>${tag}</article-tag>`).join("");
  }
}

customElements.define("article-tags", ArticleTags);
