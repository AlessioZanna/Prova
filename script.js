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

document.getElementById("search-input").addEventListener("input", renderChats);
renderChats();
