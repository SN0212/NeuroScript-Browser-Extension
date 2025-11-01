// Load settings from Chrome storage
chrome.storage.sync.get([
    "dyslexiaFont", "enableEmojis", "focusMode", "adaptiveColors",
    "textColor", "bgColor", "enableTTS", "guidedReading", "guidedReadingSpeed"
], (data) => {
    if (data.dyslexiaFont) applyDyslexiaFont();
    if (data.enableEmojis) addEmojisToPage();
    if (data.focusMode) filterContent();
    if (data.adaptiveColors) applyAdaptiveColors(data.textColor, data.bgColor);
    if (data.enableTTS) enableTextToSpeech(data.guidedReadingSpeed);
    else disableTextToSpeech();
    if (data.guidedReading) enableGuidedReading();
    else disableGuidedReading();
});

// Global Variables
let speechSynthesisUtterance = new SpeechSynthesisUtterance();
let guidedReadingActive = false;
let highlightInterval;

// Enable Text-to-Speech with speed control
function enableTextToSpeech(speed = 1.0) {
    speechSynthesisUtterance.rate = speed;
    document.addEventListener("mouseup", handleTextSelection);
}

// Disable Text-to-Speech
function disableTextToSpeech() {
    document.removeEventListener("mouseup", handleTextSelection);
    speechSynthesis.cancel();
}

// Handle Text Selection for TTS
function handleTextSelection() {
    let selectedText = window.getSelection().toString().trim();
    if (selectedText) {
        speechSynthesis.cancel();
        speechSynthesisUtterance.text = selectedText;
        speechSynthesis.speak(speechSynthesisUtterance);
        if (guidedReadingActive) highlightSelectedText(selectedText);
    }
}

// Enable Guided Reading
function enableGuidedReading() {
    guidedReadingActive = true;
    document.addEventListener("mousemove", highlightCurrentLine);
}

// Disable Guided Reading
function disableGuidedReading() {
    guidedReadingActive = false;
    document.removeEventListener("mousemove", highlightCurrentLine);
    clearHighlights();
}

// Highlight the line the user is currently reading
function highlightCurrentLine(event) {
    if (!guidedReadingActive) return;
    clearHighlights();
    let target = event.target.closest("p, span, div, h1, h2, h3, h4, h5, h6, li");
    if (target) target.classList.add("highlight-guided");
}

// Highlight words progressively as they are spoken
function highlightSelectedText(text) {
    clearHighlights();
    let words = text.split(" ");
    let index = 0;

    highlightInterval = setInterval(() => {
        if (index >= words.length) {
            clearInterval(highlightInterval);
            return;
        }
        let regex = new RegExp(`\\b${words[index]}\\b`, "gi");
        document.querySelectorAll("p, span, div, h1, h2, h3, h4, h5, h6, li").forEach(el => {
            el.innerHTML = el.innerHTML.replace(regex, `<span class='highlight-guided'>${words[index]}</span>`);
        });
        index++;
    }, 300); // Adjust speed dynamically if needed
}

// Clear Highlights
function clearHighlights() {
    document.querySelectorAll(".highlight-guided").forEach(el => el.classList.remove("highlight-guided"));
    clearInterval(highlightInterval);
}

// Listen for setting changes and update TTS speed in real time
chrome.storage.onChanged.addListener((changes) => {
    if (changes.guidedReadingSpeed) {
        speechSynthesisUtterance.rate = changes.guidedReadingSpeed.newValue;
    }
});

// Add necessary CSS
let style = document.createElement("style");
style.innerHTML = `
    .highlight-guided {
        background-color: yellow !important;
        transition: background-color 0.3s ease-in-out;
    }
`;
document.head.appendChild(style);

// Functions for Adaptive Colors, Dyslexia Font, Emojis, and Filtering remain unchanged
function applyAdaptiveColors(textColor, bgColor) {
    let style = document.createElement("style");
    style.innerHTML = `
        * {
            background-color: ${bgColor} !important;
            color: ${textColor} !important;
        }
        body, html {
            background-color: ${bgColor} !important;
            color: ${textColor} !important;
        }
        p, h1, h2, h3, h4, h5, h6, span, div, a, li, td, th {
            color: ${textColor} !important;
            background-color: transparent !important;
        }
    `;
    document.head.appendChild(style);
    console.log("✅ Adaptive Contrast Applied!");
}

// Function to apply Dyslexia-Friendly font
function applyDyslexiaFont() {
    let style = document.createElement("style");
    style.innerHTML = `
        @font-face {
            font-family: 'OpenDyslexicMono';
            src: url('${chrome.runtime.getURL("fonts/OpenDyslexicMono-Regular.otf")}') format('opentype');
        }
        
        body, p, div, span, h1, h2, h3, h4, h5, h6, a, li, td, th, button, input, textarea {
            font-family: 'OpenDyslexicMono', Arial, sans-serif !important;
        }
    `;
    document.head.appendChild(style);
    console.log("✅ Dyslexia-Friendly Font Applied!");
}

async function addEmojisToPage() {
    const emojiDict = await loadEmojiDictionary();
    if (Object.keys(emojiDict).length === 0) return;
    document.querySelectorAll("p, span, div, h1, h2, h3, h4, h5, h6, a, li, td").forEach(element => {
        let textNodes = Array.from(element.childNodes).filter(node => node.nodeType === Node.TEXT_NODE);
        textNodes.forEach(node => {
            let text = node.nodeValue;
            for (let word in emojiDict) {
                const regex = new RegExp(`\\b${word}\\b`, "gi");
                text = text.replace(regex, match => `${match} ${emojiDict[word][Math.floor(Math.random() * emojiDict[word].length)]}`);
            }
            node.nodeValue = text;
        });
    });
    console.log("✅ Emojis added without breaking HTML!");
}

function filterContent() {
    const elements = document.querySelectorAll("p, h1, h2, h3, h4, h5, h6");
    if (elements.length === 0) {
        alert("No readable text found on this page.");
        return;
    }
    let content = document.createElement("div");
    content.style.padding = "20px";
    content.style.fontSize = "18px";
    content.style.maxWidth = "800px";
    content.style.margin = "auto";
    elements.forEach(el => content.appendChild(el.cloneNode(true)));
    document.body.innerHTML = "";
    document.body.appendChild(content);
    console.log("✅ Page filtered to show only main content!");
}

async function loadEmojiDictionary() {
    try {
        const response = await fetch(chrome.runtime.getURL("data/emoji.json"));
        return await response.json();
    } catch (error) {
        console.error("❌ Error loading emoji dictionary:", error);
        return {};
    }
}
