class SiteFooter extends HTMLElement {
  connectedCallback() {
    const shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = `
      <style>
        :host {
          margin-top: auto;
        }
        .site-footer {
          margin-top: 8rem;
          text-align: center;
          color: #888;
          font-size: 0.9rem;
        }
        a {
          color: inherit;
          text-decoration: none;
        }
        p {
          margin: 0;
        }
        .links {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 3rem;
          margin: 1rem
        }
        .copyright {
          margin: 0 0 1rem 0;
          font-size: 0.7rem;
          line-height: 0.7rem;
          color: #999;
        }
        @media (max-width: 800px) {
          .links {
            gap: 1.5rem;
          }
        }
      </style>
      <div class="site-footer">
        <div class="links">
          <p>友情链接</p>
          <a href="https://fzf404.art" target="_blank" rel="noopener noreferrer">FZF404.Art</a>
          <a href="https://huohuo90.com" target="_blank" rel="noopener noreferrer">逸刻时光</a>
          <a href="https://blog.closex.org" target="_blank" rel="noopener noreferrer">CloseX</a>
        </div>

        <div class="copyright">
          <p>
            本站所有由卡戎Charon原创的内容均进入公有领域，您可以无限制的使用这些内容，包括但不限于分享、商用、修改、训练AI。无需署名，无需征求本人同意。
          </p>
          <p>
            本站可能包含转载的内容，这些内容的版权归原作者所有，如有侵权请联系我删除。
          </p>
        </div>
      </div>
    `;
  }
}

customElements.define("site-footer", SiteFooter);
