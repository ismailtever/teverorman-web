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

export default function TermsScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ title: 'Terms of Service', headerBackTitle: 'Back' }} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>{I18n.t('legalTerms')}</Text>
        <Text style={styles.date}>{I18n.t('legalLastUpdated')}</Text>

        <Section title="1. Acceptance">
          By downloading or using Mentra, you agree to these Terms. If you do not agree, do not use the app. These Terms form a legally binding agreement between you and Tever Technology.
        </Section>

        <Section title="2. Description of Service">
          Mentra is a cognitive training and wellness application. It provides brain training games, AI-powered coaching, mood journaling, and progress tracking. Mentra is intended for personal wellness purposes only.
        </Section>

        <Section title="3. Not Medical Advice">
          Mentra is NOT a medical device. Content in the app, including AI Coach responses, is for informational and wellness purposes only. It does not constitute medical, psychological, or therapeutic advice. Do not use Mentra as a substitute for professional medical care.
        </Section>

        <Section title="4. Subscriptions & Billing">
          Mentra Pro is a subscription available as Monthly or Annual plans. Subscriptions are billed through your Apple ID. Subscriptions auto-renew unless cancelled at least 24 hours before the renewal date. You can manage subscriptions in your Apple ID Account Settings. No refunds are provided for partial subscription periods.
        </Section>

        <Section title="5. Free Tier Limitations">
          Free users may access a limited set of features including 3 brain games and 10 AI Coach messages per day. Tever Technology reserves the right to modify free tier limits at any time.
        </Section>

        <Section title="6. User Conduct">
          You agree not to: reverse engineer the app, use it for commercial purposes without permission, attempt to access other users' data, or use the AI Coach to generate harmful content.
        </Section>

        <Section title="7. Intellectual Property">
          All content, design, and technology in Mentra is owned by Tever Technology and protected by copyright laws. You may not copy, modify, or distribute any part of the app.
        </Section>

        <Section title="8. Limitation of Liability">
          To the maximum extent permitted by law, Tever Technology is not liable for any indirect, incidental, or consequential damages arising from your use of Mentra. Our total liability shall not exceed the amount you paid for the app in the past 12 months.
        </Section>

        <Section title="9. Governing Law">
          These Terms are governed by the laws of the Republic of Turkey. Disputes shall be resolved in Istanbul courts. For EU users, mandatory consumer protection laws of your country also apply.
        </Section>

        <Section title="10. Contact">
          Tever Technology{"\n"}
          www.tevertechnology.com{"\n"}
          legal@tevertechnology.com
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
