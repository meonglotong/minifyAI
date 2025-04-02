const express = require("express");
const cors = require("cors");
const axios = require("axios");
const multer = require("multer");
const path = require("path");
const fs = require("fs").promises; // Gunakan promises untuk asinkron
const pdf = require("pdf-parse");
const ExcelJS = require("exceljs");
const mammoth = require("mammoth");

const app = express();
app.use(cors());
app.use(express.json());

// Konfigurasi multer untuk upload file
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // Batas 2MB untuk kecepatan
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            "text/plain",
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Tipe file tidak didukung."));
        }
    },
});

// Pastikan folder uploads ada
(async () => {
    await fs.mkdir("uploads", { recursive: true });
})();

const OLLAMA_URL = "http://localhost:11434/api/generate";

// Endpoint untuk chat
app.post("/chat", async (req, res) => {
    try {
        const { message } = req.body;

        // Pengecekan khusus untuk "Armin"
        if (message.toLowerCase().includes("armin")) {
            return res.json({ response: "Armin adalah orang yang merancang chatbot ini." });
        }

        // Timeout 5 detik untuk Ollama
        const response = await Promise.race([
            axios.post(OLLAMA_URL, {
                model: "llama3.2",
                prompt: message,
                stream: false,
            }),
            new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 50000)),
        ]);
        res.json({ response: response.data.response });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Terjadi kesalahan atau respons terlalu lama." });
    }
});

// Endpoint untuk upload dan analisis file
app.post("/upload", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "Tidak ada file yang diunggah." });
        }

        const filePath = req.file.path;
        const fileType = req.file.mimetype;
        let analysisResult;

        if (fileType.startsWith("image/")) {
            analysisResult = await analyzeImage(filePath);
        } else if (
            fileType === "text/plain" ||
            fileType === "application/pdf" ||
            fileType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
            fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ) {
            const textContent = await extractText(filePath, fileType);
            analysisResult = await analyzeText(textContent.slice(0, 1000)); // Batasi 1000 karakter
        } else {
            return res.status(400).json({ error: "Tipe file tidak didukung." });
        }

        res.json({ message: "File diunggah dan dianalisis", analysis: analysisResult });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Gagal menganalisis file." });
    }
});

// Fungsi untuk analisis gambar (placeholder)
async function analyzeImage(filePath) {
    const prompt = `Analisis gambar dari file: ${filePath}. Deskripsikan apa yang ada di dalamnya.`;
    const response = await axios.post(OLLAMA_URL, { model: "llama3.2", prompt, stream: false });
    return response.data.response || "Analisis gambar belum didukung sepenuhnya.";
}

// Fungsi untuk ekstrak teks dari file
async function extractText(filePath, fileType) {
    try {
        if (fileType === "text/plain") {
            return await fs.readFile(filePath, "utf8");
        } else if (fileType === "application/pdf") {
            const dataBuffer = await fs.readFile(filePath);
            const data = await pdf(dataBuffer);
            return data.text;
        } else if (fileType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.readFile(filePath);
            let text = "";
            workbook.eachSheet((sheet) => {
                sheet.eachRow((row) => {
                    row.eachCell((cell) => {
                        text += cell.value + " ";
                    });
                });
            });
            return text.trim();
        } else if (fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
            const result = await mammoth.extractRawText({ path: filePath });
            return result.value;
        }
        return "";
    } catch (error) {
        console.error("Error extracting text:", error);
        return "Gagal mengekstrak teks dari file.";
    }
}

// Fungsi untuk analisis teks dengan Ollama
async function analyzeText(text) {
    const prompt = `Analisis isi teks berikut dan berikan ringkasan atau wawasan: ${text}`;
    const response = await Promise.race([
        axios.post(OLLAMA_URL, { model: "llama3.2", prompt, stream: false }),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 5000)),
    ]);
    return response.data.response;
}

// Endpoint untuk generate gambar (placeholder)
app.post("/generate-image", async (req, res) => {
    const { prompt } = req.body;
    res.json({ imageUrl: "https://via.placeholder.com/300?text=Gambar+Generated" });
});

const PORT = 8000;
app.listen(PORT, () => console.log(`Server berjalan di http://localhost:${PORT}`));