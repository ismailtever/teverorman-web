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
import { BookOpen, Save, Tag as TagIcon, Smile, Meh, Frown, Sun, Cloud, Calendar } from 'lucide-react-native';

import { Metrics } from '@/constants/Theme';
import { I18n } from '@/services/i18n';
import { useMentraTheme } from '@/hooks/useMentraTheme';

// ─── Mood Options ─────────────────────────────────────────────────────────────

const MOODS = [
    { label: I18n.t('moodLabelGreat'), icon: <Sun size={22} color="#F59E0B" />, value: 5 },
    { label: I18n.t('moodLabelGood'), icon: <Smile size={22} color="#10B981" />, value: 4 },
    { label: I18n.t('moodLabelOkay'), icon: <Meh size={22} color="#6366F1" />, value: 3 },
    { label: I18n.t('moodLabelLow'), icon: <Cloud size={22} color="#3B82F6" />, value: 2 },
    { label: I18n.t('moodLabelRough'), icon: <Frown size={22} color="#EF4444" />, value: 1 },
];

const getTags = () => [I18n.t('tagProductive'), I18n.t('tagAnxious'), I18n.t('tagMotivated'), I18n.t('tagTired'), I18n.t('tagFocused'), I18n.t('tagGrateful'), I18n.t('tagStressed'), I18n.t('tagCreative')];

// ─── Calendar Strip ───────────────────────────────────────────────────────────

