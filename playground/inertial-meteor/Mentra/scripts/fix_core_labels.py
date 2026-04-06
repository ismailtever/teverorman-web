import json
import os

languages = {
    'ar': {'home': 'الرئيسية', 'coach': 'المدرب'},
    'fa': {'home': 'خانه', 'coach': 'مربی'},
    'tr': {'home': 'Ana Sayfa', 'coach': 'Koç'},
    'fr': {'home': 'Accueil', 'coach': 'Coach'},
    'de': {'home': 'Startseite', 'coach': 'Coach'},
    'es': {'home': 'Inicio', 'coach': 'Coach'},
    'it': {'home': 'Home', 'coach': 'Coach'},
    'nl': {'home': 'Home', 'coach': 'Coach'},
    'ja': {'home': 'ホーム', 'coach': 'コーチ'},
    'ko': {'home': '홈', 'coach': '코치'},
    'zh': {'home': '首页', 'coach': '教练'},
    'hi': {'home': 'होम', 'coach': 'कोच'},
    'fi': {'home': 'Koti', 'coach': 'Valmentaja'}
}

base_dir = r'C:\Users\Hp Victus\OneDrive - Istanbul Bilgi Universitesi\Masaüstü\teverorman-web\playground\inertial-meteor\Mentra\locales'

for lang, labels in languages.items():
    path = os.path.join(base_dir, f'{lang}.json')
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        data['home'] = labels['home']
        data['coach'] = labels['coach']
        
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"Updated core labels for {lang}")
