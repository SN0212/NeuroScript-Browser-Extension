chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({
        dyslexiaFont: true,
        enableEmojis: true,
        focusMode: true,
        adaptiveColors: false,  // Default: Off
        textColor: "#000000",   // Default: Black
        bgColor: "#FFFFFF",      // Default: White
        enableTTS: false         // Default: TTS Off
    }, () => {
        console.log("✅ Default settings saved.");
    });
});