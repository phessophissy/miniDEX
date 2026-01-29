// Button component

/**
 * Create button element
 */
export function createButton(options = {}) {
  const {
    text = 'Button',
    id = null,
    className = '',
    onClick = null,
    disabled = false,
    variant = 'primary',
    size = 'md',
    loading = false,
    icon = null,
    tooltip = null
  } = options;

  const btn = document.createElement('button');
  btn.textContent = text;
  btn.className = `btn btn-${variant} btn-${size} ${className}`;

  if (id) btn.id = id;
  if (disabled) btn.disabled = true;
  if (onClick) btn.addEventListener('click', onClick);
  if (tooltip) btn.title = tooltip;

  if (loading) {
    btn.classList.add('loading');
    btn.disabled = true;
  }

  if (icon) {
    const iconSpan = document.createElement('span');
    iconSpan.className = 'btn-icon';
    iconSpan.textContent = icon;
    btn.prepend(iconSpan);
  }

  return btn;
}

/**
 * Button component class
 */
export class Button {
  constructor(options = {}) {
    this.options = options;
    this.element = this.render();
  }

  render() {
    return createButton(this.options);
  }

  setText(text) {
    this.element.textContent = text;
    return this;
  }

  setLoading(loading) {
    if (loading) {
      this.element.classList.add('loading');
      this.element.disabled = true;
    } else {
      this.element.classList.remove('loading');
      this.element.disabled = false;
    }
    return this;
  }

  setDisabled(disabled) {
    this.element.disabled = disabled;
    return this;
  }

  onClick(callback) {
    this.element.addEventListener('click', callback);
    return this;
  }

  getElement() {
    return this.element;
  }
}
