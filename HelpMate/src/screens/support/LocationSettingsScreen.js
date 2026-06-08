import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch, Alert, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { usePrivacy } from '../../context/PrivacyContext';

export default function LocationSettingsScreen({ navigation }) {
  const { locationSettings, updateLocationSetting } = usePrivacy();
  const { useLocationForMap, hideFromNearby } = locationSettings;

  const openDeviceSettings = () => {
    Alert.alert(
      'Open device settings?',
      'You can change precise location access in your phone settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => Linking.openSettings() },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Location Settings</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>
          Choose how your location appears to neighbours. HelpMate only shares nearby area details, not your exact live position.
        </Text>

        <View style={styles.notice}>
          <Ionicons name="shield-checkmark-outline" size={18} color={colors.primary} />
          <Text style={styles.noticeText}>
            Your exact GPS location stays private. Map pins use approximate neighbourhood placement.
          </Text>
        </View>

        <Text style={styles.label}>Map Privacy</Text>
        <View style={styles.card}>
          <ToggleRow
            icon="navigate-outline"
            label="Use my location for nearby posts"
            description="When this is off, HelpMate uses the default neighbourhood map instead of your current GPS."
            value={useLocationForMap}
            onValueChange={value => updateLocationSetting('useLocationForMap', value)}
          />
          <ToggleRow
            icon="eye-off-outline"
            label="Hide me from nearby list"
            description="Your posts stay visible, but your profile will not appear as a nearby helper."
            value={hideFromNearby}
            onValueChange={value => updateLocationSetting('hideFromNearby', value)}
            last
          />
        </View>

        <Text style={styles.label}>Device Permission</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.permissionRow} onPress={openDeviceSettings} activeOpacity={0.6}>
            <View style={styles.iconBox}>
              <Ionicons name="settings-outline" size={18} color={colors.textSecondary} />
            </View>
            <View style={styles.permissionTextWrap}>
              <Text style={styles.permissionTitle}>Manage phone location access</Text>
              <Text style={styles.permissionSub}>Change precise location, while using app, or never.</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.saveBtn}
          onPress={() => Alert.alert('Saved', 'Your location settings have been updated.')}
          activeOpacity={0.7}
        >
          <Text style={styles.saveBtnText}>Save Settings</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function ToggleRow({ icon, label, description, value, onValueChange, last }) {
  return (
    <View style={[styles.toggleRow, !last && styles.rowDivider]}>
      <View style={styles.iconBox}>
        <Ionicons name={icon} size={18} color={colors.textSecondary} />
      </View>
      <View style={styles.toggleTextWrap}>
        <Text style={styles.toggleTitle}>{label}</Text>
        <Text style={styles.toggleSub}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.primaryLight }}
        thumbColor={value ? colors.primary : '#fff'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { paddingBottom: 48 },

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

  intro: {
    ...typography.body, color: colors.textSecondary,
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12,
  },
  notice: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: colors.primaryLight,
    marginHorizontal: 16,
    borderRadius: 14,
    padding: 14,
  },
  noticeText: { ...typography.small, color: colors.primaryDark, flex: 1, lineHeight: 19 },
  label: {
    ...typography.smallBold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    paddingHorizontal: 20, paddingTop: 22, paddingBottom: 8,
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
  toggleRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 14, paddingVertical: 13,
  },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: colors.border },
  iconBox: {
    width: 34, height: 34, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.background,
  },
  toggleTextWrap: { flex: 1 },
  toggleTitle: { ...typography.bodyBold, color: colors.textPrimary },
  toggleSub: { ...typography.caption, color: colors.textSecondary, marginTop: 3, lineHeight: 17 },
  permissionRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 14, paddingVertical: 14,
  },
  permissionTextWrap: { flex: 1 },
  permissionTitle: { ...typography.bodyBold, color: colors.textPrimary },
  permissionSub: { ...typography.caption, color: colors.textSecondary, marginTop: 3 },
  saveBtn: {
    backgroundColor: colors.primary,
    marginHorizontal: 16, marginTop: 24,
    borderRadius: 14, paddingVertical: 15,
    alignItems: 'center',
  },
  saveBtnText: { ...typography.button, color: colors.textWhite },
});
