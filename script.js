// Lista giocatori e stato applicazione
let players = JSON.parse(localStorage.getItem('players')) || [];
let selectedSlot = null;

// Navigazione tra sezioni
function navigate(section) {
  document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
  document.getElementById(section).classList.add('active');

  document.querySelectorAll('.nav button').forEach(btn => {
    btn.classList.remove('active');
    if (btn.textContent.toLowerCase() === section || 
        (section === 'field' && btn.textContent === 'Campo') ||
        (section === 'locker' && btn.textContent === 'Spogliatoio') ||
        (section === 'card' && btn.textContent === 'Carta')) {
      btn.classList.add('active');
    }
  });
}

// Aggiunta giocatori
document.getElementById('playerForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const player = {
    id: Date.now(),
    name: document.getElementById('name').value,
    speed: parseInt(document.getElementById('speed').value),
    shot: parseInt(document.getElementById('shot').value),
    pass: parseInt(document.getElementById('pass').value),
    dribble: parseInt(document.getElementById('dribble').value),
    defense: parseInt(document.getElementById('defense').value),
    physical: parseInt(document.getElementById('physical').value),
    rendita: parseInt(document.getElementById('rendita').value),
    overall: 0
  };

  player.overall = calculateOverall(player);

  players.push(player);
  localStorage.setItem('players', JSON.stringify(players));
  this.reset();
  updatePlayerList();
});

function calculateOverall(player) {
  return Math.round((player.speed + player.shot + player.pass + 
                    player.dribble + player.defense + 
                    player.physical + player.rendita) / 7);
}

// Inizializzazione
document.addEventListener('DOMContentLoaded', function() {
  navigate('field');
  updatePlayerList();
  setupDragAndDrop();
});

// Funzioni per il drag and drop
function dragStart(e) {
  const slot = e.target;
  if (slot.classList.contains('filled')) {
    e.dataTransfer.setData('text/plain', slot.dataset.playerId);
    e.dataTransfer.setData('slot-id', slot.id || `slot-${Date.now()}`);
    e.dataTransfer.effectAllowed = 'move';
  } else {
    e.preventDefault(); // Non permettere di trascinare slot vuoti
  }
}

function setupDragAndDrop() {
  document.querySelectorAll('.add-player').forEach(circle => {
    circle.setAttribute('draggable', 'true');

    circle.addEventListener('dragstart', dragStart);

    circle.addEventListener('dragover', e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      circle.classList.add('drag-over');
    });

    circle.addEventListener('dragleave', () => {
      circle.classList.remove('drag-over');
    });

    circle.addEventListener('drop', e => {
      e.preventDefault();
      circle.classList.remove('drag-over');

      const playerId = e.dataTransfer.getData('text/plain');
      const slotId = e.dataTransfer.getData('slot-id');
      const player = players.find(p => p.id === parseInt(playerId));

      if (player) {
        // Rimuovi il giocatore dallo slot originale
        const originalSlot = document.getElementById(slotId) || 
          document.querySelector(`.add-player[data-player-id="${playerId}"]`);

        if (originalSlot && originalSlot !== circle) {
          originalSlot.innerHTML = '+';
          originalSlot.classList.remove('filled');
          delete originalSlot.dataset.playerId;
        }

        // Aggiungi il giocatore alla nuova posizione
        circle.innerHTML = `${player.name}<br>${player.overall}`;
        circle.classList.add('filled');
        circle.dataset.playerId = player.id;
        updateTeamOveralls();
      }
    });

    // ✴️ Rimozione tenendo premuto
    let pressTimer;
    circle.addEventListener('mousedown', (e) => {
      if (circle.classList.contains('filled')) {
        pressTimer = setTimeout(() => {
          // Rimuovi il giocatore
          circle.innerHTML = '+';
          circle.classList.remove('filled');
          delete circle.dataset.playerId;
          updateTeamOveralls();
        }, 800); // Tempo per il "press lungo"
      }
    });

    circle.addEventListener('mouseup', () => {
      clearTimeout(pressTimer);
    });

    circle.addEventListener('mouseleave', () => {
      clearTimeout(pressTimer);
    });
  });

  // Rendi anche gli slot sotto campo (select-slot) dragabili
  document.querySelectorAll('.select-slot').forEach(slot => {
    slot.setAttribute('draggable', 'true');
    slot.addEventListener('dragstart', dragStart);
  });
}


