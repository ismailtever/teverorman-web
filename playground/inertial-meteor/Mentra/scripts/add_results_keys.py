#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import json, os, sys
sys.stdout.reconfigure(encoding='utf-8')

LOCALES_DIR = os.path.join(os.path.dirname(__file__), '..', 'locales')

NEW_KEYS = {
    "sessionComplete": { "en":"Session Complete", "tr":"Seans Tamamlandı", "ar":"اكتملت الجلسة", "fr":"Session terminée", "de":"Sitzung abgeschlossen", "hi":"सत्र पूर्ण", "zh":"训练完成", "es":"Sesión completada", "nl":"Sessie voltooid", "it":"Sessione completata", "ja":"セッション完了", "ko":"세션 완료", "fi":"Sessio valmis", "fa":"جلسه کامل شد" },
    "gameInsightConsistency": { "en":"Consistency builds neural pathways.", "tr":"Tutarlılık nöral yollar inşa eder.", "ar":"الاتساق يبني مسارات عصبية.", "fr":"La régularité construit des voies neuronales.", "de":"Konsistenz baut neuronale Bahnen auf.", "hi":"निरंतरता तंत्रिका पथ बनाती है।", "zh":"坚持建立神经通路。", "es":"La consistencia construye vías neuronales.", "nl":"Consistentie bouwt neurale paden op.", "it":"La coerenza costruisce percorsi neurali.", "ja":"一貫性が神経回路を構築します。", "ko":"일관성은 신경망을 형성합니다.", "fi":"Johdonmukaisuus rakentaa neuraalisia polkuja.", "fa":"ثبات، مسیرهای عصبی می‌سازد." },
    "finalScore": { "en":"Final Score", "tr":"Nihai Skor", "ar":"النتيجة النهائية", "fr":"Score final", "de":"Endergebnis", "hi":"अंतिम स्कोर", "zh":"最终得分", "es":"Puntaje final", "nl":"Eindscore", "it":"Punteggio finale", "ja":"最終スコア", "ko":"최종 점수", "fi":"Lopullinen tulos", "fa":"امتیاز نهایی" },
    "reactionTime": { "en":"Reaction Time", "tr":"Tepki Süresi", "ar":"وقت الاستجابة", "fr":"Temps de réaction", "de":"Reaktionszeit", "hi":"प्रतिक्रिया समय", "zh":"反应时间", "es":"Tiempo de reacción", "nl":"Reactietijd", "it":"Tempo di reazione", "ja":"反応時間", "ko":"반응 시간", "fi":"Reaktioaika", "fa":"زمان واکنش" },
    "focusStability": { "en":"Focus Stability", "tr":"Odak Kararlılığı", "ar":"استقرار التركيز", "fr":"Stabilité de la concentration", "de":"Fokus-Stabilität", "hi":"फोकस स्थिरता", "zh":"专注稳定性", "es":"Estabilidad del enfoque", "nl":"Focusstabiliteit", "it":"Stabilità del focus", "ja":"集中力の安定性", "ko":"집중 안정성", "fi":"Keskittymisen vakaus", "fa":"پایداری تمرکز" },
    "continue": { "en":"Continue", "tr":"Devam Et", "ar":"متابعة", "fr":"Continuer", "de":"Weiter", "hi":"जारी रखें", "zh":"继续", "es":"Continuar", "nl":"Doorgaan", "it":"Continua", "ja":"続行", "ko":"계속", "fi":"Jatka", "fa":"ادامه" },
    "back": { "en":"Back", "tr":"Geri", "ar":"رجوع", "fr":"Retour", "de":"Zurück", "hi":"पीछे", "zh":"返回", "es":"Atrás", "nl":"Terug", "it":"Indietro", "ja":"戻る", "ko":"뒤로", "fi":"Takaisin", "fa":"بازگشت" }
}

def main():
    langs = ["en","tr","ar","fr","de","hi","zh","es","nl","it","ja","ko","fi","fa"]
    total = 0
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
        total += added
        print(f"✅ {lang}.json: +{added}")
    print(f"\nDone. {total} keys added.")

if __name__ == '__main__':
    main()
