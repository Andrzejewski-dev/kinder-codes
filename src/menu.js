const hamburger = document.getElementById('hamburger');
const sideMenu = document.getElementById('sideMenu');
const closeMenu = document.getElementById('closeMenu');
const overlay = document.getElementById('menuOverlay');
const logo = document.getElementById('logo');

function openMenu() {
  sideMenu.classList.add('show');
  overlay.classList.add('show');
}

function closeSideMenu() {
  sideMenu.classList.remove('show');
  overlay.classList.remove('show');
}

logo.addEventListener('click', () => {
  window.location.href = 'index.html';
});
hamburger.addEventListener('click', openMenu);
closeMenu.addEventListener('click', closeSideMenu);
overlay.addEventListener('click', closeSideMenu);

// Optional: close when clicking any menu link
sideMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', closeSideMenu);
});
