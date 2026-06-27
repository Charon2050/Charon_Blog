class ArticleTag extends HTMLElement {
  static get observedAttributes() {
    return ['color'];
  }

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });

    this.wrapper = document.createElement('span');
    this.wrapper.className = 'tag';
    this.wrapper.textContent = this.textContent;

    const style = document.createElement('style');
    style.textContent = `
      :host {
        font-size: 0.75rem;
        line-height: 0.75rem;
      }
      .tag {
        border-radius: 999rem;
        padding: 0.25rem 0.5rem;
        font-family: inherit;
        display: inline-block;
        white-space: nowrap;
      }
    `;

    shadow.appendChild(style);
    shadow.appendChild(this.wrapper);

    // 初始化颜色
    const color = this.getAttribute('color') || '#CC0000';
    this.updateColor(color);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'color') {
      this.updateColor(newValue);
    }
  }

  updateColor(color) {
    this.wrapper.style.color = color;
    // 将颜色转换为背景色带透明度20
    const hex = color.replace(/^#/, '');
    let r, g, b;
    if (hex.length === 3) {
      r = hex[0] + hex[0];
      g = hex[1] + hex[1];
      b = hex[2] + hex[2];
    } else if (hex.length === 6) {
      r = hex.slice(0, 2);
      g = hex.slice(2, 4);
      b = hex.slice(4, 6);
    } else {
      r = g = b = 'BB';
    }
    this.wrapper.style.backgroundColor = `#${r}${g}${b}20`;
  }

  set text(value) {
    this.wrapper.textContent = value;
  }

  get text() {
    return this.wrapper.textContent;
  }
}

customElements.define('article-tag', ArticleTag);
