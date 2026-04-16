import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
   ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { mockFarmerCrops } from '../../data/mockData';

export default function FarmerScreen({ navigation }) {
  const [crops, setCrops] = useState(mockFarmerCrops);
  const [harvested, setHarvested] = useState([]);

  const harvest = (cropId) => {
    setHarvested(prev => [...prev, cropId]);
    setCrops(prev => prev.map(c => c.id === cropId ? { ...c, status: 'harvested', harvestedAt: 'just now' } : c));
  };

  const readyCrops = crops.filter(c => c.status === 'ready');
  const growingCrops = crops.filter(c => c.status === 'growing');
  const harvestedCrops = crops.filter(c => c.status === 'harvested');
  const lockedCrops = crops.filter(c => c.status === 'locked');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🌾 My Farm</Text>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>Lv.3</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.container}>

        {/* Farm scene */}
        <View style={styles.farmScene}>
          <View style={styles.sky}>
            <Text style={styles.sun}>☀️</Text>
            <Text style={styles.cloud}>☁️</Text>
          </View>
          <View style={styles.field}>
            {/* Crop slots */}
            <View style={styles.cropGrid}>
              {crops.filter(c => c.status !== 'locked').map(crop => (
                <TouchableOpacity
                  key={crop.id}
                  style={[
                    styles.cropSlot,
                    crop.status === 'ready' && styles.cropSlotReady,
                    crop.status === 'harvested' && styles.cropSlotHarvested,
                  ]}
                  onPress={() => crop.status === 'ready' && harvest(crop.id)}
                  activeOpacity={crop.status === 'ready' ? 0.7 : 1}
                >
                  <Text style={styles.cropEmoji}>
                    {crop.status === 'harvested' ? '🟫' : crop.emoji}
                  </Text>
                  {crop.status === 'ready' && (
                    <View style={styles.readyPulse}>
                      <Text style={styles.readyText}>Ready!</Text>
                    </View>
                  )}
                  {crop.status === 'growing' && (
                    <View style={styles.progressBarMini}>
                      <View style={[styles.progressFillMini, { width: `${crop.progress * 100}%` }]} />
                    </View>
                  )}
                  <Text style={styles.cropName}>{crop.name}</Text>
                </TouchableOpacity>
              ))}
              {/* Empty plot slot */}
              <View style={styles.emptySlot}>
                <Text style={styles.emptySlotText}>+</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Ready to harvest */}
        {readyCrops.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎉 Ready to Harvest!</Text>
            {readyCrops.map(crop => (
              <View key={crop.id} style={styles.readyCard}>
                <Text style={styles.readyCardEmoji}>{crop.emoji}</Text>
                <View style={styles.readyCardInfo}>
                  <Text style={styles.readyCardName}>{crop.name}</Text>
                  <Text style={styles.readyCardSub}>Planted {crop.plantedAt}</Text>
                </View>
                <TouchableOpacity
                  style={styles.harvestBtn}
                  onPress={() => harvest(crop.id)}
                >
                  <Text style={styles.harvestBtnText}>Harvest 🌿</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Growing */}
        {growingCrops.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🌱 Growing</Text>
            {growingCrops.map(crop => (
              <View key={crop.id} style={styles.growingCard}>
                <Text style={styles.growingEmoji}>{crop.emoji}</Text>
                <View style={styles.growingInfo}>
                  <Text style={styles.growingName}>{crop.name}</Text>
                  <View style={styles.progressBarFull}>
                    <View style={[styles.progressFillFull, { width: `${crop.progress * 100}%` }]} />
                  </View>
                  <Text style={styles.growingTime}>⏰ {crop.hoursLeft} hours left</Text>
                </View>
                <Text style={styles.growingPct}>{Math.round(crop.progress * 100)}%</Text>
              </View>
            ))}
          </View>
        )}

        {/* Locked crops */}
        {lockedCrops.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔒 Unlock at higher levels</Text>
            {lockedCrops.map(crop => (
              <View key={crop.id} style={[styles.growingCard, styles.lockedCard]}>
                <Text style={[styles.growingEmoji, { opacity: 0.4 }]}>{crop.emoji}</Text>
                <View style={styles.growingInfo}>
                  <Text style={[styles.growingName, { color: colors.textMuted }]}>{crop.name}</Text>
                  <Text style={styles.lockedText}>Unlocks at Level {crop.requiredLevel}</Text>
                </View>
                <Text style={styles.lockIcon}>🔒</Text>
              </View>
            ))}
          </View>
        )}

        {/* Harvest history */}
        {harvestedCrops.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🧺 Harvest History</Text>
            <View style={styles.harvestGrid}>
              {harvestedCrops.map(crop => (
                <View key={crop.id} style={styles.harvestBadge}>
                  <Text style={styles.harvestBadgeEmoji}>{crop.emoji}</Text>
                  <Text style={styles.harvestBadgeName}>{crop.name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* How it works */}
        <View style={styles.howItWorks}>
          <Text style={styles.howTitle}>How it works</Text>
          <Text style={styles.howText}>
            🌱 Level up in HeroKind by helping neighbours{'\n'}
            🌾 Each level unlocks a new seed packet{'\n'}
            ⏰ Crops grow over real time (24–48 hours){'\n'}
            🧺 Harvested crops appear on your profile
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#8BC34A' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  backText: { ...typography.body, color: '#fff' },
  headerTitle: { ...typography.h3, color: '#fff' },
  levelBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  levelText: { ...typography.small, color: '#fff', fontWeight: '700' },

  container: { paddingBottom: 40 },

  farmScene: { backgroundColor: '#8BC34A' },
  sky: {
    height: 80,
    backgroundColor: '#87CEEB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  sun: { fontSize: 36 },
  cloud: { fontSize: 28 },
  field: {
    backgroundColor: '#795548',
    minHeight: 180,
    padding: 16,
    borderRadius: 0,
  },
  cropGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  cropSlot: {
    width: 80,
    height: 90,
    backgroundColor: '#6D4C41',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderWidth: 2,
    borderColor: '#5D4037',
  },
  cropSlotReady: {
    borderColor: '#FFD600',
    borderWidth: 2.5,
    backgroundColor: '#6D4C41',
  },
  cropSlotHarvested: { opacity: 0.6 },
  cropEmoji: { fontSize: 36 },
  readyPulse: {
    backgroundColor: '#FFD600',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  readyText: { fontSize: 10, fontWeight: '700', color: '#333' },
  progressBarMini: {
    width: 56,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFillMini: { height: '100%', backgroundColor: '#8BC34A', borderRadius: 2 },
  cropName: { ...typography.caption, color: 'rgba(255,255,255,0.8)', textAlign: 'center' },
  emptySlot: {
    width: 80,
    height: 90,
    backgroundColor: '#5D4037',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#8D6E63',
  },
  emptySlotText: { fontSize: 32, color: '#8D6E63' },

  section: {
    backgroundColor: colors.card,
    margin: 16,
    marginBottom: 0,
    borderRadius: 20,
    padding: 16,
    gap: 10,
  },
  sectionTitle: { ...typography.h4, color: colors.textPrimary },

  readyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFDE7',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#FFD600',
  },
  readyCardEmoji: { fontSize: 36 },
  readyCardInfo: { flex: 1 },
  readyCardName: { ...typography.bodyBold, color: colors.textPrimary },
  readyCardSub: { ...typography.caption, color: colors.textMuted },
  harvestBtn: {
    backgroundColor: '#8BC34A',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  harvestBtnText: { ...typography.smallBold, color: '#fff' },

  growingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.background,
    borderRadius: 14,
    padding: 12,
  },
  growingEmoji: { fontSize: 32 },
  growingInfo: { flex: 1, gap: 4 },
  growingName: { ...typography.bodyBold, color: colors.textPrimary },
  progressBarFull: {
    height: 6, backgroundColor: colors.border,
    borderRadius: 3, overflow: 'hidden',
  },
  progressFillFull: { height: '100%', backgroundColor: '#8BC34A', borderRadius: 3 },
  growingTime: { ...typography.caption, color: colors.textMuted },
  growingPct: { ...typography.smallBold, color: colors.textSecondary },

  lockedCard: { opacity: 0.7 },
  lockedText: { ...typography.caption, color: colors.textMuted },
  lockIcon: { fontSize: 18 },

  harvestGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  harvestBadge: {
    backgroundColor: colors.background,
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
    gap: 4,
    minWidth: 72,
  },
  harvestBadgeEmoji: { fontSize: 28 },
  harvestBadgeName: { ...typography.caption, color: colors.textSecondary, textAlign: 'center' },

  howItWorks: {
    margin: 16,
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 16,
    gap: 8,
  },
  howTitle: { ...typography.h4, color: colors.textPrimary },
  howText: { ...typography.body, color: colors.textSecondary, lineHeight: 26 },
});
