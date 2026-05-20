import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import {
  Send,
  BrainCircuit,
  Trash2,
  Zap,
  Sparkles,
} from 'lucide-react-native';

import { getPremiumStatus } from '@/services/purchases';
import { Storage } from '@/services/storage';
import {
  ChatMessage,
  SendMessageResult,
  loadChatHistory,
  saveChatHistory,
  clearChatHistory,
  sendMessageToCoach,
  checkDailyLimit,
  QUICK_PROMPTS,
} from '@/services/aiCoach';
import { useMentraTheme } from '@/hooks/useMentraTheme';

// ─── Typing Indicator ─────────────────────────────────────────────────────────

function TypingIndicator() {
  const C = useMentraTheme();
  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);

  useEffect(() => {
    const animate = (sv: typeof dot1, delay: number) => {
      sv.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(-6, { duration: 300 }),
            withTiming(0, { duration: 300 })
          ),
          -1,
          false
        )
      );
    };
    animate(dot1, 0);
    animate(dot2, 150);
    animate(dot3, 300);
  }, []);

  const s1 = useAnimatedStyle(() => ({ transform: [{ translateY: dot1.value }] }));
  const s2 = useAnimatedStyle(() => ({ transform: [{ translateY: dot2.value }] }));
  const s3 = useAnimatedStyle(() => ({ transform: [{ translateY: dot3.value }] }));

  return (
    <View style={[styles.typingBubble, { backgroundColor: C.surface, borderColor: C.border }]}>
      <View style={styles.typingDots}>
        <Animated.View style={[styles.dot, { backgroundColor: C.muted }, s1]} />
        <Animated.View style={[styles.dot, { backgroundColor: C.muted }, s2]} />
        <Animated.View style={[styles.dot, { backgroundColor: C.muted }, s3]} />
      </View>
    </View>
  );
}

// ─── Message Bubble ────────────────────────────────────────────────────────────

function MessageBubble({ message, index }: { message: ChatMessage; index: number }) {
  const C = useMentraTheme();
  const isUser = message.role === 'user';
  const time = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <Animated.View
      entering={FadeInDown.delay(Math.min(index * 30, 200)).springify()}
      style={[styles.messageRow, isUser ? styles.messageRowUser : styles.messageRowAI]}
    >
      {!isUser && (
        <View style={[styles.aiAvatar, { backgroundColor: C.brandPrimary }]}>
          <BrainCircuit size={16} color="#FFF" />
        </View>
      )}
      <View style={[
        styles.bubble,
        isUser
          ? [styles.bubbleUser, { backgroundColor: C.brandPrimary }]
          : [styles.bubbleAI, { backgroundColor: C.surface, borderColor: C.border, shadowColor: C.text }],
      ]}>
        <Text style={[styles.bubbleText, isUser ? styles.bubbleTextUser : { color: C.text }]}>
          {message.content}
        </Text>
        <Text style={[styles.bubbleTime, isUser ? styles.bubbleTimeUser : { color: C.muted }]}>
          {time}
        </Text>
      </View>
    </Animated.View>
  );
}

// ─── Empty State ───────────────────────────────────────────────────────────────

function EmptyState({ onPromptPress }: { onPromptPress: (msg: string) => void }) {
  const C = useMentraTheme();
  return (
    <Animated.View entering={FadeIn.springify()} style={styles.emptyContainer}>
      <View style={[styles.emptyAvatar, { backgroundColor: C.brandPrimary + '15', borderColor: C.brandPrimary + '30' }]}>
        <BrainCircuit size={36} color={C.brandPrimary} />
      </View>
      <Text style={[styles.emptyTitle, { color: C.text }]}>Your AI Life Coach</Text>
      <Text style={[styles.emptySubtitle, { color: C.textDim }]}>
        Ask me anything about focus, anxiety, habits, sleep, or how to perform at your best.
      </Text>

      <Text style={[styles.promptsLabel, { color: C.textDim }]}>QUICK STARTS</Text>
      <View style={styles.promptsGrid}>
        {QUICK_PROMPTS.map((p, i) => (
          <Pressable
            key={i}
            onPress={() => onPromptPress(p.message)}
            style={({ pressed }) => [
              styles.promptChip,
              { backgroundColor: C.surface, borderColor: C.border, shadowColor: C.text },
              pressed && { opacity: 0.7, transform: [{ scale: 0.97 }] },
            ]}
          >
            <Text style={styles.promptEmoji}>{p.emoji}</Text>
            <Text style={[styles.promptLabel, { color: C.text }]}>{p.label}</Text>
          </Pressable>
        ))}
      </View>
    </Animated.View>
  );
}

