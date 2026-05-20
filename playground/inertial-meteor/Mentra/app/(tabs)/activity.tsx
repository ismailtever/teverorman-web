import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Activity, Calendar, Trophy, Zap, Clock } from 'lucide-react-native';

import { AppHeader } from '@/components/ui/AppHeader';
import { Card, StatCard, Section } from '@/components/ui/Cards';
import { SectionTitle } from '@/components/ui/Typography';
import { ListRow } from '@/components/ui/ListRow';
import { ProgressBar } from '@/components/ui/Progress';
import { useMentraTheme } from '@/hooks/useMentraTheme';
import { Metrics } from '@/constants/Theme';
import { ThemedText } from '@/components/themed-text';

// Mock data for the activity list
const RECENT_SESSIONS = [
    { id: '1', title: 'Deep Focus Morning', duration: '15 min', score: 92, date: 'Today' },
    { id: '2', title: 'Quick Speed Drill', duration: '5 min', score: 88, date: 'Yesterday' },
    { id: '3', title: 'Memory Grid Pro', duration: '10 min', score: 95, date: 'Tuesday' },
    { id: '4', title: 'Relaxation Session', duration: '12 min', score: 100, date: 'Monday' },
];

export default function ActivityScreen() {
    const C = useMentraTheme();
    const styles = makeStyles(C);

    return (
        <View style={styles.container}>
            <StatusBar style={C.statusBar} />
            <AppHeader title="Your Activity" />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Weekly Summary Card */}
                <Section style={styles.summarySection}>
                    <SectionTitle title="Weekly Summary" />
                    <Card variant="default" style={styles.summaryCard}>
                        <View style={styles.summaryHeader}>
                            <Trophy size={28} color={C.brandAccent} />
                            <View style={styles.summaryTitleContainer}>
                                <SectionTitle title="Great work, Athlete!" subtitle="You're on track to beat last week." />
                            </View>
                        </View>

                        <View style={styles.progressContainer}>
                            <View style={styles.progressLabels}>
                                <ThemedText style={{ color: C.textDim }}>Goal: 5 Sessions</ThemedText>
                                <ThemedText style={{ color: C.textDim, fontWeight: '700' }}>4/5</ThemedText>
                            </View>
                            <ProgressBar progress={0.8} color={C.brandPrimary} />
                        </View>

                        <View style={styles.statsGrid}>
                            <StatCard
                                title="Time"
                                value="42m"
                                icon={<Clock size={18} color={C.brandSecondary} />}
                                style={styles.flexCard}
                            />
                            <StatCard
                                title="Days"
                                value="4"
                                icon={<Calendar size={18} color={C.brandAccent} />}
                                style={styles.flexCard}
                            />
                        </View>
                    </Card>
                </Section>

                {/* Recent Sessions List */}
                <Section style={styles.listSection}>
                    <SectionTitle
                        title="Recent Sessions"
                        action={<Activity size={24} color={C.text} />}
                    />
                    <Card variant="outline" style={styles.listCard}>
                        {RECENT_SESSIONS.map((session, index) => (
                            <ListRow
                                key={session.id}
                                icon={<Zap size={20} color={C.brandPrimary} />}
                                title={session.title}
                                subtitle={`${session.date} • ${session.duration}`}
                                rightElement={<ThemedText style={{ color: C.textDim, fontWeight: '600' }}>{`${session.score} XP`}</ThemedText>}
                                showChevron
                                style={index !== RECENT_SESSIONS.length - 1 ? styles.borderBottom : undefined}
                                onPress={() => { }}
                            />
                        ))}
                    </Card>
                </Section>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

function makeStyles(C: ReturnType<typeof useMentraTheme>) {
    return StyleSheet.create({
        container: { flex: 1, backgroundColor: C.bg },
        scrollContent: { paddingTop: Metrics.spacing.m, paddingBottom: Metrics.spacing.xxl },
        summarySection: { paddingHorizontal: Metrics.spacing.l },
        summaryCard: { marginTop: Metrics.spacing.s },
        summaryHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Metrics.spacing.l },
        summaryTitleContainer: { marginLeft: Metrics.spacing.m, flex: 1 },
        progressContainer: { marginBottom: Metrics.spacing.l },
        progressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Metrics.spacing.xs },
        statsGrid: { flexDirection: 'row', gap: Metrics.spacing.m },
        flexCard: { flex: 1, padding: Metrics.spacing.m, backgroundColor: C.surface2 },
        listSection: { paddingHorizontal: Metrics.spacing.l, marginTop: Metrics.spacing.m },
        listCard: { padding: 0, overflow: 'hidden', marginTop: Metrics.spacing.s },
        borderBottom: { borderBottomWidth: 1, borderBottomColor: C.divider },
    });
}