// Selezione slot
function selectSlot(slot) {
  if (slot.classList.contains('filled')) {
    if (confirm('Vuoi sostituire questo giocatore?')) {
      slot.innerHTML = '';
      slot.classList.remove('filled');
      delete slot.dataset.playerId;
      selectedSlot = slot;
      navigate('locker');
    }
  } else {
    selectedSlot = slot;
    navigate('locker');
  }
}

// Mostra i giocatori nello spogliatoio con opzione di rimozione e modifica
function updatePlayerList() {
  const playersList = document.getElementById('playersList');
  playersList.innerHTML = '';

  if (players.length === 0) {
    playersList.innerHTML = '<p>Nessun giocatore aggiunto</p>';
    return;
  }

  players.forEach((player) => {
    const playerDiv = document.createElement('div');
    playerDiv.className = 'player';
    playerDiv.innerHTML = `
      <div class="player-info">
        <strong>${player.name}</strong><br>
        Overall: ${player.overall}<br>
        Vel: ${player.speed} | Tir: ${player.shot} | Pas: ${player.pass}
      </div>
      <div>
        <button class="edit-player" data-id="${player.id}">✏️</button>
        <button class="delete-player" data-id="${player.id}">❌</button>
      </div>
    `;

    // Selezione per il campo
    playerDiv.addEventListener('click', (e) => {
      if (e.target.classList.contains('delete-player') || e.target.classList.contains('edit-player')) return;

      const isAlreadyAssigned = Array.from(document.querySelectorAll('.select-slot, .add-player')).some(el => {
        return parseInt(el.dataset.playerId) === player.id;
      });

      if (isAlreadyAssigned) {
        alert('Questo giocatore è già stato aggiunto al campo.');
        return;
      }

      if (selectedSlot) {
        selectedSlot.innerHTML = `${player.name}<br>${player.overall}`;
        selectedSlot.classList.add('filled');
        selectedSlot.dataset.playerId = player.id;
        selectedSlot = null;
        navigate('field');
        updateTeamOveralls();
      }
    });

    playersList.appendChild(playerDiv);
  });

  // Pulsanti elimina
  document.querySelectorAll('.delete-player').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = parseInt(btn.getAttribute('data-id'));
      players = players.filter(player => player.id !== id);
      localStorage.setItem('players', JSON.stringify(players));
      updatePlayerList();
      removePlayerFromField(id);
    });
  });

  // Pulsanti modifica
  document.querySelectorAll('.edit-player').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = parseInt(btn.getAttribute('data-id'));
      const player = players.find(p => p.id === id);
      if (!player) return;

      const newName = prompt("Modifica nome:", player.name);
      const newSpeed = parseInt(prompt("Velocità:", player.speed));
      const newShot = parseInt(prompt("Tiro:", player.shot));
      const newPass = parseInt(prompt("Passaggio:", player.pass));
      const newDribble = parseInt(prompt("Dribbling:", player.dribble));
      const newDefense = parseInt(prompt("Difesa:", player.defense));
      const newPhysical = parseInt(prompt("Fisico:", player.physical));
      const newRendita = parseInt(prompt("Rendita:", player.rendita));

      if (
        newName && !isNaN(newSpeed) && !isNaN(newShot) && !isNaN(newPass) &&
        !isNaN(newDribble) && !isNaN(newDefense) && !isNaN(newPhysical) && !isNaN(newRendita)
      ) {
        player.name = newName;
        player.speed = newSpeed;
        player.shot = newShot;
        player.pass = newPass;
        player.dribble = newDribble;
        player.defense = newDefense;
        player.physical = newPhysical;
        player.rendita = newRendita;
        player.overall = calculateOverall(player);
        localStorage.setItem('players', JSON.stringify(players));
        updatePlayerList();
        updateFieldNames();
      }
    });
  });
}

