chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({
        dyslexiaFont: true,
        enableEmojis: true,
        focusMode: true,
        adaptiveColors: false,  // Default: Off
        textColor: "#000000",   // Default: Black
        bgColor: "#FFFFFF",      // Default: White
        enableTTS: false,        // Default: TTS Off
        ambientMusic: ""         // Default: No music selected
    }, () => {
        console.log("✅ Default settings saved.");
    });
});

document.addEventListener("DOMContentLoaded", () => {
    let toggleFont = document.getElementById("toggleFont");
    let toggleEmojis = document.getElementById("toggleEmojis");
    let focusToggle = document.getElementById("toggleContentFilter");
    let toggleAdaptiveColors = document.getElementById("toggleAdaptiveColors");
    let textColorPicker = document.getElementById("textColorPicker");
    let bgColorPicker = document.getElementById("bgColorPicker");
    let toggleTTS = document.getElementById("toggleTTS");
    let musicDropdown = document.getElementById("musicDropdown");
    let toggleMusic = document.getElementById("toggleMusic");
    let audioPlayer = new Audio();

    // Load saved settings
    chrome.storage.sync.get(["dyslexiaFont", "enableEmojis", "focusMode", "adaptiveColors", "textColor", "bgColor", "enableTTS", "ambientMusic"], (data) => {
        toggleFont.checked = data.dyslexiaFont || false;
        toggleEmojis.checked = data.enableEmojis || false;
        focusToggle.checked = data.focusMode || false;
        toggleAdaptiveColors.checked = data.adaptiveColors || false;
        textColorPicker.value = data.textColor || "#000000"; // Default black
        bgColorPicker.value = data.bgColor || "#FFFFFF"; // Default white
        toggleTTS.checked = data.enableTTS || false;
        musicDropdown.value = data.ambientMusic || "";
        if (data.ambientMusic) playMusic(data.ambientMusic);
    });

    function playMusic(selection) {
        if (selection) {
            audioPlayer.src = chrome.runtime.getURL(`music/${selection}.mp3`);
            audioPlayer.loop = true;
            audioPlayer.play();
            toggleMusic.textContent = "Pause Music";
        } else {
            audioPlayer.pause();
            toggleMusic.textContent = "Play Music";
        }
    }

    musicDropdown.addEventListener("change", () => {
        let selectedMusic = musicDropdown.value;
        chrome.storage.sync.set({ ambientMusic: selectedMusic });
        playMusic(selectedMusic);
    });

    toggleMusic.addEventListener("click", () => {
        if (audioPlayer.paused) {
            audioPlayer.play();
            toggleMusic.textContent = "Pause Music";
        } else {
            audioPlayer.pause();
            toggleMusic.textContent = "Play Music";
        }
    });

    // Update settings when checkboxes are clicked
    focusToggle.addEventListener("change", () => {
        chrome.storage.sync.set({ focusMode: focusToggle.checked });
        reloadPage();
    });

    toggleFont.addEventListener("change", () => {
        chrome.storage.sync.set({ dyslexiaFont: toggleFont.checked });
        reloadPage();
    });

    toggleEmojis.addEventListener("change", () => {
        chrome.storage.sync.set({ enableEmojis: toggleEmojis.checked });
        reloadPage();
    });

    toggleAdaptiveColors.addEventListener("change", () => {
        chrome.storage.sync.set({ adaptiveColors: toggleAdaptiveColors.checked });
        reloadPage();
    });

    textColorPicker.addEventListener("input", () => {
        chrome.storage.sync.set({ textColor: textColorPicker.value });
        reloadPage();
    });

    bgColorPicker.addEventListener("input", () => {
        chrome.storage.sync.set({ bgColor: bgColorPicker.value });
        reloadPage();
    });

    toggleTTS.addEventListener("change", () => {
        chrome.storage.sync.set({ enableTTS: toggleTTS.checked });
        reloadPage();
    });

    function reloadPage() {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]?.id) chrome.tabs.reload(tabs[0].id);
        });
    }
});