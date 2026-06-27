class HoverTooltip extends HTMLElement {
  constructor() {
    super();
    this._show = this._show.bind(this);
    this._hide = this._hide.bind(this);
    this._toggle = this._toggle.bind(this);

    this.attachShadow({ mode: "open" });

    this.shadowRoot.innerHTML = `
      <style>
        :host {
            display: inline-block;
            position: relative;
            text-decoration-line: underline;
            text-decoration-style: dotted;
            text-underline-offset: 0.2em;
            text-decoration-color: rgb(0 0 0 / 50%);
            cursor: help;
        }

        .tip {
            position: absolute;
            left: 50%;
            bottom: 110%;
            transform: translateX(-50%);
            white-space: nowrap;

            padding: 0.25rem 0.75rem;
            background-color: #DDDDDD;
            font-size: 0.75rem;
            border-radius: 0.5rem;
            box-shadow: 0 0 0.8rem #88888866;

            display: none;
            z-index: 9999;
            pointer-events: none;
        }

        :host([open]) .tip {
          display: block;
        }
      </style>

      <slot></slot><div class="tip"></div>
    `;

    this._tipEl = this.shadowRoot.querySelector(".tip");
  }

  connectedCallback() {
    this._tipEl.textContent = this.getAttribute("tip") || "";

    // PC hover
    this.addEventListener("mouseenter", this._show);
    this.addEventListener("mouseleave", this._hide);

    // mobile / click toggle
    this.addEventListener("click", this._toggle);

    // click outside to close
    document.addEventListener("click", this._docClick = (e) => {
      if (!this.contains(e.target)) this._hide();
    });
  }

  disconnectedCallback() {
    this.removeEventListener("mouseenter", this._show);
    this.removeEventListener("mouseleave", this._hide);
    this.removeEventListener("click", this._toggle);
    document.removeEventListener("click", this._docClick);
  }

  _show() {
    this.setAttribute("open", "");
  }

  _hide() {
    this.removeAttribute("open");
  }

  _toggle(e) {
    e.stopPropagation();
    if (this.hasAttribute("open")) this._hide();
    else this._show();
  }
}

customElements.define("hover-tooltip", HoverTooltip);