// ─── Main Screen ───────────────────────────────────────────────────────────────

export default function CoachScreen() {
  const C = useMentraTheme();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [userName, setUserName] = useState('');

  useFocusEffect(
    useCallback(() => {
      const init = async () => {
        const [history, pro, profile, limitInfo] = await Promise.all([
          loadChatHistory(),
          getPremiumStatus(),
          Storage.getUserProfile(),
          checkDailyLimit(false),
        ]);
        setMessages(history);
        setIsPro(pro);
        if (profile?.name) setUserName(profile.name.split(' ')[0]);
        setRemaining(pro ? null : limitInfo.remaining);
      };
      init();
    }, [])
  );

  const scrollToBottom = (animated = true) => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated }), 80);
  };

  const handleSend = async (overrideText?: string) => {
    const text = (overrideText ?? inputText).trim();
    if (!text || isTyping) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setInputText('');

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsTyping(true);
    scrollToBottom();

    const result: SendMessageResult = await sendMessageToCoach(text, messages, isPro);

    setIsTyping(false);

    if (result.error === 'daily_limit_reached') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert(
        'Daily Limit Reached',
        'You\'ve used all 10 free messages for today. Upgrade to Mentra Pro for unlimited AI coaching.',
        [
          { text: 'Not Now', style: 'cancel' },
          {
            text: 'Upgrade to Pro',
            style: 'default',
            onPress: () => router.push('/paywall/onboarding' as any),
          },
        ]
      );
      // Remove the user message that bounced
      setMessages(messages);
      return;
    }

    if (result.error || !result.reply) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const errorMsg: ChatMessage = {
        id: `e_${Date.now()}`,
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please check your internet connection and try again.",
        timestamp: Date.now(),
      };
      const finalMessages = [...newMessages, errorMsg];
      setMessages(finalMessages);
      await saveChatHistory(finalMessages);
      scrollToBottom();
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const aiMsg: ChatMessage = {
      id: `a_${Date.now()}`,
      role: 'assistant',
      content: result.reply,
      timestamp: Date.now(),
    };

    const finalMessages = [...newMessages, aiMsg];
    setMessages(finalMessages);
    await saveChatHistory(finalMessages);

    if (!isPro && result.remainingFree !== null) {
      setRemaining(result.remainingFree);
    }

    scrollToBottom();
  };

  const handleClearChat = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Clear Conversation',
      'Start a fresh conversation? Your history will be deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearChatHistory();
            setMessages([]);
          },
        },
      ]
    );
  };

  const canSend = inputText.trim().length > 0 && !isTyping;
  const showLimitBanner = !isPro && remaining !== null && remaining <= 3 && remaining > 0;
  const isLimitExhausted = !isPro && remaining === 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: C.bg }]}>
      <StatusBar style={C.statusBar} />

      {/* ── Header ── */}
      <Animated.View entering={FadeInDown.springify()} style={[styles.header, { borderBottomColor: C.border, backgroundColor: C.surface }]}>
        <View style={styles.headerLeft}>
          <View style={[styles.headerAvatar, { backgroundColor: C.brandPrimary }]}>
            <BrainCircuit size={20} color="#FFF" />
          </View>
          <View>
            <Text style={[styles.headerTitle, { color: C.text }]}>AI Coach</Text>
            <View style={styles.onlineRow}>
              <View style={[styles.onlineDot, { backgroundColor: C.success }]} />
              <Text style={[styles.onlineText, { color: C.textDim }]}>Online · Ready to help</Text>
            </View>
          </View>
        </View>
        <View style={styles.headerRight}>
          {!isPro && (
            <Pressable
              onPress={() => router.push('/paywall/onboarding' as any)}
              style={[styles.proChip, { backgroundColor: C.brandSecondary + '25', borderColor: C.brandPrimary + '30' }]}
            >
              <Zap size={12} color={C.brandPrimary} />
              <Text style={[styles.proChipText, { color: C.brandPrimary }]}>Pro</Text>
            </Pressable>
          )}
          {messages.length > 0 && (
            <Pressable onPress={handleClearChat} style={styles.clearBtn}>
              <Trash2 size={18} color={C.textDim} />
            </Pressable>
          )}
        </View>
      </Animated.View>

      {/* ── Limit warning banner ── */}
      {showLimitBanner && (
        <Animated.View entering={FadeInDown.springify()} style={styles.limitBanner}>
          <Sparkles size={14} color="#F59E0B" />
          <Text style={styles.limitBannerText}>
            {remaining} free message{remaining !== 1 ? 's' : ''} left today.{' '}
          </Text>
          <Pressable onPress={() => router.push('/paywall/onboarding' as any)}>
            <Text style={[styles.limitBannerLink, { color: C.brandPrimary }]}>Go Pro</Text>
          </Pressable>
        </Animated.View>
      )}

      {/* ── Messages ── */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {messages.length === 0 && !isTyping ? (
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >
            <EmptyState onPromptPress={(msg) => handleSend(msg)} />
          </ScrollView>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messageList}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => scrollToBottom(false)}
            renderItem={({ item, index }) => (
              <MessageBubble message={item} index={index} />
            )}
            ListFooterComponent={
              isTyping ? (
                <View style={styles.typingRow}>
                  <View style={[styles.aiAvatar, { backgroundColor: C.brandPrimary }]}>
                    <BrainCircuit size={16} color="#FFF" />
                  </View>
                  <TypingIndicator />
                </View>
              ) : null
            }
          />
        )}

        {/* ── Input Bar ── */}
        <View style={[styles.inputBar, { paddingBottom: insets.bottom + 8, borderTopColor: C.border, backgroundColor: C.surface }]}>
          {isLimitExhausted ? (
            <Pressable
              onPress={() => router.push('/paywall/onboarding' as any)}
              style={[styles.limitExhaustedBtn, { backgroundColor: C.brandPrimary }]}
            >
              <Zap size={16} color="#FFF" />
              <Text style={styles.limitExhaustedText}>Upgrade for Unlimited Coaching</Text>
            </Pressable>
          ) : (
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, { backgroundColor: C.bg, borderColor: C.border, color: C.text }]}
                placeholder={`Ask your coach anything...`}
                placeholderTextColor={C.muted}
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={1000}
                selectionColor={C.brandPrimary}
                returnKeyType="default"
                blurOnSubmit={false}
              />
              <Pressable
                onPress={() => handleSend()}
                disabled={!canSend}
                style={[
                  styles.sendBtn,
                  canSend ? { backgroundColor: C.brandPrimary } : { backgroundColor: C.surface2 },
                ]}
              >
                {isTyping ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Send size={18} color={canSend ? '#FFF' : C.muted} />
                )}
              </Pressable>
            </View>
          )}

          {/* Free tier counter */}
          {!isPro && remaining !== null && !isLimitExhausted && (
            <Text style={[styles.freeCounter, { color: C.muted }]}>
              {remaining}/{10} free messages today
            </Text>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  onlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  onlineText: {
    fontSize: 12,
    fontWeight: '500',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  proChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  proChipText: {
    fontSize: 11,
    fontWeight: '800',
  },
  clearBtn: {
    padding: 8,
  },

  // Limit banner
  limitBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#FDE68A',
  },
  limitBannerText: {
    fontSize: 13,
    color: '#92400E',
    fontWeight: '500',
    flex: 1,
  },
  limitBannerLink: {
    fontSize: 13,
    fontWeight: '800',
  },

  // Messages
  messageList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
    gap: 12,
  },
  messageRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-end',
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  messageRowAI: {
    justifyContent: 'flex-start',
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
    flexShrink: 0,
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 4,
  },
  bubbleUser: {
    borderBottomRightRadius: 4,
  },
  bubbleAI: {
    borderWidth: 1,
    borderBottomLeftRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 22,
  },
  bubbleTextUser: {
    color: '#FFF',
    fontWeight: '500',
  },
  bubbleTime: {
    fontSize: 10,
    alignSelf: 'flex-end',
  },
  bubbleTimeUser: {
    color: 'rgba(255,255,255,0.55)',
  },

  // Typing
  typingRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginTop: 4,
  },
  typingBubble: {
    borderWidth: 1,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  typingDots: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    alignItems: 'center',
  },
  emptyAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    maxWidth: 280,
  },
  promptsLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  promptsGrid: {
    width: '100%',
    gap: 10,
  },
  promptChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  promptEmoji: {
    fontSize: 20,
  },
  promptLabel: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },

  // Input bar
  inputBar: {
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    gap: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 15,
    maxHeight: 120,
    lineHeight: 20,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  freeCounter: {
    fontSize: 11,
    textAlign: 'center',
    fontWeight: '500',
  },

  // Limit exhausted
  limitExhaustedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    paddingVertical: 14,
  },
  limitExhaustedText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
  },
});
