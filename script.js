/* INIT ---------------------------------------------------------------------------------------------------------------------------- */

// Elementi della pagina
const homePage = document.getElementById("home-page");
const chatPage = document.getElementById("chat-page");
const chatList = document.getElementById("chat-list");
const noteContainer = document.getElementById("note-container");
const addChatButton = document.getElementById("add-chat");
const backButton = document.getElementById("back-button");
const chatTitle = document.getElementById("chat-title");
const backupButton = document.getElementById("backup-button");
const restoreButton = document.getElementById("restore-button");
const deleteAllButton = document.getElementById("delete-all-button");

// Variabile globale per tracciare la chat corrente
let currentChatName = "";

// Configurazione IndexedDB
const dbName = "musicNotesApp";
let db;

const request = indexedDB.open(dbName, 1);

request.onerror = function (event) {
  console.log("Errore nell'aprire il database IndexedDB:", event);
};

request.onsuccess = function (event) {
  db = event.target.result;
  loadChats(); // Carica le chat appena il database è pronto
};

request.onupgradeneeded = function (event) {
  db = event.target.result;
  if (!db.objectStoreNames.contains("chats")) {
    db.createObjectStore("chats", { keyPath: "name" });
  }
};

/* HOME PAGE & CHAT PAGE ---------------------------------------------------------------------------------------------------------- */

// Elemento della barra di ricerca
const searchBar = document.querySelector(".search-bar1");

// Funzione per cercare chat
searchBar.addEventListener("input", () => {
  const searchQuery = searchBar.value.toLowerCase();
  const chatItems = chatList.getElementsByClassName("chat-item");

  Array.from(chatItems).forEach(item => {
    const chatName = item.querySelector("span").textContent.toLowerCase();
    const artistName = item.querySelector(".artist-name") ? item.querySelector(".artist-name").textContent.toLowerCase() : "";
    if (chatName.includes(searchQuery) || artistName.includes(searchQuery)) {
      item.style.display = ""; // Mostra l'elemento
    } else {
      item.style.display = "none"; // Nascondi l'elemento
    }
  });
});

// Funzione per far partire l'app dalla home page
document.addEventListener("DOMContentLoaded", () => {
  homePage.style.display = "block";
  chatPage.style.display = "none";
});

// Funzione per aprire una chat
function openChat(name) {
  currentChatName = name; // Aggiorna la chat corrente
  homePage.style.display = "none";
  chatPage.style.display = "block";
  chatTitle.innerText = name;

  noteContainer.innerHTML = ""; // Pulire il contenitore delle note

  loadNotes(); // Caricare le note specifiche per questa chat
}

// Tornare alla homepage
backButton.addEventListener("click", () => {
  currentChatName = ""; // Resetta la chat corrente
  chatPage.style.display = "none";
  homePage.style.display = "block";
});

// Aggiungere una nuova chat
addChatButton.addEventListener("click", () => {
  const chatName = prompt("Inserisci il nome della chat:");
  if (!chatName) {
    return; // Interrompe l'esecuzione se il nome della chat non è stato inserito
  }

  const artistName = prompt("Di chi è la canzone:");
  if (!artistName) {
    return; // Interrompe l'esecuzione se il nome dell'artista non è stato inserito
  }

  // Creazione dell'elemento chat solo se entrambi i campi sono compilati
  const chatItem = document.createElement("div");
  chatItem.classList.add("chat-item");
  chatItem.innerHTML = ` 
    <div class="chat-square"></div> <!-- Quadrato bianco -->
    <div style="display: flex; flex-direction: column;">
      <span>${chatName}</span>
      <span>${artistName}</span>
      <button onclick="deleteChat(this)" class="canc">X</button> <!-- Bottone per eliminare la chat -->
    </div>
  `;

  // Aggiungiamo l'evento per aprire la chat quando viene cliccata
  chatItem.addEventListener("click", () => openChat(chatName));
  chatList.appendChild(chatItem); // Aggiungiamo la chat alla lista delle chat

  // Crea la chat vuota e salva
  const newChat = {
    name: chatName,
    artist: artistName, // Salviamo anche l'artista
    notes: [{ title: "Titolo iniziale", text: "Testo iniziale" }]
  };

  saveChat(newChat);
  openChat(chatName);
});