// Aggiorna nomi e overall dei giocatori già assegnati al campo
function updateFieldNames() {
  document.querySelectorAll('.select-slot, .add-player').forEach(el => {
    const id = parseInt(el.dataset.playerId);
    const player = players.find(p => p.id === id);
    if (player) {
      el.innerHTML = `${player.name}<br>${player.overall}`;
    }
  });
}

// Rimuove un giocatore dal campo se è stato eliminato dallo spogliatoio
function removePlayerFromField(playerId) {
  document.querySelectorAll('.select-slot, .add-player').forEach(el => {
    if (el.dataset.playerId && parseInt(el.dataset.playerId) === playerId) {
      el.innerHTML = el.classList.contains('add-player') ? '+' : '';
      el.classList.remove('filled');
      delete el.dataset.playerId;
    }
  });
  updateTeamOveralls();
}


// Pulisci squadre
function clearTeams() {
  document.querySelectorAll('.select-slot, .add-player').forEach(el => {
    el.innerHTML = el.classList.contains('add-player') ? '+' : '';
    el.classList.remove('filled');
    delete el.dataset.playerId;
  });
  selectedSlot = null;
  updateTeamOveralls();

}

function updateTeamOveralls() {
  const allCircles = document.querySelectorAll('.add-player');
  let topTotal = 0, topCount = 0;
  let bottomTotal = 0, bottomCount = 0;

  allCircles.forEach(circle => {
    if (circle.classList.contains('filled') && circle.dataset.playerId) {
      const player = players.find(p => p.id === parseInt(circle.dataset.playerId));
      if (!player) return;

      const style = circle.getAttribute('style');
      
      // Squadra sopra: cerchi con "top"
      if (style.includes('top:')) {
        topTotal += player.overall;
        topCount++;
      }

      // Squadra sotto: cerchi con "bottom"
      if (style.includes('bottom:')) {
        bottomTotal += player.overall;
        bottomCount++;
      }
    }
  });

  const topAverage = topCount > 0 ? Math.round(topTotal / topCount) : 0;
  const bottomAverage = bottomCount > 0 ? Math.round(bottomTotal / bottomCount) : 0;

  document.getElementById('topTeamOverall').textContent = topAverage;
  document.getElementById('bottomTeamOverall').textContent = bottomAverage;
}

function shareTeams() {
  const allCircles = document.querySelectorAll('.add-player');
  const topTeam = [];
  const bottomTeam = [];

  allCircles.forEach(circle => {
    const playerId = parseInt(circle.dataset.playerId);
    if (!playerId) return;
    const player = players.find(p => p.id === playerId);
    if (!player) return;

    const style = circle.getAttribute('style');
    if (style.includes('top')) {
      topTeam.push(player.name);
    } else if (style.includes('bottom')) {
      bottomTeam.push(player.name);
    }
  });

  const formatList = (list) => list.map((name, i) => `${i + 1}. ${name}`).join('\n');

  const text = `Squadra 1:\n${formatList(bottomTeam)}\n\nSquadra 2:\n${formatList(topTeam)}`;

  if (navigator.share) {
    navigator.share({
      title: 'Squadre Calcetto',
      text: text,
    }).catch((err) => {
      alert("Condivisione annullata o non riuscita.");
    });
  } else {
    // Fallback: copia negli appunti
    navigator.clipboard.writeText(text).then(() => {
      alert("Testo copiato negli appunti:\n\n" + text);
    });
  }
}
