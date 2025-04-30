// Inizializzazione IndexedDB
let db;

const request = indexedDB.open("calcettoDB", 1);
request.onupgradeneeded = (e) => {
  db = e.target.result;
  const objectStore = db.createObjectStore("players", { keyPath: "id", autoIncrement: true });
  objectStore.createIndex("name", "name", { unique: false });
  objectStore.createIndex("rendita", "rendita", { unique: false });
};

request.onsuccess = () => {
  db = request.result;
  loadPlayers();
};

// Funzione per aggiungere un giocatore alla lista
function addPlayer() {
  const player = {
    name: prompt("Nome del giocatore:"),
    velocita: parseInt(prompt("Velocità (0-100):")),
    tiro: parseInt(prompt("Tiro (0-100):")),
    passaggio: parseInt(prompt("Passaggio (0-100):")),
    dribbling: parseInt(prompt("Dribbling (0-100):")),
    difesa: parseInt(prompt("Difesa (0-100):")),
    fisico: parseInt(prompt("Fisico (0-100):")),
    rendita: parseInt(prompt("Rendita (0-100):")),
  };

  const transaction = db.transaction(["players"], "readwrite");
  const objectStore = transaction.objectStore("players");
  objectStore.add(player);

  transaction.oncomplete = () => {
    showToast("Giocatore aggiunto!");
    loadPlayers();
  };
  transaction.onerror = (e) => {
    console.log("Errore durante l'aggiunta del giocatore", e);
  };
}

// Carica tutti i giocatori dalla IndexedDB
function loadPlayers() {
  const playerList = document.getElementById("player-list");
  playerList.innerHTML = '';  // Pulisce la lista esistente

  const transaction = db.transaction(["players"], "readonly");
  const objectStore = transaction.objectStore("players");
  const request = objectStore.getAll();

  request.onsuccess = () => {
    const players = request.result;
    players.forEach(player => {
      const div = document.createElement("div");
      div.classList.add("player-entry");
      div.innerHTML = `
        <strong>${player.name}</strong>
        <p>Velocità: ${player.velocita}</p>
        <p>Tiro: ${player.tiro}</p>
        <p>Passaggio: ${player.passaggio}</p>
        <p>Dribbling: ${player.dribbling}</p>
        <p>Difesa: ${player.difesa}</p>
        <p>Fisico: ${player.fisico}</p>
        <p>Rendita: ${player.rendita}</p>
        <button onclick="editPlayer(${player.id})">Modifica</button>
      `;
      playerList.appendChild(div);
    });
  };
}

// Modifica le statistiche di un giocatore
function editPlayer(id) {
  const transaction = db.transaction(["players"], "readwrite");
  const objectStore = transaction.objectStore("players");
  const request = objectStore.get(id);

  request.onsuccess = (e) => {
    const player = e.target.result;
    const newVelocita = prompt("Nuova velocità:", player.velocita);
    const newTiro = prompt("Nuovo tiro:", player.tiro);
    const newPassaggio = prompt("Nuovo passaggio:", player.passaggio);
    const newDribbling = prompt("Nuovo dribbling:", player.dribbling);
    const newDifesa = prompt("Nuova difesa:", player.difesa);
    const newFisico = prompt("Nuovo fisico:", player.fisico);
    const newRendita = prompt("Nuova rendita:", player.rendita);

    player.velocita = parseInt(newVelocita);
    player.tiro = parseInt(newTiro);
    player.passaggio = parseInt(newPassaggio);
    player.dribbling = parseInt(newDribbling);
    player.difesa = parseInt(newDifesa);
    player.fisico = parseInt(newFisico);
    player.rendita = parseInt(newRendita);

    objectStore.put(player);

    transaction.oncomplete = () => {
      showToast("Giocatore modificato!");
      loadPlayers();
    };
  };
}

// Funzione per mostrare il toast
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.innerText = message;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 2000);
}

// Funzione per scegliere i giocatori
let team1 = [];
let team2 = [];

function selectPlayer(team, playerIndex) {
  const playerList = document.getElementById("player-list");
  const players = Array.from(playerList.getElementsByClassName("player-entry"));

  const player = players[playerIndex];
  const name = player.querySelector("strong").innerText;

  if (team === 1 && team1.length < 5 && !team1.includes(name)) {
    team1.push(name);
    updateTeam(1);
  } else if (team === 2 && team2.length < 5 && !team2.includes(name)) {
    team2.push(name);
    updateTeam(2);
  }
}

function updateTeam(team) {
  const teamContainer = document.getElementById(`team${team}`);
  const teamArray = team === 1 ? team1 : team2;

  let playersHTML = `<h3>Squadra ${team}</h3>`;
  teamArray.forEach(player => {
    playersHTML += `<p>${player} <button onclick="removePlayer('${player}', ${team})">Rimuovi</button></p>`;
  });

  teamContainer.innerHTML = playersHTML;
}

// Funzione per rimuovere un giocatore dalla squadra
function removePlayer(playerName, team) {
  if (team === 1) {
    team1 = team1.filter(player => player !== playerName);
    updateTeam(1);
  } else if (team === 2) {
    team2 = team2.filter(player => player !== playerName);
    updateTeam(2);
  }
}