// Eliminare una chat
function deleteChat(button) {
  const chatName = button.parentElement.querySelector("span").textContent; // Otteniamo il nome della chat da eliminare
  deleteChatData(chatName); // Rimuoviamo i dati della chat
  button.parentElement.remove(); // Rimuoviamo l'elemento HTML della chat
}

// Aggiungere un nuovo blocco di note
function addNoteBlock(title = "Titolo...", text = "Testo...") {
  const noteBlock = document.createElement("div"); // Creiamo un nuovo blocco di nota
  noteBlock.classList.add("note-block"); // Aggiungiamo la classe per il blocco di nota

  // AGGIUNTA Generiamo un ID univoco per il blocco
  /*   const noteBlockId = `note-${new Date().getTime()}`;
    noteBlock.setAttribute("id", noteBlockId);  */// Assegniamo l'ID al blocco

  const noteTitle = document.createElement("div"); // Creiamo il titolo della nota
  noteTitle.classList.add("note-title"); // Aggiungiamo la classe per il titolo
  noteTitle.contentEditable = true; // Impostiamo il titolo come modificabile
  noteTitle.textContent = title; // Impostiamo il titolo iniziale

  const noteText = document.createElement("div");
  noteText.classList.add("note-text");
  noteText.contentEditable = true;
  noteText.textContent = text;


// Crea il pulsante di trascinamento per spostare il blocco
const dragHandle = document.createElement("div");
dragHandle.classList.add("drag-handle");
dragHandle.innerHTML = ` 
<div class="contai"></div> 
`;

// Aggiungiamo il pulsante di trascinamento al blocco
noteBlock.appendChild(dragHandle);

// Disabilitiamo il drag nativo del blocco
noteBlock.setAttribute("draggable", false);

// Aggiungiamo il supporto touch per il drag handle
dragHandle.addEventListener("touchstart", (event) => {
  event.preventDefault();

  const touch = event.touches[0];
  const startX = touch.clientX;
  const startY = touch.clientY;

  const blockRect = noteBlock.getBoundingClientRect();
  const offsetX = startX - blockRect.left;
  const offsetY = startY - blockRect.top;

  // Aggiungiamo uno stile temporaneo al blocco durante il trascinamento
  noteBlock.classList.add("dragging");
  /* noteBlock.style.position = "absolute";
  noteBlock.style.zIndex = "1000"; */

  const containerRect = noteContainer.getBoundingClientRect();

  const moveHandler = (moveEvent) => {
    const moveTouch = moveEvent.touches[0];
    const newX = moveTouch.clientX - offsetX;
    const newY = moveTouch.clientY - offsetY;

    // Mantieni il blocco entro i limiti del contenitore
    const boundedX = Math.max(containerRect.left, Math.min(newX, containerRect.right - blockRect.width));
    const boundedY = Math.max(containerRect.top, Math.min(newY, containerRect.bottom - blockRect.height));

    // Aggiorna posizione visiva del blocco
    noteBlock.style.left = `${boundedX - containerRect.left}px`;
    noteBlock.style.top = `${boundedY - containerRect.top}px`;

    // Calcola la posizione e inserisce dinamicamente il blocco
    const afterElement = getDragAfterElement(noteContainer, moveTouch.clientY);
    if (afterElement == null) {
      noteContainer.appendChild(noteBlock); // Se nessun elemento trovato, aggiungi alla fine
    } else {
      noteContainer.insertBefore(noteBlock, afterElement); // Inserisci prima del blocco target
    }
  };

  const endHandler = () => {
    // Ripristina stile iniziale
    noteBlock.classList.remove("dragging");
    noteBlock.style.position = "static";
    noteBlock.style.zIndex = "";

    // Rimuovi gli eventi di trascinamento
    document.removeEventListener("touchmove", moveHandler);
    document.removeEventListener("touchend", endHandler);

    // Salva la nuova disposizione (funzione da implementare)
    saveNotes();
  };

  // Aggiungi eventi per movimento e rilascio
  document.addEventListener("touchmove", moveHandler, { passive: false });
  document.addEventListener("touchend", endHandler);
}, { passive: false });

// Funzione per trovare l'elemento dopo il quale inserire il blocco
function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll(".note-block:not(.dragging)")];

  console.log(draggableElements); // Debug: vedi gli altri blocchi di note

  let closest = null;
  let closestOffset = Number.POSITIVE_INFINITY;

  draggableElements.forEach((child) => {
    const box = child.getBoundingClientRect();
    const offset = y - (box.top + box.height / 2);

    if (offset < 0 && Math.abs(offset) < closestOffset) {
      closestOffset = Math.abs(offset);
      closest = child;
    }
  });

  console.log(closest); // Debug: vedi quale blocco è più vicino
  return closest;
}




