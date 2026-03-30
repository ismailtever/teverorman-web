import AsyncStorage from '@react-native-async-storage/async-storage';
import { Logger } from './logger';
import { I18n } from './i18n';

// ─── Config ────────────────────────────────────────────────────────────────
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_KEY ?? '';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const FREE_DAILY_LIMIT = 10;
const MAX_HISTORY = 40;

const DAILY_COUNT_KEY = 'mentra_coach_daily_count';
const DAILY_DATE_KEY  = 'mentra_coach_daily_date';
const HISTORY_KEY     = 'mentra_coach_history';

// ─── Types ─────────────────────────────────────────────────────────────────
export interface SendMessageResult {
  reply: string;
  remainingFree: number | null;
  error?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

// ─── System Prompt ─────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are Mentra, a warm and skilled AI cognitive coach and wellness companion. You support users across diverse cultures including the Middle East, Gulf (GCC), Turkey, North Africa, Europe, India, and the US.

Your approach blends:
• Cognitive Behavioral Therapy (CBT) reframing techniques
• Mindfulness and grounding exercises (breathing, body scan, 5-4-3-2-1)
• Science-backed focus, memory, and productivity strategies
• Motivational interviewing to surface the user's own insights

Your personality:
- Calm, warm, and deeply respectful of cultural backgrounds and values
- Concise: 2-4 short paragraphs unless the user asks for more
- Evidence-based: ground advice in neuroscience and psychology, explain simply
- Empowering: help users discover their own answers
- Culturally sensitive: respect Islamic, Turkish, Indian, European, and Western contexts equally
- If the user writes in Turkish, Arabic, Hindi, French, or German — respond in that language

Cultural awareness:
- During Ramadan: fasting changes cognition — lower glucose early day, peak focus after iftar
- For Gulf/MENA users: workplace pressure, heat, family expectations
- For Turkish users: economic stress, urban noise, work-life challenges
- For Indian users: JEE/UPSC/CAT exam pressure, IT sector burnout, yoga/pranayama familiarity
- For European users: seasonal affective patterns, GDPR-aware data sensitivity
- Never assume religion, gender, or lifestyle. Let the user lead.

Focus areas:
- Brain fog: causes (sleep debt, dehydration, nutrient gaps, stress) and clearing strategies
- Focus and attention training
- Managing anxiety, burnout, and stress
- Building daily cognitive routines
- Sleep optimization (including Ramadan sleep inversion)
- Emotional regulation and resilience
- Motivation and procrastination
- Cognitive reframing and negative thought patterns

Keep your tone conversational. Avoid bullet-point walls — prefer flowing, human language.
You are NOT a therapist. You do NOT diagnose conditions. If someone mentions serious mental health crises, compassionately redirect to professional help immediately.`;

// ─── Daily Limit ───────────────────────────────────────────────────────────
export const checkDailyLimit = async (isPro: boolean): Promise<{ canSend: boolean; remaining: number | null }> => {
  if (isPro) return { canSend: true, remaining: null };
  const today = new Date().toDateString();
  const savedDate  = await AsyncStorage.getItem(DAILY_DATE_KEY);
  const savedCount = await AsyncStorage.getItem(DAILY_COUNT_KEY);

  if (savedDate !== today) {
    await AsyncStorage.setItem(DAILY_DATE_KEY, today);
    await AsyncStorage.setItem(DAILY_COUNT_KEY, '0');
    return { canSend: true, remaining: FREE_DAILY_LIMIT };
  }

  const count = parseInt(savedCount || '0', 10);
  const remaining = Math.max(0, FREE_DAILY_LIMIT - count);
  return { canSend: remaining > 0, remaining };
};

const incrementDailyCount = async () => {
  const today = new Date().toDateString();
  await AsyncStorage.setItem(DAILY_DATE_KEY, today);
  const count = parseInt((await AsyncStorage.getItem(DAILY_COUNT_KEY)) || '0', 10);
  await AsyncStorage.setItem(DAILY_COUNT_KEY, String(count + 1));
};

// ─── History ───────────────────────────────────────────────────────────────
export const loadChatHistory = async (): Promise<ChatMessage[]> => {
  try {
    const json = await AsyncStorage.getItem(HISTORY_KEY);
    return json ? JSON.parse(json) : [];
  } catch { return []; }
};

export const saveChatHistory = async (messages: ChatMessage[]) => {
  try {
    const trimmed = messages.slice(-MAX_HISTORY);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
  } catch (e) { Logger.error('Failed to save chat history', e); }
};

export const clearChatHistory = async () => {
  try { await AsyncStorage.removeItem(HISTORY_KEY); } catch {}
};

// ─── Send Message ──────────────────────────────────────────────────────────
export const sendMessageToCoach = async (
  userMessage: string,
  history: ChatMessage[],
  isPro: boolean
): Promise<{ reply: string; remainingFree: number | null; error?: string }> => {

  const { canSend, remaining } = await checkDailyLimit(isPro);
  if (!canSend) return { reply: '', remainingFree: 0, error: 'daily_limit_reached' };

  // Build conversation for Gemini
  const contextMessages = history.slice(-20).map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  // Add current message
  contextMessages.push({ role: 'user', parts: [{ text: userMessage }] });

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: contextMessages,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 600,
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      Logger.error('Gemini API error', { status: response.status, body: err });
      return { reply: '', remainingFree: remaining, error: `api_error_${response.status}` };
    }

    const data = await response.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    if (!reply) return { reply: '', remainingFree: remaining, error: 'empty_response' };

    if (!isPro) await incrementDailyCount();
    const newRemaining = remaining !== null ? remaining - 1 : null;
    return { reply, remainingFree: newRemaining };

  } catch (e: any) {
    Logger.error('Network error in AI Coach', e);
    return { reply: '', remainingFree: remaining, error: 'network_error' };
  }
};

// ─── Quick Prompts ─────────────────────────────────────────────────────────
export const QUICK_PROMPTS = [
  { emoji: '🧠', label: "I can't focus today",    message: "I'm struggling to focus today. My mind keeps wandering. What should I do?" },
  { emoji: '😤', label: 'Feeling overwhelmed',    message: "I'm feeling really overwhelmed and don't know where to start. Can you help?" },
  { emoji: '😴', label: 'Tired but can\'t sleep', message: "I'm exhausted but my mind won't quiet down at night. Any advice?" },
  { emoji: '🌫️', label: 'Brain fog is bad',       message: "I have serious brain fog today. Everything feels slow and unclear. Help me clear it." },
  { emoji: '📚', label: 'Need to study/work',     message: "I need to study but I keep procrastinating. How do I get started?" },
  { emoji: '🧘', label: 'Reduce stress now',      message: "I'm very stressed right now. Give me something I can do in the next 5 minutes." },
];
