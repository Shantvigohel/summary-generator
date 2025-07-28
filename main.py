from transformers import (
    T5Tokenizer,
    T5ForConditionalGeneration,
    TrainingArguments,
    Trainer,
    DataCollatorForSeq2Seq
)
from datasets import load_dataset
import torch
import os

# 0. Set cache dir for Hugging Face datasets (optional)
os.environ["HF_DATASETS_CACHE"] = "./hf_cache"

# 1. Load tokenizer & model
model_name = "t5-small"
tokenizer = T5Tokenizer.from_pretrained(model_name)
model = T5ForConditionalGeneration.from_pretrained(model_name)

# 2. Load summarization dataset (cnn_dailymail)
dataset = load_dataset("cnn_dailymail", "3.0.0", split="train[:1%]", trust_remote_code=True)

# 3. Preprocessing
def preprocess_function(example):
    input_text = "summarize: " + example["article"]
    target_text = example["highlights"]

    model_inputs = tokenizer(
        input_text,
        max_length=512,
        truncation=True,
        padding="max_length"
    )

    labels = tokenizer(
        text_target=target_text,
        max_length=64,
        truncation=True,
        padding="max_length"
    )

    # Replace padding token IDs with -100 to ignore in loss
    labels["input_ids"] = [
        (token if token != tokenizer.pad_token_id else -100)
        for token in labels["input_ids"]
    ]
    model_inputs["labels"] = labels["input_ids"]

    return model_inputs

tokenized_dataset = dataset.map(
    preprocess_function,
    batched=False,
    remove_columns=dataset.column_names
)

# 4. Training arguments
training_args = TrainingArguments(
    output_dir="./results",
    num_train_epochs=1,
    per_device_train_batch_size=4,
    save_steps=500,
    save_total_limit=1,
    logging_dir="./logs",
    logging_steps=100,
    remove_unused_columns=False,
    report_to="none"
)

# 5. Collator and Trainer
data_collator = DataCollatorForSeq2Seq(tokenizer=tokenizer, model=model)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_dataset,
    tokenizer=tokenizer,
    data_collator=data_collator
)

# 6. Train
print("🚀 Training...")
trainer.train()

# 7. Save model to server/saved_model
model.save_pretrained("server/saved_model")
tokenizer.save_pretrained("server/saved_model")
print("✅ Model saved to server/saved_model")

# 8. Reload model and test
print("🔁 Reloading model...")
model = T5ForConditionalGeneration.from_pretrained("server/saved_model")
tokenizer = T5Tokenizer.from_pretrained("server/saved_model")

# 9. Inference test
test_text = (
    "The Scottish government has unveiled its latest budget plans, "
    "outlining how public money will be spent in the year ahead. "
    "The finance secretary set out the proposals at Holyrood earlier."
)

# Prepare input
input_text = "summarize: " + test_text
inputs = tokenizer(input_text, return_tensors="pt", truncation=True, padding=True)

# Generate dynamic summary length
input_len = inputs["input_ids"].shape[1]
summary_len = max(20, int(input_len * 0.35))

# Generate summary
with torch.no_grad():
    output_ids = model.generate(
        input_ids=inputs["input_ids"],
        attention_mask=inputs["attention_mask"],
        max_length=summary_len,
        num_beams=4,
        early_stopping=True
    )

# Decode and print
summary = tokenizer.decode(output_ids[0], skip_special_tokens=True)
print("\n📝 Summary:", summary)
