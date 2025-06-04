from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch
import os

app = Flask(__name__)
CORS(app)

model_path = os.path.join(os.path.dirname(__file__), "qwen3-merged-model")

tokenizer = AutoTokenizer.from_pretrained(model_path, trust_remote_code=True)
model = AutoModelForCausalLM.from_pretrained(model_path, trust_remote_code=True)

model.eval()

@app.route("/get-compatibility", methods=["POST"])
def get_compatibility():
    data = request.json
    sign1 = data.get("sign1")
    sign2 = data.get("sign2")

    if not (sign1 and sign2):
        return jsonify({"error": "Missing signs for compatibility"}), 400

    instruction = "You are an astrology relationship advisor focused on helping couples improve their connection. Provide specific advice to enhance their relationship."
    input_text = f"Compare: {sign1} vs {sign2}\nWhat specific advice would you give to improve their relationship?"

    prompt = f"<|im_start|>system\n{instruction}<|im_end|>\n<|im_start|>user\n{input_text}<|im_end|>\n<|im_start|>assistant"

    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
    with torch.no_grad():
        outputs = model.generate(**inputs, max_new_tokens=300)
    result = tokenizer.decode(outputs[0], skip_special_tokens=True)

    return jsonify({"suggestion": result.replace(prompt, "").strip()})

@app.route("/get-self-improvement", methods=["POST"])
def get_self_improvement():
    data = request.json
    birthday = data.get("birthday", "")
    birthtime = data.get("birthtime", "")
    location = data.get("location", "")
    gender = data.get("gender", "")

    if not (birthday and location and gender):
        return jsonify({"error": "Missing fields for self-improvement"}), 400

    instruction = "You are an insightful astrology coach focused on personal growth and self-improvement. Provide detailed sign reports with specific self-improvement advice."
    input_text = f"Birthday: {birthday} {birthtime}, {location} ({gender})"

    prompt = f"<|im_start|>system\n{instruction}<|im_end|>\n<|im_start|>user\n{input_text}<|im_end|>\n<|im_start|>assistant"

    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
    with torch.no_grad():
        outputs = model.generate(**inputs, max_new_tokens=300)
    result = tokenizer.decode(outputs[0], skip_special_tokens=True)

    return jsonify({"suggestion": result.replace(prompt, "").strip()})


if __name__ == "__main__":
    app.run(port=3000)
