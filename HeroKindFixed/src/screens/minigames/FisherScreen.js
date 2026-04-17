import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { mockFishCollection } from '../../data/mockData';

const RARITY_COLORS = {
  Common: '#95A5A6',
  Uncommon: '#3498DB',
  Rare: '#9B59B6',
  Epic: '#E67E22',
  Legendary: '#F1C40F',
};

const GAME_STATES = {
  IDLE: 'idle',
  CASTING: 'casting',
  WAITING: 'waiting',
  BITING: 'biting',
  SUCCESS: 'success',
  FAIL: 'fail',
};

export default function FisherScreen({ navigation }) {
  const [gameState, setGameState] = useState(GAME_STATES.IDLE);
  const [caughtFish, setCaughtFish] = useState(null);
  const [collection, setCollection] = useState(mockFishCollection);
  const [activeTab, setActiveTab] = useState('game');

  const bobAnim = useRef(new Animated.Value(0)).current;
  const reelAnim = useRef(new Animated.Value(0)).current;
  let biteTimer = useRef(null);

  useEffect(() => {
    return () => { if (biteTimer.current) clearTimeout(biteTimer.current); };
  }, []);

  const startBobbing = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bobAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(bobAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  };

  const cast = () => {
    if (gameState !== GAME_STATES.IDLE) return;
    setGameState(GAME_STATES.CASTING);
    setCaughtFish(null);

    setTimeout(() => {
      setGameState(GAME_STATES.WAITING);
      startBobbing();
      // Random bite time 2–5 seconds
      const delay = 2000 + Math.random() * 3000;
      biteTimer.current = setTimeout(() => {
        setGameState(GAME_STATES.BITING);
        bobAnim.stopAnimation();
      }, delay);
    }, 800);
  };

  const reel = () => {
    if (gameState !== GAME_STATES.BITING) return;
    // Simple 50% success for demo
    const success = Math.random() > 0.3;
    if (success) {
      const availableFish = collection.filter(f => !f.locked);
      const fish = availableFish[Math.floor(Math.random() * availableFish.length)];
      setCaughtFish(fish);
      setCollection(prev => prev.map(f => f.id === fish.id ? { ...f, caught: f.caught + 1 } : f));
      setGameState(GAME_STATES.SUCCESS);
    } else {
      setGameState(GAME_STATES.FAIL);
    }

    setTimeout(() => {
      setGameState(GAME_STATES.IDLE);
      bobAnim.setValue(0);
    }, 2500);
  };

  const bobY = bobAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 10] });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🎣 Fisher</Text>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>Lv.3</Text>
        </View>
      </View>

      {/* Tab selector */}
      <View style={styles.tabBar}>
        {['game', 'collection'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'game' ? '🎣 Play' : '📖 Collection'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'game' ? (
        <ScrollView contentContainerStyle={styles.container}>

          {/* Water scene */}
          <View style={styles.scene}>
            {/* Sky */}
            <View style={styles.sceneSky}>
              <Text style={styles.sceneSun}>🌤️</Text>
              <Text style={styles.sceneTree}>🌲</Text>
              <Text style={styles.sceneTree2}>🌲</Text>
            </View>

            {/* Avatar fishing */}
            <View style={styles.avatarOnDock}>
              <Text style={styles.avatarEmoji}>🧑‍💻</Text>
              {/* Fishing line */}
              {gameState !== GAME_STATES.IDLE && (
                <View style={styles.fishingLine} />
              )}
            </View>

            {/* Water */}
            <View style={styles.water}>
              <Text style={styles.waterText}>〰〰〰〰〰〰〰〰〰</Text>

              {/* Float / bobber */}
              {gameState === GAME_STATES.WAITING && (
                <Animated.View style={[styles.bobber, { transform: [{ translateY: bobY }] }]}>
                  <Text style={styles.bobberEmoji}>🔴</Text>
                </Animated.View>
              )}
              {gameState === GAME_STATES.BITING && (
                <View style={styles.bobber}>
                  <Text style={styles.bobberEmoji}>💦</Text>
                  <Text style={styles.biteAlert}>TAP!</Text>
                </View>
              )}

              {/* Fish swimming */}
              {gameState === GAME_STATES.WAITING && (
                <Text style={styles.swimmingFish}>🐟</Text>
              )}
            </View>

            {/* Result overlay */}
            {gameState === GAME_STATES.SUCCESS && caughtFish && (
              <View style={styles.resultOverlay}>
                <Text style={styles.resultEmoji}>{caughtFish.emoji}</Text>
                <Text style={styles.resultTitle}>You caught a {caughtFish.name}!</Text>
                <View style={[styles.rarityBadge, { backgroundColor: RARITY_COLORS[caughtFish.rarity] + '33', borderColor: RARITY_COLORS[caughtFish.rarity] }]}>
                  <Text style={[styles.rarityText, { color: RARITY_COLORS[caughtFish.rarity] }]}>{caughtFish.rarity}</Text>
                </View>
              </View>
            )}
            {gameState === GAME_STATES.FAIL && (
              <View style={styles.resultOverlay}>
                <Text style={styles.resultEmoji}>💨</Text>
                <Text style={styles.resultTitle}>The fish got away!</Text>
                <Text style={styles.resultSub}>Try again...</Text>
              </View>
            )}
          </View>

          {/* Action button */}
          <View style={styles.actionSection}>
            {gameState === GAME_STATES.IDLE && (
              <TouchableOpacity style={styles.castBtn} onPress={cast}>
                <Text style={styles.castBtnText}>🎣 Cast Line</Text>
              </TouchableOpacity>
            )}
            {gameState === GAME_STATES.CASTING && (
              <View style={styles.statusBox}>
                <Text style={styles.statusText}>Casting… 🌊</Text>
              </View>
            )}
            {gameState === GAME_STATES.WAITING && (
              <View style={styles.statusBox}>
                <Text style={styles.statusText}>Waiting for a bite… 🎣</Text>
              </View>
            )}
            {gameState === GAME_STATES.BITING && (
              <TouchableOpacity style={[styles.castBtn, styles.reelBtn]} onPress={reel}>
                <Text style={styles.castBtnText}>💥 TAP TO REEL IN!</Text>
              </TouchableOpacity>
            )}
            {(gameState === GAME_STATES.SUCCESS || gameState === GAME_STATES.FAIL) && (
              <View style={styles.statusBox}>
                <Text style={styles.statusText}>
                  {gameState === GAME_STATES.SUCCESS ? '🎉 Great catch!' : '😅 Better luck next time!'}
                </Text>
              </View>
            )}
          </View>

          {/* Stats */}
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>Your Collection</Text>
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{collection.filter(f => f.caught > 0).length}</Text>
                <Text style={styles.statLabel}>Species caught</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statValue}>{collection.reduce((acc, f) => acc + f.caught, 0)}</Text>
                <Text style={styles.statLabel}>Total caught</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statValue}>{collection.filter(f => f.rarity === 'Rare' && f.caught > 0).length}</Text>
                <Text style={styles.statLabel}>Rare+</Text>
              </View>
            </View>
          </View>

          {/* How it works */}
          <View style={styles.howItWorks}>
            <Text style={styles.howTitle}>How it works</Text>
            <Text style={styles.howText}>
              🎣 Tap Cast Line to throw your line{'\n'}
              👀 Wait for the bobber to go under{'\n'}
              💥 Tap quickly to reel in your catch!{'\n'}
              🌟 Higher level = rarer fish chances
            </Text>
          </View>

        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.collectionTitle}>Fish Collection Album</Text>
          {['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'].map(rarity => {
            const rarityFish = collection.filter(f => f.rarity === rarity);
            return (
              <View key={rarity} style={styles.rarityGroup}>
                <View style={[styles.rarityHeader, { borderLeftColor: RARITY_COLORS[rarity] }]}>
                  <Text style={[styles.rarityTitle, { color: RARITY_COLORS[rarity] }]}>{rarity}</Text>
                </View>
                <View style={styles.fishGrid}>
                  {rarityFish.map(fish => (
                    <View
                      key={fish.id}
                      style={[
                        styles.fishCard,
                        fish.locked && styles.fishCardLocked,
                        fish.caught > 0 && { borderColor: RARITY_COLORS[rarity], borderWidth: 2 },
                      ]}
                    >
                      <Text style={[styles.fishEmoji, fish.locked && styles.lockedEmoji]}>
                        {fish.locked ? '❓' : fish.emoji}
                      </Text>
                      <Text style={[styles.fishName, fish.locked && styles.lockedText]}>
                        {fish.locked ? '???' : fish.name}
                      </Text>
                      {fish.caught > 0 ? (
                        <Text style={styles.caughtCount}>×{fish.caught}</Text>
                      ) : fish.locked ? (
                        <Text style={styles.lockedLabel}>Lv.{fish.level} needed</Text>
                      ) : (
                        <Text style={styles.notCaughtLabel}>Not caught</Text>
                      )}
                    </View>
                  ))}
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#1E88E5' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: 'rgba(0,0,0,0.15)',
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

  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  tab: {
    flex: 1, paddingVertical: 10, alignItems: 'center',
    borderBottomWidth: 3, borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: '#fff' },
  tabText: { ...typography.small, color: 'rgba(255,255,255,0.6)' },
  tabTextActive: { color: '#fff', fontWeight: '600' },

  container: { paddingBottom: 40 },

  scene: {
    height: 300,
    position: 'relative',
    overflow: 'hidden',
  },
  sceneSky: {
    height: 130,
    backgroundColor: '#87CEEB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  sceneSun: { fontSize: 36 },
  sceneTree: { fontSize: 40 },
  sceneTree2: { fontSize: 32, marginBottom: 4 },

  avatarOnDock: {
    position: 'absolute',
    top: 60,
    left: 40,
    alignItems: 'center',
  },
  avatarEmoji: { fontSize: 48 },
  fishingLine: {
    width: 2,
    height: 100,
    backgroundColor: '#795548',
    marginTop: -4,
    alignSelf: 'center',
  },

  water: {
    flex: 1,
    backgroundColor: '#1565C0',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 8,
    overflow: 'hidden',
  },
  waterText: { color: 'rgba(255,255,255,0.2)', fontSize: 18 },
  bobber: { marginTop: 8, alignItems: 'center' },
  bobberEmoji: { fontSize: 24 },
  biteAlert: {
    backgroundColor: '#FF4757',
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginTop: 4,
  },
  swimmingFish: { fontSize: 24, marginTop: 16, alignSelf: 'flex-end', marginRight: 40 },

  resultOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  resultEmoji: { fontSize: 56 },
  resultTitle: { ...typography.h3, color: '#fff', textAlign: 'center' },
  resultSub: { ...typography.body, color: 'rgba(255,255,255,0.7)' },
  rarityBadge: {
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4,
    borderWidth: 1.5,
  },
  rarityText: { ...typography.smallBold },

  actionSection: {
    padding: 20,
    alignItems: 'center',
  },
  castBtn: {
    backgroundColor: '#1565C0',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  reelBtn: { backgroundColor: '#FF4757' },
  castBtnText: { ...typography.button, color: '#fff', fontSize: 17 },
  statusBox: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  statusText: { ...typography.body, color: '#fff' },

  statsCard: {
    backgroundColor: colors.card,
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  statsTitle: { ...typography.h4, color: colors.textPrimary, marginBottom: 12 },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { ...typography.h3, color: colors.textPrimary },
  statLabel: { ...typography.caption, color: colors.textMuted, textAlign: 'center' },
  statDivider: { width: 1, height: 28, backgroundColor: colors.border },

  howItWorks: {
    backgroundColor: colors.card,
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 16,
    gap: 8,
  },
  howTitle: { ...typography.h4, color: colors.textPrimary },
  howText: { ...typography.body, color: colors.textSecondary, lineHeight: 26 },

  collectionTitle: { ...typography.h3, color: '#fff', padding: 16 },
  rarityGroup: { marginHorizontal: 16, marginBottom: 16 },
  rarityHeader: { borderLeftWidth: 4, paddingLeft: 10, marginBottom: 10 },
  rarityTitle: { ...typography.h4 },
  fishGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  fishCard: {
    width: 80,
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  fishCardLocked: { opacity: 0.55 },
  fishEmoji: { fontSize: 32 },
  lockedEmoji: { opacity: 0.4 },
  fishName: { ...typography.caption, color: colors.textPrimary, textAlign: 'center' },
  lockedText: { color: colors.textMuted },
  caughtCount: { ...typography.smallBold, color: colors.primary },
  lockedLabel: { ...typography.caption, color: colors.textMuted, textAlign: 'center' },
  notCaughtLabel: { ...typography.caption, color: colors.textMuted },
});
