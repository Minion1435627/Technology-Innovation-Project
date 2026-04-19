import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { usePrivacy } from '../context/PrivacyContext';

const OPTIONS = [
  {
    key: 'everyone',
    icon: 'earth-outline',
    label: 'Everyone',
    description: 'Any HeroKind user can send you a message.',
  },
  {
    key: 'friends_only',
    icon: 'people-outline',
    label: 'Friends only',
    description: 'Only users you have added as friends can message you.',
  },
];

export default function WhoCanMessageScreen({ navigation }) {
  const { messagePrivacy, setMessagePrivacy } = usePrivacy();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Who can message me</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.container}>
        <Text style={styles.intro}>
          Choose who is allowed to send you direct messages on HeroKind.
        </Text>

        <View style={styles.card}>
          {OPTIONS.map((opt, idx) => {
            const selected = messagePrivacy === opt.key;
            const isLast = idx === OPTIONS.length - 1;
            return (
              <TouchableOpacity
                key={opt.key}
                style={[styles.row, !isLast && styles.rowDivider, selected && styles.rowSelected]}
                onPress={() => setMessagePrivacy(opt.key)}
                activeOpacity={0.6}
              >
                <View style={[styles.iconWrap, selected && styles.iconWrapSelected]}>
                  <Ionicons name={opt.icon} size={20} color={selected ? colors.primary : colors.textSecondary} />
                </View>
                <View style={styles.rowText}>
                  <Text style={[styles.rowLabel, selected && styles.rowLabelSelected]}>{opt.label}</Text>
                  <Text style={styles.rowDesc}>{opt.description}</Text>
                </View>
                <View style={[styles.radio, selected && styles.radioSelected]}>
                  {selected && <View style={styles.radioDot} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {messagePrivacy === 'friends_only' && (
          <View style={styles.notice}>
            <Ionicons name="information-circle-outline" size={16} color={colors.primary} />
            <Text style={styles.noticeText}>
              Users who are not your friends will see "You're not friends yet" when they try to message you.
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, paddingVertical: 12,
    backgroundColor: colors.card,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { ...typography.h3, color: colors.textPrimary },

  container: { padding: 20, gap: 16 },

  intro: { ...typography.body, color: colors.textSecondary },

  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 3,
    elevation: 1,
  },

  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 14, gap: 12,
  },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: colors.border },
  rowSelected: { backgroundColor: colors.primaryLight },

  iconWrap: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: colors.background,
    alignItems: 'center', justifyContent: 'center',
  },
  iconWrapSelected: { backgroundColor: colors.primaryLight },

  rowText: { flex: 1 },
  rowLabel: { ...typography.bodyBold, color: colors.textPrimary },
  rowLabelSelected: { color: colors.primaryDark },
  rowDesc: { ...typography.small, color: colors.textSecondary, marginTop: 2 },

  radio: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  radioSelected: { borderColor: colors.primary },
  radioDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: colors.primary,
  },

  notice: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: colors.primaryLight,
    borderRadius: 12, padding: 12,
  },
  noticeText: { ...typography.small, color: colors.primaryDark, flex: 1, lineHeight: 20 },
});