/* ----------------------------------------------------------------------------------------------------------------------------- */

const rec = document.createElement("div");
rec.classList.add("rec");

rec.innerHTML = `
<div class="contai2"></div>
`;
noteBlock.appendChild(rec);

let isRecording = false;
let isTriangle = false;
let recorder;
let audioContext;

// Gestione eventi per desktop e mobile
const startEvent = "ontouchstart" in window ? "touchstart" : "click";

rec.addEventListener(startEvent, () => {
  if (!isTriangle) {
    if (!isRecording) {
      checkMicrophonePermission().then((hasPermission) => {
        if (hasPermission) {
          startRecording();
        } else {
          alert("Devi consentire l'accesso al microfono per registrare.");
        }
      });
    } else {
      stopRecording();
    }
  }
});

rec.addEventListener("mousedown", () => {
  if (isTriangle) {
    setTimeout(() => {
      if (rec.matches(":active")) {
        const confirmDelete = confirm("Vuoi cancellare la registrazione?");
        if (confirmDelete) {
          resetButton();
        }
      }
    }, 1000);
  }
});

function checkMicrophonePermission() {
  return navigator.permissions.query({ name: "microphone" }).then((permissionStatus) => {
    console.log("Permesso microfono:", permissionStatus.state);
    return permissionStatus.state === "granted" || permissionStatus.state === "prompt";
  }).catch((err) => {
    console.error("Errore durante il controllo dei permessi:", err);
    return false;
  });
}

function startRecording() {
  console.log("Tentativo di accesso al microfono...");
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then((stream) => {
      console.log("Accesso al microfono riuscito.");
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const input = audioContext.createMediaStreamSource(stream);

      recorder = new Recorder(input); // Assicurati di avere il file "recorder.js"
      recorder.record();

      isRecording = true;
      console.log("Registrazione avviata.");
    })
    .catch((err) => {
      console.error("Errore nell'accesso al microfono:", err);
      alert(`Errore: ${err.name} - ${err.message}`);
    });
}

function stopRecording() {
  if (recorder) {
    recorder.stop();
    isRecording = false;
    isTriangle = true;
    rec.classList.add("triangle");
    rec.textContent = "";

    recorder.exportWAV((blob) => {
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      audio.play();
      console.log("Registrazione completata e riprodotta.");
    });

    console.log("Registrazione interrotta.");
  }
}

