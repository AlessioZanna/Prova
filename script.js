const audioPlayer = document.getElementById("audio-player");
const progressBar = document.getElementById("progress-bar");
const currentTimeDisplay = document.getElementById("current-time");


let isPlaying = false;
let progressInterval = null;




let chats = JSON.parse(localStorage.getItem("chats")) || [];
let currentChatIndex = null;
let startX = 0;
let currentSwipedChat = null;

function saveChats() {
    localStorage.setItem("chats", JSON.stringify(chats));
}

function goBack() {
    document.getElementById("chat-page").style.display = "none";
    document.getElementById("home-page").style.display = "flex";
    currentChatIndex = null;
}

function createNewChat() {
    const chatName = prompt("Inserisci il nome della chat:");
    if (chatName && chatName.trim() !== "") {
        chats.push({ name: chatName.trim(), messages: [] });
        saveChats();
        renderChats();
    }
}

function renderChats() {
    const contactList = document.getElementById("contact-list");
    contactList.innerHTML = "";
    const searchQuery = document.getElementById("search-input").value.toLowerCase();

    chats.filter(chat => chat.name.toLowerCase().includes(searchQuery)).forEach((chat, index) => {
        const contactItem = document.createElement("div");
        contactItem.classList.add("contact");
        contactItem.innerHTML = `
            <div class="contact-info">
                <h3>${chat.name}</h3>
                <p>${chat.messages.length > 0 ? chat.messages[chat.messages.length - 1].text : "Nessun messaggio"}</p>
            </div>
            <div class="contact-delete" onclick="deleteChat(${index})">✖</div>
        `;

        // Gestione dello swipe
        contactItem.addEventListener("touchstart", e => {
            startX = e.touches[0].clientX;
        });

        contactItem.addEventListener("touchmove", e => {
            const touchX = e.touches[0].clientX;
            const distance = touchX - startX;

            if (distance < -50) { // Swipe sinistra
                if (currentSwipedChat && currentSwipedChat !== contactItem) {
                    currentSwipedChat.classList.remove("swiped");
                }
                contactItem.classList.add("swiped");
                currentSwipedChat = contactItem;
            } else if (distance > 50) { // Swipe destra
                contactItem.classList.remove("swiped");
                if (currentSwipedChat === contactItem) {
                    currentSwipedChat = null;
                }
            }
        });

        contactItem.addEventListener("touchend", () => {
            if (!contactItem.classList.contains("swiped")) {
                currentSwipedChat = null;
            }
        });

        contactItem.addEventListener("click", () => openChat(index));
        contactList.appendChild(contactItem);
    });
}

function openChat(index) {
    currentChatIndex = index;
    const chat = chats[index];
    document.getElementById("chat-user").innerText = chat.name;
    const chatBox = document.getElementById("chat-box");
    chatBox.innerHTML = "";
    chat.messages.forEach(message => {
        const messageDiv = document.createElement("div");
        messageDiv.classList.add("message", message.type);
        messageDiv.innerHTML = `<div class="msg">${message.text}</div>`;
        chatBox.appendChild(messageDiv);
    });
    document.getElementById("chat-page").style.display = "flex";
    document.getElementById("home-page").style.display = "none";
}

function sendMessage() {
    const input = document.getElementById("message");
    if (input.value.trim() !== "" && currentChatIndex !== null) {
        chats[currentChatIndex].messages.push({ type: "user", text: input.value.trim() });
        saveChats();
        input.value = "";
        openChat(currentChatIndex);
    }
}

function sendAudio() {
    if (currentChatIndex !== null) {
        chats[currentChatIndex].messages.push({ type: "audio", text: "Audio inviato." });
        saveChats();
        openChat(currentChatIndex);
    }
}

function deleteChat(index) {
    if (confirm("Sei sicuro di voler eliminare questa chat?")) {
        chats.splice(index, 1);
        saveChats();
        goBack(); // Torna alla home page dopo l'eliminazione
        renderChats();
    }
}

function loadAudio(event) {
    const file = event.target.files[0];
    if (file) {
        if (file.type.startsWith("audio/")) {
            const fileURL = URL.createObjectURL(file);
            audioPlayer.src = fileURL;
            audioPlayer.load();
            document.querySelector(".progress-bar-container").style.display = "block";
            document.querySelector(".beat-title").textContent = file.name;
            resetPlayer();
        } else {
            alert("Per favore seleziona un file audio valido!");
        }
    } else {
        alert("Nessun file selezionato.");
    }
}

function resetPlayer() {
    isPlaying = false;
    updateProgressBar(0);
    currentTimeDisplay.textContent = formatTime(0);
    if (progressInterval) clearInterval(progressInterval);
}

function togglePlayPause() {
    if (audioPlayer.src === "") {
        alert("Per favore seleziona un beat prima di riprodurre!");
        return;
    }

    if (isPlaying) {
        pause();
    } else {
        play();
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
    progressBar.style.width = ${progress}%;
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return ${minutes}:${secs < 10 ? "0" : ""}${secs};
}


document.getElementById("search-input").addEventListener("input", renderChats);
renderChats();
