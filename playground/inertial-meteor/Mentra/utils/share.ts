import { Share, Linking } from 'react-native';

const WHATSAPP_LANGS = ['tr', 'ar', 'hi'];

export async function shareResult(lang: string, message: string): Promise<void> {
    const langCode = lang.split('-')[0];
    if (WHATSAPP_LANGS.includes(langCode)) {
        const url = `whatsapp://send?text=${encodeURIComponent(message)}`;
        try {
            const canOpen = await Linking.canOpenURL(url);
            if (canOpen) {
                await Linking.openURL(url);
                return;
            }
        } catch {}
    }
    await Share.share({ message });
}
