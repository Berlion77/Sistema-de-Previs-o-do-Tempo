// components/modal.js — Componente de Modal reutilizável
const Modal = (() => {

  function show(id) {
    document.getElementById(id)?.classList.add('open');
    document.body.classList.add('modal-open');
  }

  function hide(id) {
    document.getElementById(id)?.classList.remove('open');
    document.body.classList.remove('modal-open');
  }

  function create(id, title, body, footer = '') {
    const existing = document.getElementById(id);
    if (existing) existing.remove();

    const el = document.createElement('div');
    el.className = 'modal-overlay';
    el.id = id;
    el.innerHTML = `
      <div class="modal-box" role="dialog" aria-modal="true">
        <div class="modal-header">
          <h3>${title}</h3>
          <button class="modal-close" onclick="Modal.hide('${id}')" aria-label="Fechar">&times;</button>
        </div>
        <div class="modal-body">${body}</div>
        ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
      </div>`;

    el.addEventListener('click', e => { if (e.target === el) hide(id); });
    document.body.appendChild(el);
  }

  function toast(msg, type = 'info', duration = 3000) {
    const t = document.createElement('div');
    t.className = `toast toast-${type}`;
    t.textContent = msg;
    document.getElementById('toast-container').appendChild(t);
    requestAnimationFrame(() => t.classList.add('show'));
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, duration);
  }

  return { show, hide, create, toast };
})();
