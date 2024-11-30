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
