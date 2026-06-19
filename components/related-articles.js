class RelatedArticles extends HTMLElement {
  static get observedAttributes() {
    return ["articles"];
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
          related-articles {
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
          }
          .article {
            font-size: 0.9rem;
            color: inherit;
            text-decoration: none;
            display: block;
            margin: 0.5rem 0;
          }
          .article:hover {
            text-decoration: underline;
          }
        </style>
        <h2>相关推荐</h2>
        <div class="related-articles"></div>
      `;
    }

    this.render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "articles" && oldValue !== newValue) {
      this.render();
    }
  }

  render() {
    if (!this.shadowRoot) return;

    const articles = JSON.parse(this.getAttribute("articles") || "[]");

    // url = article.url || `/articles/${article.title}`
    const url = article => article.url || `/articles/${article.title}`;

    this.shadowRoot.querySelector(".related-articles").innerHTML =
      articles.map(article => `<a class="article" href="${url(article)}">${article.title}</a>`).join("");
  }
}

customElements.define("related-articles", RelatedArticles);
