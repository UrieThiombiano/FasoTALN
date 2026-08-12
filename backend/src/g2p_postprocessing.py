"""
Post-traitement de la sortie IPA du modèle ByT5 G2P.

Porté depuis postprocessing.py du repo HuggingFace
`Uriath/byt5-small-g2p-african`. Ne s'applique qu'au dioula et au bambara
(le mooré ressort tel quel, sans correction).
"""
import re
import unicodedata

_NASAL_VOWELS = {
    'a': 'ã', 'e': 'ẽ', 'i': 'ĩ', 'o': 'õ', 'u': 'ũ', 'ɛ': 'ɛ̃', 'ɔ': 'ɔ̃',
}
_CODA_N_RE = re.compile(r'([aeiouɛɔ])([̀-ͯ]*)(ː?)n(?=[^aeiouɛɔ]|$)')


def fix_nasalisation_coda_n(ipa: str) -> str:
    nfd = unicodedata.normalize('NFD', ipa)

    def _replace(m):
        base, marks, length = m.group(1), m.group(2), m.group(3)
        if '̃' in marks:
            return m.group(0)
        nasal = _NASAL_VOWELS[base]
        if length:
            return base + marks + nasal
        return nasal + marks

    return unicodedata.normalize('NFC', _CODA_N_RE.sub(_replace, nfd))


def fix_c_affricate(ipa: str) -> str:
    return re.sub(r'(?<!t)c', 'tʃ', ipa)


def apply_postprocessing(ipa: str, lang_code: str) -> str:
    """Applique le post-traitement complet pour bam/dyu."""
    if lang_code in ('bam', 'dyu'):
        ipa = fix_nasalisation_coda_n(ipa)
        ipa = fix_c_affricate(ipa)
    return ipa
