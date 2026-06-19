import "/components/svg-icon.js";

class SiteHeader extends HTMLElement {
  connectedCallback() {
    const shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = `
      <style>
        :host {
          display: block;
          height: 3rem;
        }
        .top-bar {
          width: 100%;
          height: 3rem;
          background-color: #EEEEEE;
          position: fixed;
          top: 0;
          left: 0;
          z-index: 999;
          display: flex;
          align-items: center;
          gap: 2rem;
          padding: 1rem 3rem;
          box-sizing: border-box;
          font-family: Helvetica, Arial, sans-serif;
        }
        .top-bar #site-title {
          font-size: 1.2rem;
          cursor: pointer;
        }
        .top-bar svg-icon {
          font-size: 1.5rem;
          fill: #333;
        }
        .top-bar .site-icon {
          font-size: 2rem;
        }
        .input-box {
          background-color: #88888822;
          border-radius: 1rem;
          padding: 0.5rem;
          height: 1rem;
          display: flex;
          align-items: center;
          justify-content: flex-end;
        }
        .input-box:hover {
          background-color: #88888833;
        }
      </style>
      <div class="top-bar">
          <!--<svg-icon class="site-icon" src="/assets/icons/charon2026.svg"></svg-icon>-->
          <div id="site-title"><b>Charon</b> Blog</div>
          <div style="flex-grow: 1;"></div>
          <div>最新</div>
          <div>标签</div>
          <div>实用工具</div>
          <div>关于</div>
          <div class="input-box">
              <div style="min-width: 8rem;" contenteditable></div>
              <svg-icon src="/assets/icons/search_24dp_333_FILL0_wght400_GRAD0_opsz24.svg"></svg-icon>
          </div>
      </div>
    `;
    shadow.getElementById("site-title").addEventListener("click", () => {
      window.location.href = "/";
    });
  }
}

customElements.define("site-header", SiteHeader);
