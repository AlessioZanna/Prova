// Selezioniamo l'elemento che verrà trascinato
const shape = document.getElementById('media-player');
let startX = 0;  // Variabile per tenere traccia della posizione di inizio del drag
let isDragging = false;  // Indica se il cerchio è in fase di trascinamento

const minWidth = 70; // Larghezza minima (cerchio)
const maxWidth = 300; // Larghezza massima (rettangolo)
const maxDistance = 100; // Distanza massima di trascinamento

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

  if (deltaX > 50) { //se trascino pr piu di 50 parte l'effetto sennò no

    // Calcola la proporzione di espansione del cerchio
    const scaleX = Math.min(deltaX / maxDistance, 1); // Limitato a 1 per evitare dimensioni troppo grandi

    // Aggiorna la larghezza in base alla proporzione
    const newWidth = maxWidth - scaleX * (maxWidth - minWidth);

    shape.style.width = `${newWidth}px`; // Imposta la nuova larghezza

    // Aumenta il border-radius in base alla proporzione per ottenere un cerchio
    shape.style.borderRadius = `${scaleX * 50}%`;

    // Imposta la nuova posizione orizzontale a destra
    const newPosition = Math.max(window.innerWidth - newWidth - 20, 0); // Imposta la posizione a destra

    shape.style.left = `${newPosition}px`;  // Cambia la posizione orizzontale in base alla larghezza

    // Applica la trasparenza a tutti gli elementi figli tranne il "+" (fa-plus)
    const children = shape.children; // Seleziona tutti i figli del media player
    Array.from(children).forEach(child => {
      // Se l'elemento non è il "+" (fa-plus), applica la trasparenza
      if (!child.querySelector('.fa-plus')) {
        child.style.opacity = '0'; // Imposta la trasparenza
        child.style.pointerEvents = 'none'; // Disabilita interazioni con gli elementi
      }
    });

    // Se la larghezza è tornata al minimo, cambia pagina
    if (newWidth <= minWidth) {
      window.location.href = "index.html"; // Torna alla pagina principale
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




const audioPlayer = document.getElementById("audio-player");
const progressBar = document.getElementById("progress-bar");
const currentTimeDisplay = document.getElementById("current-time");
const musicList = document.getElementById("music-list");

let isPlaying = false;
let progressInterval = null;
let loadedTracks = []; // Array per memorizzare i brani caricati


function toggleAudioSelection() {
  const beatButton = document.getElementById("beat-button");
  const icon = beatButton.querySelector("i");

  if (icon.classList.contains("fa-plus")) {
    document.getElementById("file-input").click();
  } else if (icon.classList.contains("fa-xmark")) {
    const confirmRemove = confirm("Sei sicuro di voler rimuovere il beat?");
    if (confirmRemove) {
      resetPlayer();
      audioPlayer.src = "";
      document.querySelector(".beat-title").textContent = "Scegli una canzone";
      document.querySelector(".progress-bar-container").style.display = "none";
      icon.classList.remove("fa-xmark");
      icon.classList.add("fa-plus");
    }
  }
}


function loadAudio(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (file.type.startsWith("audio/")) {
    const fileURL = URL.createObjectURL(file);

    // Aggiorna la lista
    const track = { name: file.name, url: fileURL };
    loadedTracks.push(track);
    updateMusicList();

    // Seleziona automaticamente il nuovo brano
    setTrack(track);
  } else {
    alert("Per favore carica un file audio valido.");
  }
}

// Funzione per aggiornare la lista delle canzoni
function updateMusicList() {
  musicList.innerHTML = ""; // Svuota la lista
  loadedTracks.forEach((track, index) => {
    const listItem = document.createElement("li");
    listItem.textContent = track.name;
    listItem.dataset.index = index;
    listItem.addEventListener("click", () => {
      setTrack(track);
      togglePlayPause();
      play();
      setSelectedTrack(listItem); // Aggiungi la classe per colorare la canzone
    });
    musicList.appendChild(listItem);
  });
}

function setTrack(track) {
  audioPlayer.src = track.url;
  const beatTitleElement = document.querySelector(".beat-title");
  beatTitleElement.textContent = track.name;
  document.querySelector(".progress-bar-container").style.display = "block";
  resetPlayer();
}

// Funzione per aggiornare il colore della canzone selezionata
function setSelectedTrack(selectedItem) {
  // Rimuovi la classe 'selected' da tutti gli altri elementi
  const allItems = musicList.querySelectorAll("li");
  allItems.forEach(item => {
    item.classList.remove("selected");
  });

  // Aggiungi la classe 'selected' all'elemento selezionato
  selectedItem.classList.add("selected");
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
    alert("Per favore seleziona una canzone prima di riprodurre!");
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

// Aggiungi un ascoltatore per l'evento "ended" del player audio
audioPlayer.addEventListener("ended", playNextTrack);

function playNextTrack() {
  // Trova l'indice del brano attualmente in riproduzione
  const currentIndex = loadedTracks.findIndex(
    track => track.url === audioPlayer.src
  );

  // Calcola l'indice del prossimo brano
  let nextIndex = (currentIndex + 1) % loadedTracks.length; // Torna al primo se è l'ultimo

  // Seleziona il prossimo brano e avvialo
  const nextTrack = loadedTracks[nextIndex];
  setTrack(nextTrack);
  play(); // Avvia automaticamente la riproduzione

  // Rimuovi la classe 'selected' da tutti gli altri brani
  updateMusicList();
  // Aggiungi la classe 'selected' al brano che sta per partire
  const selectedItem = musicList.querySelector(`li[data-index="${nextIndex}"]`);
  setSelectedTrack(selectedItem);
}
