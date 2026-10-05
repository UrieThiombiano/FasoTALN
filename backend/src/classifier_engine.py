"""
TopicClassifier : classification thématique hybride texte + IPA.

Modèle : Uriath/afro-xlmr-hybrid-sib200-masakhanews-5class-byt5
(XLMRobertaForSequenceClassification, base Davlan/afro-xlmr-base, 5 classes :
politics, sports, health, entertainment, technology).

Construction de la séquence reproduite à l'identique de `tokenize_hybrid`
dans le notebook d'entraînement `12_sib200_masakhanews_5class_byt5_FINAL` :
texte et IPA sont chacun tronqués à MAX_LEN/2 tokens (sans tokens spéciaux),
puis assemblés manuellement en `[CLS] texte [SEP] IPA [SEP]` : un **seul**
[SEP] entre texte et IPA. C'est un point important : l'appel standard
`tokenizer(texte, ipa)` de XLM-R (format de paire à la RoBERTa) insère
**deux** [SEP] consécutifs entre les deux segments, ce qui ne correspond pas
au format vu par le modèle pendant l'entraînement et dégradait fortement les
prédictions.
"""
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification

MODEL_REPO = "Uriath/afro-xlmr-hybrid-sib200-masakhanews-5class-byt5"
MAX_LEN = 512

LABELS_FR = {
    "politics": "Politique",
    "sports": "Sport",
    "health": "Santé",
    "entertainment": "Divertissement",
    "technology": "Technologie",
}


class TopicClassifier:
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        print(f"[Classifier] Chargement de {MODEL_REPO} sur {self.device}...")
        self.tokenizer = AutoTokenizer.from_pretrained(MODEL_REPO)
        self.model = AutoModelForSequenceClassification.from_pretrained(MODEL_REPO).to(self.device)
        self.model.eval()
        self.id2label = self.model.config.id2label
        print("[Classifier] Prêt.")

    def _build_hybrid_inputs(self, text: str, ipa: str):
        half_len = MAX_LEN // 2
        enc_text = self.tokenizer(text, truncation=True, max_length=half_len, add_special_tokens=False)
        enc_ipa = self.tokenizer(ipa, truncation=True, max_length=half_len, add_special_tokens=False)

        cls_id = self.tokenizer.cls_token_id
        sep_id = self.tokenizer.sep_token_id
        full_ids = [cls_id] + enc_text["input_ids"] + [sep_id] + enc_ipa["input_ids"] + [sep_id]
        if len(full_ids) > MAX_LEN:
            full_ids = full_ids[: MAX_LEN - 1] + [sep_id]
        attention_mask = [1] * len(full_ids)
        return {
            "input_ids": torch.tensor([full_ids], device=self.device),
            "attention_mask": torch.tensor([attention_mask], device=self.device),
        }

    @torch.inference_mode()
    def classify(self, text: str, ipa: str) -> dict:
        inputs = self._build_hybrid_inputs(text, ipa)
        logits = self.model(**inputs).logits[0]
        probs = torch.softmax(logits, dim=-1)
        predicted_id = int(torch.argmax(probs))
        predicted_label = self.id2label[predicted_id]
        probabilities = {self.id2label[i]: round(float(p), 4) for i, p in enumerate(probs)}
        return {
            "predicted_label": predicted_label,
            "predicted_label_fr": LABELS_FR.get(predicted_label, predicted_label),
            "probabilities": probabilities,
            "probabilities_fr": {LABELS_FR.get(k, k): v for k, v in probabilities.items()},
        }
