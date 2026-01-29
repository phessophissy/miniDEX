// DOM manipulation utilities

export class DomUtils {
  static createElement(tag, options = {}) {
    const { id, className, innerHTML, style } = options;
    const el = document.createElement(tag);
    if (id) el.id = id;
    if (className) el.className = className;
    if (innerHTML) el.innerHTML = innerHTML;
    if (style) Object.assign(el.style, style);
    return el;
  }

  static setAttributes(el, attrs) {
    for (const [key, value] of Object.entries(attrs)) {
      el.setAttribute(key, value);
    }
    return el;
  }

  static addClass(el, className) {
    el.classList.add(className);
    return el;
  }

  static removeClass(el, className) {
    el.classList.remove(className);
    return el;
  }

  static toggleClass(el, className) {
    el.classList.toggle(className);
    return el;
  }

  static hasClass(el, className) {
    return el.classList.contains(className);
  }

  static setStyle(el, styles) {
    Object.assign(el.style, styles);
    return el;
  }

  static querySelector(selector) {
    return document.querySelector(selector);
  }

  static querySelectorAll(selector) {
    return document.querySelectorAll(selector);
  }

  static show(el) {
    el.style.display = '';
    return el;
  }

  static hide(el) {
    el.style.display = 'none';
    return el;
  }

  static remove(el) {
    el.remove();
  }

  static clear(el) {
    el.innerHTML = '';
    return el;
  }

  static append(parent, child) {
    parent.appendChild(child);
    return parent;
  }

  static prepend(parent, child) {
    parent.insertBefore(child, parent.firstChild);
    return parent;
  }

  static on(el, event, callback) {
    el.addEventListener(event, callback);
    return el;
  }

  static off(el, event, callback) {
    el.removeEventListener(event, callback);
    return el;
  }

  static trigger(el, event) {
    el.dispatchEvent(new Event(event));
    return el;
  }

  static getText(el) {
    return el.textContent;
  }

  static setText(el, text) {
    el.textContent = text;
    return el;
  }

  static getHTML(el) {
    return el.innerHTML;
  }

  static setHTML(el, html) {
    el.innerHTML = html;
    return el;
  }

  static getValue(el) {
    return el.value;
  }

  static setValue(el, value) {
    el.value = value;
    return el;
  }
}

export const dom = DomUtils;
