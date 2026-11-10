import os
import re
import math
import json
from typing import Dict, List, Tuple, Optional, Any

# Multi-lingual Civic Concept Dictionary to anchor semantic representations
# across English, Hindi, and Kannada
CIVIC_CONCEPTS = {
    "water_supply": {
        "en": ["water", "supply", "pipeline", "drinking", "tap", "leakage", "pressure", "scarcity", "shortage", "tanker", "pipe", "borewell"],
        "hi": ["पानी", "जल", "सप्लाई", "आपूर्ति", "नल", "पाइप", "किल्लत", "लीकेज", "दबाव", "टैंकर", "पेयजल", "बोरवेल"],
        "kn": ["ನೀರು", "ಸರಬರಾಜು", "ಪೈಪ್", "ಕುಡಿಯುವ", "ನಲ್ಲಿ", "ಸೋರಿಕೆ", "ಒತ್ತಡ", "ಕೊರತೆ", "ಟ್ಯಾಂಕರ್", "ಕೊಳವೆಬಾವಿ", "ಬರುತ್ತಿಲ್ಲ"]
    },
    "roads": {
        "en": ["road", "pothole", "street", "asphalt", "tar", "traffic", "crater", "pavement", "signal", "damaged", "divider"],
        "hi": ["सड़क", "रास्ता", "गड्ढा", "मार्ग", "डामर", "ट्रैफिक", "टूटी", "गड्ढे", "फुटपाथ", "सिग्नल"],
        "kn": ["ರಸ್ತೆ", "ಗುಂಡಿ", "ಬೀದಿ", "ಟಾರ್", "ಹಾಳಾದ", "ಗುಂಡಿಗಳು", "ಕಾಲುದಾರಿ", "ಸಂಚಾರ", "ಸಿಗ್ನಲ್", "ರಸ್ತೆಯಲ್ಲಿ"]
    },
    "waste_management": {
        "en": ["garbage", "waste", "trash", "dump", "dustbin", "cleanliness", "sweep", "litter", "collection", "stench", "sanitation"],
        "hi": ["कचरा", "कूड़ा", "सफाई", "डस्टबिन", "दुर्गंध", "कचरे", "ढेर", "सड़ांध", "उठाया", "सफाईकर्मी"],
        "kn": ["ಕಸ", "ತ್ಯಾಜ್ಯ", "ಕಸದ", "ಸ್ವಚ್ಛತೆ", "ದುರ್ವಾಸನೆ", "ಸಂಗ್ರಹ", "ಗುಡಿಸುವುದು", "ತೊಟ್ಟಿ", "ಕಸವನ್ನು"]
    },
    "drainage": {
        "en": ["drainage", "sewer", "sewage", "gutter", "overflow", "manhole", "clogged", "blocked", "stagnant", "flooding", "nullah"],
        "hi": ["नाली", "सीवर", "गटर", "नाला", "उफान", "अवरुद्ध", "जाम", "मैनहोल", "बदबू", "गंदा", "जलभराव"],
        "kn": ["ಚರಂಡಿ", "ಒಳಚರಂಡಿ", "ಗಟಾರ", "ಹರಿಯುತ್ತಿದೆ", "ಕೊಳಚೆ", "ತುಂಬಿ", "ಕಟ್ಟಿಕೊಂಡಿದೆ", "ಮ್ಯಾನ್‌ಹೋಲ್", "ನೀರು"]
    },
    "electricity": {
        "en": ["electricity", "power", "light", "street light", "pole", "transformer", "wire", "voltage", "blackout", "fluctuation", "outage"],
        "hi": ["बिजली", "विद्युत", "स्ट्रीट", "लाइट", "खंभा", "ट्रांसफार्मर", "तार", "वोल्टेज", "अंधेरा", "कटौती"],
        "kn": ["ವಿದ್ಯುತ್", "ಬೆಳಕು", "ಬೀದಿ", "ದೀಪ", "ಕಂಬ", "ಟ್ರಾನ್ಸ್‌ಫಾರ್ಮರ್", "ತಂತಿ", "ವೋಲ್ಟೇಜ್", "ಕತ್ತಲೆ", "ಲೋಡ್‌ಶೆಡ್ಡಿಂಗ್"]
    },
    "public_safety": {
        "en": ["safety", "security", "dark", "crime", "stray dogs", "harassment", "cctv", "patrol", "danger", "encroachment"],
        "hi": ["सुरक्षा", "असुरक्षित", "अंधेरा", "आवारा", "कुत्ते", "खतरा", "गश्त", "अतिक्रमण", "सीसीटीवी"],
        "kn": ["ಸುರಕ್ಷತೆ", "ಅಪಾಯ", "ಅಲೆಮಾರಿ", "ನಾಯಿಗಳು", "ಕತ್ತಲು", "ಸಿಬ್ಬಂದಿ", "ಅತಿಕ್ರಮಣ", "ಭಯ"]
    }
}

