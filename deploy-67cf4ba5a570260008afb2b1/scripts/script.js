// Variables globales
let selectedSymbol = null;
let editMode = false;
let cardsGenerated = false;
let isDragging = false;
let minSizeValue = 40;  // Taille minimale par défaut
let maxSizeValue = 100;  // Taille maximale par défaut
let cardShape = 'square'; // Forme de carte par défaut (square ou round)

// Émojis par défaut (accessible globalement)
window.DEFAULT_EMOJIS = [
    "🍓", "🍕", "🍔", "🌵", "🐱", "🐟", "🎸", "🎨", "📱", "🚗",
    "🍦", "🥑", "🦄", "🌙", "🔥", "🎶", "💻", "🐻", "🍩", "🏀",
    "🌈", "🍿", "🥂", "🍹", "🎁", "🏞️", "🚀", "🎧", "👑", "⚽",
    "📚", "🎂", "🍪", "🌻", "🎀", "🐶", "🍇", "🌎", "🍉", "🎤",
    "🎯", "🍋", "🎹", "🐾", "🪐", "🛴", "🦋", "🍫", "🐨", "🍒",
    "🌴", "🚲", "🎮", "⚡", "⭐", "🌟", "☕"
];

// Fonction pour charger les émojis personnalisés depuis localStorage
function loadEmojiList() {
    const storedEmojis = localStorage.getItem("customEmojis");
    if (storedEmojis) {
        try {
            const parsedEmojis = JSON.parse(storedEmojis);
            console.log("Émojis chargés:", parsedEmojis);
            return parsedEmojis;
        } catch (error) {
            console.error("Erreur lors du chargement des émojis:", error);
            return window.DEFAULT_EMOJIS;
        }
    }
    return window.DEFAULT_EMOJIS;
}

// Fonction pour sauvegarder les émojis dans localStorage
function saveEmojiList(emojiList) {
    localStorage.setItem("customEmojis", JSON.stringify(emojiList));
}

// Fonction pour générer les cartes Dobble
function generateDobbleCards() {
    // Récupérer et mélanger les émojis disponibles
    const emojis = loadEmojiList();
    const availableEmojis = [...emojis];
    shuffleArray(availableEmojis);
    
    const n = 8; // Nombre de symboles par carte
    const p = n - 1; // Ordre du plan projectif
    
    // Générer les indices mathématiques pour les cartes
    const cards = [];
    
    // Première carte avec les premiers indices
    const firstCard = Array.from({length: n}, (_, i) => i);
    cards.push(firstCard);
    
    // Générer les autres cartes selon l'algorithme de Dobble
    for (let i = 0; i < p; i++) {
        for (let j = 0; j < p + 1; j++) {
            const card = [i];
            for (let k = 0; k < p; k++) {
                card.push(p + 1 + i * p + ((j + k) % p));
            }
            cards.push(card);
        }
    }
    
    // Créer un mapping unique entre les indices et les émojis
    const indexToEmoji = {};
    const uniqueIndices = new Set(cards.flat());
    
    // Assigner des émojis uniques à chaque indice
    Array.from(uniqueIndices).forEach((index, i) => {
        indexToEmoji[index] = availableEmojis[i % availableEmojis.length];
    });
    
    // Convertir les indices en émojis en utilisant le mapping
    const emojiCards = cards.map(card => 
        card.map(index => indexToEmoji[index])
    );
    
    // Mélanger les cartes pour plus de variété
    shuffleArray(emojiCards);
    
    // Retourner 57 cartes (nombre standard pour Dobble)
    return emojiCards.slice(0, 57);
}

