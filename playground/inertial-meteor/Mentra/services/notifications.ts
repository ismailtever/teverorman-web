import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18n } from './i18n';
import { Logger } from './logger';

// Behavior for notifications when app is in foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export const NotificationService = {
    async requestPermissionsAsync() {
        if (!Device.isDevice) {
            Logger.log('Must use physical device for Push Notifications');
            return false;
        }

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            Logger.log('Failed to get push token for push notification!');
            return false;
        }

        if (Platform.OS === 'android') {
            Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#10B981',
            });
        }
        return true;
    },

    async scheduleDailyStreakReminder() {
        try {
            const hasPermission = await this.requestPermissionsAsync();
            if (!hasPermission) return;

            // Clear any existing reminders to avoid duplicates
            await Notifications.cancelAllScheduledNotificationsAsync();

            // Schedule for 20:00 (8:00 PM) every day
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: I18n.t('notifStreakTitle'),
                    body: I18n.t('notifStreakBody'),
                    sound: true,
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.DAILY,
                    hour: 20,
                    minute: 0,
                },
            });
            Logger.log('Scheduled daily streak reminder for 20:00');
        } catch (error) {
            Logger.error('Error scheduling notification', error);
        }
    },

    async cancelStreakReminderForToday() {
        try {
            await Notifications.cancelAllScheduledNotificationsAsync();

            // Schedule for tomorrow 20:00
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(20, 0, 0, 0);

            await Notifications.scheduleNotificationAsync({
                content: {
                    title: I18n.t('notifStreakTitle'),
                    body: I18n.t('notifStreakBody'),
                    sound: true,
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
                    year: tomorrow.getFullYear(),
                    month: tomorrow.getMonth() + 1,
                    day: tomorrow.getDate(),
                    hour: 20,
                    minute: 0,
                    repeats: true // Repeats daily starting tomorrow
                },
            });
            Logger.log('Streak reminder bumped to tomorrow 20:00');
        } catch (error) {
            Logger.error('Error cancelling/rescheduling notification', error);
        }
    }
};
