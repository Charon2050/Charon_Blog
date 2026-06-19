class SvgIcon extends HTMLElement {
  async connectedCallback() {
    const shadow = this.attachShadow({ mode: "open" });

    const src = this.getAttribute("src");
    const text = await fetch(src).then(r => r.text());

    shadow.innerHTML = `
      <style>
        :host {
          display: inline-block;
          line-height: 1;
        }

        svg {
          width: 1em;
          height: 1em;
        }

        svg * {
          fill: currentColor !important;
          stroke: currentColor !important;
        }

        svg [fill="none"] {
          fill: none !important;
        }

        svg [stroke="none"] {
          stroke: none !important;
        }
      </style>
      ${text}
    `;
  }
}

customElements.define("svg-icon", SvgIcon);
