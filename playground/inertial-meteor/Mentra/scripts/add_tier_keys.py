#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
add_tier_keys.py
Adds missing tier/level-up locale keys to all language files.
This completes Claude's Wave 6 locale work.
"""
import json, os, sys
sys.stdout.reconfigure(encoding='utf-8')

LOCALES_DIR = os.path.join(os.path.dirname(__file__), '..', 'locales')

TIER_KEYS = {
    "tierNoise":    { "en":"Noise","tr":"Gürültü","ar":"ضجيج","fr":"Bruit","de":"Rauschen","hi":"शोर","zh":"噪音","es":"Ruido","nl":"Ruis","it":"Rumore","ja":"ノイズ","ko":"잡음","fi":"Kohina","fa":"سر و صدا" },
    "tierSignal":   { "en":"Signal","tr":"Sinyal","ar":"إشارة","fr":"Signal","de":"Signal","hi":"संकेत","zh":"信号","es":"Señal","nl":"Signaal","it":"Segnale","ja":"シグナル","ko":"신호","fi":"Signaali","fa":"سیگنال" },
    "tierClarity":  { "en":"Clarity","tr":"Netlik","ar":"وضوح","fr":"Clarté","de":"Klarheit","hi":"स्पष्टता","zh":"清晰","es":"Claridad","nl":"Helderheid","it":"Chiarezza","ja":"明晰","ko":"명료함","fi":"Selkeys","fa":"وضوح" },
    "tierEdge":     { "en":"Edge","tr":"Keskinlik","ar":"حافة","fr":"Tranchant","de":"Schärfe","hi":"धार","zh":"锋芒","es":"Filo","nl":"Scherpte","it":"Affilato","ja":"エッジ","ko":"예리함","fi":"Terä","fa":"لبه" },
    "tierFlow":     { "en":"Flow","tr":"Akış","ar":"تدفق","fr":"Flux","de":"Flow","hi":"प्रवाह","zh":"流动","es":"Flujo","nl":"Flow","it":"Flusso","ja":"フロー","ko":"흐름","fi":"Virtaus","fa":"جریان" },
    "tierTimeless": { "en":"Timeless","tr":"Zamansız","ar":"خارج الزمن","fr":"Intemporel","de":"Zeitlos","hi":"कालातीत","zh":"超越时间","es":"Atemporal","nl":"Tijdloos","it":"Senza tempo","ja":"無限","ko":"초월","fi":"Ajaton","fa":"فراتر از زمان" },
    "lvlUpTitle":   { "en":"Level Up!","tr":"Seviye Atladın!","ar":"ارتقيت مستوى!","fr":"Niveau supérieur !","de":"Level Up!","hi":"लेवल अप!","zh":"升级了！","es":"¡Subiste de nivel!","nl":"Level omhoog!","it":"Livello superiore!","ja":"レベルアップ！","ko":"레벨 업!","fi":"Taso nousi!","fa":"سطح بالاتر!" },
    "lvlUpStatReaction": { "en":"Reaction time improved","tr":"Tepki süresi gelişti","ar":"تحسّن وقت الاستجابة","fr":"Temps de réaction amélioré","de":"Reaktionszeit verbessert","hi":"प्रतिक्रिया समय बेहतर हुआ","zh":"反应时间改善","es":"Tiempo de reacción mejorado","nl":"Reactietijd verbeterd","it":"Tempo di reazione migliorato","ja":"反応時間が向上","ko":"반응 시간 향상","fi":"Reaktioaika parani","fa":"زمان واکنش بهبود یافت" },
    "lvlUpStatAccuracy": { "en":"Accuracy improved","tr":"Doğruluk arttı","ar":"تحسّنت الدقة","fr":"Précision améliorée","de":"Genauigkeit verbessert","hi":"सटीकता बेहतर हुई","zh":"准确率提升","es":"Precisión mejorada","nl":"Nauwkeurigheid verbeterd","it":"Precisione migliorata","ja":"精度が向上","ko":"정확도 향상","fi":"Tarkkuus parani","fa":"دقت بهبود یافت" },
    "improvementReaction": { "en":"↑ %{ms}ms faster","tr":"↑ %{ms}ms daha hızlı","ar":"↑ %{ms}ms أسرع","fr":"↑ %{ms}ms plus rapide","de":"↑ %{ms}ms schneller","hi":"↑ %{ms}ms तेज","zh":"↑ 快了%{ms}毫秒","es":"↑ %{ms}ms más rápido","nl":"↑ %{ms}ms sneller","it":"↑ %{ms}ms più veloce","ja":"↑ %{ms}ms 速く","ko":"↑ %{ms}ms 빠름","fi":"↑ %{ms}ms nopeampi","fa":"↑ %{ms} میلی‌ثانیه سریع‌تر" },
    "improvementAccuracy": { "en":"↑ %{pct}% more accurate","tr":"↑ %{pct}% daha doğru","ar":"↑ %{pct}% أدق","fr":"↑ %{pct}% plus précis","de":"↑ %{pct}% genauer","hi":"↑ %{pct}% अधिक सटीक","zh":"↑ 准确率提升%{pct}%","es":"↑ %{pct}% más preciso","nl":"↑ %{pct}% nauwkeuriger","it":"↑ %{pct}% più preciso","ja":"↑ %{pct}%精度向上","ko":"↑ %{pct}% 정확도 향상","fi":"↑ %{pct}% tarkempi","fa":"↑ %{pct}% دقیق‌تر" },
    "xpGained":     { "en":"+%{xp} XP","tr":"+%{xp} XP","ar":"+%{xp} XP","fr":"+%{xp} XP","de":"+%{xp} XP","hi":"+%{xp} XP","zh":"+%{xp} XP","es":"+%{xp} XP","nl":"+%{xp} XP","it":"+%{xp} XP","ja":"+%{xp} XP","ko":"+%{xp} XP","fi":"+%{xp} XP","fa":"XP %{xp}+" },
    "levelLabel":   { "en":"Level %{level}","tr":"Seviye %{level}","ar":"المستوى %{level}","fr":"Niveau %{level}","de":"Level %{level}","hi":"लेवल %{level}","zh":"等级 %{level}","es":"Nivel %{level}","nl":"Niveau %{level}","it":"Livello %{level}","ja":"レベル %{level}","ko":"레벨 %{level}","fi":"Taso %{level}","fa":"سطح %{level}" },
}

def main():
    langs = ["en","tr","ar","fr","de","hi","zh","es","nl","it","ja","ko","fi","fa"]
    total_added = 0

    for lang in langs:
        path = os.path.join(LOCALES_DIR, f"{lang}.json")
        if not os.path.exists(path):
            print(f"  ⚠️  {lang}.json not found")
            continue
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        added = 0
        for key, translations in TIER_KEYS.items():
            if key not in data:
                data[key] = translations.get(lang, translations["en"])
                added += 1
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        total_added += added
        status = "✅" if added > 0 else "⚪"
        print(f"  {status} {lang}.json: +{added} keys")

    print(f"\n✅ Done. {total_added} total keys added across {len(langs)} locales.")

if __name__ == '__main__':
    main()