// Fonction pour générer les cartes dans le DOM
function generateCards() {
    const cardContainer = document.getElementById("cardContainer");
    if (!cardContainer) return;
    
    cardContainer.innerHTML = "";
    const cards = generateDobbleCards();
    
    for (let index = 0; index < cards.length; index++) {
        const card = cards[index];
        const cardDiv = document.createElement("div");
        cardDiv.className = "card";
        cardDiv.dataset.cardIndex = index;
        
        // Appliquer la forme actuelle des cartes
        if (cardShape === 'round') {
            cardDiv.classList.add('round');
        }
        
        // Positionner les symboles
        positionSymbols(cardDiv, card);
        
        // Activer le glisser-déposer si en mode édition
        if (editMode) {
            cardDiv.querySelectorAll('.symbol').forEach(symbol => {
                enableDrag(symbol);
            });
        }
        
        cardContainer.appendChild(cardDiv);
    }
    
    cardsGenerated = true;
    saveCardsState();
}

// Fonction pour positionner les symboles sur la carte
function positionSymbols(cardDiv, card) {
    const symbolCount = card.length;
    const padding = 30; // Espace en pixels par rapport aux bords de la carte
    
    // Si c'est une carte ronde, on doit positionner les symboles en cercle
    const isRound = cardShape === 'round';
    
    // Générer des positions pour chaque symbole
    const positions = [];
    const cardWidth = 300 - padding * 2; // Largeur de la carte moins le padding
    const cardHeight = 300 - padding * 2; // Hauteur de la carte moins le padding
    
    if (isRound) {
        // Pour les cartes rondes, nous placerons les symboles en cercle
        const centerX = cardWidth / 2 + padding;
        const centerY = cardHeight / 2 + padding;
        const maxRadius = Math.min(cardWidth, cardHeight) / 2 * 0.8; // 80% du rayon pour garder les symboles visibles
        
        // Générer des positions en cercle avec un peu d'aléatoire
        for (let i = 0; i < symbolCount; i++) {
            // Position angulaire régulière avec un peu d'aléatoire
            const angle = (i / symbolCount) * 2 * Math.PI + (Math.random() * 0.3 - 0.15);
            // Distance du centre (aléatoire mais pas trop près du centre ni du bord)
            const distance = maxRadius * (0.4 + Math.random() * 0.5);
            
            positions.push({
                x: centerX + Math.cos(angle) * distance,
                y: centerY + Math.sin(angle) * distance
            });
        }
    } else {
        // Pour les cartes carrées, nous placerons les symboles de manière aléatoire
        for (let i = 0; i < symbolCount; i++) {
            positions.push({
                x: Math.random() * cardWidth + padding,
                y: Math.random() * cardHeight + padding
            });
        }
    }
    
    // Placer chaque symbole
    for (let i = 0; i < symbolCount && i < positions.length; i++) {
        const symbol = card[i];
        const pos = positions[i];
        
        // Taille aléatoire entre min et max
        const size = Math.floor(minSizeValue + Math.random() * (maxSizeValue - minSizeValue));
        // Rotation aléatoire
        const rotation = Math.floor(Math.random() * 360);
        
        // Créer et positionner le symbole
        const symbolElement = createSymbolElement(symbol, size, pos.x - size/2, pos.y - size/2, rotation);
        enableDrag(symbolElement);
        cardDiv.appendChild(symbolElement);
    }
}

// Fonction pour créer un élément de symbole
function createSymbolElement(symbol, size, x, y, rotation) {
    const symbolDiv = document.createElement("div");
    symbolDiv.className = "symbol";
    
    if (symbol.startsWith && symbol.startsWith("data:image")) {
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
        transform: `rotate(${rotation}deg)`,
        cursor: "move",
        userSelect: "none"
    });
    
    return symbolDiv;
}

