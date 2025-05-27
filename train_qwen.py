import json
import torch
from torch.utils.data import Dataset, DataLoader
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    TrainingArguments,
    Trainer,
    DataCollatorForLanguageModeling
)

class AstrologyDataset(Dataset):
    def __init__(self, file_path, tokenizer):
        self.tokenizer = tokenizer
        self.examples = []
        
        # Load and process the JSONL file
        with open(file_path, 'r', encoding='utf-8') as f:
            for line in f:
                data = json.loads(line)
                # Format the input as a chat message
                messages = [
                    {"role": "system", "content": data["instruction"]},
                    {"role": "user", "content": data["input"]},
                    {"role": "assistant", "content": data["output"]}
                ]
                # Convert to model input format with thinking mode enabled
                text = tokenizer.apply_chat_template(
                    messages,
                    tokenize=False,
                    add_generation_prompt=True,
                    enable_thinking=True  # Enable thinking mode
                )
                self.examples.append(text)

    def __len__(self):
        return len(self.examples)

    def __getitem__(self, idx):
        return self.examples[idx]

def main():
    # Initialize model and tokenizer
    model_name = "Qwen/Qwen3-0.6B"
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForCausalLM.from_pretrained(
        model_name,
        torch_dtype="auto",
        device_map="auto"
    )

    # Create dataset
    dataset = AstrologyDataset("app/dataset/qwen3_training_data.jsonl", tokenizer)
    
    # Create data collator
    data_collator = DataCollatorForLanguageModeling(
        tokenizer=tokenizer,
        mlm=False
    )

    # Define training arguments
    training_args = TrainingArguments(
        output_dir="./qwen3_0.6B_finetuned",
        num_train_epochs=3,
        per_device_train_batch_size=4,
        gradient_accumulation_steps=4,
        learning_rate=2e-5,
        weight_decay=0.01,
        warmup_steps=500,
        logging_steps=100,
        save_steps=1000,
        fp16=True,
        gradient_checkpointing=True,
    )

    # Initialize trainer
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=dataset,
        data_collator=data_collator,
    )

    # Start training
    trainer.train()

    # Save the model
    trainer.save_model()
    tokenizer.save_pretrained("./qwen3_0.6B_finetuned")

if __name__ == "__main__":
    main() 