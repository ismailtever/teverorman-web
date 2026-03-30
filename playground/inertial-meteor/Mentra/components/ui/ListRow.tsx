import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '../themed-text';
import { Colors } from '@/constants/Colors';
import { Metrics } from '@/constants/Theme';
import { ChevronRight } from 'lucide-react-native';

interface ListRowProps {
    title: string;
    subtitle?: string;
    icon?: React.ReactNode;
    rightElement?: React.ReactNode;
    onPress?: () => void;
    showChevron?: boolean;
    style?: any;
}

export const ListRow = ({ title, subtitle, icon, rightElement, onPress, showChevron = true, style, ...props }: ListRowProps) => {
    const Container = onPress ? TouchableOpacity : View;

    return (
        <Container
            style={[styles.container, style]}
            onPress={onPress}
            activeOpacity={0.7}
            {...(props as any)}
        >
            <View style={styles.leftContent}>
                {icon && <View style={styles.iconContainer}>{icon}</View>}
                <View style={styles.textContainer}>
                    <ThemedText style={styles.title}>{title}</ThemedText>
                    {subtitle && <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>}
                </View>
            </View>
            <View style={styles.rightContent}>
                {rightElement}
                {onPress && showChevron && !rightElement && (
                    <ChevronRight size={20} color={Colors.mentra.muted} />
                )}
            </View>
        </Container>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: Metrics.spacing.m,
        paddingHorizontal: Metrics.spacing.l,
        backgroundColor: Colors.mentra.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.mentra.divider,
    },
    leftContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        marginRight: Metrics.spacing.m,
        width: 40,
        height: 40,
        borderRadius: Metrics.radius.m,
        backgroundColor: Colors.mentra.surface2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.mentra.text,
    },
    subtitle: {
        fontSize: 14,
        color: Colors.mentra.muted,
        marginTop: 2,
    },
    rightContent: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: Metrics.spacing.m,
    }
});