// Fonction pour mélanger un tableau (algorithme de Fisher-Yates)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Fonction pour activer le glisser-déposer sur un élément
function enableDrag(element) {
    let isDragging = false;
    let startX, startY, originalX, originalY;
    const speedFactor = 1; // Facteur de vitesse pour le déplacement
    
    element.addEventListener("mousedown", startDrag);
    element.addEventListener("touchstart", startDrag);
    element.addEventListener("click", selectSymbol);
    
    function startDrag(e) {
        if (!editMode) return;
        
        isDragging = true;
        
        if (e.type === "touchstart") {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        } else {
            startX = e.clientX;
            startY = e.clientY;
        }
        
        // Stocker la position originale
        const style = window.getComputedStyle(element);
        originalX = parseInt(style.left);
        originalY = parseInt(style.top);
        
        // Sélectionner l'élément
        if (selectedSymbol) {
            selectedSymbol.classList.remove("selected");
        }
        selectedSymbol = element;
        selectedSymbol.classList.add("selected");
        
        // Afficher le contrôle de taille
        document.getElementById("sizeControl").style.display = "block";
        updateSliderValues();
        
        // Ajouter les écouteurs d'événements pour le déplacement
        document.addEventListener("mousemove", drag);
        document.addEventListener("touchmove", drag);
        document.addEventListener("mouseup", stopDrag);
        document.addEventListener("touchend", stopDrag);
        
        e.preventDefault();
    }
    
    function drag(e) {
        if (!isDragging || !editMode) return;
        
        let clientX, clientY;
        if (e.type === "touchmove") {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        
        const deltaX = (clientX - startX) * speedFactor;
        const deltaY = (clientY - startY) * speedFactor;
        
        // Calculer la nouvelle position
        let newX = originalX + deltaX;
        let newY = originalY + deltaY;
        
        // Obtenir les dimensions de la carte et du symbole
        const card = element.closest(".card");
        const cardRect = card.getBoundingClientRect();
        const symbolRect = element.getBoundingClientRect();
        const symbolWidth = symbolRect.width;
        const symbolHeight = symbolRect.height;
        
        // Convertir les coordonnées globales en coordonnées relatives à la carte
        const cardStyle = window.getComputedStyle(card);
        const cardBorderWidth = parseInt(cardStyle.borderWidth) || 0;
        
        // Limites pour que le symbole reste dans la carte
        const minX = cardBorderWidth;
        const minY = cardBorderWidth;
        const maxX = cardRect.width - symbolWidth - cardBorderWidth;
        const maxY = cardRect.height - symbolHeight - cardBorderWidth;
        
        // Appliquer les limites
        newX = Math.max(minX, Math.min(maxX, newX));
        newY = Math.max(minY, Math.min(maxY, newY));
        
        // Appliquer la nouvelle position
        element.style.left = `${newX}px`;
        element.style.top = `${newY}px`;
        
        e.preventDefault();
    }
    
    function stopDrag() {
        isDragging = false;
        document.removeEventListener("mousemove", drag);
        document.removeEventListener("touchmove", drag);
        document.removeEventListener("mouseup", stopDrag);
        document.removeEventListener("touchend", stopDrag);
        
        // Sauvegarder l'état des cartes après le déplacement
        saveCardsState();
    }
    
    function selectSymbol(e) {
        if (!editMode) return;
        e.stopPropagation();
        
        // Désélectionner le symbole précédent
        if (selectedSymbol) {
            selectedSymbol.classList.remove("selected");
        }
        
        // Sélectionner le nouveau symbole
        selectedSymbol = element;
        selectedSymbol.classList.add("selected");
        
        // Afficher le contrôle de taille
        document.getElementById("sizeControl").style.display = "block";
        updateSliderValues();
    }
}

// Fonction pour mettre à jour les valeurs des sliders quand un symbole est sélectionné
function updateSliderValues() {
    const sizeControl = document.getElementById("sizeControl");
    if (!sizeControl || !selectedSymbol) return;
    
    // Obtenir les dimensions actuelles
    const rect = selectedSymbol.getBoundingClientRect();
    const currentSize = parseInt(selectedSymbol.style.width) || rect.width;
    
    // Mettre à jour le slider de taille
    const sizeSlider = document.getElementById("emojiSize");
    const sizeValue = document.getElementById("emojiSizeValue");
    if (sizeSlider && sizeValue) {
        sizeSlider.value = currentSize;
        sizeValue.textContent = currentSize;
    }
    
    // Mettre à jour le slider de rotation
    // Récupérer la rotation actuelle depuis la propriété transform
    let rotation = 0;
    const transform = selectedSymbol.style.transform;
    if (transform) {
        const match = transform.match(/rotate\((\d+)deg\)/);
        if (match && match[1]) {
            rotation = parseInt(match[1]);
        }
    }
    
    const rotationSlider = document.getElementById("emojiRotation");
    const rotationValue = document.getElementById("emojiRotationValue");
    if (rotationSlider && rotationValue) {
        rotationSlider.value = rotation;
        rotationValue.textContent = rotation;
    }
}

// Fonction pour ajuster la taille
function updateSize(e) {
    if (!selectedSymbol || !editMode) return;
    
    const newSize = parseInt(e.target.value);
    document.getElementById("emojiSizeValue").textContent = newSize;
    
    // Appliquer la nouvelle taille
    selectedSymbol.style.width = `${newSize}px`;
    selectedSymbol.style.height = `${newSize}px`;
    
    // Si c'est un emoji textuel, ajuster la taille de police
    if (!selectedSymbol.querySelector('img')) {
        selectedSymbol.style.fontSize = `${newSize}px`;
    } else {
        // Si c'est une image, ajuster les dimensions de l'image
        const img = selectedSymbol.querySelector('img');
        if (img) {
            img.style.width = `${newSize}px`;
            img.style.height = `${newSize}px`;
        }
    }
    
    saveCardsState();
}

// Fonction pour ajuster la rotation
function updateRotation(e) {
    if (!selectedSymbol || !editMode) return;
    
    const rotation = parseInt(e.target.value);
    const rotationValue = document.getElementById("emojiRotationValue");
    if (rotationValue) rotationValue.textContent = rotation;
    
    // Mettre à jour la rotation du symbole
    selectedSymbol.style.transform = `rotate(${rotation}deg)`;
    
    // Sauvegarder l'état
    saveCardsState();
}

// Fonction pour sauvegarder l'état des cartes
function saveCardsState() {
    const cardContainer = document.getElementById("cardContainer");
    if (!cardContainer) return;
    
    localStorage.setItem("cardsGenerated", "true");
    localStorage.setItem("cardsHTML", cardContainer.innerHTML);
    
    const symbols = cardContainer.querySelectorAll(".symbol");
    const symbolsState = Array.from(symbols).map(symbol => ({
        fontSize: symbol.style.fontSize,
        lineHeight: symbol.style.lineHeight,
        transform: symbol.style.transform,
        left: symbol.style.left,
        top: symbol.style.top
    }));
    
    localStorage.setItem("symbolsState", JSON.stringify(symbolsState));
}

// Fonction pour restaurer l'état des cartes
function restoreCardsState() {
    const cardContainer = document.getElementById("cardContainer");
    if (!cardContainer) return;
    
    const isGenerated = localStorage.getItem("cardsGenerated") === "true";
    
    if (isGenerated) {
        const savedHTML = localStorage.getItem("cardsHTML");
        const symbolsState = JSON.parse(localStorage.getItem("symbolsState") || "[]");
        
        if (savedHTML) {
            cardContainer.innerHTML = savedHTML;
            cardsGenerated = true;
            
            const symbols = cardContainer.querySelectorAll(".symbol");
            symbols.forEach((symbol, index) => {
                if (symbolsState[index]) {
                    symbol.style.fontSize = symbolsState[index].fontSize;
                    symbol.style.lineHeight = symbolsState[index].lineHeight;
                    symbol.style.transform = symbolsState[index].transform;
                    symbol.style.left = symbolsState[index].left;
                    symbol.style.top = symbolsState[index].top;
                }
                enableDrag(symbol);
            });
            
            return true;
        }
    }
    return false;
}

// Fonction pour afficher les contrôles de taille
function showSizeControl() {
    // Afficher le panneau de contrôle de taille/rotation 
    const sizeControl = document.getElementById('sizeControl');
    if (sizeControl) {
        sizeControl.style.display = 'block';
    }
    
    // Afficher également les contrôles de taille globale (min/max)
    const cardCustomization = document.querySelector('.card-customization');
    if (cardCustomization) {
        cardCustomization.style.display = 'block';
    }
}

// Fonction pour cacher les contrôles de taille
function hideSizeControl() {
    // Cacher le panneau de contrôle de taille/rotation
    const sizeControl = document.getElementById('sizeControl');
    if (sizeControl) {
        sizeControl.style.display = 'none';
    }
    
    // Cacher également les contrôles de taille globale (min/max)
    const cardCustomization = document.querySelector('.card-customization');
    if (cardCustomization) {
        cardCustomization.style.display = 'none';
    }
}

// Fonction pour initialiser les contrôles de taille globale
function initializeSizeControls() {
    const minSizeSlider = document.getElementById('minSize');
    const maxSizeSlider = document.getElementById('maxSize');
    const minSizeValue = document.getElementById('minSizeValue');
    const maxSizeValue = document.getElementById('maxSizeValue');

    if (minSizeSlider && maxSizeSlider && minSizeValue && maxSizeValue) {
        // Initialiser les valeurs
        minSizeSlider.value = 40;
        maxSizeSlider.value = 100;
        minSizeValue.textContent = minSizeSlider.value;
        maxSizeValue.textContent = maxSizeSlider.value;

        // Gestionnaires d'événements pour les curseurs
        minSizeSlider.addEventListener('input', function(e) {
            const value = parseInt(e.target.value);
            minSizeValue.textContent = value;
            
            // Mettre à jour tous les émojis avec la nouvelle taille minimale
            document.querySelectorAll('.symbol').forEach(symbol => {
                // Pour les émojis textuels
                symbol.style.fontSize = `${value}px`;
                
                // Pour les images uploadées
                const img = symbol.querySelector('img');
                if (img) {
                    img.style.width = `${value}px`;
                    img.style.height = `${value}px`;
                }
            });
            saveCardsState();
        });

        maxSizeSlider.addEventListener('input', function(e) {
            const value = parseInt(e.target.value);
            maxSizeValue.textContent = value;
            
            // Mettre à jour tous les émojis avec la nouvelle taille maximale
            document.querySelectorAll('.symbol').forEach(symbol => {
                // Pour les émojis textuels
                symbol.style.fontSize = `${value}px`;
                
                // Pour les images uploadées
                const img = symbol.querySelector('img');
                if (img) {
                    img.style.width = `${value}px`;
                    img.style.height = `${value}px`;
                }
            });
            saveCardsState();
        });
    }
}

// Configuration initiale des curseurs
function initCursors() {
    minSizeValue = parseInt(document.getElementById("minSize")?.value || "30", 10);
    maxSizeValue = parseInt(document.getElementById("maxSize")?.value || "70", 10);
    
    const minSizeValueText = document.getElementById("minSizeValue");
    const maxSizeValueText = document.getElementById("maxSizeValue");
    
    if (minSizeValueText) minSizeValueText.textContent = minSizeValue;
    if (maxSizeValueText) maxSizeValueText.textContent = maxSizeValue;
}

// Fonction pour mettre en place tous les écouteurs d'événements
function setupEventListeners() {
    // Bouton de génération
    const generateButton = document.getElementById("generateBtn");
    if (generateButton) {
        generateButton.addEventListener("click", generateCards);
    }
    
    // Bouton d'impression
    const printButton = document.getElementById("printButton");
    if (printButton) {
        printButton.addEventListener("click", printCards);
    }
    
    // Curseurs de taille des émojis
    const minSizeSlider = document.getElementById("minSize");
    const maxSizeSlider = document.getElementById("maxSize");
    const minSizeValueDisplay = document.getElementById("minSizeValue");
    const maxSizeValueDisplay = document.getElementById("maxSizeValue");

    if (minSizeSlider && minSizeValueDisplay) {
        minSizeSlider.addEventListener('input', function(e) {
            const value = parseInt(e.target.value);
            minSizeValueDisplay.textContent = value;
            minSizeValue = value;
            
            // Mettre à jour tous les émojis avec la nouvelle taille minimale
            document.querySelectorAll('.symbol').forEach(symbol => {
                // Pour les émojis textuels
                symbol.style.fontSize = `${value}px`;
                
                // Pour les images uploadées
                const img = symbol.querySelector('img');
                if (img) {
                    img.style.width = `${value}px`;
                    img.style.height = `${value}px`;
                }
            });
            saveCardsState();
        });
    }

    if (maxSizeSlider && maxSizeValueDisplay) {
        maxSizeSlider.addEventListener('input', function(e) {
            const value = parseInt(e.target.value);
            maxSizeValueDisplay.textContent = value;
            maxSizeValue = value;
            
            // Mettre à jour tous les émojis avec la nouvelle taille maximale
            document.querySelectorAll('.symbol').forEach(symbol => {
                // Pour les émojis textuels
                symbol.style.fontSize = `${value}px`;
                
                // Pour les images uploadées
                const img = symbol.querySelector('img');
                if (img) {
                    img.style.width = `${value}px`;
                    img.style.height = `${value}px`;
                }
            });
            saveCardsState();
        });
    }
    
    // Boutons de forme des cartes
    const squareShapeButton = document.getElementById("squareShape");
    const circleShapeButton = document.getElementById("circleShape");
    
    if (squareShapeButton && circleShapeButton) {
        squareShapeButton.addEventListener("click", function() {
            changeCardShape('square');
        });
        
        circleShapeButton.addEventListener("click", function() {
            changeCardShape('round');
        });
    }
    
    // Écouteurs pour les contrôles d'édition individuels (taille et rotation)
    const emojiSizeSlider = document.getElementById("emojiSize");
    const emojiRotationSlider = document.getElementById("emojiRotation");
    
    if (emojiSizeSlider) {
        emojiSizeSlider.addEventListener("input", updateSize);
    }
    
    if (emojiRotationSlider) {
        emojiRotationSlider.addEventListener("input", updateRotation);
    }
    
    // Bouton de basculement du mode édition
    const editToggle = document.getElementById("editModeToggle");
    if (editToggle) {
        editToggle.addEventListener("click", toggleEditMode);
    }
    
    // Masquer les contrôles d'édition si on clique ailleurs
    document.addEventListener("click", function(e) {
        if (!editMode) return;
        
        if (!e.target.closest(".symbol") && !e.target.closest("#sizeControl")) {
            const sizeControl = document.getElementById("sizeControl");
            if (sizeControl) {
                sizeControl.style.display = "none";
            }
            
            if (selectedSymbol) {
                selectedSymbol.classList.remove("selected");
                selectedSymbol = null;
            }
        }
    });
}

// Fonction pour basculer le mode édition
function toggleEditMode() {
    editMode = !editMode;
    document.getElementById("editModeToggle").textContent = editMode ? "Désactiver l'édition" : "Activer l'édition";
    
    // Basculer les classes CSS pour l'interface
    document.body.classList.toggle("edit-mode", editMode);
    
    // Afficher ou masquer les curseurs en mode édition
    const sizeControl = document.getElementById("sizeControl");
    if (sizeControl) {
        sizeControl.style.display = "none";
    }
    
    // Désélectionner le symbole actuel
    if (selectedSymbol) {
        selectedSymbol.classList.remove("selected");
        selectedSymbol = null;
    }
    
    // Afficher ou masquer les contrôles d'édition globaux
    const editorControls = document.getElementById("editorControls");
    if (editorControls) {
        editorControls.style.display = editMode ? "block" : "none";
    }
}

// Fonction pour changer la forme des cartes
function changeCardShape(shape) {
    // Mettre à jour la variable globale
    cardShape = shape;
    
    // Mettre à jour les boutons
    const squareButton = document.getElementById("squareShape");
    const circleButton = document.getElementById("circleShape");
    
    if (squareButton && circleButton) {
        if (shape === 'square') {
            squareButton.classList.add('active');
            circleButton.classList.remove('active');
        } else {
            circleButton.classList.add('active');
            squareButton.classList.remove('active');
        }
    }
    
    // Appliquer la forme aux cartes existantes
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        if (shape === 'round') {
            card.classList.add('round');
        } else {
            card.classList.remove('round');
        }
    });
    
    // Sauvegarder la préférence de forme dans le localStorage
    localStorage.setItem('cardShape', shape);
    
    // Si des cartes sont déjà générées, les régénérer pour repositionner les symboles
    if (cardsGenerated) {
        // Régénérer les cartes pour que les symboles soient correctement positionnés
        generateCards();
    }
}

