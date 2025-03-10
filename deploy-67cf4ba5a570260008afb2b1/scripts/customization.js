// Constantes pour les émojis par défaut
const DEFAULT_EMOJIS = [
    "🍓", "🍕", "🍔", "🌵", "🐱", "🐟", "🎸", "🎨", "📱", "🚗",
    "🍦", "🥑", "🦄", "🌙", "🔥", "🎶", "💻", "🐻", "🍩", "🏀",
    "🌈", "🍿", "🥂", "🍹", "🎁", "🏞️", "🚀", "🎧", "👑", "⚽",
    "📚", "🎂", "🍪", "🌻", "🎀", "🐶", "🍇", "🌎", "🍉", "🎤",
    "🎯", "🍋", "🎹", "🐾", "🪐", "🛴", "🦋", "🍫", "🐨", "🍒",
    "🌴", "🚲", "🎮", "⚡", "⭐", "🌟", "☕"
];

// Exporter les émojis par défaut dans l'objet global window
window.DEFAULT_EMOJIS = DEFAULT_EMOJIS;

// État global
let customEmojis = null;
let cardBackImage = null;

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    console.log("→ DOMContentLoaded: Initialisation de la personnalisation");
    initializeCustomization();
});

// Initialiser la personnalisation
function initializeCustomization() {
    console.log("→ Début de l'initialisation de la personnalisation");
    loadSavedEmojis();
    setupEventListeners();
    populateEmojiTables();
    
    // Vérification supplémentaire après un court délai pour s'assurer que les tableaux sont bien remplis
    setTimeout(() => {
        const emojiCells = document.querySelectorAll('.emoji-cell');
        console.log(`→ Vérification après délai: ${emojiCells.length} cellules d'émojis trouvées`);
        
        if (emojiCells.length === 0 || emojiCells[0].innerHTML === '') {
            console.warn("→ Les cellules d'émojis semblent vides, tentative de repeuplement");
            // Seconde tentative de peuplement des tableaux
            populateEmojiTables();
        }
    }, 300);
}

// Charger les émojis sauvegardés
function loadSavedEmojis() {
    console.log("→ Chargement des émojis sauvegardés");
    try {
        const saved = localStorage.getItem('customEmojis');
        if (saved) {
            customEmojis = JSON.parse(saved);
            console.log('Émojis personnalisés chargés:', customEmojis);
        } else {
            customEmojis = window.DEFAULT_EMOJIS;
            console.log('Utilisation des émojis par défaut');
        }
    } catch (error) {
        console.error('Erreur lors du chargement des émojis:', error);
        customEmojis = window.DEFAULT_EMOJIS;
    }

    // Charger l'image de dos de carte
    const savedBack = localStorage.getItem('cardBackImage');
    if (savedBack) {
        cardBackImage = savedBack;
        updateCardBackPreview(savedBack);
    }
}

// Configurer les écouteurs d'événements
function setupEventListeners() {
    document.getElementById('resetAll').addEventListener('click', handleResetAll);
    document.getElementById('saveEmojis').addEventListener('click', handleSave);
    document.getElementById('cardBackUpload').addEventListener('change', handleCardBackUpload);
    document.getElementById('removeCardBack').addEventListener('click', handleRemoveCardBack);
}

// Remplir les tableaux d'émojis
function populateEmojiTables() {
    console.log("Début de populateEmojiTables", customEmojis);
    
    const leftTable = document.getElementById('leftEmojiTable').querySelector('tbody');
    const rightTable = document.getElementById('rightEmojiTable').querySelector('tbody');
    
    if (!leftTable || !rightTable) {
        console.error("Tableaux non trouvés:", !leftTable ? "leftTable manquant" : "rightTable manquant");
        return;
    }
    
    // Vider les tableaux
    leftTable.innerHTML = '';
    rightTable.innerHTML = '';
    
    if (!customEmojis || !Array.isArray(customEmojis) || customEmojis.length === 0) {
        console.error("Émojis non disponibles ou format invalide:", customEmojis);
        customEmojis = DEFAULT_EMOJIS; // Utiliser les émojis par défaut si customEmojis est invalide
        console.log("Utilisation des émojis par défaut comme fallback");
    }

    // Remplir les tableaux
    customEmojis.forEach((emoji, index) => {
        console.log(`Création de la ligne pour l'emoji ${index}:`, emoji);
        const row = createEmojiRow(index, emoji);
        if (index < 29) {
            leftTable.appendChild(row);
        } else {
            rightTable.appendChild(row);
        }
    });
    
    console.log("Tableaux d'émojis remplis:", 
                "gauche:", leftTable.childElementCount, 
                "droite:", rightTable.childElementCount);
}

