// Loader/Spinner component

export class Loader {
  static show(message = 'Loading...') {
    const loader = document.createElement('div');
    loader.id = 'app-loader';
    loader.className = 'loader';
    loader.innerHTML = `<div class="spinner"></div><p>${message}</p>`;
    document.body.appendChild(loader);
    return loader;
  }

  static hide() {
    const loader = document.getElementById('app-loader');
    if (loader) loader.remove();
  }
}
