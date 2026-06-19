import "/components/site-header.js";
import "/components/site-footer.js";
import "/components/owner-info.js";
import "/components/article-tags.js";
import "/components/related-articles.js"
import "/components/recommend.js"
import "/components/nostr-comments/nostr-comments.js"

import "/components/article-card.js"

class ArticlePage extends HTMLElement {
  connectedCallback() {
    const shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = `
      <style>
          :host {
            display: block;
            width: fit-content;
            width: 100%;
          }
          .article-page {
            width: fit-content;
            margin: auto;
            display: flex;
            gap: 4rem;
            align-items: flex-start;
          }
          .article {
            max-width: 40rem;
          }
          .sidebar {
            margin-top: 4rem;
            position: sticky;
            top: 6rem;
            width: 16rem;
            display: flex;
            flex-direction: column;
            gap: 2rem;
          }
      </style>
      <site-header></site-header>
      <div class="article-page">
        <div class="article">
          <slot></slot>
          <nostr-comments
            article="charon-blog-comments-test-0002">
          </nostr-comments>
        </div>
        <div class="sidebar">
          <owner-info></owner-info>
          <article-tags></article-tags>
          <related-articles></related-articles>
        </div>
      </div>
      <site-footer></site-footer>
    `;

    const articlesRequest = fetch("/articles.json").then((response) => response.json())

    // 填入文章标签
    articlesRequest.then((articles) => {
      const title = decodeURIComponent(window.location.pathname.split("/").filter(Boolean).pop());
      const article = articles.find((a) => a.title === title);
      if (article) {
        const tags = article.tags || "";
        const articleTags = shadow.querySelector("article-tags");
        if (articleTags) {
          articleTags.setAttribute("tags", tags);
        }
      }
    });

    // 填入相关推荐(测试中)
    articlesRequest.then((articles) => {
      // 获取当前文章内容
      const content = shadow.querySelector("slot").assignedNodes().map(node => node.textContent).join(" ");
      // 调用 recommand 函数获取推荐文章标题
      const recommendedTitles = window.recommand(content, articles);
      // 根据推荐标题找到对应的文章对象
      const recommendedArticles = recommendedTitles.map(title => articles.find(a => a.title === title)).filter(Boolean);
      // 去除当前文章
      const title = decodeURIComponent(window.location.pathname.split("/").filter(Boolean).pop());
      const selfIndex = recommendedArticles.findIndex(a => a.title === title);
      if (selfIndex !== -1) {
        recommendedArticles.splice(selfIndex, 1);
      }
      // 将推荐文章传递给 related-articles 组件
      const relatedArticles = shadow.querySelector("related-articles");
      if (relatedArticles) {
        relatedArticles.setAttribute("articles", JSON.stringify(recommendedArticles));
      }
    });
  }
}

customElements.define("article-page", ArticlePage);
