/**
 * ScienceTag — "Peer-reviewed method" credibility chip
 * 
 * Shown inside every game's "Why This Works" section.
 * Communicates that the exercise is backed by published research,
 * NOT a medical claim — it's the gym version, not the hospital version.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BookOpen } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { I18n } from '@/services/i18n';

interface ScienceTagProps {
  /** Short method identifier shown after the badge, e.g. "Corsi Block Test" */
  method?: string;
}

export function ScienceTag({ method }: ScienceTagProps) {
  const label = method
    ? `${I18n.t('peerReviewedPrefix')} · ${method}`
    : I18n.t('peerReviewedPrefix');

  return (
    <View style={styles.tag}>
      <BookOpen size={11} color={Colors.mentra.brandAccent} />
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: Colors.mentra.brandAccent + '12',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.mentra.brandAccent + '25',
  },
  text: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.mentra.brandAccent,
    letterSpacing: 0.3,
  },
});
