// ====== Константы ======
const API_URL = "https://script.google.com/macros/s/AKfycbze1GxbBxN3nuEbOlltEKLjUjct4CRgevJ36TMexh7AnOpi_OPRpGxf8M2jjaiE3N8sTw/exec";

let codeReader;
let last = "";
let count = 0;

// ====== DOM элементы ======
const videoWrapper = document.getElementById("videoWrapper");
const statusEl = document.getElementById("status");
const scanBtn = document.getElementById("scanBtn");

// ====== Установка статуса ======
function setStatus(text, cls="") {
  statusEl.className = "status " + cls;
  statusEl.innerText = text;
}

// ====== Старт сканирования ======
function start() {
  videoWrapper.style.display = "block";
  setStatus("запуск камеры");

  // Инициализация сканера ZXing
  codeReader = new ZXing.BrowserMultiFormatReader();

  codeReader.decodeFromConstraints(
    {
      video: {
        facingMode: "environment",  // задняя камера
        frameRate: { ideal: 15, max: 20 }
      }
    },
    "video",
    (result, err) => {
      if(result) {
        const code = result.text;
        if(code === last) count++;
        else { last = code; count = 1; }

        if(count >= 2) { // дубликат для стабильности
          codeReader.reset(); // выключаем камеру
          videoWrapper.style.display = "none";
          setStatus("отправка");

          fetch(API_URL, {
            method: "POST",
            body: JSON.stringify({ barcode: code })
          })
          .then(r => r.json())
          .then(data => setStatus(data.result,"success"))
          .catch(() => setStatus("Ошибка сети"));
        }
      }
    }
  );
}

// ====== Привязка к кнопке ======
scanBtn.addEventListener("click", start);
