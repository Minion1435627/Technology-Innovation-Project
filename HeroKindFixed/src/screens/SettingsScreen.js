import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Switch, Alert, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { useAuth } from '../context/AuthContext';
export default function SettingsScreen({ navigation }) {
  const { profile, signOut } = useAuth();
  const user = profile;

  const [notifMessages,  setNotifMessages]  = useState(true);
  const [notifExchanges, setNotifExchanges] = useState(true);
  const [notifReminders, setNotifReminders] = useState(true);
  const [notifXP,        setNotifXP]        = useState(false);
  const [darkMode,       setDarkMode]       = useState(false);

  if (!user) return null;

  const todo = (label) => Alert.alert(label, `${label} screen coming soon.`);

  const confirmLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          navigation.getParent()?.reset({ index: 0, routes: [{ name: 'Login' }] });
        },
      },
    ]);
  };
  const confirmDelete = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all associated data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => todo('Delete Account') },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* ---------- Account ---------- */}
        <SectionHeader icon="👤" title="Account" />
        <Card>
          <Row icon="create-outline"      label="Edit Profile"          onPress={() => navigation.navigate('EditProfile')} />
          <Row icon="image-outline"       label="Change Avatar"         onPress={() => todo('Change Avatar')} last />
        </Card>

        {/* ---------- Verification ---------- */}
        <SectionHeader icon="🛡️" title="Verification" />
        <Card>
          <Row
            icon="checkmark-circle"
            iconColor={user.verified ? colors.success : colors.textMuted}
            label="Verified Status"
            right={
              <View style={[
                styles.verifiedPill,
                { backgroundColor: user.verified ? colors.supplyLight : colors.background }
              ]}>
                <Text style={[
                  styles.verifiedPillText,
                  { color: user.verified ? colors.success : colors.textMuted }
                ]}>
                  {user.verified ? 'Verified' : 'Not verified'}
                </Text>
              </View>
            }
          />
          <Row icon="school-outline" label="Verify Student Email"  onPress={() => todo('Verify Student Email')} />
          <Row icon="call-outline"   label="Verify Phone Number"  onPress={() => todo('Verify Phone Number')} last />
        </Card>

        {/* ---------- Privacy & Safety ---------- */}
        <SectionHeader icon="🔒" title="Privacy & Safety" />
        <Card>
          <Row icon="chatbubble-outline"     label="Who can message me"      onPress={() => navigation.navigate('WhoCanMessage')} />
          <Row icon="location-outline"       label="Show location settings"  onPress={() => navigation.navigate('LocationSettings')} />
          <Row icon="warning-outline"        label="Report a safety issue"   onPress={() => navigation.navigate('ReportSafetyIssue')} last />
        </Card>

        {/* ---------- Notifications ---------- */}
        <SectionHeader icon="🔔" title="Notifications" />
        <Card>
          <ToggleRow icon="chatbubbles-outline" label="Messages"         value={notifMessages}  onValueChange={setNotifMessages} />
          <ToggleRow icon="swap-horizontal"     label="Exchange updates" value={notifExchanges} onValueChange={setNotifExchanges} />
          <ToggleRow icon="alarm-outline"       label="Reminders"        value={notifReminders} onValueChange={setNotifReminders} />
          <ToggleRow icon="trophy-outline"      label="XP & rewards"     value={notifXP}        onValueChange={setNotifXP} last />
        </Card>

        {/* ---------- Help & Support ---------- */}
        <SectionHeader icon="❓" title="Help & Support" />
        <Card>
          <Row icon="help-circle-outline"     label="FAQ"                  onPress={() => navigation.navigate('FAQ')} />
          <Row icon="mail-outline"            label="Contact Support"      onPress={() => navigation.navigate('ContactSupport')} />
          <Row icon="book-outline"            label="Community Guidelines" onPress={() => navigation.navigate('CommunityGuidelines')} />
          <Row icon="phone-portrait-outline"  label="App Settings"         onPress={() => Linking.openSettings()} last />
        </Card>

        {/* ---------- Account Actions ---------- */}
        <SectionHeader icon="🚪" title="Account Actions" />
        <Card>
          <DangerRow icon="log-out-outline" label="Log out"        onPress={confirmLogout} />
          <DangerRow icon="trash-outline"   label="Delete Account" onPress={confirmDelete} destructive last />
        </Card>

        <Text style={styles.versionText}>HeroKind · v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

/* -------------------- Sub components -------------------- */

function SectionHeader({ icon, title }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionEmoji}>{icon}</Text>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function Card({ children }) {
  return <View style={styles.card}>{children}</View>;
}

function Row({ icon, iconColor, label, value, right, onPress, last }) {
  return (
    <TouchableOpacity
      style={[styles.row, !last && styles.rowDivider]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.5 : 1}
    >
      {!!icon && (
        <View style={styles.rowIcon}>
          <Ionicons name={icon} size={18} color={iconColor || colors.textSecondary} />
        </View>
      )}
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.rowRight}>
        {right ? right : (
          <>
            {!!value && <Text style={styles.rowValue}>{value}</Text>}
            {onPress && <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />}
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}

function ToggleRow({ icon, label, value, onValueChange, last }) {
  return (
    <View style={[styles.row, !last && styles.rowDivider]}>
      <View style={styles.rowIcon}>
        <Ionicons name={icon} size={18} color={colors.textSecondary} />
      </View>
      <Text style={styles.rowLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor={colors.card}
      />
    </View>
  );
}

function DangerRow({ icon, label, onPress, destructive, last }) {
  const tint = destructive ? colors.error : colors.textPrimary;
  return (
    <TouchableOpacity
      style={[styles.row, !last && styles.rowDivider]}
      onPress={onPress}
      activeOpacity={0.5}
    >
      <View style={styles.rowIcon}>
        <Ionicons name={icon} size={18} color={tint} />
      </View>
      <Text style={[styles.rowLabel, { color: tint, fontWeight: '600' }]}>{label}</Text>
    </TouchableOpacity>
  );
}

/* -------------------- Styles -------------------- */

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { paddingBottom: 40 },

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

  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 20, paddingTop: 22, paddingBottom: 8,
  },
  sectionEmoji: { fontSize: 16 },
  sectionTitle: {
    ...typography.smallBold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },

  card: {
    backgroundColor: colors.card,
    marginHorizontal: 16,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 3,
    elevation: 1,
  },

  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 13,
    gap: 12, minHeight: 48,
  },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: colors.border },
  rowIcon: {
    width: 28, height: 28, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.background,
  },
  rowLabel: { ...typography.body, color: colors.textPrimary, flex: 1 },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowValue: { ...typography.small, color: colors.textMuted },

  verifiedPill: {
    paddingHorizontal: 10, paddingVertical: 3,
    borderRadius: 10,
  },
  verifiedPillText: { ...typography.caption, fontWeight: '700' },

  versionText: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 28,
  },
});
