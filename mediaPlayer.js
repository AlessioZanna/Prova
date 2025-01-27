/* ----------------------------------------------------------------------------------------------------------- media player */
const audioPlayer = document.getElementById("audio-player");
const progressBar = document.getElementById("progress-bar");
const currentTimeDisplay = document.getElementById("current-time");

let isPlaying = false;
let progressInterval = null;

/* ----------------------------------------------------------------------------------------------------------- scegli beat */
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
      document.querySelector(".beat-title").textContent = "Scegli il beat";
      document.querySelector(".progress-bar-container").style.display = "none";
      icon.classList.remove("fa-xmark");
      icon.classList.add("fa-plus");
    }
  }
}

/* ----------------------------------------------------------------------------------------------------------- carica beat */
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
      document.querySelector(".progress-bar-container").style.display = "block";
      document.querySelector(".beat-title").textContent = file.name;

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

/* ----------------------------------------------------------------------------------------------------------- resetta pulsante */
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
  
  /* ----------------------------------------------------------------------------------------------------------- controlli */
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
  
  /* ----------------------------------------------------------------------------------------------------------- progress bar */
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
  
