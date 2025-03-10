// Fonction pour télécharger les cartes en PDF
async function downloadCardsAsPDF() {
  try {
      const cardContainer = document.getElementById("cardContainer");
      const cards = cardContainer.querySelectorAll(".card");
      const loadingOverlay = document.getElementById("loadingOverlay");

      if (cards.length === 0) {
          alert("Aucune carte à télécharger. Veuillez d'abord générer les cartes.");
          return;
      }

      // Afficher l'overlay de chargement
      loadingOverlay.style.display = "flex";

      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4"
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const cardSize = 85;
      const margin = 10;
      const cardsPerRow = 2;
      const cardsPerCol = 3;
      const cardsPerPage = cardsPerRow * cardsPerCol;

      // Calculer les positions pour centrer les cartes sur la page
      const contentWidth = cardsPerRow * cardSize + (cardsPerRow - 1) * margin;
      const contentHeight = cardsPerCol * cardSize + (cardsPerCol - 1) * margin;
      const startX = (pageWidth - contentWidth) / 2;
      const startY = (pageHeight - contentHeight) / 2;

      // Vérifier s'il existe un dos de carte personnalisé
      let cardBackImage = null;
      const customCardBackImage = localStorage.getItem("cardBackImage");
      
      if (customCardBackImage) {
          // Utiliser le dos de carte personnalisé
          cardBackImage = customCardBackImage;
          console.log("Utilisation du dos de carte personnalisé");
      } else {
          // Créer un dos de carte par défaut
          try {
              // Créer un dos de carte avec un design simple
              const cardBack = document.createElement("div");
              cardBack.classList.add("card");
              cardBack.style.display = "flex";
              cardBack.style.alignItems = "center";
              cardBack.style.justifyContent = "center";
              cardBack.style.backgroundColor = "#007BFF";
              cardBack.style.borderRadius = "50%";
              cardBack.style.width = "200px";
              cardBack.style.height = "200px";
              
              // Ajouter un texte au lieu d'une image pour plus de fiabilité
              const textElement = document.createElement("div");
              textElement.textContent = "DOBBLE";
              textElement.style.color = "white";
              textElement.style.fontFamily = "Arial, sans-serif";
              textElement.style.fontSize = "32px";
              textElement.style.fontWeight = "bold";
              
              cardBack.appendChild(textElement);
              document.body.appendChild(cardBack);
              
              // Attendre que l'élément soit rendu
              await new Promise(resolve => setTimeout(resolve, 100));
              
              // Capturer le dos de carte
              const backCanvas = await html2canvas(cardBack, { 
                  scale: 2,
                  backgroundColor: null,
                  logging: false,
                  useCORS: true
              });
              cardBackImage = backCanvas.toDataURL("image/png");
              
              // Supprimer l'élément temporaire
              document.body.removeChild(cardBack);
          } catch (error) {
              console.error("Erreur lors de la création du dos de carte:", error);
              // Créer un dos de carte de secours en cas d'erreur
              cardBackImage = createFallbackCardBack();
          }
      }

      // Calculer le nombre total de pages nécessaires
      const totalPages = Math.ceil(cards.length / cardsPerPage);
      
      // Préparer les images des cartes à l'avance
      const cardImages = [];
      for (let i = 0; i < cards.length; i++) {
          // Ajouter temporairement une bordure noire plus épaisse pour l'export
          const originalBorder = cards[i].style.border;
          cards[i].style.border = '3px solid black';
          
          const canvas = await html2canvas(cards[i], { 
              scale: 2,
              backgroundColor: 'white',
              logging: false
          });
          
          // Restaurer la bordure d'origine
          cards[i].style.border = originalBorder;
          
          // Ne pas ajouter de bordure supplémentaire sur le canvas
          cardImages.push(canvas.toDataURL("image/png"));
      }
      
      // Organiser les cartes pour l'impression recto-verso
      // Pour chaque page recto, nous créons une page verso correspondante
      for (let page = 0; page < totalPages; page++) {
          // Nombre de cartes sur cette page
          const cardsOnThisPage = Math.min(cardsPerPage, cards.length - page * cardsPerPage);
          
          // Page recto (cartes avant)
          if (page > 0) {
              pdf.addPage();
          }
          
          // Ajouter les cartes recto
          for (let i = 0; i < cardsOnThisPage; i++) {
              const cardIndex = page * cardsPerPage + i;
              const row = Math.floor(i / cardsPerRow);
              const col = i % cardsPerRow;
              
              const x = startX + col * (cardSize + margin);
              const y = startY + row * (cardSize + margin);
              
              pdf.addImage(cardImages[cardIndex], "PNG", x, y, cardSize, cardSize);
          }
          
          // Page verso (dos des cartes)
          // Ajouter une nouvelle page pour les dos
          pdf.addPage();
          
          // Pour l'impression recto-verso, nous devons inverser l'ordre des cartes sur la page verso
          // afin qu'elles s'alignent correctement avec les cartes recto lors de l'impression
          for (let i = 0; i < cardsOnThisPage; i++) {
              // Calculer la position inversée pour l'impression recto-verso
              // Pour une page A4 en portrait avec 2 colonnes, nous inversons les colonnes
              const row = Math.floor(i / cardsPerRow);
              const col = cardsPerRow - 1 - (i % cardsPerRow); // Inverser les colonnes
              
              const x = startX + col * (cardSize + margin);
              const y = startY + row * (cardSize + margin);
              
              if (cardBackImage) {
                  pdf.addImage(cardBackImage, "PNG", x, y, cardSize, cardSize);
              }
          }
      }

      pdf.save("dobble_cards_recto_verso.pdf");
      loadingOverlay.style.display = "none";
  } catch (error) {
      console.error("Erreur lors du téléchargement du PDF:", error);
      alert("Une erreur est survenue lors du téléchargement du PDF.");
      document.getElementById("loadingOverlay").style.display = "none";
  }
}

// Fonction de secours pour créer un dos de carte en cas d'échec de html2canvas
function createFallbackCardBack() {
    // Créer un canvas pour dessiner le dos de carte
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    
    // Dessiner un cercle bleu
    ctx.beginPath();
    ctx.arc(200, 200, 200, 0, 2 * Math.PI);
    ctx.fillStyle = '#007BFF';
    ctx.fill();
    
    // Ajouter du texte
    ctx.font = 'bold 64px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('DOBBLE', 200, 200);
    
    return canvas.toDataURL('image/png');
}

// Fonction pour exporter les cartes en ZIP
async function exportCardsAsZip() {
  try {
      const cardContainer = document.getElementById("cardContainer");
      const cards = cardContainer.querySelectorAll(".card");
      const loadingOverlay = document.getElementById("loadingOverlay");

      if (cards.length === 0) {
          alert("Aucune carte à exporter. Veuillez d'abord générer les cartes.");
          return;
      }

      // Afficher l'overlay de chargement
      loadingOverlay.style.display = "flex";

      const zip = new JSZip();
      const folder = zip.folder("Cartes_Dobble");

      for (let i = 0; i < cards.length; i++) {
          const canvas = await html2canvas(cards[i], { scale: 2 });
          const imgData = canvas.toDataURL("image/png");
          folder.file(`carte_${i + 1}.png`, imgData.split(",")[1], { base64: true });
      }

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "cartes_dobble.zip");
      loadingOverlay.style.display = "none";
  } catch (error) {
      console.error("Erreur lors de l'export en ZIP:", error);
      alert("Une erreur est survenue lors de l'export en ZIP.");
      document.getElementById("loadingOverlay").style.display = "none";
  }
}
