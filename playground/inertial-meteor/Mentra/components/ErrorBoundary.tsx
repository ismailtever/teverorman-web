import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Metrics } from '@/constants/Theme';
import { Brain } from 'lucide-react-native';
import { useMentraTheme } from '@/hooks/useMentraTheme';

interface Props {
    children: React.ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

// Inner functional component so we can use hooks
function ErrorUI({ onRestart }: { onRestart: () => void }) {
    const C = useMentraTheme();
    const styles = makeStyles(C);
    return (
        <View style={styles.container}>
            <Brain color={C.brandPrimary} size={64} style={{ marginBottom: Metrics.spacing.xl }} />
            <Text style={styles.title}>System Interruption</Text>
            <Text style={styles.subtitle}>
                Mentra experienced an unexpected cognitive load. Please restart the protocol.
            </Text>
            <Pressable style={styles.button} onPress={onRestart}>
                <Text style={styles.btnText}>Restart App</Text>
            </Pressable>
        </View>
    );
}

export class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("Global Error Boundary Caught:", error, errorInfo);
    }

    handleRestart = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return <ErrorUI onRestart={this.handleRestart} />;
        }
        return this.props.children;
    }
}

function makeStyles(C: ReturnType<typeof useMentraTheme>) {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: C.bg,
            alignItems: 'center',
            justifyContent: 'center',
            padding: Metrics.spacing.xl,
        },
        title: {
            fontSize: 24,
            fontWeight: 'bold',
            color: C.text,
            marginBottom: Metrics.spacing.m,
        },
        subtitle: {
            fontSize: 16,
            color: C.textDim,
            textAlign: 'center',
            marginBottom: Metrics.spacing.xxl,
            lineHeight: 24,
        },
        button: {
            backgroundColor: C.surface,
            paddingVertical: Metrics.spacing.m,
            paddingHorizontal: Metrics.spacing.xl,
            borderRadius: Metrics.radius.m,
            borderWidth: 1,
            borderColor: C.brandPrimary,
        },
        btnText: {
            color: C.text,
            fontWeight: '600',
            fontSize: 16,
        }
    });
}
