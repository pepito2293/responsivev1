// Liste des émojis par défaut
export const defaultEmojis = [
  "🍓", "🍕", "🍔", "🌵", "🐱", "🐟", "🎸", "🎨", "📱", "🚗",
  "🍦", "🥑", "🦄", "🌙", "🔥", "🎶", "💻", "🐻", "🍩", "🏀",
  "🌈", "🍿", "🥂", "🍹", "🎁", "🏞️", "🚀", "🎧", "👑", "⚽",
  "📚", "🎂", "🍪", "🌻", "🎀", "🐶", "🍇", "🌎", "🍉", "🎤",
  "🎯", "🍋", "🎹", "🐾", "🪐", "🛴", "🦋", "🍫", "🐨", "🍒",
  "🌴", "🚲", "🎮", "⚡", "⭐", "🌟", "☕"
];

// Fonction pour charger les émojis personnalisés depuis `localStorage`
export function loadEmojiList() {
  const storedEmojis = localStorage.getItem("emojiList");
  return storedEmojis ? JSON.parse(storedEmojis) : [...defaultEmojis];
}

// Fonction pour sauvegarder les émojis dans `localStorage`
export function saveEmojiList(emojiList) {
  localStorage.setItem("emojiList", JSON.stringify(emojiList));
}

// Fonction pour générer les cartes Dobble
export function generateDobbleCards(emojiList) {
  const n = 7; // Nombre de symboles par carte - 1
  const totalSymbols = n * n + n + 1;
  const symbols = emojiList.slice(0, totalSymbols);
  const cards = [];

  // Première boucle : génère 8 cartes (n+1)
  for (let i = 0; i <= n; i++) {
    const card = [symbols[0]];
    for (let j = 0; j < n; j++) {
      card.push(symbols[1 + i * n + j]);
    }
    cards.push(card);
  }

  // Deuxième boucle : normalement génère 49 cartes (n*n)
  // Pour avoir 54 cartes au total (8 + 46), nous limitons à 46 cartes ici
  let cardCount = 0;
  const maxSecondLoopCards = 46; // 54 - 8 = 46
  
  for (let i = 0; i < n && cardCount < maxSecondLoopCards; i++) {
    for (let j = 0; j < n && cardCount < maxSecondLoopCards; j++) {
      const card = [symbols[1 + i]];
      for (let k = 0; k < n; k++) {
        const index = 1 + n + k * n + ((i * k + j) % n);
        card.push(symbols[index]);
      }
      cards.push(card);
      cardCount++;
    }
  }

  return cards; // Exactement 54 cartes (8 + 46)
}
