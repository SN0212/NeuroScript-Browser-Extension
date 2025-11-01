chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    let url = "http://localhost:5000";

    try {
        let response, data;

        if (request.action === "simplifyText") {
            response = await fetch(`${url}/simplify`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: request.text })
            });
            data = await response.json();
            sendResponse({ simplifiedText: data.simplifiedText });

        } else if (request.action === "extractKeywords") {
            response = await fetch(`${url}/extract_keywords`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: request.text })
            });
            data = await response.json();
            sendResponse({ keywords: data.keywords });

        } else if (request.action === "analyzeEmotion") {
            response = await fetch(`${url}/analyze_emotion`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: request.text })
            });
            data = await response.json();
            sendResponse({ emotion: data.emotion });

        } else if (request.action === "textToSpeech") {
            response = await fetch(`${url}/text_to_speech`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: request.text })
            });
            sendResponse({ message: "Playing audio..." });
        }

    } catch (error) {
        console.error("API Error:", error);
        sendResponse({ error: "Failed to connect to the API." });
    }

    return true; // Keeps sendResponse() async
});
