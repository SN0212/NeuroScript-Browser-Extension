import torch
import os
from flask import Flask, request, jsonify
from transformers import pipeline, BertForSequenceClassification, BertTokenizer
import yake
from gtts import gTTS

app = Flask(__name__)

# Load AI Models
simplifier = pipeline("text2text-generation", model="facebook/bart-large-cnn")
emotion_model = BertForSequenceClassification.from_pretrained("bhadresh-savani/bert-base-go-emotion")
emotion_tokenizer = BertTokenizer.from_pretrained("bhadresh-savani/bert-base-go-emotion")

# 🔹 Text Simplification API
@app.route('/simplify', methods=['POST'])
def simplify_text():
    data = request.get_json()
    text = data.get("text", "")

    if not text:
        return jsonify({"error": "No text provided"}), 400

    result = simplifier(text, max_length=50, min_length=10, do_sample=False)
    simplified_text = result[0]['generated_text']

    return jsonify({"simplifiedText": simplified_text})

# 🔹 Keyword Extraction API
@app.route('/extract_keywords', methods=['POST'])
def extract_keywords():
    data = request.get_json()
    text = data.get("text", "")
    
    if not text:
        return jsonify({"error": "No text provided"}), 400

    kw_extractor = yake.KeywordExtractor()
    keywords = kw_extractor.extract_keywords(text)
    top_keywords = [kw[0] for kw in keywords[:5]]

    return jsonify({"keywords": top_keywords})

# 🔹 Emotion Analysis API
@app.route('/analyze_emotion', methods=['POST'])
def analyze_emotion():
    data = request.get_json()
    text = data.get("text", "")

    if not text:
        return jsonify({"error": "No text provided"}), 400

    inputs = emotion_tokenizer(text, return_tensors="pt", truncation=True, padding=True)
    outputs = emotion_model(**inputs)
    scores = torch.nn.functional.softmax(outputs.logits, dim=1)

    emotions = ["anger", "joy", "sadness", "fear", "surprise", "neutral"]
    detected_emotion = emotions[torch.argmax(scores).item()]

    return jsonify({"emotion": detected_emotion})

# 🔹 Text-to-Speech API
@app.route('/text_to_speech', methods=['POST'])
def text_to_speech():
    data = request.get_json()
    text = data.get("text", "")
    lang = data.get("lang", "en")

    if not text:
        return jsonify({"error": "No text provided"}), 400

    filename = "output.mp3"
    tts = gTTS(text=text, lang=lang, slow=False)
    tts.save(filename)

    os.system(f"start {filename}")  # For Windows, change "start" to "open" for Mac

    return jsonify({"message": "Text converted to speech", "file": filename})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
