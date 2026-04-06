import React, { useState, useCallback } from 'react';
import {
    View, Text, ScrollView, TextInput, Pressable,
    StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BookOpen, Save, Smile, Meh, Frown, Sun, Cloud, Calendar } from 'lucide-react-native';

import { Colors } from '@/constants/Colors';
import { I18n, useI18n } from '@/services/i18n';


// ─── Calendar Strip ───────────────────────────────────────────────────────────

function CalendarStrip({ days }: { days: string[] }) {
    const [selectedDay, setSelectedDay] = useState(new Date().getDay());
    const today = new Date().getDay();

    return (
        <View style={styles.calendarRow}>
            {days.map((d, i) => (
                <Pressable
                    key={i}
                    onPress={() => setSelectedDay(i)}
                    style={[
                        styles.dayChip,
                        i === selectedDay && styles.dayChipActive,
                        i === today && i !== selectedDay && styles.dayChipToday,
                    ]}
                >
                    <Text style={[styles.dayText, i === selectedDay && styles.dayTextActive]}>{d}</Text>
                    {i === today && <View style={styles.todayDot} />}
                </Pressable>
            ))}
        </View>
    );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function JournalScreen() {
    const insets = useSafeAreaInsets();
    const { lang, t } = useI18n();

    const MOODS = React.useMemo(() => [
        { label: t('moodLabelGreat'), icon: <Sun size={22} color="#F59E0B" />, value: 5 },
        { label: t('moodLabelGood'), icon: <Smile size={22} color="#10B981" />, value: 4 },
        { label: t('moodLabelOkay'), icon: <Meh size={22} color="#6366F1" />, value: 3 },
        { label: t('moodLabelLow'), icon: <Cloud size={22} color="#3B82F6" />, value: 2 },
        { label: t('moodLabelRough'), icon: <Frown size={22} color="#EF4444" />, value: 1 },
    ], [lang]);

    const tags = React.useMemo(() => [
        t('tagProductive'), t('tagAnxious'), t('tagMotivated'), t('tagTired'),
        t('tagFocused'), t('tagGrateful'), t('tagStressed'), t('tagCreative')
    ], [lang]);

    const calendarDays = React.useMemo(() => [
        t('calS1'), t('calM'), t('calT1'), t('calW'), t('calT2'), t('calF'), t('calS2')
    ], [lang]);

    const [selectedMood, setSelectedMood] = useState<number | null>(null);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [noteText, setNoteText] = useState('');
    const [saved, setSaved] = useState(false);
    const [pastEntries, setPastEntries] = useState<any[]>([]);

    useFocusEffect(
        useCallback(() => {
            loadEntries();
        }, [])
    );

    const loadEntries = async () => {
        try {
            const existing = await AsyncStorage.getItem('mentra_journal');
            if (existing) setPastEntries(JSON.parse(existing));
        } catch (e) { }
    };

    const toggleTag = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    const handleSave = async () => {
        if (!noteText.trim() && selectedMood === null) return;
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        const entry = {
            date: new Date().toISOString(),
            mood: selectedMood,
            tags: selectedTags,
            note: noteText,
        };
        const existing = await AsyncStorage.getItem('mentra_journal');
        const entries = existing ? JSON.parse(existing) : [];
        entries.unshift(entry);
        await AsyncStorage.setItem('mentra_journal', JSON.stringify(entries));
        setPastEntries(entries);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        setNoteText('');
        setSelectedMood(null);
        setSelectedTags([]);
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1, backgroundColor: Colors.mentra.bg }}
        >
            <StatusBar style="dark" />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 8 }]}
                keyboardShouldPersistTaps="handled"
            >
                {/* ── Header ── */}
                <Animated.View entering={FadeInDown.springify()} style={styles.header}>
                    <View>
                        <Text style={styles.screenTitle}>{t('journalTitle')}</Text>
                        <Text style={styles.screenSub}>{new Date().toLocaleDateString(I18n.getDateLocale(), { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
                    </View>
                    <BookOpen size={24} color={Colors.mentra.brandPrimary} />
                </Animated.View>

                {/* ── Calendar ── */}
                <CalendarStrip days={calendarDays} />

                {/* ── Mood ── */}
                <Animated.View entering={FadeInDown.delay(80).springify()} style={styles.section}>
                    <Text style={styles.sectionLabel}>{t('journalFeelPrompt')}</Text>
                    <View style={styles.moodRow}>
                        {MOODS.map(m => (
                            <Pressable
                                key={m.value}
                                onPress={() => { Haptics.selectionAsync(); setSelectedMood(m.value); }}
                                style={[styles.moodBtn, selectedMood === m.value && styles.moodBtnActive]}
                            >
                                {m.icon}
                                <Text style={[styles.moodLabel, selectedMood === m.value && styles.moodLabelActive]}>{m.label}</Text>
                            </Pressable>
                        ))}
                    </View>
                </Animated.View>

                {/* ── Tags ── */}
                <Animated.View entering={FadeInDown.delay(140).springify()} style={styles.section}>
                    <Text style={styles.sectionLabel}>{t('journalTagsLabel')}</Text>
                    <View style={styles.tagsWrap}>
                        {tags.map(tag => (
                            <Pressable
                                key={tag}
                                onPress={() => toggleTag(tag)}
                                style={[styles.tag, selectedTags.includes(tag) && styles.tagActive]}
                            >
                                <Text style={[styles.tagText, selectedTags.includes(tag) && styles.tagTextActive]}>
                                    {tag}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </Animated.View>

                {/* ── Note ── */}
                <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.section}>
                    <Text style={styles.sectionLabel}>{t('journalNoteLabel')}</Text>
                    <TextInput
                        style={styles.noteInput}
                        placeholder={t('journalPlaceholder')}
                        placeholderTextColor={Colors.mentra.muted}
                        value={noteText}
                        onChangeText={setNoteText}
                        multiline
                        textAlignVertical="top"
                    />
                </Animated.View>

                {/* ── Save Button ── */}
                <Pressable
                    onPress={handleSave}
                    style={({ pressed }) => [
                        styles.saveBtn,
                        { opacity: pressed ? 0.85 : 1, backgroundColor: saved ? Colors.mentra.success : Colors.mentra.brandPrimary },
                    ]}
                >
                    <Save size={18} color="#FFF" />
                    <Text style={styles.saveBtnText}>{saved ? t('journalSaved') : t('journalSave')}</Text>
                </Pressable>

                {/* ── Past Entries ── */}
                {pastEntries.length > 0 && (
                    <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.historySection}>
                        <Text style={styles.historyTitle}>{t('journalPastLabel')}</Text>
                        {pastEntries.map((item, idx) => {
                            const dateObj = new Date(item.date);
                            const moodObj = MOODS.find(m => m.value === item.mood);
                            return (
                                <View key={idx} style={styles.entryCard}>
                                    <View style={styles.entryHeader}>
                                        <View style={styles.entryDateRow}>
                                            <Calendar size={14} color={Colors.mentra.textDim} />
                                            <Text style={styles.entryDate}>{dateObj.toLocaleDateString(I18n.getDateLocale(), { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
                                        </View>
                                        {moodObj && (
                                            <View style={styles.entryMoodPill}>
                                                {moodObj.icon}
                                                <Text style={styles.entryMoodText}>{moodObj.label}</Text>
                                            </View>
                                        )}
                                    </View>

                                    {item.note ? <Text style={styles.entryNote}>{item.note}</Text> : null}

                                    {item.tags && item.tags.length > 0 && (
                                        <View style={styles.entryTagsRow}>
                                            {item.tags.map((t: string) => (
                                                <View key={t} style={styles.entryMiniTag}>
                                                    <Text style={styles.entryMiniTagText}>{t}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    )}
                                </View>
                            );
                        })}
                    </Animated.View>
                )}

            </ScrollView>
        </KeyboardAvoidingView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    scroll: { paddingHorizontal: 20, paddingBottom: 120 },

    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
    screenTitle: { fontSize: 28, fontWeight: '800', color: Colors.mentra.text, letterSpacing: -0.5 },
    screenSub: { fontSize: 13, color: Colors.mentra.textDim, marginTop: 2 },

    calendarRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
    dayChip: {
        width: 40, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
        backgroundColor: Colors.mentra.surface, borderWidth: 1, borderColor: Colors.mentra.border,
        gap: 4,
    },
    dayChipActive: { backgroundColor: Colors.mentra.brandPrimary, borderColor: Colors.mentra.brandPrimary },
    dayChipToday: { borderColor: Colors.mentra.brandPrimary },
    dayText: { fontSize: 13, fontWeight: '600', color: Colors.mentra.textDim },
    dayTextActive: { color: '#FFF' },
    todayDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.mentra.brandPrimary },

    section: { marginBottom: 24 },
    sectionLabel: { fontSize: 14, fontWeight: '700', color: Colors.mentra.text, marginBottom: 12 },

    moodRow: { flexDirection: 'row', justifyContent: 'space-between' },
    moodBtn: {
        flex: 1, alignItems: 'center', gap: 6,
        paddingVertical: 12, borderRadius: 12,
        backgroundColor: Colors.mentra.surface, borderWidth: 1, borderColor: Colors.mentra.border,
        marginHorizontal: 3,
    },
    moodBtnActive: { backgroundColor: Colors.mentra.brandPrimary + '20', borderColor: Colors.mentra.brandPrimary },
    moodLabel: { fontSize: 10, fontWeight: '600', color: Colors.mentra.textDim },
    moodLabelActive: { color: Colors.mentra.brandPrimary },

    tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    tag: {
        paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
        borderWidth: 1, borderColor: Colors.mentra.border,
        backgroundColor: Colors.mentra.surface,
    },
    tagActive: { backgroundColor: Colors.mentra.brandPrimary, borderColor: Colors.mentra.brandPrimary },
    tagText: { fontSize: 13, fontWeight: '600', color: Colors.mentra.textDim },
    tagTextActive: { color: '#FFF' },

    noteInput: {
        backgroundColor: Colors.mentra.surface, borderRadius: 14,
        borderWidth: 1, borderColor: Colors.mentra.border,
        padding: 14, minHeight: 140, fontSize: 15, color: Colors.mentra.text, lineHeight: 22,
    },

    saveBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        borderRadius: 14, paddingVertical: 16, marginBottom: 40,
    },
    saveBtnText: { fontSize: 16, fontWeight: '700', color: '#FFF' },

    // History
    historySection: { marginTop: 10, borderTopWidth: 1, borderTopColor: Colors.mentra.border, paddingTop: 32 },
    historyTitle: { fontSize: 18, fontWeight: '800', color: Colors.mentra.text, marginBottom: 16 },
    entryCard: { backgroundColor: Colors.mentra.surface, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: Colors.mentra.border },
    entryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    entryDateRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    entryDate: { fontSize: 13, fontWeight: '600', color: Colors.mentra.textDim },
    entryMoodPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.mentra.surface2, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
    entryMoodText: { fontSize: 11, fontWeight: '700', color: Colors.mentra.text },
    entryNote: { fontSize: 14, color: Colors.mentra.text, lineHeight: 22, marginBottom: 12 },
    entryTagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    entryMiniTag: { backgroundColor: Colors.mentra.surface2, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    entryMiniTagText: { fontSize: 10, fontWeight: '600', color: Colors.mentra.textDim },
});
