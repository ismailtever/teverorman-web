#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
add_missing_keys.py
Injects missing achievement + misc keys into ALL locale files.
Run after update_locales.py (which updates EN).
"""
import json, os

LOCALES_DIR = os.path.join(os.path.dirname(__file__), '..', 'locales')

# New keys with translations for every supported language
NEW_KEYS = {
    "ach7DayStreak": {
        "en": "7-Day Streak",
        "tr": "7 Günlük Seri",
        "ar": "سلسلة 7 أيام",
        "fr": "Série de 7 jours",
        "de": "7-Tage-Serie",
        "hi": "7 दिन की स्ट्रीक",
        "zh": "7天连续",
        "es": "Racha de 7 días",
        "nl": "7-daagse reeks",
        "it": "Serie di 7 giorni",
        "ja": "7日連続",
        "ko": "7일 연속",
        "fi": "7 päivän putki",
        "fa": "رشته ۷ روزه",
    },
    "ach7DayStreakDesc": {
        "en": "Train 7 days in a row",
        "tr": "7 gün üst üste antrenman yap",
        "ar": "تدرب 7 أيام متتالية",
        "fr": "Entraîne-toi 7 jours de suite",
        "de": "Trainiere 7 Tage hintereinander",
        "hi": "लगातार 7 दिन ट्रेन करें",
        "zh": "连续训练7天",
        "es": "Entrena 7 días seguidos",
        "nl": "Train 7 dagen achter elkaar",
        "it": "Allenati per 7 giorni di fila",
        "ja": "7日連続でトレーニング",
        "ko": "7일 연속 훈련",
        "fi": "Harjoittele 7 peräkkäistä päivää",
        "fa": "۷ روز پشت سر هم تمرین کن",
    },
    "achMemoryMaster": {
        "en": "Memory Master",
        "tr": "Hafıza Ustası",
        "ar": "سيد الذاكرة",
        "fr": "Maître de la mémoire",
        "de": "Gedächtnismeister",
        "hi": "मेमोरी मास्टर",
        "zh": "记忆大师",
        "es": "Maestro de la memoria",
        "nl": "Geheugenmeester",
        "it": "Maestro della memoria",
        "ja": "記憶マスター",
        "ko": "기억 마스터",
        "fi": "Muistimestari",
        "fa": "استاد حافظه",
    },
    "achMemoryMasterDesc": {
        "en": "Complete 10 memory sessions",
        "tr": "10 hafıza seansı tamamla",
        "ar": "أكمل 10 جلسات ذاكرة",
        "fr": "Termine 10 séances de mémoire",
        "de": "Schließe 10 Gedächtnissitzungen ab",
        "hi": "10 मेमोरी सेशन पूरे करें",
        "zh": "完成10次记忆训练",
        "es": "Completa 10 sesiones de memoria",
        "nl": "Voltooi 10 geheugensessies",
        "it": "Completa 10 sessioni di memoria",
        "ja": "記憶セッションを10回完了",
        "ko": "기억 세션 10회 완료",
        "fi": "Suorita 10 muistisessiota",
        "fa": "۱۰ جلسه حافظه را کامل کن",
    },
    "achSpeedDemon": {
        "en": "Speed Demon",
        "tr": "Hız Şeytanı",
        "ar": "شيطان السرعة",
        "fr": "Démon de la vitesse",
        "de": "Geschwindigkeitsteufel",
        "hi": "स्पीड डेमन",
        "zh": "速度恶魔",
        "es": "Demonio de la velocidad",
        "nl": "Snelheidsdemon",
        "it": "Demonio della velocità",
        "ja": "スピードデーモン",
        "ko": "스피드 데몬",
        "fi": "Nopeusdemon",
        "fa": "شیطان سرعت",
    },
    "achSpeedDemonDesc": {
        "en": "Score over 90 in Speed Match",
        "tr": "Speed Match'te 90 üzeri puan al",
        "ar": "سجل أكثر من 90 في Speed Match",
        "fr": "Score au-dessus de 90 en Speed Match",
        "de": "Über 90 Punkte in Speed Match",
        "hi": "Speed Match में 90 से ज़्यादा स्कोर करें",
        "zh": "在Speed Match中得分超过90",
        "es": "Puntaje sobre 90 en Speed Match",
        "nl": "Scoor boven 90 in Speed Match",
        "it": "Punteggio oltre 90 in Speed Match",
        "ja": "Speed Matchで90点以上",
        "ko": "Speed Match에서 90점 이상",
        "fi": "Yli 90 pistettä Speed Matchissa",
        "fa": "بیش از ۹۰ امتیاز در Speed Match",
    },
    "achEliteFocus": {
        "en": "Elite Focus",
        "tr": "Elit Odak",
        "ar": "تركيز النخبة",
        "fr": "Focus Élite",
        "de": "Elite-Fokus",
        "hi": "एलीट फोकस",
        "zh": "精英专注",
        "es": "Enfoque élite",
        "nl": "Elite focus",
        "it": "Focus élite",
        "ja": "エリートフォーカス",
        "ko": "엘리트 집중",
        "fi": "Eliitti-fokus",
        "fa": "تمرکز نخبه",
    },
    "achEliteFocusDesc": {
        "en": "Reach 900+ FPQ in Grid Focus",
        "tr": "Grid Focus'ta 900+ FPQ'ya ulaş",
        "ar": "حقق 900+ FPQ في Grid Focus",
        "fr": "Atteindre 900+ FPQ dans Grid Focus",
        "de": "900+ FPQ in Grid Focus erreichen",
        "hi": "Grid Focus में 900+ FPQ तक पहुंचें",
        "zh": "在Grid Focus中达到900+ FPQ",
        "es": "Alcanza 900+ FPQ en Grid Focus",
        "nl": "Bereik 900+ FPQ in Grid Focus",
        "it": "Raggiugi 900+ FPQ in Grid Focus",
        "ja": "Grid Focusで900+ FPQ達成",
        "ko": "Grid Focus에서 900+ FPQ 달성",
        "fi": "Saavuta 900+ FPQ Grid Focusissa",
        "fa": "در Grid Focus به ۹۰۰+ FPQ برس",
    },
    "ach30DayVeteran": {
        "en": "30-Day Veteran",
        "tr": "30 Günlük Veteran",
        "ar": "مخضرم 30 يومًا",
        "fr": "Vétéran de 30 jours",
        "de": "30-Tage-Veteran",
        "hi": "30-दिन का वेटरन",
        "zh": "30天老将",
        "es": "Veterano de 30 días",
        "nl": "30-daags veteraan",
        "it": "Veterano di 30 giorni",
        "ja": "30日ベテラン",
        "ko": "30일 베테랑",
        "fi": "30 päivän veteraani",
        "fa": "کهنه‌سرباز ۳۰ روزه",
    },
    "ach30DayVeteranDesc": {
        "en": "Train for 30 days total",
        "tr": "Toplamda 30 gün antrenman yap",
        "ar": "تدرب لمدة 30 يومًا إجمالاً",
        "fr": "Entraîne-toi 30 jours au total",
        "de": "Insgesamt 30 Tage trainieren",
        "hi": "कुल 30 दिन ट्रेन करें",
        "zh": "累计训练30天",
        "es": "Entrena 30 días en total",
        "nl": "Train in totaal 30 dagen",
        "it": "Allenati per 30 giorni totali",
        "ja": "合計30日間トレーニング",
        "ko": "총 30일 훈련",
        "fi": "Harjoittele yhteensä 30 päivää",
        "fa": "در مجموع ۳۰ روز تمرین کن",
    },
    "achNightOwl": {
        "en": "Night Owl",
        "tr": "Gece Kuşu",
        "ar": "بومة الليل",
        "fr": "Oiseau de nuit",
        "de": "Nachteule",
        "hi": "नाइट आउल",
        "zh": "夜猫子",
        "es": "Búho nocturno",
        "nl": "Nachtuil",
        "it": "Nottambulo",
        "ja": "夜型",
        "ko": "올빼미",
        "fi": "Yöpöllö",
        "fa": "جغد شب",
    },
    "achNightOwlDesc": {
        "en": "Complete a session after 10 PM",
        "tr": "Saat 22:00'dan sonra bir seans tamamla",
        "ar": "أكمل جلسة بعد الساعة 10 مساءً",
        "fr": "Termine une séance après 22h",
        "de": "Eine Sitzung nach 22 Uhr abschließen",
        "hi": "रात 10 बजे के बाद एक सेशन पूरा करें",
        "zh": "晚上10点后完成一次训练",
        "es": "Completa una sesión después de las 10 PM",
        "nl": "Voltooi een sessie na 22:00",
        "it": "Completa una sessione dopo le 22:00",
        "ja": "午後10時以降にセッション完了",
        "ko": "오후 10시 이후 세션 완료",
        "fi": "Suorita sessio klo 22 jälkeen",
        "fa": "یک جلسه را بعد از ساعت ۲۲ کامل کن",
    },
    "today": {
        "en": "Today",
        "tr": "Bugün",
        "ar": "اليوم",
        "fr": "Aujourd'hui",
        "de": "Heute",
        "hi": "आज",
        "zh": "今天",
        "es": "Hoy",
        "nl": "Vandaag",
        "it": "Oggi",
        "ja": "今日",
        "ko": "오늘",
        "fi": "Tänään",
        "fa": "امروز",
    },
    "yesterday": {
        "en": "Yesterday",
        "tr": "Dün",
        "ar": "أمس",
        "fr": "Hier",
        "de": "Gestern",
        "hi": "कल",
        "zh": "昨天",
        "es": "Ayer",
        "nl": "Gisteren",
        "it": "Ieri",
        "ja": "昨日",
        "ko": "어제",
        "fi": "Eilen",
        "fa": "دیروز",
    },
    "daysAgo": {
        "en": "%{count} days ago",
        "tr": "%{count} gün önce",
        "ar": "منذ %{count} أيام",
        "fr": "Il y a %{count} jours",
        "de": "Vor %{count} Tagen",
        "hi": "%{count} दिन पहले",
        "zh": "%{count}天前",
        "es": "Hace %{count} días",
        "nl": "%{count} dagen geleden",
        "it": "%{count} giorni fa",
        "ja": "%{count}日前",
        "ko": "%{count}일 전",
        "fi": "%{count} päivää sitten",
        "fa": "%{count} روز پیش",
    },
}

def main():
    langs = ["en","tr","ar","fr","de","hi","zh","es","nl","it","ja","ko","fi","fa"]
    summary = {}

    for lang in langs:
        path = os.path.join(LOCALES_DIR, f"{lang}.json")
        if not os.path.exists(path):
            print(f"  ⚠️  {lang}.json not found, skipping")
            continue

        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        added = 0
        for key, translations in NEW_KEYS.items():
            if key not in data:
                data[key] = translations.get(lang, translations["en"])
                added += 1

        with open(path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        summary[lang] = added
        status = "✅" if added > 0 else "⚪"
        print(f"  {status} {lang}.json: +{added} keys")

    total = sum(summary.values())
    print(f"\n✅ Done. {total} total keys added across {len(langs)} locales.")

if __name__ == '__main__':
    main()
