// Card/Panel component

export class Card {
  constructor(options = {}) {
    const { title = '', content = '', className = '', icon = null } = options;
    this.element = document.createElement('div');
    this.element.className = `card ${className}`;

    if (title) {
      const header = document.createElement('div');
      header.className = 'card-header';
      if (icon) {
        const iconEl = document.createElement('span');
        iconEl.className = 'card-icon';
        iconEl.textContent = icon;
        header.appendChild(iconEl);
      }
      const titleEl = document.createElement('h3');
      titleEl.textContent = title;
      header.appendChild(titleEl);
      this.element.appendChild(header);
    }

    const body = document.createElement('div');
    body.className = 'card-body';
    body.innerHTML = content;
    this.element.appendChild(body);

    this.body = body;
  }

  setContent(content) {
    this.body.innerHTML = content;
    return this;
  }

  getElement() {
    return this.element;
  }
}
