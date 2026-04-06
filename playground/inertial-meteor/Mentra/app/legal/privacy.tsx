import React from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { I18n } from '@/services/i18n';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <View style={styles.section}>
    <Text style={styles.heading}>{title}</Text>
    <Text style={styles.body}>{children}</Text>
  </View>
);

export default function PrivacyScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ title: 'Privacy Policy', headerBackTitle: 'Back' }} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>{I18n.t('legalPrivacy')}</Text>
        <Text style={styles.date}>{I18n.t('legalLastUpdated')}</Text>

        <Section title="1. Overview">
          Mentra is a cognitive training application developed by Tever Technology. We are committed to protecting your privacy through a "Local-First" architecture. This policy explains what data we collect, how we use it, and your rights across multiple jurisdictions including the EU, USA, Turkey, Japan, and South Korea.
        </Section>

        <Section title="2. Data We Collect">
          LOCAL DATA (stored only on your device): Session scores, reaction times, streak counts, journal entries, cognitive radar scores, and mood check-ins. This data never leaves your device unless you explicitly export it.{"\n\n"}
          AI COACH DATA: When you use the AI Coach feature, your messages are sent to Google's Gemini API to generate responses. Google's privacy policy applies to this data (policies.google.com/privacy). We do not store your chat history on our servers — it is stored locally on your device and deleted when you clear the conversation.{"\n\n"}
          PURCHASE DATA: If you subscribe to Mentra Pro, your purchase is processed through Apple's App Store and RevenueCat. We receive only your subscription status — no payment card details.
        </Section>

        <Section title="3. Data We Do NOT Collect">
          We do NOT collect: your name or email address (unless provided for support), device identifiers for advertising (IDFA), precise location data, contacts, camera or microphone data, or any biometric data. Mentra does not run advertising networks or sell user data to brokers.
        </Section>

        <Section title="4. AI Coach & Third Parties">
          The AI Coach uses Google Gemini API. Messages you send to the coach are transmitted over HTTPS to Google's servers to generate a response. Google's data processing terms apply (cloud.google.com/terms/data-processing-terms). Please do not share sensitive personal information (passwords, financial details, medical records) with the AI Coach.
        </Section>

        <Section title="5. Data Storage & Security">
          All local data is stored in the application's private sandboxed storage (AsyncStorage), which is protected by your device's native security systems (Passcode, Face ID, or Biometrics). We enforce HTTPS for all external communications and utilize industry-standard protocols to prevent unauthorized access.
        </Section>

        <Section title="6. Regional Compliance & Your Rights">
          You can delete all your data at any time from Settings → Data & Privacy → Reset. Uninstalling the app permanently deletes all local data.{"\n\n"}
          EU/UK Users (GDPR): You have the right to access, rectify, erase, and port your data. Mentra acts as a Data Controller for minimal purchase status and a Data Processor via Local Storage.{"\n\n"}
          USA Users (CCPA/CPRA): We do not "sell" or "share" your personal information. You have the right to know what data is collected and request its deletion.{"\n\n"}
          Turkish Users (KVKK): Your rights under Law No. 6698 are fully respected. Data remains within your device.{"\n\n"}
          Japanese Users (APPI): We comply with the Act on the Protection of Personal Information. Your cognitive data is considered personal information and is handled locally on your device.{"\n\n"}
          South Korean Users (PIPA): We comply with the Personal Information Protection Act. User data is not transmitted to third parties except for AI processing as described in Section 4.{"\n\n"}
          Persian (FA) / Iranian Users: We respect any relevant data protection regulations and ensure that no sensitive personal information is stored on our servers. All cognitive data remains on your device.{"\n\n"}
          MENA Users (PDPL): We comply with the Saudi Personal Data Protection Law and relevant regional regulations.{"\n\n"}
          Indian Users (DPDP Act 2023): We comply with India's Digital Personal Data Protection Act. No personal data is transmitted to our servers.
        </Section>

        <Section title="7. Children">
          Mentra is not intended for children under 13. We do not knowingly collect data from children. If you believe a child has provided data, contact us for immediate deletion.
        </Section>

        <Section title="8. Contact">
          Tever Technology{"\n"}
          Website: www.tevertechnology.com{"\n"}
          Email: privacy@tevertechnology.com{"\n"}
          Data Request: dpo@tevertechnology.com
        </Section>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.mentra.bg },
  scroll: { padding: 24, paddingBottom: 60 },
  title: { fontSize: 26, fontWeight: '800', color: Colors.mentra.text, marginBottom: 6, letterSpacing: -0.5 },
  date: { fontSize: 13, color: Colors.mentra.textDim, marginBottom: 28 },
  section: { marginBottom: 24 },
  heading: { fontSize: 15, fontWeight: '800', color: Colors.mentra.text, marginBottom: 8, letterSpacing: -0.2 },
  body: { fontSize: 14, color: Colors.mentra.textDim, lineHeight: 22 },
});