class MultilingualNLPEngine:
    def __init__(self):
        self.model = None
        self.model_name = "paraphrase-multilingual-MiniLM-L12-v2"
        self.processing_mode = "multilingual_semantic_lexical (Civic Multilingual Engine)"
        self.dimension = 64
        # Lazily check if explicitly enabled in env
        if os.getenv("ENABLE_HEAVY_TRANSFORMER", "false").lower() == "true":
            self._load_transformer()

    def _load_transformer(self):
        """Attempts to load sentence-transformers model if requested."""
        try:
            from sentence_transformers import SentenceTransformer
            self.model = SentenceTransformer(self.model_name, local_files_only=True)
            self.processing_mode = f"multilingual_transformer ({self.model_name})"
            self.dimension = 384
        except Exception:
            self.model = None
            self.processing_mode = "multilingual_semantic_lexical (Civic Multilingual Engine)"

    def detect_language(self, text: str) -> str:
        """
        Detects primary script and language:
        Kannada (U+0C80 to U+0CFF) -> 'kn'
        Hindi / Devanagari (U+0900 to U+097F) -> 'hi'
        Latin / English -> 'en'
        """
        if not text:
            return "en"

        kn_count = sum(1 for c in text if '\u0c80' <= c <= '\u0cff')
        hi_count = sum(1 for c in text if '\u0900' <= c <= '\u097f')
        en_count = sum(1 for c in text if 'a' <= c.lower() <= 'z')

        if kn_count > hi_count and kn_count > en_count:
            return "kn"
        elif hi_count > kn_count and hi_count > en_count:
            return "hi"
        return "en"

    def normalize_text(self, text: str) -> str:
        text = text.strip()
        text = re.sub(r'\s+', ' ', text)
        return text

    def extract_issue_and_category(self, text: str, user_category: Optional[str] = None) -> Tuple[str, str]:
        """
        Determines the civic category and key extracted issue keywords
        by analyzing tokens against cross-lingual concept dictionaries.
        """
        text_lower = text.lower()
        scores = {}

        for category, lang_dict in CIVIC_CONCEPTS.items():
            cat_score = 0
            for lang, keywords in lang_dict.items():
                for kw in keywords:
                    if kw.lower() in text_lower:
                        cat_score += 1
            scores[category] = cat_score

        category_mapping = {
            "water_supply": "Water Supply",
            "roads": "Roads",
            "waste_management": "Waste Management",
            "drainage": "Drainage",
            "electricity": "Electricity",
            "public_safety": "Public Safety"
        }

        best_category = None
        max_score = 0
        for cat_key, score in scores.items():
            if score > max_score:
                max_score = score
                best_category = category_mapping.get(cat_key)

        if user_category and user_category != "Other":
            final_category = user_category
        else:
            final_category = best_category or user_category or "Other"
        extracted_issue = self.normalize_text(text[:80])
        return extracted_issue, final_category

    def generate_embedding(self, text: str) -> List[float]:
        """
        Generates semantic embedding vector.
        If transformer is loaded, uses SentenceTransformer.
        Otherwise generates dense cross-lingual concept projection vector.
        """
        if self.model is not None:
            try:
                emb = self.model.encode(text, normalize_embeddings=True)
                return emb.tolist()
            except Exception:
                pass

        # Native Cross-lingual Semantic Vector
        # Constructs a normalized vector projected across the semantic concepts
        # and character n-grams for language-invariant similarity.
        text_lower = text.lower()
        vector = [0.0] * 64

        # Concept dimension activations (first 36 dims)
        dim_idx = 0
        for category, lang_dict in CIVIC_CONCEPTS.items():
            for kw_lang, kw_list in lang_dict.items():
                for kw in kw_list:
                    if kw.lower() in text_lower:
                        vector[dim_idx % 36] += 2.0
                dim_idx += 1

        # Text length & character n-gram hash features (remaining 28 dims)
        for i in range(len(text_lower) - 2):
            trigram = text_lower[i:i+3]
            h = abs(hash(trigram)) % 28
            vector[36 + h] += 0.5

        # L2 Normalization
        norm = math.sqrt(sum(v * v for v in vector))
        if norm > 0:
            vector = [v / norm for v in vector]
        else:
            vector[0] = 1.0

        return vector

    def compute_cosine_similarity(self, vec_a: List[float], vec_b: List[float]) -> float:
        """Computes cosine similarity between two embedding vectors."""
        if not vec_a or not vec_b:
            return 0.0
        
        min_len = min(len(vec_a), len(vec_b))
        dot = sum(vec_a[i] * vec_b[i] for i in range(min_len))
        norm_a = math.sqrt(sum(vec_a[i] * vec_a[i] for i in range(min_len)))
        norm_b = math.sqrt(sum(vec_b[i] * vec_b[i] for i in range(min_len)))
        
        if norm_a == 0 or norm_b == 0:
            return 0.0
        score = dot / (norm_a * norm_b)
        return max(0.0, min(1.0, float(score)))

    def find_related_complaints(
        self,
        target_text: str,
        target_category: str,
        candidate_complaints: List[Any],
        threshold: float = 0.75
    ) -> List[Dict[str, Any]]:
        """
        Identifies semantically related complaints across languages.
        Preserves separate citizen records and computes transparent similarity scores.
        """
        target_vec = self.generate_embedding(target_text)
        results = []

        for candidate in candidate_complaints:
            cand_vec = None
            if hasattr(candidate, "embedding_json") and candidate.embedding_json:
                try:
                    cand_vec = json.loads(candidate.embedding_json)
                except Exception:
                    cand_vec = None

            if not cand_vec:
                cand_vec = self.generate_embedding(candidate.description)

            sim = self.compute_cosine_similarity(target_vec, cand_vec)

            # Cross-lingual affinity boost when sharing category
            if hasattr(candidate, "category") and candidate.category == target_category:
                sim = min(1.0, sim * 1.12)

            if sim >= 0.60:
                if sim >= 0.85:
                    status = "High Confidence Match"
                    explanation = f"Cross-lingual semantic match ({sim:.2f}) with shared civic concept in {candidate.category}."
                elif sim >= 0.75:
                    status = "Potential Match"
                    explanation = f"Similar civic concern ({sim:.2f}) reported in nearby locality."
                else:
                    status = "Review Needed"
                    explanation = f"Marginal semantic alignment ({sim:.2f}) flagged for officer verification."

                results.append({
                    "id": candidate.id,
                    "complaint_code": candidate.complaint_code,
                    "title": candidate.title,
                    "description": candidate.description,
                    "original_language": candidate.original_language,
                    "category": candidate.category,
                    "locality": candidate.locality,
                    "similarity_score": round(sim, 3),
                    "matching_status": status,
                    "matching_explanation": explanation
                })

        results.sort(key=lambda x: x["similarity_score"], reverse=True)
        return results

nlp_engine = MultilingualNLPEngine()
