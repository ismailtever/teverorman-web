import json
import os

languages = ['ar', 'de', 'es', 'fa', 'fi', 'fr', 'hi', 'it', 'ja', 'ko', 'nl', 'tr', 'zh']
base_dir = r'C:\Users\Hp Victus\OneDrive - Istanbul Bilgi Universitesi\Masaüstü\teverorman-web\playground\inertial-meteor\Mentra\locales'

en_path = os.path.join(base_dir, 'en.json')
with open(en_path, 'r', encoding='utf-8') as f:
    en_data = json.load(f)

for lang in languages:
    lang_path = os.path.join(base_dir, f'{lang}.json')
    if os.path.exists(lang_path):
        with open(lang_path, 'r', encoding='utf-8') as f:
            lang_data = json.load(f)
        
        # Update missing keys
        updated_data = {**en_data, **lang_data}
        
        with open(lang_path, 'w', encoding='utf-8') as f:
            json.dump(updated_data, f, indent=2, ensure_ascii=False)
        print(f"Synced {lang}.json")