function resetButton() {
  isRecording = false;
  isTriangle = false;
  rec.classList.remove("triangle");
  rec.textContent = "rec";
  console.log("Registrazione cancellata.");
}


  /* ----------------------------------------------------------------------------------------------------------------------------- */


  // Aggiungere il pulsante di cancellazione (X)
  const deleteButton = document.createElement("button");
  deleteButton.classList.add("delete-btn");
  deleteButton.innerHTML = "&#10006;";
  deleteButton.addEventListener("click", () => {
    const allNoteBlocks = document.querySelectorAll(".note-block");

    if (allNoteBlocks.length > 1) {
      if (confirm("Sei sicuro di voler eliminare questo paragrafo?")) {
        noteBlock.remove();
        saveNotes();
      }
    } else {
      if (confirm("Non puoi eliminare l'unica nota. Vuoi svuotarla e ripristinare i placeholder?")) {
        const noteTitle = noteBlock.querySelector(".note-title");
        const noteText = noteBlock.querySelector(".note-text");
        noteTitle.textContent = "Titolo...";
        noteText.textContent = "Testo...";
        saveNotes();
      }
    }
  });

  // Posiziona la X all'estremità destra del titolo
  const titleWrapper = document.createElement("div");
  titleWrapper.classList.add("note-title-wrapper");
  titleWrapper.appendChild(noteTitle);
  titleWrapper.appendChild(deleteButton);

  // Appendi il titolo, X e testo
  noteBlock.appendChild(titleWrapper);
  noteBlock.appendChild(noteText);
  noteContainer.appendChild(noteBlock);
  noteBlock.appendChild(dragHandle);

  // Salvare le modifiche sui cambiamenti
  const saveOnChange = () => saveNotes();
  noteTitle.addEventListener("input", saveOnChange);
  noteText.addEventListener("input", saveOnChange);

  // Funzionalità 1: il titolo può avere solo una riga
  noteTitle.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      noteText.focus(); // Passa al testo
    }
  });

  // Funzionalità 2: gestione di invio multiplo nella nota
  let enterCount = 0;

  noteText.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      enterCount++;
      if (enterCount === 3) {
        // Cancella gli ultimi due invii e aggiunge un nuovo blocco
        noteText.textContent = noteText.textContent.replace(/\n{2}$/, "");
        const newNoteBlock = addNoteBlock();
        saveNotes();
        enterCount = 0;

        // Passa al titolo del nuovo blocco
        newNoteBlock.querySelector(".note-title").focus();
      } else {
        document.execCommand("insertLineBreak");
      }
    } else {
      enterCount = 0;
    }
  });

  // Gestire il placeholder per noteTitle
  noteTitle.addEventListener("focus", () => {
    if (noteTitle.textContent === "Titolo...") {
      noteTitle.textContent = "";
    }
  });

  // Gestire il placeholder per noteText
  noteText.addEventListener("focus", () => {
    if (noteText.textContent === "Testo...") {
      noteText.textContent = "";
    }
  });

  noteText.addEventListener("blur", () => {
    if (noteText.textContent.trim() === "") {
      noteText.textContent = "Testo...";
    }
  });

  // Gestione del placeholder per il paragrafo di default
  if (noteTitle.textContent === "Titolo iniziale") {
    noteTitle.addEventListener("focus", () => {
      if (noteTitle.textContent === "Titolo iniziale") {
        noteTitle.textContent = "";
      }
    });
    noteTitle.addEventListener("blur", () => {
      if (noteTitle.textContent.trim() === "") {
        noteTitle.textContent = "Titolo iniziale";
      }
    });
  }

  if (noteText.textContent === "Testo iniziale") {
    noteText.addEventListener("focus", () => {
      if (noteText.textContent === "Testo iniziale") {
        noteText.textContent = "";
      }
    });
    noteText.addEventListener("blur", () => {
      if (noteText.textContent.trim() === "") {
        noteText.textContent = "Testo iniziale";
      }
    });
  }

  // Funzionalità per modificare la nota con un solo click
  noteTitle.addEventListener("click", () => {
    noteTitle.contentEditable = true; // Permette di modificare il titolo
    noteTitle.focus();
  });

  noteText.addEventListener("click", () => {
    noteText.contentEditable = true; // Permette di modificare il testo
    noteText.focus();
  });

  return noteBlock;
}

