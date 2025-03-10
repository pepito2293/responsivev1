import { generateDobbleCards } from './dobbleLogic.js';

let currentSelectedEmoji = null;

// Fonction pour afficher les cartes dans la grille
export function generateCards(emojiList) {
  const cardContainer = document.getElementById("cardContainer");
  if (!cardContainer) return;
  
  cardContainer.innerHTML = "";

  const cards = generateDobbleCards(emojiList);
  cards.forEach((card) => {
    const cardDiv = document.createElement("div");
    cardDiv.className = "card";
    positionSymbols(cardDiv, card);
    cardContainer.appendChild(cardDiv);
  });
}

// Fonction pour positionner les symboles sur une carte
function positionSymbols(cardDiv, card) {
  const cardSize = 250;
  const margin = 20;

  const minSize = parseInt(document.getElementById("minSize")?.value || "30", 10);
  const maxSize = parseInt(document.getElementById("maxSize")?.value || "70", 10);

  const positions = [];

  card.forEach((symbol) => {
    let isValidPosition = false;
    let x, y, size;

    while (!isValidPosition) {
      size = Math.random() * (maxSize - minSize) + minSize;
      x = margin + Math.random() * (cardSize - 2 * margin - size);
      y = margin + Math.random() * (cardSize - 2 * margin - size);

      isValidPosition = positions.every(pos => {
        const distance = Math.sqrt((pos.x - x) ** 2 + (pos.y - y) ** 2);
        return distance > (pos.size + size) / 2 + 10;
      });

      if (positions.length === 0) isValidPosition = true;
    }

    positions.push({ x, y, size });

    const symbolDiv = document.createElement("div");
    symbolDiv.className = "symbol";

    if (symbol.startsWith("data:image")) {
      const img = document.createElement("img");
      img.src = symbol;
      img.style.width = `${size}px`;
      img.style.height = `${size}px`;
      symbolDiv.appendChild(img);
    } else {
      symbolDiv.textContent = symbol;
      symbolDiv.style.fontSize = `${size}px`;
    }

    Object.assign(symbolDiv.style, {
      position: "absolute",
      left: `${x}px`,
      top: `${y}px`,
      width: `${size}px`,
      height: `${size}px`,
      transform: `rotate(${Math.random() * 360}deg)`,
      transformOrigin: "center",
      cursor: "move"
    });

    enableDrag(symbolDiv);
    cardDiv.appendChild(symbolDiv);
  });
}

// Fonction pour activer le déplacement et la sélection d'un émoji
function enableDrag(symbol) {
  let isDragging = false;
  let offsetX, offsetY;

  symbol.addEventListener("dragstart", (event) => event.preventDefault());

  symbol.addEventListener("mousedown", (event) => {
    isDragging = true;
    offsetX = event.clientX - symbol.offsetLeft;
    offsetY = event.clientY - symbol.offsetTop;
    symbol.style.cursor = "grabbing";
    selectEmoji(symbol);
  });

  document.addEventListener("mousemove", (event) => {
    if (isDragging) {
      const parentRect = symbol.parentElement.getBoundingClientRect();
      let newLeft = event.clientX - offsetX;
      let newTop = event.clientY - offsetY;

      newLeft = Math.max(0, Math.min(newLeft, parentRect.width - symbol.offsetWidth));
      newTop = Math.max(0, Math.min(newTop, parentRect.height - symbol.offsetHeight));

      symbol.style.left = `${newLeft}px`;
      symbol.style.top = `${newTop}px`;
    }
  });

  document.addEventListener("mouseup", () => {
    if (isDragging) {
      isDragging = false;
      symbol.style.cursor = "move";
    }
  });

  symbol.addEventListener("click", (e) => {
    e.stopPropagation();
    selectEmoji(symbol);
  });
}

// Fonction pour sélectionner un émoji
function selectEmoji(symbol) {
  currentSelectedEmoji = symbol;
  const sizeControl = document.getElementById("sizeControl");
  const emojiSize = document.getElementById("emojiSize");
  const emojiSizeValue = document.getElementById("emojiSizeValue");

  if (!sizeControl || !emojiSize || !emojiSizeValue) return;

  const currentSize = symbol.offsetWidth;
  emojiSize.value = currentSize;
  emojiSizeValue.textContent = currentSize;
  sizeControl.style.display = "flex";
}

// Fonction pour mettre à jour l'affichage des curseurs
export function updatePreview() {
  const minSize = document.getElementById("minSize")?.value;
  const maxSize = document.getElementById("maxSize")?.value;
  const minSizeValue = document.getElementById("minSizeValue");
  const maxSizeValue = document.getElementById("maxSizeValue");

  if (minSize && minSizeValue) minSizeValue.textContent = minSize;
  if (maxSize && maxSizeValue) maxSizeValue.textContent = maxSize;
}

// Fonction pour remplir le tableau des émojis personnalisables
export function populateEmojiTable(emojiList) {
  // Cette fonction n'est pas utilisée dans generateur.html
  return;
}

// Initialisation des événements UI
export function initializeUIEvents(emojiList, resetEmoji) {
  document.body.addEventListener("click", (event) => {
    if (!event.target.classList.contains('symbol')) {
      currentSelectedEmoji = null;
      const sizeControl = document.getElementById("sizeControl");
      if (sizeControl) sizeControl.style.display = "none";
    }
  });

  const emojiSizeSlider = document.getElementById("emojiSize");
  if (!emojiSizeSlider) return;

  emojiSizeSlider.addEventListener("input", (event) => {
    const newSize = event.target.value;
    const emojiSizeValue = document.getElementById("emojiSizeValue");
    if (emojiSizeValue) emojiSizeValue.textContent = newSize;

    if (currentSelectedEmoji) {
      currentSelectedEmoji.style.width = `${newSize}px`;
      currentSelectedEmoji.style.height = `${newSize}px`;
      if (currentSelectedEmoji.children[0]) {
        currentSelectedEmoji.children[0].style.width = `${newSize}px`;
        currentSelectedEmoji.children[0].style.height = `${newSize}px`;
      } else {
        currentSelectedEmoji.style.fontSize = `${newSize}px`;
      }
    }
  });
}
