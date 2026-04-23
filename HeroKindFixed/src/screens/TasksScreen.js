import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { useAuth } from '../context/AuthContext';

const DAILY_TASKS = [
  { id: 'daily_exchange', emoji: '🤝', label: 'Help 1 neighbour',     xp: 20 },
  { id: 'daily_review',   emoji: '⭐', label: 'Leave a review',        xp: 10 },
  { id: 'daily_message',  emoji: '💬', label: 'Send a message',        xp: 5  },
  { id: 'daily_post',     emoji: '📋', label: 'Post a need or supply', xp: 10 },
];

const WEEKLY_TASKS = [
  { id: 'weekly_exchanges', emoji: '🔄', label: 'Complete 3 exchanges',        xp: 50 },
  { id: 'weekly_lend',      emoji: '📦', label: 'Lend 2 items to neighbours',  xp: 40 },
  { id: 'weekly_reviews',   emoji: '🌟', label: 'Receive 2 reviews',           xp: 30 },
  { id: 'weekly_posts',     emoji: '📝', label: 'Post 3 supply or need items', xp: 30 },
  { id: 'weekly_start',     emoji: '🚀', label: 'Start 3 exchanges this week', xp: 20 },
];

const getToday   = () => new Date().toISOString().split('T')[0];
const getWeekKey = () => {
  const d = new Date();
  const jan1 = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d - jan1) / 86400000 + jan1.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${week}`;
};

export default function TasksScreen({ navigation }) {
  const { profile, patchProfile } = useAuth();
  const [dailyDone,  setDailyDone]  = useState([]);
  const [weeklyDone, setWeeklyDone] = useState([]);
  const [claiming,   setClaiming]   = useState(null);

  const load = useCallback(async () => {
    try {
      const [d, w] = await Promise.all([
        AsyncStorage.getItem('tasks_daily'),
        AsyncStorage.getItem('tasks_weekly'),
      ]);
      if (d) { const p = JSON.parse(d); if (p.date === getToday())   setDailyDone(p.done); }
      if (w) { const p = JSON.parse(w); if (p.week === getWeekKey()) setWeeklyDone(p.done); }
    } catch {}
  }, []);

  useEffect(() => { load(); }, [load]);

  const claim = async (task, isDaily) => {
    if (claiming) return;
    setClaiming(task.id);
    try {
      await patchProfile({
        xp:           (profile?.xp           ?? 0) + task.xp,
        weekly_score: (profile?.weekly_score  ?? 0) + task.xp,
      });
      if (isDaily) {
        const updated = [...dailyDone, task.id];
        setDailyDone(updated);
        await AsyncStorage.setItem('tasks_daily', JSON.stringify({ date: getToday(), done: updated }));
      } else {
        const updated = [...weeklyDone, task.id];
        setWeeklyDone(updated);
        await AsyncStorage.setItem('tasks_weekly', JSON.stringify({ week: getWeekKey(), done: updated }));
      }
      Alert.alert('🎉 XP Earned!', `+${task.xp} XP added to your profile.`);
    } catch {
      Alert.alert('Error', 'Could not claim XP. Please try again.');
    } finally {
      setClaiming(null);
    }
  };

  const resetTasks = () => {
    Alert.alert('Reset Tasks', 'Clear all claimed tasks for today and this week?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset', style: 'destructive', onPress: async () => {
          await Promise.all([
            AsyncStorage.removeItem('tasks_daily'),
            AsyncStorage.removeItem('tasks_weekly'),
          ]);
          setDailyDone([]);
          setWeeklyDone([]);
        },
      },
    ]);
  };

  const dailyEarned  = DAILY_TASKS .filter(t => dailyDone .includes(t.id)).reduce((s, t) => s + t.xp, 0);
  const weeklyEarned = WEEKLY_TASKS.filter(t => weeklyDone.includes(t.id)).reduce((s, t) => s + t.xp, 0);

  const renderTask = (task, isDaily) => {
    const done = isDaily ? dailyDone.includes(task.id) : weeklyDone.includes(task.id);
    return (
      <View key={task.id} style={[styles.taskRow, done && styles.taskRowDone]}>
        <View style={styles.taskCheck}>
          <Ionicons
            name={done ? 'checkmark-circle' : 'ellipse-outline'}
            size={22}
            color={done ? colors.primary : colors.textMuted}
          />
        </View>
        <View style={styles.taskInfo}>
          <Text style={styles.taskEmoji}>{task.emoji}</Text>
          <Text style={[styles.taskLabel, done && styles.taskLabelDone]}>{task.label}</Text>
        </View>
        {done ? (
          <Text style={styles.taskXpDone}>+{task.xp} XP</Text>
        ) : (
          <TouchableOpacity
            style={styles.claimBtn}
            onPress={() => claim(task, isDaily)}
            disabled={!!claiming}
            activeOpacity={0.75}
          >
            <Text style={styles.claimBtnText}>
              {claiming === task.id ? '…' : `+${task.xp} XP`}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tasks</Text>
        <TouchableOpacity onPress={resetTasks} style={styles.resetBtn}>
          <Ionicons name="refresh-outline" size={20} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>

        <View style={styles.xpBar}>
          <Ionicons name="flash" size={16} color={colors.primary} />
          <Text style={styles.xpBarText}>
            Total XP: <Text style={styles.xpBarBold}>{profile?.xp ?? 0}</Text>
            {'  ·  '}
            Weekly: <Text style={styles.xpBarBold}>{profile?.weekly_score ?? 0}</Text>
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🔥 Daily Tasks</Text>
            <Text style={styles.sectionSub}>Resets at midnight</Text>
          </View>
          <Text style={styles.sectionProgress}>
            {dailyDone.length}/{DAILY_TASKS.length} claimed · +{dailyEarned} XP today
          </Text>
          <View style={styles.taskList}>
            {DAILY_TASKS.map(t => renderTask(t, true))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📅 Weekly Tasks</Text>
            <Text style={styles.sectionSub}>Resets Monday</Text>
          </View>
          <Text style={styles.sectionProgress}>
            {weeklyDone.length}/{WEEKLY_TASKS.length} claimed · +{weeklyEarned} XP this week
          </Text>
          <View style={styles.taskList}>
            {WEEKLY_TASKS.map(t => renderTask(t, false))}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: colors.border,
    backgroundColor: colors.card,
  },
  backBtn:  { padding: 4 },
  resetBtn: { padding: 4 },
  headerTitle: { ...typography.h3, color: colors.textPrimary },

  body: { padding: 16, gap: 16 },

  xpBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.primaryLight,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
  },
  xpBarText: { ...typography.small, color: colors.primaryDark },
  xpBarBold: { fontWeight: '700' },

  section: {
    backgroundColor: colors.card, borderRadius: 16,
    padding: 16, borderWidth: 1, borderColor: colors.border, gap: 10,
  },
  sectionHeader:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle:    { ...typography.h4, color: colors.textPrimary },
  sectionSub:      { ...typography.caption, color: colors.textMuted },
  sectionProgress: { ...typography.small, color: colors.primary, fontWeight: '600' },

  taskList: { gap: 0 },
  taskRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 11,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  taskRowDone:   { opacity: 0.55 },
  taskCheck:     { width: 24, alignItems: 'center' },
  taskInfo:      { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  taskEmoji:     { fontSize: 18 },
  taskLabel:     { ...typography.body, color: colors.textPrimary },
  taskLabelDone: { textDecorationLine: 'line-through', color: colors.textMuted },
  claimBtn: {
    backgroundColor: colors.primary,
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
  },
  claimBtnText: { ...typography.small, color: colors.textWhite, fontWeight: '700' },
  taskXpDone:   { ...typography.small, color: colors.primary, fontWeight: '600', minWidth: 52, textAlign: 'right' },
});
