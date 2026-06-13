#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import json, os, sys
sys.stdout.reconfigure(encoding='utf-8')

LOCALES_DIR = os.path.join(os.path.dirname(__file__), '..', 'locales')

NEW_KEYS = {
    "shareResult": { "en":"Share Result", "tr":"Sonucu Paylaş", "ar":"مشاركة النتيجة", "fr":"Partager", "de":"Teilen", "hi":"साझा करें", "zh":"分享结果", "es":"Compartir", "nl":"Delen", "it":"Condividi", "ja":"共有する", "ko":"결과 공유", "fi":"Jaa", "fa":"اشتراک گذاری" },
    "tipSocialMediaDetox": { "en":"Replace mindless scrolling with intentional training to rebuild attention.", "tr":"Dikkatini yeniden inşa etmek için bilinçsiz kaydırmayı bilinçli eğitimle değiştir.", "ar":"استبدل التمرير بلا تفكير بالتدريب المقصود.", "fr":"Remplacez le défilement inutile par un entraînement intentionnel.", "de":"Ersetzen Sie sinnloses Scrollen durch gezieltes Training.", "hi":"ध्यान भटकाने वाले स्क्रॉलिंग को छोड़ें।", "zh":"用有意识的训练代替无意识的滑动。", "es":"Reemplaza el desplazamiento sin sentido con entrenamiento intencional.", "nl":"Vervang hersenloos scrollen door gerichte training.", "it":"Sostituisci lo scorrimento passivo con un allenamento intenzionale.", "ja":"目的のないスクロールをやめて、意識的なトレーニングを。", "ko":"무의미한 스크롤 대신 의도적인 훈련을 하세요.", "fi":"Vaihda aivoton selailu tarkoitukselliseen harjoitteluun.", "fa":"وب‌گردی بی‌هدف را با تمرین هدفمند جایگزین کن." },
    "percentileResult": { "en":"Top %{pct}%", "tr":"En İyi %%%{pct}", "ar":"أفضل %{pct}%", "fr":"Top %{pct}%", "de":"Top %{pct}%", "hi":"शीर्ष %{pct}%", "zh":"前%{pct}%", "es":"Top %{pct}%", "nl":"Top %{pct}%", "it":"Top %{pct}%", "ja":"上位%{pct}%", "ko":"상위 %{pct}%", "fi":"Parhaat %{pct}%", "fa":"درصد برتر %{pct}" },
    "shareMessage": { "en":"I just scored %{score} on Mentra 🧠 Can you beat it? 🎯 mentra.app", "tr":"Mentra'da %{score} yaptım 🧠 Beni geçebilir misin? 🎯 mentra.app", "ar":"سجلت %{score} في Mentra 🧠 هل يمكنك التفوق؟ 🎯 mentra.app", "fr":"J'ai marqué %{score} sur Mentra 🧠 Peux-tu me battre ? 🎯 mentra.app", "de":"Ich habe %{score} bei Mentra erreicht 🧠 Kannst du das schlagen? 🎯 mentra.app", "hi":"मेरा Mentra स्कोर %{score} है 🧠 🎯 mentra.app", "zh":"我在Mentra得了%{score}分 🧠 你能打破吗？ 🎯 mentra.app", "es":"Gané %{score} en Mentra 🧠 ¿Puedes superarlo? 🎯 mentra.app", "nl":"Ik scoorde %{score} op Mentra 🧠 Kun jij het verbeteren? 🎯 mentra.app", "it":"Ho fatto %{score} su Mentra 🧠 Puoi battermi? 🎯 mentra.app", "ja":"Mentraで%{score}点取りました 🧠 勝てますか？ 🎯 mentra.app", "ko":"Mentra에서 %{score}점을 받았습니다 🧠 이길 수 있나요? 🎯 mentra.app", "fi":"Sain %{score} Mentra-pelissä 🧠 Voitko voittaa minut? 🎯 mentra.app", "fa":"من در Mentra امتیاز %{score} گرفتم 🧠 آیا می‌توانی من را شکست دهی؟ 🎯 mentra.app" },
}

def main():
    langs = ["en","tr","ar","fr","de","hi","zh","es","nl","it","ja","ko","fi","fa"]
    total_added = 0
    for lang in langs:
        path = os.path.join(LOCALES_DIR, f"{lang}.json")
        if not os.path.exists(path): continue
        with open(path, 'r', encoding='utf-8') as f: data = json.load(f)
        added = 0
        for key, translations in NEW_KEYS.items():
            if key not in data:
                data[key] = translations.get(lang, translations["en"])
                added += 1
        with open(path, 'w', encoding='utf-8') as f: json.dump(data, f, ensure_ascii=False, indent=2)
        total_added += added
        print(f"  ✅ {lang}.json: +{added} keys")
    print(f"\n✅ Done. {total_added} total keys added.")

if __name__ == '__main__':
    main()
