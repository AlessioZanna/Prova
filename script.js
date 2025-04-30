// Funzione per navigare tra le sezioni
function navigateTo(sectionId) {
  const sections = document.querySelectorAll('.section');
  sections.forEach(section => section.classList.remove('active')); // Nasconde tutte le sezioni
  document.getElementById(sectionId).classList.add('active'); // Mostra la sezione selezionata
}

// Carica la sezione iniziale
document.addEventListener('DOMContentLoaded', () => {
  navigateTo('locker-room-section'); // Imposta la sezione di default a "Spogliatoio"
});

// Funzione per aggiungere un giocatore
function addPlayer() {
  const playerList = document.getElementById('player-list');
  const player = document.createElement('div');
  player.classList.add('player');
  player.innerHTML = `
    <input type="text" placeholder="Nome" />
    <input type="number" placeholder="Velocità" />
    <input type="number" placeholder="Tiro" />
    <input type="number" placeholder="Passaggio" />
    <input type="number" placeholder="Dribbling" />
    <input type="number" placeholder="Difesa" />
    <input type="number" placeholder="Fisico" />
    <input type="number" placeholder="Rendita" />
    <button onclick="removePlayer(this)">Rimuovi</button>
  `;
  playerList.appendChild(player);
}

// Funzione per rimuovere un giocatore dalla lista
function removePlayer(button) {
  button.parentElement.remove();
}

// Funzione per selezionare un giocatore per una squadra
let selectedPlayers = [];
function selectPlayer(team, index) {
  if (selectedPlayers.includes(index)) {
    alert('Questo giocatore è già stato selezionato!');
    return;
  }

  const playerList = document.querySelectorAll('#player-list .player');
  const player = playerList[index];
  const teamSection = document.getElementById(`team${team}`);
  const playerName = player.querySelector('input').value;

  if (!playerName) {
    alert('Seleziona un giocatore valido!');
    return;
  }

  const teamPlayer = document.createElement('div');
  teamPlayer.textContent = playerName;
  teamSection.appendChild(teamPlayer);
  selectedPlayers.push(index);
}

// Funzione per modificare la carta giocatore
function toggleEditMyCard() {
  const inputs = document.querySelectorAll('#my-card input');
  const button = document.querySelector('#my-card button');
  const isDisabled = inputs[0].disabled;
  inputs.forEach(input => input.disabled = !isDisabled);
  button.textContent = isDisabled ? 'Conferma' : 'Modifica';

  if (isDisabled) {
    // Calcola l'overall
    const velocita = document.getElementById('my-velocita').value;
    const tiro = document.getElementById('my-tiro').value;
    const passaggio = document.getElementById('my-passaggio').value;
    const dribbling = document.getElementById('my-dribbling').value;
    const difesa = document.getElementById('my-difesa').value;
    const fisico = document.getElementById('my-fisico').value;
    const rendita = document.getElementById('my-rendita').value;

    const overall = (parseInt(velocita) + parseInt(tiro) + parseInt(passaggio) + parseInt(dribbling) + parseInt(difesa) + parseInt(fisico)) / 6;
    document.getElementById('my-overall').textContent = Math.round(overall);
  }
}
