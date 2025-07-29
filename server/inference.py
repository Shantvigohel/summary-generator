import sys
import json
from transformers import T5Tokenizer, T5ForConditionalGeneration
import os

# Load model and tokenizer
script_dir = os.path.dirname(os.path.abspath(__file__))
model_dir = os.path.join(script_dir, "saved_model")

tokenizer = T5Tokenizer.from_pretrained(model_dir)
model = T5ForConditionalGeneration.from_pretrained(model_dir)

# Read JSON input from stdin
input_json = sys.stdin.read()
data = json.loads(input_json)
input_text = data["text"]

# Tokenize and summarize
input_ids = tokenizer("summarize: " + input_text, return_tensors="pt", truncation=True).input_ids
input_length = input_ids.shape[1]
summary_length = max(20, int(input_length * 0.35))

summary_ids = model.generate(
    input_ids,
    max_length=summary_length,
    num_beams=4,
    early_stopping=True
)

summary = tokenizer.decode(summary_ids[0], skip_special_tokens=True)

# ✅ Flush output
print(summary, flush=True)