// Caricare le note della chat corrente
function loadNotes() {
  const transaction = db.transaction(["chats"], "readonly");
  const objectStore = transaction.objectStore("chats");

  const request = objectStore.get(currentChatName);

  request.onsuccess = function (event) {
    const chatData = event.target.result;

    if (chatData) {
      chatData.notes.forEach(note => addNoteBlock(note.title, note.text));
    } else {
      addNoteBlock("Titolo iniziale", "Testo iniziale");
      saveNotes();
    }
  };

  request.onerror = function (event) {
    console.log("Errore nel caricamento delle note:", event);
  };
}

// Funzione per caricare tutte le chat nella home page
function loadChats() {
  const transaction = db.transaction(["chats"], "readonly");
  const objectStore = transaction.objectStore("chats");

  const request = objectStore.getAll();

  request.onsuccess = function (event) {
    const chats = event.target.result;

    chatList.innerHTML = ""; // Pulisci la lista esistente

    chats.forEach(chat => {
      const chatItem = document.createElement("div");
      chatItem.classList.add("chat-item");
      chatItem.innerHTML = `
      <div class="chat-square"></div> <!-- Quadrato bianco -->
      <div style="display: flex; flex-direction: column;">
        <span>${chat.name}</span>
        <div class="artist-name">${chat.artist}</div> <!-- Mostra l'artista -->
        <button onclick="deleteChat(this)" class="canc">X</button> <!-- Bottone per eliminare la chat -->
        </div>
        
      `;
      chatItem.addEventListener("click", () => openChat(chat.name));
      chatList.appendChild(chatItem);
    });
  };

  request.onerror = function (event) {
    console.log("Errore nel caricamento delle chat:", event);
  };

}


// Funzione per salvare una chat nel database
function saveChat(chat) {
  const transaction = db.transaction(["chats"], "readwrite");
  const objectStore = transaction.objectStore("chats");

  const request = objectStore.put(chat);

  request.onsuccess = function () {
    console.log("Chat salvata con successo");
  };

  request.onerror = function (event) {
    console.log("Errore nel salvataggio della chat:", event);
  };
}

// Funzione per salvare le note della chat corrente
function saveNotes() {
  const notes = [];
  const noteBlocks = noteContainer.getElementsByClassName("note-block");

  Array.from(noteBlocks).forEach(block => {
    const noteTitle = block.querySelector(".note-title").textContent.trim();
    const noteText = block.querySelector(".note-text").textContent.trim();

    if (noteTitle || noteText) {
      notes.push({ title: noteTitle, text: noteText });
    }
  });

  // Aggiornare le note nella chat corrente
  const transaction = db.transaction(["chats"], "readwrite");
  const objectStore = transaction.objectStore("chats");

  const request = objectStore.get(currentChatName);

  request.onsuccess = function (event) {
    const chatData = event.target.result;
    chatData.notes = notes;
    objectStore.put(chatData);
  };

  request.onerror = function (event) {
    console.log("Errore nel salvataggio delle note:", event);
  };
}


/* MENU HOME PAGE ------------------------------------------------------------------------------------------------------------------ */

// Funzione per creare un backup delle chat
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

// Funzione per caricare un backup da un file JSON
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

      // Eliminare tutte le chat esistenti prima di caricare il backup
      deleteAllChats();

      // Aggiungere il backup nel database
      backupData.forEach(chat => {
        saveChat(chat);
      });

      loadChats(); // Ricarica le chat dopo il backup
    };

    reader.readAsText(file);
  });
});

// Funzione per cancellare tutte le chat
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

