// Tabs component

export class Tabs {
  constructor(options = {}) {
    const { tabs = [] } = options;
    this.element = document.createElement('div');
    this.element.className = 'tabs';
    this.activeTab = 0;
    this.tabs = tabs;
    this.render();
  }

  render() {
    const nav = document.createElement('div');
    nav.className = 'tabs-nav';

    this.tabs.forEach((tab, idx) => {
      const btn = document.createElement('button');
      btn.className = `tab-btn ${idx === 0 ? 'active' : ''}`;
      btn.textContent = tab.label;
      btn.addEventListener('click', () => this.setActive(idx));
      nav.appendChild(btn);
    });

    this.element.appendChild(nav);

    const content = document.createElement('div');
    content.className = 'tabs-content';
    this.tabs.forEach((tab, idx) => {
      const panel = document.createElement('div');
      panel.className = `tab-panel ${idx === 0 ? 'active' : ''}`;
      panel.innerHTML = tab.content || '';
      content.appendChild(panel);
    });

    this.element.appendChild(content);
  }

  setActive(idx) {
    const buttons = this.element.querySelectorAll('.tab-btn');
    const panels = this.element.querySelectorAll('.tab-panel');
    buttons.forEach(btn => btn.classList.remove('active'));
    panels.forEach(panel => panel.classList.remove('active'));
    buttons[idx].classList.add('active');
    panels[idx].classList.add('active');
  }

  getElement() {
    return this.element;
  }
}
