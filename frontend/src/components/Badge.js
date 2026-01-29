// Badge component

export class Badge {
  constructor(options = {}) {
    const { text = '', variant = 'primary', className = '' } = options;
    this.element = document.createElement('span');
    this.element.className = `badge badge-${variant} ${className}`;
    this.element.textContent = text;
  }

  getElement() {
    return this.element;
  }
}
