async function sendMessage() {
    const userInput = document.getElementById("user-input");
    const chatBox = document.getElementById("chat-box");
    const message = userInput.value.trim();

    if (!message) return;

    appendMessage(chatBox, message, "user");
    userInput.value = "";
    showLoading(chatBox); // Tampilkan animasi loading

    try {
        const response = await fetch("http://localhost:8000/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message }),
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        removeLoading(chatBox); // Hapus animasi
        appendMessage(chatBox, data.response, "bot");
    } catch (error) {
        removeLoading(chatBox); // Hapus animasi meskipun error
        appendMessage(chatBox, "Terjadi kesalahan.", "bot");
        console.error("Error:", error);
    }
}

async function uploadFile() {
    const fileInput = document.getElementById("file-upload");
    const chatBox = document.getElementById("chat-box");
    const file = fileInput.files[0];
    if (!file) return;

    appendMessage(chatBox, `Mengunggah file: ${file.name}`, "user");
    showLoading(chatBox); // Tampilkan animasi loading

    const formData = new FormData();
    formData.append("file", file);

    try {
        const response = await fetch("http://localhost:8000/upload", {
            method: "POST",
            body: formData,
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        removeLoading(chatBox); // Hapus animasi
        appendMessage(chatBox, `${data.message}: ${data.analysis}`, "bot");
    } catch (error) {
        removeLoading(chatBox); // Hapus animasi meskipun error
        appendMessage(chatBox, `Gagal mengunggah file: ${error.message}`, "bot");
        console.error("Error:", error);
    }
}

async function generateImagePrompt() {
    const chatBox = document.getElementById("chat-box");
    const prompt = prompt("Masukkan deskripsi untuk gambar:");
    if (!prompt) return;

    appendMessage(chatBox, `Generate gambar: ${prompt}`, "user");
    showLoading(chatBox); // Tampilkan animasi loading

    try {
        const response = await fetch("http://localhost:8000/generate-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt }),
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        removeLoading(chatBox); // Hapus animasi
        const img = document.createElement("img");
        img.src = data.imageUrl;
        img.style.maxWidth = "100%";
        appendMessage(chatBox, "", "bot", img);
    } catch (error) {
        removeLoading(chatBox); // Hapus animasi meskipun error
        appendMessage(chatBox, "Gagal membuat gambar.", "bot");
        console.error("Error:", error);
    }
}

function appendMessage(chatBox, text, type, element = null) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message", type);
    if (element) {
        messageDiv.appendChild(element);
    } else {
        messageDiv.textContent = text;
    }
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function showLoading(chatBox) {
    const loadingDiv = document.createElement("div");
    loadingDiv.classList.add("message", "bot", "loading");
    loadingDiv.innerHTML = '<span class="typing-dots"><span>.</span><span>.</span><span>.</span></span>';
    loadingDiv.id = "loading-indicator";
    chatBox.appendChild(loadingDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function removeLoading(chatBox) {
    const loadingDiv = document.getElementById("loading-indicator");
    if (loadingDiv) {
        chatBox.removeChild(loadingDiv);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const userInput = document.getElementById("user-input");
    userInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            sendMessage();
        }
    });
});