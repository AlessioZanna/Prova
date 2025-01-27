/* ----------------------------------------------------------------------------------------------------------- menu home page */

// Funzione per aprire il menu e applicare l'overlay
function openHomeMenu() {
  document.getElementById("right-page").style.transform = "translateX(0)";
  document.getElementById("right-page").style.display = "block";
  document.getElementById("home-overlay").style.display = "block"; // Mostra l'overlay
  document.getElementById("home-page").classList.add("blur"); // Applica la classe di opacità
  document.querySelector(".menu-icon").classList.add("hidden"); // Nascondi l'icona del menu
}

// Funzione per chiudere il menu e rimuovere l'overlay
function closeHomeMenu() {
  document.getElementById("right-page").style.transform = "translateX(100%)";
  document.getElementById("home-overlay").style.display = "none"; // Nascondi l'overlay
  document.getElementById("home-page").classList.remove("blur"); // Rimuovi la classe di opacità
  document.querySelector(".menu-icon").classList.remove("hidden"); // Mostra l'icona del menu
}

function openChatMenu() {
  document.getElementById("chat-page").style.display = "none";
  document.getElementById("settings-page").style.display = "flex";
}

function goBackFromSettings() {
  document.getElementById("settings-page").style.display = "none";
  document.getElementById("chat-page").style.display = "flex";
}

function toggleMenu() {
  const menu = document.getElementById("menu");
  const menuIcon = document.getElementById("menu-icon");

  if (menu.style.transform === "translateX(0%)") {
    menu.style.transform = "translateX(100%)"; // Chiudi il menu
    menuIcon.style.display = "block"; // Rendi visibile l'icona del menu
  } else {
    menu.style.transform = "translateX(0%)"; // Apre il menu
    menuIcon.style.display = "none"; // Nascondi l'icona del menu
  }
}

function closeMenu() {
  const menu = document.getElementById("menu");
  const menuIcon = document.getElementById("menu-icon");
  menu.style.transform = "translateX(100%)"; // Chiudi il menu
  menuIcon.style.display = "block"; // Rendi visibile l'icona del menu
}


/* ----------------------------------------------------------------------------------------------------------- tasto crea backup chat */
backupButton.addEventListener("click", () => {
    const transaction = db.transaction(["chats"], "readonly");
    const objectStore = transaction.objectStore("chats");
  
    const request = objectStore.getAll();
  
    request.onsuccess = function (event) {
      const chats = event.target.result;
      const jsonBackup = JSON.stringify(chats);
  
      const blob = new Blob([jsonBackup], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "backup_chats.json";
      a.click();
      URL.revokeObjectURL(url);
    };
  });

  /* --------------------------------------------------------------------------------------------------------- tasto carica backup chat */
  restoreButton.addEventListener("click", () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".json";
    fileInput.click();
  
    fileInput.addEventListener("change", (event) => {
      const file = event.target.files[0];
      const reader = new FileReader();
  
      reader.onload = function (e) {
        const backupData = JSON.parse(e.target.result);
  
        deleteAllChats();
        backupData.forEach(chat => {
          saveChat(chat);
        });
  
        loadChats();
      };
  
      reader.readAsText(file);
    });
  });
  
/* ------------------------------------------------------------------------------------------------------------- tasto cancella chat */
  deleteAllButton.addEventListener("click", () => {
    if (confirm("Sei sicuro di voler cancellare tutte le chat e le note?")) {
      deleteAllChats();
      loadChats();
    }
  });
  
  // Funzione per eliminare tutte le chat
  function deleteAllChats() {
    const transaction = db.transaction(["chats"], "readwrite");
    const objectStore = transaction.objectStore("chats");
    const request = objectStore.clear();
  
    request.onsuccess = function () {
      console.log("Tutte le chat sono state cancellate");
    };
  
    request.onerror = function (event) {
      console.log("Errore nell'eliminare tutte le chat:", event);
    };
  }
  
  /* ------------------------------------------------------------------------------------------------------------- tasti cambia colore */
  function changeAppColors(oldColor, newColor) {
    const elements = document.querySelectorAll('*');
    elements.forEach(element => {
      const computedStyle = getComputedStyle(element);
      ['backgroundColor', 'color', 'borderColor'].forEach(property => {
        if (computedStyle[property] === oldColor) {
          element.style[property] = newColor;
        }
      });
    });
  
    const styleSheets = Array.from(document.styleSheets);
    styleSheets.forEach(styleSheet => {
      try {
        const rules = styleSheet.cssRules || [];
        Array.from(rules).forEach(rule => {
          if (rule.style) {
            ['background-color', 'color', 'border-color'].forEach(property => {
              if (rule.style[property] === oldColor) {
                rule.style[property] = newColor;
              }
            });
          }
        });
      } catch (error) {
        console.warn(`Non è stato possibile accedere a ${styleSheet.href}`);
      }
    });
  }
  
  // Aggiunge un listener per il click del pulsante
document.getElementById('changeColorButton1').addEventListener('click', () => {
    changeAppColors('rgb(236, 64, 79)', 'rgb(0, 123, 255)');
    changeAppColors('rgb(0, 255, 157)', 'rgb(0, 123, 255)');
  });
  
  // Aggiunge un listener per il click del pulsante
  document.getElementById('changeColorButton2').addEventListener('click', () => {
    changeAppColors('rgb(236, 64, 79)', 'rgb(0, 255, 157)');
    changeAppColors('rgb(0, 123, 255)', 'rgb(0, 255, 157)');
  });
  
  // Aggiunge un listener per il click del pulsante
  document.getElementById('changeColorButton3').addEventListener('click', () => {
    changeAppColors('rgb(0, 123, 255)', 'rgb(236, 64, 79)');
    changeAppColors('rgb(0, 255, 157)', 'rgb(236, 64, 79)');
  });