function CalendarStrip() {
    const C = useMentraTheme();
    const [selectedDay, setSelectedDay] = useState(new Date().getDay());
    const days = [I18n.t('calS1'), I18n.t('calM'), I18n.t('calT1'), I18n.t('calW'), I18n.t('calT2'), I18n.t('calF'), I18n.t('calS2')];
    const today = new Date().getDay();

    return (
        <View style={styles.calendarRow}>
            {days.map((d, i) => (
                <Pressable
                    key={i}
                    onPress={() => setSelectedDay(i)}
                    style={[
                        styles.dayChip,
                        {
                            backgroundColor: C.surface,
                            borderColor: i === selectedDay ? C.brandPrimary : C.border,
                        },
                        i === selectedDay && { backgroundColor: C.brandPrimary },
                        i === today && i !== selectedDay && { borderColor: C.brandPrimary },
                    ]}
                >
                    <Text style={[styles.dayText, { color: i === selectedDay ? '#FFF' : C.textDim }]}>{d}</Text>
                    {i === today && <View style={[styles.todayDot, { backgroundColor: C.brandPrimary }]} />}
                </Pressable>
            ))}
        </View>
    );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function JournalScreen() {
    const C = useMentraTheme();
    const insets = useSafeAreaInsets();
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
            style={{ flex: 1, backgroundColor: C.bg }}
        >
            <StatusBar style={C.statusBar} />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 8 }]}
                keyboardShouldPersistTaps="handled"
            >
                {/* ── Header ── */}
                <Animated.View entering={FadeInDown.springify()} style={styles.header}>
                    <View>
                        <Text style={[styles.screenTitle, { color: C.text }]}>{I18n.t('journalTitle')}</Text>
                        <Text style={[styles.screenSub, { color: C.textDim }]}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
                    </View>
                    <BookOpen size={24} color={C.brandPrimary} />
                </Animated.View>

                {/* ── Calendar ── */}
                <CalendarStrip />

                {/* ── Mood ── */}
                <Animated.View entering={FadeInDown.delay(80).springify()} style={styles.section}>
                    <Text style={[styles.sectionLabel, { color: C.text }]}>{I18n.t('journalFeelPrompt')}</Text>
                    <View style={styles.moodRow}>
                        {MOODS.map(m => (
                            <Pressable
                                key={m.value}
                                onPress={() => { Haptics.selectionAsync(); setSelectedMood(m.value); }}
                                style={[
                                    styles.moodBtn,
                                    {
                                        backgroundColor: selectedMood === m.value ? C.brandPrimary + '20' : C.surface,
                                        borderColor: selectedMood === m.value ? C.brandPrimary : C.border,
                                    },
                                ]}
                            >
                                {m.icon}
                                <Text style={[styles.moodLabel, { color: selectedMood === m.value ? C.brandPrimary : C.textDim }]}>{m.label}</Text>
                            </Pressable>
                        ))}
                    </View>
                </Animated.View>

                {/* ── Tags ── */}
                <Animated.View entering={FadeInDown.delay(140).springify()} style={styles.section}>
                    <Text style={[styles.sectionLabel, { color: C.text }]}>{I18n.t('journalTagsLabel')}</Text>
                    <View style={styles.tagsWrap}>
                        {getTags().map(tag => (
                            <Pressable
                                key={tag}
                                onPress={() => toggleTag(tag)}
                                style={[
                                    styles.tag,
                                    {
                                        backgroundColor: selectedTags.includes(tag) ? C.brandPrimary : C.surface,
                                        borderColor: selectedTags.includes(tag) ? C.brandPrimary : C.border,
                                    },
                                ]}
                            >
                                <Text style={[styles.tagText, { color: selectedTags.includes(tag) ? '#FFF' : C.textDim }]}>
                                    {tag}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </Animated.View>

                {/* ── Note ── */}
                <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.section}>
                    <Text style={[styles.sectionLabel, { color: C.text }]}>{I18n.t('journalNoteLabel')}</Text>
                    <TextInput
                        style={[styles.noteInput, { backgroundColor: C.surface, borderColor: C.border, color: C.text }]}
                        placeholder={I18n.t('journalPlaceholder')}
                        placeholderTextColor={C.muted}
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
                        { opacity: pressed ? 0.85 : 1, backgroundColor: saved ? C.success : C.brandPrimary },
                    ]}
                >
                    <Save size={18} color="#FFF" />
                    <Text style={styles.saveBtnText}>{saved ? I18n.t('journalSaved') : I18n.t('journalSave')}</Text>
                </Pressable>

                {/* ── Past Entries ── */}
                {pastEntries.length > 0 && (
                    <Animated.View entering={FadeInDown.delay(300).springify()} style={[styles.historySection, { borderTopColor: C.border }]}>
                        <Text style={[styles.historyTitle, { color: C.text }]}>{I18n.t('journalPastLabel')}</Text>
                        {pastEntries.map((item, idx) => {
                            const dateObj = new Date(item.date);
                            const moodObj = MOODS.find(m => m.value === item.mood);
                            return (
                                <View key={idx} style={[styles.entryCard, { backgroundColor: C.surface, borderColor: C.border }]}>
                                    <View style={styles.entryHeader}>
                                        <View style={styles.entryDateRow}>
                                            <Calendar size={14} color={C.textDim} />
                                            <Text style={[styles.entryDate, { color: C.textDim }]}>{dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
                                        </View>
                                        {moodObj && (
                                            <View style={[styles.entryMoodPill, { backgroundColor: C.surface2 }]}>
                                                {moodObj.icon}
                                                <Text style={[styles.entryMoodText, { color: C.text }]}>{moodObj.label}</Text>
                                            </View>
                                        )}
                                    </View>

                                    {item.note ? <Text style={[styles.entryNote, { color: C.text }]}>{item.note}</Text> : null}

                                    {item.tags && item.tags.length > 0 && (
                                        <View style={styles.entryTagsRow}>
                                            {item.tags.map((t: string) => (
                                                <View key={t} style={[styles.entryMiniTag, { backgroundColor: C.surface2 }]}>
                                                    <Text style={[styles.entryMiniTagText, { color: C.textDim }]}>{t}</Text>
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
    screenTitle: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
    screenSub: { fontSize: 13, marginTop: 2 },

    calendarRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
    dayChip: {
        width: 40, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
        borderWidth: 1,
        gap: 4,
    },
    dayText: { fontSize: 13, fontWeight: '600' },
    todayDot: { width: 4, height: 4, borderRadius: 2 },

    section: { marginBottom: 24 },
    sectionLabel: { fontSize: 14, fontWeight: '700', marginBottom: 12 },

    moodRow: { flexDirection: 'row', justifyContent: 'space-between' },
    moodBtn: {
        flex: 1, alignItems: 'center', gap: 6,
        paddingVertical: 12, borderRadius: 12,
        borderWidth: 1,
        marginHorizontal: 3,
    },
    moodLabel: { fontSize: 10, fontWeight: '600' },

    tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    tag: {
        paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
        borderWidth: 1,
    },
    tagText: { fontSize: 13, fontWeight: '600' },

    noteInput: {
        borderRadius: 14,
        borderWidth: 1,
        padding: 14, minHeight: 140, fontSize: 15, lineHeight: 22,
    },

    saveBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        borderRadius: 14, paddingVertical: 16, marginBottom: 40,
    },
    saveBtnText: { fontSize: 16, fontWeight: '700', color: '#FFF' },

    // History
    historySection: { marginTop: 10, borderTopWidth: 1, paddingTop: 32 },
    historyTitle: { fontSize: 18, fontWeight: '800', marginBottom: 16 },
    entryCard: { borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1 },
    entryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    entryDateRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    entryDate: { fontSize: 13, fontWeight: '600' },
    entryMoodPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
    entryMoodText: { fontSize: 11, fontWeight: '700' },
    entryNote: { fontSize: 14, lineHeight: 22, marginBottom: 12 },
    entryTagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    entryMiniTag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    entryMiniTagText: { fontSize: 10, fontWeight: '600' },
});
