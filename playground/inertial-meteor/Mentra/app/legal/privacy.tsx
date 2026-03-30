import React from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';

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
        <Text style={styles.title}>Privacy Policy</Text>
        <Text style={styles.date}>Tever Technology — Last Updated: March 2026</Text>

        <Section title="1. Overview">
          Mentra is a cognitive training application developed by Tever Technology. We are committed to protecting your privacy. This policy explains what data we collect, how we use it, and your rights.
        </Section>

        <Section title="2. Data We Collect">
          LOCAL DATA (stored only on your device): Session scores, reaction times, streak counts, journal entries, cognitive radar scores, and mood check-ins. This data never leaves your device unless you explicitly export it.{"\n\n"}
          AI COACH DATA: When you use the AI Coach feature, your messages are sent to Google's Gemini API to generate responses. Google's privacy policy applies to this data (policies.google.com/privacy). We do not store your chat history on our servers — it is stored locally on your device and deleted when you clear the conversation.{"\n\n"}
          PURCHASE DATA: If you subscribe to Mentra Pro, your purchase is processed through Apple's App Store and RevenueCat. We receive only your subscription status — no payment card details.
        </Section>

        <Section title="3. Data We Do NOT Collect">
          We do not collect: your name or email address, device identifiers for advertising (IDFA), location data, contacts, camera or microphone data, or any biometric data. Mentra does not run advertising networks.
        </Section>

        <Section title="4. AI Coach & Third Parties">
          The AI Coach uses Google Gemini API. Messages you send to the coach are transmitted over HTTPS to Google's servers to generate a response. Google's data processing terms apply (cloud.google.com/terms/data-processing-terms). Please do not share sensitive personal information (passwords, financial details, medical records) with the AI Coach.
        </Section>

        <Section title="5. Data Storage & Security">
          All local data is stored using Apple's encrypted storage (AsyncStorage). Your data is protected by your device passcode/Face ID. We use HTTPS for all API communications.
        </Section>

        <Section title="6. Your Rights">
          You can delete all your data at any time from Settings → Export Data → Reset. Uninstalling the app permanently deletes all local data. For AI Coach history, use the Clear button in the Coach tab.{"\n\n"}
          EU Users (GDPR Art. 17): You have the right to access, rectify, erase, and port your data.{"\n\n"}
          Turkish Users (KVKK): Your rights under Law No. 6698 are respected.{"\n\n"}
          Saudi/MENA Users (PDPL): We comply with the Saudi Personal Data Protection Law.{"\n\n"}
          Indian Users (DPDP Act 2023): We comply with India's Digital Personal Data Protection Act 2023. All your data is stored locally on your device. No personal data is transmitted to our servers. You have the right to access and erase your data at any time from Settings.
        </Section>

        <Section title="7. Children">
          Mentra is not intended for children under 13. We do not knowingly collect data from children under 13. If you believe a child has provided data, contact us immediately.
        </Section>

        <Section title="8. Contact">
          Tever Technology{"\n"}
          Website: www.tevertechnology.com{"\n"}
          Email: privacy@tevertechnology.com{"\n"}
          For data requests: dpo@tevertechnology.com
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
