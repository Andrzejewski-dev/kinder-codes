document.addEventListener('DOMContentLoaded', () => {
  const scannedListDiv = document.getElementById('scanned-list');
  let scannedCodes = JSON.parse(localStorage.getItem('scannedCodes')) || [];

  function renderList() {
    if (scannedCodes.filter(sc => !sc.manual).length === 0) {
      scannedListDiv.innerHTML = '<p class="empty">Brak zeskanowanych kodów.</p>';
      return;
    }

    scannedListDiv.innerHTML = scannedCodes.map(item => {
      if (item.manual) return '';
      const found = figures.filter(f => f.id === item.figureId);
      const figureHTML = found.length > 0
        ? found.map(f => `
          <div class="figure-info">
            <img src="${f.img}" alt="${f.name}">
            <div class="figure-details">
              <h3>${f.name}</h3>
              <p>Kod: <b>${item.code}</b></p>
            </div>
          </div>
        `).join('')
        : `<p class="no-figure">Nie znaleziono figurki dla kodu: <b>${item.code}</b></p>`;

      return `
        <div class="scanned-item" data-itemid="${item.id}">
          ${figureHTML}
          <div class="action-row">
            ${found.length ? (item.approved ? '<button class="confirm-btn confirmed" disabled>Potwierdzono</button>' : '<button class="confirm-btn">Potwierdź</button>') : ''}
            ${!item.approved ? '<button class="change-btn">Zmień</button>' : ''}
            <button class="delete-btn">Usuń</button>
          </div>
        </div>
      `;
    }).join('');
  }

  renderList();

  // Handle all buttons
  scannedListDiv.addEventListener('click', e => {
    const parentItem = e.target.closest('.scanned-item');
    const itemId = parentItem?.dataset.itemid;
    if (!itemId) return;

    if (e.target.classList.contains('confirm-btn')) {
      e.target.textContent = '✔ Potwierdzono';
      e.target.disabled = true;
      e.target.classList.add('confirmed');
      scannedCodes = scannedCodes.map(item => {
        if (item.id === itemId) {
          item.approved = true;
        }
        return item;
      });
      localStorage.setItem('scannedCodes', JSON.stringify(scannedCodes));
    }

    if (e.target.classList.contains('change-btn')) {
      currentChangeItemId = itemId;
      openChangeModal();
    }

    if (e.target.classList.contains('delete-btn')) {
      if (confirm(`Czy na pewno chcesz usunąć ten skan?`)) {
        scannedCodes = scannedCodes.filter(item => item.id !== itemId);
        localStorage.setItem('scannedCodes', JSON.stringify(scannedCodes));
        renderList();
      }
    }
  });


  let currentChangeItemId = null;

  const modalOverlay = document.getElementById('modalOverlay');
  const changeModal = document.getElementById('changeModal');
  const modalFigureList = document.getElementById('modalFigureList');
  const cancelChange = document.getElementById('cancelChange');
  const confirmChange = document.getElementById('confirmChange');

  // Populate modal with all figures
  function openChangeModal() {
    modalFigureList.innerHTML = `<div class="figure-option" data-id="none">
        <span>Brak</span>
      </div>
    `;
    modalFigureList.innerHTML += figures.map(f => `
      <div class="figure-option" data-id="${f.id}">
        <img src="${f.img}" alt="${f.name}">
      </div>
    `).join('');

    // Select figure
    modalFigureList.querySelectorAll('.figure-option').forEach(opt => {
      opt.addEventListener('click', () => {
        modalFigureList.querySelectorAll('.figure-option').forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
      });
    });

    modalOverlay.classList.add('show');
    changeModal.classList.add('show');
  }

  // Close modal
  function closeChangeModal() {
    modalOverlay.classList.remove('show');
    changeModal.classList.remove('show');
    currentChangeItemId = null;
  }

  cancelChange.addEventListener('click', closeChangeModal);
  modalOverlay.addEventListener('click', closeChangeModal);

  // Confirm selection
  confirmChange.addEventListener('click', () => {
    const selected = modalFigureList.querySelector('.figure-option.selected');
    if (!selected) return alert('Wybierz figurkę!');
    const figureId = selected.dataset.id;

    // Update scannedCodes if you want to link it to the new figure (optional)
    const scan = scannedCodes.find(item => item.id === currentChangeItemId)
    if (scan) {
      scannedCodes = scannedCodes.map(item => {
        if (item.id === scan.id) {
          item.figureId = figureId !== "none" ? +figureId : undefined;
        }
        return item;
      });
      localStorage.setItem('scannedCodes', JSON.stringify(scannedCodes));
      renderList()
    }

    closeChangeModal();
  });

});