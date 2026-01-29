// Input component

/**
 * Create input element
 */
export function createInput(options = {}) {
  const {
    id = null,
    type = 'text',
    placeholder = '',
    value = '',
    disabled = false,
    onChange = null,
    onBlur = null,
    onFocus = null,
    validation = null,
    pattern = null,
    step = null,
    min = null,
    max = null,
    className = '',
    label = null,
    error = null
  } = options;

  const container = document.createElement('div');
  container.className = `input-container ${className}`;

  if (label) {
    const labelEl = document.createElement('label');
    labelEl.textContent = label;
    if (id) labelEl.htmlFor = id;
    container.appendChild(labelEl);
  }

  const input = document.createElement('input');
  input.type = type;
  input.placeholder = placeholder;
  input.value = value;
  input.className = 'input-field';

  if (id) input.id = id;
  if (disabled) input.disabled = true;
  if (pattern) input.pattern = pattern;
  if (step) input.step = step;
  if (min !== null) input.min = min;
  if (max !== null) input.max = max;

  if (onChange) input.addEventListener('change', onChange);
  if (onBlur) input.addEventListener('blur', onBlur);
  if (onFocus) input.addEventListener('focus', onFocus);

  container.appendChild(input);

  if (error) {
    const errorEl = document.createElement('div');
    errorEl.className = 'input-error';
    errorEl.textContent = error;
    container.appendChild(errorEl);
    input.classList.add('error');
  }

  input.container = container;
  return input;
}

/**
 * Input component class
 */
export class Input {
  constructor(options = {}) {
    this.options = options;
    this.element = createInput(options);
    this.container = this.element.container;
    this.value = '';
  }

  getValue() {
    return this.element.value;
  }

  setValue(value) {
    this.element.value = value;
    this.value = value;
    return this;
  }

  clear() {
    this.element.value = '';
    this.value = '';
    return this;
  }

  setError(error) {
    const errorEl = this.container.querySelector('.input-error');
    if (error) {
      this.element.classList.add('error');
      if (errorEl) {
        errorEl.textContent = error;
      } else {
        const newErrorEl = document.createElement('div');
        newErrorEl.className = 'input-error';
        newErrorEl.textContent = error;
        this.container.appendChild(newErrorEl);
      }
    } else {
      this.element.classList.remove('error');
      if (errorEl) errorEl.remove();
    }
    return this;
  }

  setDisabled(disabled) {
    this.element.disabled = disabled;
    return this;
  }

  onChange(callback) {
    this.element.addEventListener('change', callback);
    return this;
  }

  onBlur(callback) {
    this.element.addEventListener('blur', callback);
    return this;
  }

  onFocus(callback) {
    this.element.addEventListener('focus', callback);
    return this;
  }

  getElement() {
    return this.container;
  }

  getInputElement() {
    return this.element;
  }

  validate() {
    const value = this.element.value;
    const validation = this.options.validation;

    if (!validation) return { valid: true };

    return validation(value);
  }
}