// Créer une ligne d'émoji
function createEmojiRow(index, emoji) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${index + 1}</td>
        <td class="emoji-cell" id="emoji-${index}" style="font-size: 24px; min-width: 40px; min-height: 40px;"></td>
        <td>
            <input type="file" id="upload-${index}" accept="image/*" style="display: none;">
            <label for="upload-${index}" class="action-button">
                <i class="fas fa-upload"></i>
            </label>
        </td>
        <td>
            <button class="reset-button" data-index="${index}">
                <i class="fas fa-undo"></i>
            </button>
        </td>
    `;

    // Ajouter les écouteurs d'événements
    const fileInput = row.querySelector(`#upload-${index}`);
    fileInput.addEventListener('change', (e) => handleEmojiUpload(e, index));

    const resetButton = row.querySelector('.reset-button');
    resetButton.addEventListener('click', () => handleResetEmoji(index));

    // Mettre à jour la cellule d'émoji après un court délai
    // pour s'assurer que l'élément est bien ajouté au DOM
    setTimeout(() => {
        updateEmojiCell(index, emoji);
    }, 0);

    return row;
}

// Mettre à jour une cellule d'émoji
function updateEmojiCell(index, content) {
    const cell = document.getElementById(`emoji-${index}`);
    if (!cell) {
        console.error(`Cellule pour l'emoji ${index} non trouvée`);
        return;
    }

    console.log(`Mise à jour de l'emoji ${index} avec le contenu:`, content);

    if (content && content.startsWith && content.startsWith('data:')) {
        // C'est une image
        cell.innerHTML = `<img src="${content}" alt="Émoji ${index + 1}" style="width: 30px; height: 30px;">`;
        console.log(`Emoji ${index}: Affichage comme image`);
    } else if (content) {
        // C'est un emoji textuel
        cell.textContent = content;
        console.log(`Emoji ${index}: Affichage comme texte: "${content}"`);
    } else {
        // Contenu vide ou invalide
        console.warn(`Emoji ${index}: Contenu invalide ou vide`, content);
        cell.textContent = "❓";
    }
}

// Gérer le téléchargement d'un émoji
function handleEmojiUpload(event, index) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        customEmojis[index] = e.target.result;
        updateEmojiCell(index, e.target.result);
        saveEmojis();
    };
    reader.readAsDataURL(file);
}

// Gérer la réinitialisation d'un émoji
function handleResetEmoji(index) {
    if (index >= 0 && index < window.DEFAULT_EMOJIS.length) {
        customEmojis[index] = window.DEFAULT_EMOJIS[index];
        updateEmojiCell(index, window.DEFAULT_EMOJIS[index]);
        saveEmojis();
    }
}

// Gérer la réinitialisation complète
function handleResetAll() {
    if (!confirm('Voulez-vous vraiment réinitialiser tous les émojis ?')) return;
    
    customEmojis = [...window.DEFAULT_EMOJIS];
    populateEmojiTables();
    localStorage.removeItem('customEmojis');
}

// Gérer la sauvegarde
function handleSave() {
    saveEmojis();
    alert('Les émojis ont été sauvegardés !');
}

// Sauvegarder les émojis
function saveEmojis() {
    try {
        localStorage.setItem('customEmojis', JSON.stringify(customEmojis));
        console.log('Émojis sauvegardés');
    } catch (error) {
        console.error('Erreur lors de la sauvegarde des émojis:', error);
        alert('Une erreur est survenue lors de la sauvegarde des émojis.');
    }
}

// Gérer le téléchargement du dos de carte
function handleCardBackUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        cardBackImage = e.target.result;
        updateCardBackPreview(cardBackImage);
        localStorage.setItem('cardBackImage', cardBackImage);
    };
    reader.readAsDataURL(file);
}

// Mettre à jour l'aperçu du dos de carte
function updateCardBackPreview(imageUrl) {
    const preview = document.getElementById('cardBackPreview');
    const img = preview.querySelector('img');
    img.src = imageUrl;
    preview.style.display = 'block';
}

// Gérer la suppression du dos de carte
function handleRemoveCardBack() {
    cardBackImage = null;
    localStorage.removeItem('cardBackImage');
    document.getElementById('cardBackPreview').style.display = 'none';
    document.getElementById('cardBackUpload').value = '';
}

// Exporter les émojis pour le générateur
window.getCustomEmojis = function() {
    return customEmojis || window.DEFAULT_EMOJIS;
};