// Restaurer la forme des cartes depuis le localStorage
function restoreCardShape() {
    const savedShape = localStorage.getItem('cardShape');
    if (savedShape) {
        cardShape = savedShape;
        
        // Mettre à jour les boutons
        const squareButton = document.getElementById("squareShape");
        const circleButton = document.getElementById("circleShape");
        
        if (squareButton && circleButton) {
            if (savedShape === 'round') {
                circleButton.classList.add('active');
                squareButton.classList.remove('active');
            } else {
                squareButton.classList.add('active');
                circleButton.classList.remove('active');
            }
        }
    }
}

// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', function() {
    // Initialiser les contrôles
    const editButton = document.getElementById('editModeBtn');
    const downloadButton = document.getElementById('downloadPDF');
    const exportButton = document.getElementById('downloadZIP');
    const generateButton = document.getElementById('generateBtn');
    
    // Initialiser les contrôles de taille globale
    initializeSizeControls();
    
    // Restaurer la forme des cartes
    restoreCardShape();
    
    // Gestionnaire pour le bouton d'édition
    if (editButton) {
        editButton.addEventListener('click', function() {
            editMode = !editMode;
            document.body.classList.toggle('edit-mode');
            editButton.innerHTML = editMode ? '<i class="fas fa-check"></i> Terminer' : '<i class="fas fa-pencil-alt"></i> Mode édition';
            
            if (editMode) {
                // En mode édition, activer le glisser-déposer sur tous les symboles
                const symbols = document.querySelectorAll('.symbol');
                symbols.forEach(symbol => {
                    enableDrag(symbol);
                });
                
                // Afficher les contrôles de personnalisation
                showSizeControl();
            } else {
                // Quitter le mode édition : masquer les contrôles
                hideSizeControl();
                if (selectedSymbol) {
                    selectedSymbol.classList.remove('selected');
                    selectedSymbol = null;
                }
            }
        });
    }
    
    // Gestionnaire pour le bouton de génération
    if (generateButton) {
        generateButton.addEventListener('click', generateCards);
    }
    
    // Gestionnaire pour le bouton de téléchargement
    if (downloadButton) {
        downloadButton.addEventListener('click', downloadCardsAsPDF);
    }
    
    // Gestionnaire pour le bouton d'export
    if (exportButton) {
        exportButton.addEventListener('click', exportCardsAsZip);
    }
    
    // Gestionnaires pour les curseurs de taille et rotation
    const emojiSize = document.getElementById('emojiSize');
    const emojiRotation = document.getElementById('emojiRotation');
    
    if (emojiSize) {
        emojiSize.addEventListener('input', updateSize);
    }
    
    if (emojiRotation) {
        emojiRotation.addEventListener('input', updateRotation);
    }
    
    // Essayer de restaurer l'état précédent ou générer de nouvelles cartes
    if (!restoreCardsState()) {
        generateCards();
    }
    
    // Ajouter les écouteurs d'événements pour les contrôles d'édition
    setupEventListeners();
    initCursors();
});

// Rendre la fonction generateCards accessible globalement
window.generateCards = generateCards;
