document.getElementById("simplify-btn").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: () => {
                let selectedText = window.getSelection().toString();
                if (!selectedText) {
                    alert("Please select text to simplify.");
                    return;
                }
                chrome.runtime.sendMessage({ action: "simplifyText", text: selectedText }, (response) => {
                    alert("Simplified: " + response.simplifiedText);
                });
            }
        });
    });
});

document.getElementById("highlight-btn").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: () => {
                let bodyText = document.body.innerText;
                chrome.runtime.sendMessage({ action: "extractKeywords", text: bodyText }, (response) => {
                    response.keywords.forEach(keyword => {
                        let regex = new RegExp(`\\b${keyword}\\b`, "gi");
                        document.body.innerHTML = document.body.innerHTML.replace(regex, `<mark>${keyword}</mark>`);
                    });
                    alert("Keywords Highlighted!");
                });
            }
        });
    });
});

document.getElementById("chunk-btn").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: () => {
                let paragraphs = document.querySelectorAll("p");
                paragraphs.forEach((p, index) => {
                    if ((index + 1) % 3 === 0) {
                        p.insertAdjacentHTML("afterend", `<button onclick="setTimeout(()=>alert('Take a break!'), 2000)">Pause</button>`);
                    }
                });
                alert("Content Chunked!");
            }
        });
    });
});

document.getElementById("emotion-btn").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: () => {
                let selectedText = window.getSelection().toString();
                if (!selectedText) {
                    alert("Please select text for emotion analysis.");
                    return;
                }
                chrome.runtime.sendMessage({ action: "analyzeEmotion", text: selectedText }, (response) => {
                    alert("Detected Emotion: " + response.emotion);
                });
            }
        });
    });
});