// Funzione per cambiare i colori dell'app
function changeAppColors(oldColor, newColor) {
  // Cambia gli stili inline nel DOM
  const elements = document.querySelectorAll('*');
  elements.forEach(element => {
    const computedStyle = getComputedStyle(element);

    // Controlla e aggiorna colori di sfondo, testo e bordo
    ['backgroundColor', 'color', 'borderColor'].forEach(property => {
      if (computedStyle[property] === oldColor) {
        element.style[property] = newColor;
      }
    });
  });

  // Aggiorna i colori definiti nei file CSS
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

/* PAGINA CON TRASCINAMENTO ------------------------------------------------------------------------------------------------------- */

// Selezioniamo gli elementi HTML che useremo
const shape = document.getElementById('add-chat'); // Il cerchio
let startX = 0;  // Variabile per tenere traccia della posizione di inizio del drag
let isDragging = false;  // Indica se il cerchio è in fase di trascinamento

const maxWidth = 345; // Larghezza massima del rettangolo
const maxDistance = 70; // Distanza massima di trascinamento

// Funzione che viene chiamata all'inizio del trascinamento
const startDrag = (x) => {
  isDragging = true;
  startX = x; // Salva la posizione iniziale
  document.body.style.cursor = 'grabbing'; // Cambia il cursore per indicare il drag
};

// Funzione che calcola l'effetto del trascinamento
const drag = (x) => {
  if (!isDragging) return; // Se non stiamo trascinando, non fare nulla

  const deltaX = Math.abs(x - startX); // Calcola la distanza trascinata

  if (deltaX > 100) { //se trascino pr piu di 50 parte l'effetto sennò no

    // Calcola la proporzione di espansione del cerchio
    const scaleX = Math.min(deltaX / maxDistance, 1); // Limitato a 1 per evitare dimensioni troppo grandi

    // Aggiorna la larghezza in base alla proporzione
    const newWidth = 100 + scaleX * (maxWidth - 100);

    shape.style.width = `${newWidth}px`; // Imposta la nuova larghezza

    // Riduci il border-radius in base alla proporzione per ottenere un rettangolo
    shape.style.borderRadius = `${Math.max(50 - scaleX * 50, 0)}%`;

    // Se la larghezza ha raggiunto il massimo, cambia pagina
    if (newWidth >= maxWidth) {
      window.location.href = "musica.html"; // Reindirizza alla pagina 'musica.html'
    }

  }
};

// Funzione che viene chiamata quando il trascinamento finisce
const endDrag = () => {
  if (isDragging) {
    isDragging = false;
    document.body.style.cursor = 'default'; // Ripristina il cursore
  }
};

// Eventi per mouse
shape.addEventListener('mousedown', (e) => startDrag(e.clientX)); // Inizio del drag
document.addEventListener('mousemove', (e) => drag(e.clientX)); // Movimento del mouse
document.addEventListener('mouseup', endDrag); // Fine del drag

// Eventi per touch
shape.addEventListener('touchstart', (e) => {
  const touch = e.touches[0];
  startDrag(touch.clientX);
});
document.addEventListener('touchmove', (e) => {
  const touch = e.touches[0];
  drag(touch.clientX);
});
document.addEventListener('touchend', endDrag);


/* media player */

const audioPlayer = document.getElementById("audio-player");
const progressBar = document.getElementById("progress-bar");
const currentTimeDisplay = document.getElementById("current-time");

let isPlaying = false;
let progressInterval = null;


function toggleAudioSelection() {
  const beatButton = document.getElementById("beat-button");
  const icon = beatButton.querySelector("i");

  if (icon.classList.contains("fa-plus")) {
    // Simula il click sull'input file per caricare un audio
    document.getElementById("file-input").click();
  } else if (icon.classList.contains("fa-xmark")) {
    const confirmRemove = confirm("Sei sicuro di voler rimuovere il beat?");
    if (confirmRemove) {
      // Rimuovi l'audio caricato
      resetPlayer();
      audioPlayer.src = ""; // Rimuove l'audio
      document.querySelector(".beat-title").textContent = "Scegli il beat";
      document.querySelector(".progress-bar-container").style.display = "none";
      icon.classList.remove("fa-xmark");
      icon.classList.add("fa-plus");
    }
  }
}


function loadAudio(event) {
  const file = event.target.files[0];

  if (!file) {
    alert("Nessun file selezionato. Riprova.");
    return;
  }

  if (file.type.startsWith("audio/")) {
    try {
      const fileURL = URL.createObjectURL(file);
      audioPlayer.src = fileURL;
      audioPlayer.load();

      // Attiva la barra di progresso e aggiorna il titolo del
      // Attiva la barra di progresso e aggiorna il titolo del beat
      document.querySelector(".progress-bar-container").style.display = "block";
      document.querySelector(".beat-title").textContent = file.name;

      // Cambia l'icona in "x"
      const icon = document.getElementById("beat-button").querySelector("i");
      icon.classList.remove("fa-plus");
      icon.classList.add("fa-xmark");

      resetPlayer();
    } catch (error) {
      alert("Si è verificato un errore durante il caricamento del file. Riprova.");
      resetButtonState();
    }
  } else {
    alert("Il file selezionato non è un audio valido. Per favore carica un file audio.");
    resetButtonState();
  }
}

// Funzione per resettare il pulsante e la UI
function resetButtonState() {
  const icon = document.getElementById("beat-button").querySelector("i");
  icon.classList.remove("fa-xmark");
  icon.classList.add("fa-plus");
  document.querySelector(".progress-bar-container").style.display = "none";
  document.querySelector(".beat-title").textContent = "Scegli il beat";
}

function resetPlayer() {
  isPlaying = false;
  updateProgressBar(0);
  currentTimeDisplay.textContent = formatTime(0);
  if (progressInterval) clearInterval(progressInterval);
}


function togglePlayPause() {
  const playPauseButton = document.querySelector(".controls .control-btn:nth-child(2) i"); // Seleziona l'icona all'interno del bottone

  // Log per vedere se il bottone è stato selezionato correttamente
  console.log("Bottone selezionato:", playPauseButton);

  if (audioPlayer.src === "") {
    alert("Per favore seleziona un beat prima di riprodurre!");
    return;
  }

  if (isPlaying) {
    pause();
    playPauseButton.className = "fa-solid fa-play"; // Imposta l'icona su play
  } else {
    play();
    playPauseButton.className = "fa-solid fa-pause"; // Imposta l'icona su pause
  }
}


function play() {
  isPlaying = true;
  audioPlayer.play();
  progressInterval = setInterval(updateProgress, 500);
}

function pause() {
  isPlaying = false;
  audioPlayer.pause();
  clearInterval(progressInterval);
}

function rewind() {
  if (audioPlayer.currentTime >= 15) {
    audioPlayer.currentTime -= 15;
  } else {
    audioPlayer.currentTime = 0;
  }
  updateProgress();
}

function forward() {
  if (audioPlayer.currentTime + 15 <= audioPlayer.duration) {
    audioPlayer.currentTime += 15;
  } else {
    audioPlayer.currentTime = audioPlayer.duration;
  }
  updateProgress();
}

function updateProgress() {
  const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
  updateProgressBar(progress);
  currentTimeDisplay.textContent = formatTime(audioPlayer.currentTime);
}

function updateProgressBar(progress) {
  progressBar.style.width = `${progress}%`;
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
}

document.querySelector(".progress-bar-container").addEventListener("click", (event) => {
  const progressBarContainer = event.currentTarget;
  const rect = progressBarContainer.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const width = rect.width;
  const newTime = (clickX / width) * audioPlayer.duration;

  // Imposta il nuovo tempo nell'audio player
  audioPlayer.currentTime = newTime;

  // Aggiorna la barra di progresso e il minutaggio
  updateProgress();
});
