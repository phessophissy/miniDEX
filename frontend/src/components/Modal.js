// Modal dialog component

export class Modal {
  constructor(options = {}) {
    const { title = '', content = '', buttons = [] } = options;
    this.element = this.createModal(title, content, buttons);
  }

  createModal(title, content, buttons) {
    const modal = document.createElement('div');
    modal.className = 'modal';

    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.addEventListener('click', () => this.close());
    modal.appendChild(backdrop);

    const dialog = document.createElement('div');
    dialog.className = 'modal-dialog';

    if (title) {
      const header = document.createElement('div');
      header.className = 'modal-header';
      const titleEl = document.createElement('h2');
      titleEl.textContent = title;
      header.appendChild(titleEl);
      const closeBtn = document.createElement('button');
      closeBtn.className = 'modal-close';
      closeBtn.textContent = '×';
      closeBtn.addEventListener('click', () => this.close());
      header.appendChild(closeBtn);
      dialog.appendChild(header);
    }

    const body = document.createElement('div');
    body.className = 'modal-body';
    body.innerHTML = content;
    dialog.appendChild(body);

    if (buttons.length > 0) {
      const footer = document.createElement('div');
      footer.className = 'modal-footer';
      buttons.forEach(btn => {
        const button = document.createElement('button');
        button.textContent = btn.text;
        button.className = `btn btn-${btn.variant || 'primary'}`;
        button.addEventListener('click', btn.onClick);
        footer.appendChild(button);
      });
      dialog.appendChild(footer);
    }

    modal.appendChild(dialog);
    return modal;
  }

  show() {
    document.body.appendChild(this.element);
    setTimeout(() => this.element.classList.add('show'), 10);
  }

  close() {
    this.element.classList.remove('show');
    setTimeout(() => this.element.remove(), 300);
  }
}
