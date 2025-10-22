const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const startBtn = document.getElementById('startCamera');
const zoomControls = document.getElementById('zoomControls');
const zoomInBtn = document.getElementById('zoomIn');
const zoomOutBtn = document.getElementById('zoomOut');
const scan1 = document.getElementById('scanCode1');
const scan2 = document.getElementById('scanCode2');
const scanCode1Btn = document.getElementById('scanCode1');
const scanCode2Btn = document.getElementById('scanCode2');
const code1Input = document.getElementById('code1');
const code2Input = document.getElementById('code2');
const buttonRow = document.getElementById('buttonRow');
const searchBtn = document.getElementById('searchBtn');
const resultDiv = document.getElementById('result');

let stream;
let zoomLevel = 1;
const zoomStep = 1;
const minZoom = 1;
const maxZoom = 10;

async function startCamera() {
  stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
  video.srcObject = stream;

  zoomControls.style.display = 'flex';
  startBtn.style.display = 'none';
  scan1.classList.add('visible');
  scan2.classList.add('visible');
  code1Input.classList.add('active');
  code2Input.classList.add('active');
}

function drawZoomedCanvas() {
  const ctx = canvas.getContext('2d');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  const w = video.videoWidth / zoomLevel;
  const h = video.videoHeight / zoomLevel;

  ctx.translate(centerX, centerY);
  ctx.scale(zoomLevel, zoomLevel);
  ctx.translate(-centerX, -centerY);
  ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

  // --- Przycinanie do 128px ---
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');
  tempCanvas.width = canvas.width;
  tempCanvas.height = 200;

  // kopiujemy tylko górną część oryginalnego canvas
  tempCtx.drawImage(canvas, 0, 0, canvas.width, 200, 0, 0, canvas.width, 200);

  // kopiujemy z powrotem do oryginalnego canvas, jeśli chcesz
  canvas.height = 200;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(tempCanvas, 0, 0);
}

async function scanCode(inputField) {
  drawZoomedCanvas();
  const { data: { text } } = await Tesseract.recognize(canvas, 'eng', {
    tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  });

  const codes = text.match(/\b[A-Z0-9]{3,4}\b/g);
  console.log(codes)
  if (codes && codes.length > 0) {
    const code = codes.find(c => c.length === 3 || c.length === 4) || codes[0];
    inputField.value = code.substring(0, 4);
  }
}

function updateVideoZoom() {
  video.style.transform = `scale(${zoomLevel})`;
}

zoomInBtn.onclick = () => {
  if (zoomLevel + zoomStep <= maxZoom) {
    zoomLevel += zoomStep;
    updateVideoZoom();
  }
};
zoomOutBtn.onclick = () => {
  if (zoomLevel - zoomStep >= minZoom) {
    zoomLevel -= zoomStep;
    updateVideoZoom();
  }
};

startBtn.onclick = async () => {
  await startCamera();
  updateVideoZoom();
};

scanCode1Btn.onclick = async () => {
  await scanCode(code1Input);
};
scanCode2Btn.onclick = async () => {
  await scanCode(code2Input);
};

searchBtn.onclick = () => {
  const code1 = code1Input.value.trim().toUpperCase();
  const code2 = code2Input.value.trim().toUpperCase();
  if (!code1 || !code2) {
    resultDiv.innerHTML = "<p>Wpisz oba kody!</p>";
    return;
  }

  const fullCode = `${code1}-${code2}`;
  const fullCode2 = `${code2}-${code1}`;
  if (!figures) {
    alert("Nie załadowano figurek!");
  }
  const found = figures.filter(f => f.codes.includes(fullCode) || f.codes.includes(fullCode2));

  const scannedCodes = JSON.parse(localStorage.getItem('scannedCodes')) || [];
  scannedCodes.push({
    id: crypto.randomUUID(),
    code: fullCode,
    figureId: found[0]?.id,
    approved: false
  });
  localStorage.setItem('scannedCodes', JSON.stringify(scannedCodes));

  if (found.length === 0) {
    resultDiv.innerHTML = `<p>Nie znaleziono figurki o kodzie <b>${fullCode}</b></p>`;
  } else {
    resultDiv.innerHTML = found.map(f => `
      <div>
        <h3>${f.name}</h3>
        <img src="${f.img}" alt="${f.name}">
      </div>
    `).join("");
  }
};
