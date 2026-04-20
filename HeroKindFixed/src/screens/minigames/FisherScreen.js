import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { useAuth } from '../../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';

const fisherImage = require('../../../assets/Fisher.png');

const LEVEL_RULES = [
  { level: 1, score: 0, name: 'Newcomer' },
  { level: 2, score: 100, name: 'Helper' },
  { level: 3, score: 180, name: 'Trusted Neighbour' },
  { level: 4, score: 300, name: 'Community Pillar' },
  { level: 5, score: 500, name: 'Legend' },
];

const RARITY_COLORS = {
  Common: '#7b9a8b',
  Uncommon: '#4e95b8',
  Rare: '#8a78b8',
  Epic: '#d18a42',
  Legendary: '#d4aa38',
};

const RARITY_WEIGHT = {
  Common: 56,
  Uncommon: 27,
  Rare: 12,
  Epic: 4,
  Legendary: 1,
};

const BAITS = [
  { key: 'worm', name: 'Worm', emoji: '🪱', cost: 3, amount: 3, catchBonus: 0, rareBonus: 0 },
  { key: 'shrimp', name: 'Shrimp', emoji: '🦐', cost: 8, amount: 3, catchBonus: 0.06, rareBonus: 0.16 },
  { key: 'fly', name: 'Fly', emoji: '🪰', cost: 12, amount: 3, catchBonus: 0.08, rareBonus: 0.24 },
  { key: 'minnow', name: 'Minnow', emoji: '🐟', cost: 18, amount: 3, catchBonus: 0.12, rareBonus: 0.38 },
];

const RODS = [
  { key: 'twig', name: 'Twig Rod', icon: '🎣', cost: 0, power: 1, catchBonus: 0, rareBonus: 0 },
  { key: 'bamboo', name: 'Bamboo Rod', icon: '🎋', cost: 35, power: 2, catchBonus: 0.08, rareBonus: 0.16 },
  { key: 'steel', name: 'Steel Rod', icon: '⚙️', cost: 90, power: 3, catchBonus: 0.14, rareBonus: 0.3 },
  { key: 'golden', name: 'Golden Rod', icon: '✨', cost: 160, power: 4, catchBonus: 0.2, rareBonus: 0.5 },
];

const FISH_SPECIES = [
  { id: 'carp', name: 'Common Carp', emoji: '🐟', rarity: 'Common', level: 1, value: 8, rodPower: 1, baits: ['worm', 'shrimp', 'fly', 'minnow'] },
  { id: 'bluegill', name: 'Bluegill', emoji: '🐠', rarity: 'Common', level: 1, value: 9, rodPower: 1, baits: ['worm', 'fly'] },
  { id: 'perch', name: 'Yellow Perch', emoji: '🐡', rarity: 'Common', level: 1, value: 10, rodPower: 1, baits: ['worm', 'shrimp'] },
  { id: 'trout', name: 'Rainbow Trout', emoji: '🌈', rarity: 'Uncommon', level: 2, value: 16, rodPower: 1, baits: ['fly', 'minnow'] },
  { id: 'bass', name: 'Lake Bass', emoji: '🐟', rarity: 'Uncommon', level: 2, value: 18, rodPower: 2, baits: ['shrimp', 'minnow'] },
  { id: 'catfish', name: 'Mud Catfish', emoji: '🐈', rarity: 'Uncommon', level: 2, value: 20, rodPower: 2, baits: ['worm', 'shrimp'] },
  { id: 'koi', name: 'Golden Koi', emoji: '🎏', rarity: 'Rare', level: 3, value: 32, rodPower: 2, baits: ['fly', 'minnow'] },
  { id: 'pike', name: 'Silver Pike', emoji: '🦈', rarity: 'Rare', level: 3, value: 35, rodPower: 3, baits: ['minnow'] },
  { id: 'eel', name: 'Moon Eel', emoji: '〰️', rarity: 'Epic', level: 4, value: 58, rodPower: 3, baits: ['shrimp', 'minnow'] },
  { id: 'salmon', name: 'Ember Salmon', emoji: '🔥', rarity: 'Epic', level: 4, value: 64, rodPower: 3, baits: ['fly', 'minnow'] },
  { id: 'crystal', name: 'Crystal Sturgeon', emoji: '💎', rarity: 'Legendary', level: 5, value: 110, rodPower: 4, baits: ['minnow'] },
  { id: 'dragon', name: 'Dragonfish', emoji: '🐉', rarity: 'Legendary', level: 5, value: 140, rodPower: 4, baits: ['minnow'] },
];

const getLevelFromScore = (score) => {
  return LEVEL_RULES.reduce((highestLevel, rule) => (
    score >= rule.score ? rule.level : highestLevel
  ), 1);
};

const pickWeighted = (items, getWeight) => {
  const totalWeight = items.reduce((sum, item) => sum + getWeight(item), 0);
  if (totalWeight <= 0) return null;
  let roll = Math.random() * totalWeight;
  for (const item of items) {
    roll -= getWeight(item);
    if (roll <= 0) return item;
  }
  return items[items.length - 1] || null;
};

export default function FisherScreen({ navigation }) {
  const { profile, patchProfile, fetchProfile, user } = useAuth();
  const playerLevel = profile?.level ?? 1;
  const levelName = LEVEL_RULES.find(r => r.level === playerLevel)?.name ?? 'Newcomer';
  const defaultCollection = FISH_SPECIES.reduce((acc, fish) => ({ ...acc, [fish.id]: 0 }), {});
  const [activeTab, setActiveTab] = useState('game');
  const [coins, setCoins] = useState(() => profile?.coins ?? 0);
  const [baitStock, setBaitStock] = useState(() => profile?.fisher_state?.baitStock ?? { worm: 5, shrimp: 2, fly: 1, minnow: 0 });
  const [selectedBaitKey, setSelectedBaitKey] = useState('worm');
  const [ownedRods, setOwnedRods] = useState(() => profile?.fisher_state?.ownedRods ?? ['twig']);
  const [selectedRodKey, setSelectedRodKey] = useState(() => profile?.fisher_state?.selectedRodKey ?? 'twig');
  const [collection, setCollection] = useState(() => profile?.fisher_state?.collection ?? defaultCollection);
  const [fishBasket, setFishBasket] = useState(() => profile?.fisher_state?.fishBasket ?? defaultCollection);

  const loadingFromDb = useRef(false);
  const saveTimerRef = useRef(null);

  useFocusEffect(useCallback(() => {
    if (user?.id) fetchProfile(user.id);
  }, [user?.id]));

  useEffect(() => {
    loadingFromDb.current = true;
    const fs = profile?.fisher_state;
    setBaitStock(fs?.baitStock ?? { worm: 5, shrimp: 2, fly: 1, minnow: 0 });
    setOwnedRods(fs?.ownedRods ?? ['twig']);
    setSelectedRodKey(fs?.selectedRodKey ?? 'twig');
    setCollection(fs?.collection ?? defaultCollection);
    setFishBasket(fs?.fishBasket ?? defaultCollection);
    const t = setTimeout(() => { loadingFromDb.current = false; }, 50);
    return () => clearTimeout(t);
  }, [profile?.fisher_state]);

  useEffect(() => {
    if (profile?.coins !== undefined) setCoins(profile.coins);
  }, [profile?.fisher_state]);

  useEffect(() => {
    if (loadingFromDb.current) return;
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      patchProfile({ fisher_state: { baitStock, ownedRods, selectedRodKey, collection, fishBasket } });
    }, 800);
    return () => clearTimeout(saveTimerRef.current);
  }, [baitStock, ownedRods, selectedRodKey, collection, fishBasket]);
  const [gameState, setGameState] = useState('idle');
  const [message, setMessage] = useState('Choose bait and cast into the lake.');
  const [caughtFish, setCaughtFish] = useState(null);

  const bobAnim = useRef(new Animated.Value(0)).current;
  const selectedBait = BAITS.find(bait => bait.key === selectedBaitKey) || BAITS[0];
  const selectedRod = RODS.find(rod => rod.key === selectedRodKey) || RODS[0];
  const caughtSpeciesCount = Object.values(collection).filter(count => count > 0).length;
  const totalCaught = Object.values(collection).reduce((sum, count) => sum + count, 0);
  const basketCount = Object.values(fishBasket).reduce((sum, count) => sum + count, 0);
  const catchChance = Math.min(
    0.92,
    0.54 + (playerLevel * 0.035) + selectedRod.catchBonus + selectedBait.catchBonus
  );
  const basketItems = FISH_SPECIES
    .map(fish => ({ ...fish, count: fishBasket[fish.id] || 0 }))
    .filter(fish => fish.count > 0);
  const basketValue = useMemo(() => (
    FISH_SPECIES.reduce((sum, fish) => sum + (fishBasket[fish.id] || 0) * fish.value, 0)
  ), [fishBasket]);

  const eligibleFish = useMemo(() => (
    FISH_SPECIES.filter(fish => (
      fish.level <= playerLevel &&
      fish.rodPower <= selectedRod.power &&
      fish.baits.includes(selectedBaitKey)
    ))
  ), [playerLevel, selectedBaitKey, selectedRod.power]);

  const castLine = () => {
    if (gameState !== 'idle') return;
    if ((baitStock[selectedBaitKey] || 0) <= 0) {
      setMessage(`Buy ${selectedBait.name} bait before casting.`);
      return;
    }
    if (eligibleFish.length === 0) {
      setMessage('This bait and rod cannot catch fish at your level yet.');
      return;
    }

    setBaitStock(prev => ({ ...prev, [selectedBaitKey]: prev[selectedBaitKey] - 1 }));
    setCaughtFish(null);
    setGameState('waiting');
    setMessage('Waiting for a bite...');
    Animated.loop(
      Animated.sequence([
        Animated.timing(bobAnim, { toValue: 1, duration: 650, useNativeDriver: true }),
        Animated.timing(bobAnim, { toValue: 0, duration: 650, useNativeDriver: true }),
      ])
    ).start();
  };

  const reelLine = () => {
    if (gameState !== 'waiting') return;
    bobAnim.stopAnimation();
    bobAnim.setValue(0);

    if (Math.random() > catchChance) {
      setGameState('miss');
      setMessage('The fish slipped away. Try a stronger rod or better bait.');
      setTimeout(() => setGameState('idle'), 2200);
      return;
    }

    const rareBoost = 1 + (playerLevel * 0.12) + selectedRod.rareBonus + selectedBait.rareBonus;
    const fish = pickWeighted(eligibleFish, (item) => {
      const base = RARITY_WEIGHT[item.rarity] || 1;
      if (item.rarity === 'Common') return base;
      if (item.rarity === 'Uncommon') return base * (1 + rareBoost * 0.45);
      if (item.rarity === 'Rare') return base * (1 + rareBoost * 0.8);
      if (item.rarity === 'Epic') return base * (1 + rareBoost);
      return base * (1 + rareBoost * 1.35);
    });

    if (!fish) {
      setGameState('miss');
      setMessage('Nothing bit this time.');
      setTimeout(() => setGameState('idle'), 1400);
      return;
    }

    setCaughtFish(fish);
    setCollection(prev => ({ ...prev, [fish.id]: (prev[fish.id] || 0) + 1 }));
    setFishBasket(prev => ({ ...prev, [fish.id]: (prev[fish.id] || 0) + 1 }));
    setGameState('caught');
    setMessage(`Caught ${fish.name}. Added to your collection book.`);
    setTimeout(() => setGameState('idle'), 3800);
  };

  const changeCoins = (delta) => {
    setCoins(prev => {
      const next = prev + delta;
      patchProfile({ coins: next });
      return next;
    });
  };

  const buyBait = (bait) => {
    if (coins < bait.cost) {
      setMessage(`${bait.name} bait costs ${bait.cost} coins.`);
      return;
    }
    changeCoins(-bait.cost);
    setBaitStock(prev => ({ ...prev, [bait.key]: (prev[bait.key] || 0) + bait.amount }));
    setSelectedBaitKey(bait.key);
    setMessage(`Bought ${bait.amount} ${bait.name} bait.`);
  };

  const buyOrSelectRod = (rod) => {
    if (ownedRods.includes(rod.key)) {
      setSelectedRodKey(rod.key);
      setMessage(`${rod.name} equipped.`);
      return;
    }
    if (coins < rod.cost) {
      setMessage(`${rod.name} costs ${rod.cost} coins.`);
      return;
    }
    changeCoins(-rod.cost);
    setOwnedRods(prev => [...prev, rod.key]);
    setSelectedRodKey(rod.key);
    setMessage(`${rod.name} bought and equipped.`);
  };

  const sellFish = () => {
    if (basketValue <= 0) {
      setMessage('Catch fish before selling.');
      return;
    }
    changeCoins(basketValue);
    setFishBasket(FISH_SPECIES.reduce((acc, fish) => ({ ...acc, [fish.id]: 0 }), {}));
    setMessage(`Sold your fish basket for ${basketValue} coins. Collection book stays saved.`);
  };

  const bobY = bobAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 12] });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={20} color="#547078" />
          <Text style={styles.backText}>Games</Text>
        </TouchableOpacity>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>Fisher Mini Game</Text>
          <Text style={styles.subtitle}>Cast, reel, and collect species</Text>
        </View>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>Lv. {playerLevel}</Text>
        </View>
      </View>

      <View style={styles.tabBar}>
        {[
          { key: 'game', label: 'Play' },
          { key: 'collection', label: 'Collection Book' },
        ].map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'game' ? (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.resources}>
            <ResourcePill icon="cash-outline" label="Coins" value={coins} color="#c59636" />
            <ResourcePill icon="fish-outline" label="Species" value={`${caughtSpeciesCount}/${FISH_SPECIES.length}`} color="#5b96b0" />
            <ResourcePill icon="bag-outline" label="Ready Sell" value={`${basketCount} fish`} color="#7a9b62" />
          </View>

          <View style={styles.levelCard}>
            <View>
              <Text style={styles.levelTitle}>Level {playerLevel} · {levelName}</Text>
              <Text style={styles.levelTextBody}>Higher level, better rods, and premium bait lower miss chance and improve rare catches.</Text>
            </View>
            <Ionicons name="sparkles-outline" size={20} color="#b58935" />
          </View>

          <View style={styles.lakeCard}>
            <View style={styles.sceneTop}>
              <View style={styles.scenePill}>
                <Text style={styles.scenePillText}>Morning Lake</Text>
              </View>
            </View>
            <View style={styles.rulesCard}>
              <Text style={styles.rulesTitle}>Rules</Text>
              <Text style={styles.rulesText}>1. Pick bait and rod</Text>
              <Text style={styles.rulesText}>2. Cast into one spot</Text>
              <Text style={styles.rulesText}>3. Reel, but fish can miss</Text>
              <Text style={styles.rulesText}>4. Fill collection book</Text>
            </View>
            <View style={styles.avatarDock}>
              <Image source={fisherImage} style={styles.fisherImage} resizeMode="contain" />
            </View>
            <View style={styles.waterSpot}>
              <Text style={[styles.waterRipple, styles.waterRippleLeftTop]}>〰〰〰</Text>
              <Text style={[styles.waterRipple, styles.waterRippleLeftBottom]}>〰〰</Text>
              <Text style={[styles.waterRipple, styles.waterRippleRightTop]}>〰〰〰</Text>
              <Text style={[styles.waterRipple, styles.waterRippleRightBottom]}>〰〰</Text>
              <Text style={[styles.waterRipple, styles.waterRippleFarRight]}>〰〰〰</Text>
              {gameState === 'waiting' && (
                <Animated.View style={{ transform: [{ translateY: bobY }] }}>
                  <View style={styles.bobberFloat}>
                    <View style={styles.bobberTop} />
                    <View style={styles.bobberBand} />
                    <View style={styles.bobberBottom} />
                  </View>
                </Animated.View>
              )}
              {gameState === 'caught' && caughtFish && (
                <View style={styles.resultBubble}>
                  <Text style={styles.resultEmoji}>{caughtFish.emoji}</Text>
                  <Text style={styles.resultText}>{caughtFish.name}</Text>
                </View>
              )}
              {gameState === 'miss' && (
                <View style={styles.resultBubble}>
                  <Text style={styles.resultEmoji}>💨</Text>
                  <Text style={styles.resultText}>Missed</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.castButton]}
              activeOpacity={0.86}
              onPress={castLine}
            >
              <Ionicons name="radio-button-on-outline" size={18} color="#fffdf7" />
              <Text style={styles.actionText}>Cast</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.reelButton]}
              activeOpacity={0.86}
              onPress={reelLine}
            >
              <Ionicons name="arrow-up-circle-outline" size={18} color="#fffdf7" />
              <Text style={styles.actionText}>Reel</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.messageCard}>
            <Ionicons name="chatbubble-ellipses-outline" size={18} color="#547078" />
            <Text style={styles.messageText}>{message}</Text>
          </View>

          <View style={styles.panel}>
            <View style={styles.panelHeader}>
              <Text style={styles.panelTitle}>Bait Shop</Text>
              <Text style={styles.panelMeta}>Selected: {selectedBait.name} · Stock {baitStock[selectedBaitKey] || 0}</Text>
            </View>
            <Text style={styles.shopHint}>Tap a bait to use it. Press Buy to restock before casting.</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.itemRow}>
              {BAITS.map(bait => {
                const active = bait.key === selectedBaitKey;
                return (
                  <TouchableOpacity
                    key={bait.key}
                    style={[styles.itemCard, active && styles.itemCardActive]}
                    onPress={() => setSelectedBaitKey(bait.key)}
                  >
                    <Text style={styles.itemEmoji}>{bait.emoji}</Text>
                    <Text style={styles.itemName}>{bait.name}</Text>
                    <Text style={styles.itemMeta}>Stock ×{baitStock[bait.key] || 0}</Text>
                    <TouchableOpacity style={styles.buyBaitButton} activeOpacity={0.84} onPress={() => buyBait(bait)}>
                      <Text style={styles.miniBuyText}>Buy +{bait.amount}</Text>
                      <Text style={styles.miniBuyPrice}>{bait.cost} coins</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.panel}>
            <View style={styles.panelHeader}>
              <Text style={styles.panelTitle}>Rod Shop</Text>
              <Text style={styles.panelMeta}>Equipped: {selectedRod.name}</Text>
            </View>
            <Text style={styles.shopHint}>Buy stronger rods to catch fish that need more power.</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.itemRow}>
              {RODS.map(rod => {
                const owned = ownedRods.includes(rod.key);
                const active = rod.key === selectedRodKey;
                return (
                  <View
                    key={rod.key}
                    style={[styles.itemCard, active && styles.itemCardActive, !owned && styles.itemCardLocked]}
                  >
                    <Text style={styles.itemEmoji}>{rod.icon}</Text>
                    <Text style={styles.itemName}>{rod.name}</Text>
                    <Text style={styles.itemMeta}>Power {rod.power}</Text>
                    <TouchableOpacity style={[styles.rodActionButton, owned && styles.rodEquipButton]} activeOpacity={0.84} onPress={() => buyOrSelectRod(rod)}>
                      <Text style={styles.miniBuyText}>{owned ? 'Equip' : 'Buy'}</Text>
                      <Text style={styles.miniBuyPrice}>{owned ? 'Owned' : `${rod.cost} coins`}</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.basketPanel}>
            <View style={styles.basketHeader}>
              <View>
                <Text style={styles.basketTitle}>Fish Ready to Sell</Text>
                <Text style={styles.basketSubtitle}>{basketCount} fish · {basketValue} coins</Text>
              </View>
              <TouchableOpacity style={styles.basketSellButton} onPress={sellFish}>
                <Text style={styles.basketSellText}>Sell</Text>
              </TouchableOpacity>
            </View>
            {basketItems.length > 0 ? (
              <View style={styles.basketList}>
                {basketItems.map(fish => (
                  <View key={fish.id} style={styles.basketFishChip}>
                    <Text style={styles.basketFishEmoji}>{fish.emoji}</Text>
                    <Text style={styles.basketFishText}>{fish.name} ×{fish.count}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.emptyBasketText}>No fish ready to sell yet. Cast and reel first.</Text>
            )}
          </View>
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.collectionHeader}>
            <Text style={styles.collectionTitle}>Collection Book</Text>
            <Text style={styles.collectionSubtitle}>{caughtSpeciesCount}/{FISH_SPECIES.length} species discovered · {totalCaught} total caught</Text>
          </View>
          {['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'].map(rarity => {
            const rarityFish = FISH_SPECIES.filter(fish => fish.rarity === rarity);
            return (
              <View key={rarity} style={styles.rarityGroup}>
                <Text style={[styles.rarityTitle, { color: RARITY_COLORS[rarity] }]}>{rarity}</Text>
                <View style={styles.fishGrid}>
                  {rarityFish.map(fish => {
                    const caught = collection[fish.id] || 0;
                    const visible = caught > 0;
                    return (
                      <View key={fish.id} style={[styles.fishCard, caught > 0 && { borderColor: RARITY_COLORS[fish.rarity] }]}>
                        <Text style={[styles.fishEmoji, !visible && styles.hiddenFish]}>{visible ? fish.emoji : '❓'}</Text>
                        <Text style={styles.fishName}>{visible ? fish.name : 'Unknown'}</Text>
                        <Text style={styles.fishMeta}>{caught > 0 ? `Caught ×${caught}` : 'Not caught yet'}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function ResourcePill({ icon, label, value, color }) {
  return (
    <View style={styles.resourcePill}>
      <View style={[styles.resourceIcon, { backgroundColor: `${color}22` }]}>
        <Ionicons name={icon} size={15} color={color} />
      </View>
      <View>
        <Text style={styles.resourceValue}>{value}</Text>
        <Text style={styles.resourceLabel}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#eef7f4',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: '#fbf7eb',
    borderBottomWidth: 1,
    borderBottomColor: '#d8e2d8',
  },
  backButton: {
    width: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  backText: {
    ...typography.smallBold,
    color: '#547078',
  },
  titleBlock: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    ...typography.h3,
    color: '#4d676f',
  },
  subtitle: {
    ...typography.caption,
    color: '#7a8c8c',
  },
  levelBadge: {
    width: 72,
    alignItems: 'flex-end',
  },
  levelText: {
    ...typography.smallBold,
    color: '#547078',
    backgroundColor: '#e3f1ee',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    overflow: 'hidden',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fbf7eb',
    borderBottomWidth: 1,
    borderBottomColor: '#d8e2d8',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#5b96b0',
  },
  tabText: {
    ...typography.smallBold,
    color: '#8b9b99',
  },
  tabTextActive: {
    color: '#547078',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 34,
    gap: 14,
  },
  resources: {
    flexDirection: 'row',
    gap: 8,
  },
  resourcePill: {
    flex: 1,
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fffdf7',
    borderWidth: 1,
    borderColor: '#d8e2d8',
    borderRadius: 8,
    paddingHorizontal: 9,
  },
  resourceIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resourceValue: {
    ...typography.bodyBold,
    color: '#4f5b56',
  },
  resourceLabel: {
    ...typography.caption,
    color: '#8b9b99',
  },
  levelCard: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    backgroundColor: '#fff7df',
    borderWidth: 1,
    borderColor: '#ead79e',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  levelTitle: {
    ...typography.bodyBold,
    color: '#5e563f',
  },
  levelTextBody: {
    ...typography.caption,
    color: '#8b7f63',
    marginTop: 2,
  },
  lakeCard: {
    height: 320,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#b9dde0',
    borderWidth: 1,
    borderColor: '#c7deda',
  },
  sceneTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    zIndex: 4,
  },
  scenePill: {
    backgroundColor: 'rgba(255, 252, 241, 0.84)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  scenePillText: {
    ...typography.smallBold,
    color: '#547078',
  },
  rulesCard: {
    position: 'absolute',
    right: 0,
    top: 78,
    width: '45%',
    backgroundColor: 'rgba(255, 252, 241, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(207, 221, 211, 0.9)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 9,
    zIndex: 5,
    elevation: 5,
  },
  rulesTitle: {
    ...typography.bodyBold,
    color: '#547078',
    marginBottom: 4,
  },
  rulesText: {
    ...typography.caption,
    color: '#758380',
    marginTop: 2,
  },
  avatarDock: {
    position: 'absolute',
    left: -130,
    top: -75,
    alignItems: 'center',
    zIndex: 3,
  },
  fisherImage: {
    width: 490,
    height: 400,
  },
  waterSpot: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 122,
    backgroundColor: '#6aa7c8',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  waterRipple: {
    position: 'absolute',
    color: 'rgba(255,255,255,0.42)',
    fontSize: 22,
  },
  waterRippleLeftTop: {
    left: '10%',
    top: 22,
  },
  waterRippleLeftBottom: {
    left: '22%',
    bottom: 24,
    opacity: 0.72,
  },
  waterRippleRightTop: {
    right: '13%',
    top: 30,
    opacity: 0.8,
  },
  waterRippleRightBottom: {
    right: '28%',
    bottom: 20,
    opacity: 0.68,
  },
  waterRippleFarRight: {
    right: '4%',
    bottom: 48,
    opacity: 0.55,
  },
  bobberFloat: {
    width: 24,
    height: 34,
    marginTop: 4,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#5d6b67',
    backgroundColor: '#fff7df',
    shadowColor: '#2f5d6c',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  bobberTop: {
    flex: 1,
    backgroundColor: '#fff4ce',
  },
  bobberBand: {
    height: 4,
    backgroundColor: '#5b96b0',
  },
  bobberBottom: {
    flex: 1,
    backgroundColor: '#d48a47',
  },
  resultBubble: {
    position: 'absolute',
    left: '31%',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  resultEmoji: {
    fontSize: 38,
  },
  resultText: {
    ...typography.smallBold,
    color: '#fffdf7',
    textShadowColor: 'rgba(47, 72, 78, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  panel: {
    backgroundColor: '#fffdf7',
    borderWidth: 1,
    borderColor: '#d8e2d8',
    borderRadius: 8,
    padding: 12,
    gap: 10,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  panelTitle: {
    ...typography.h4,
    color: '#4f5b56',
  },
  panelMeta: {
    ...typography.caption,
    color: '#8b9b99',
    flexShrink: 1,
    textAlign: 'right',
  },
  shopHint: {
    ...typography.caption,
    color: '#6f817e',
    backgroundColor: '#eef7f4',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  itemRow: {
    gap: 9,
    paddingRight: 2,
  },
  itemCard: {
    width: 106,
    minHeight: 104,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#eef7f4',
    borderWidth: 1,
    borderColor: '#c7deda',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  itemCardActive: {
    backgroundColor: '#e0f0f5',
    borderColor: '#5b96b0',
    borderWidth: 2,
  },
  itemCardLocked: {
    backgroundColor: '#f1ede2',
  },
  itemEmoji: {
    fontSize: 26,
  },
  itemName: {
    ...typography.caption,
    color: '#4f5b56',
    fontWeight: '700',
    textAlign: 'center',
  },
  itemMeta: {
    ...typography.caption,
    color: '#7a8c8c',
    textAlign: 'center',
  },
  buyBaitButton: {
    width: '100%',
    backgroundColor: '#5b96b0',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginTop: 2,
    alignItems: 'center',
  },
  rodActionButton: {
    width: '100%',
    backgroundColor: '#d0a244',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginTop: 2,
    alignItems: 'center',
  },
  rodEquipButton: {
    backgroundColor: '#5b96b0',
  },
  miniBuyText: {
    fontSize: 11,
    lineHeight: 14,
    color: '#fffdf7',
    fontWeight: '800',
  },
  miniBuyPrice: {
    fontSize: 9,
    lineHeight: 12,
    color: '#eef7f4',
    fontWeight: '700',
  },
  basketPanel: {
    backgroundColor: '#fffdf7',
    borderWidth: 1,
    borderColor: '#d8e2d8',
    borderRadius: 8,
    padding: 12,
    gap: 10,
  },
  basketHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  basketTitle: {
    ...typography.h4,
    color: '#4f5b56',
  },
  basketSubtitle: {
    ...typography.caption,
    color: '#7a8c8c',
    marginTop: 2,
  },
  basketSellButton: {
    minWidth: 72,
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#d0a244',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  basketSellText: {
    ...typography.button,
    color: '#fffdf7',
    fontSize: 12,
  },
  basketList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  basketFishChip: {
    maxWidth: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#eef7f4',
    borderWidth: 1,
    borderColor: '#c7deda',
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },
  basketFishEmoji: {
    fontSize: 16,
  },
  basketFishText: {
    ...typography.caption,
    color: '#4f5b56',
    fontWeight: '700',
  },
  emptyBasketText: {
    ...typography.body,
    color: '#7a8c8c',
  },
  messageCard: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#eaf5e2',
    borderWidth: 1,
    borderColor: '#d4e8ca',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  messageText: {
    ...typography.body,
    color: '#586a45',
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48.5%',
    minHeight: 52,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  castButton: {
    backgroundColor: '#5b96b0',
  },
  reelButton: {
    backgroundColor: '#d48a47',
  },
  actionText: {
    ...typography.button,
    fontSize: 13,
    color: '#fffdf7',
  },
  collectionHeader: {
    backgroundColor: '#fffdf7',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d8e2d8',
    padding: 14,
  },
  collectionTitle: {
    ...typography.h3,
    color: '#4f5b56',
  },
  collectionSubtitle: {
    ...typography.small,
    color: '#7a8c8c',
    marginTop: 2,
  },
  rarityGroup: {
    backgroundColor: '#fffdf7',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d8e2d8',
    padding: 12,
    gap: 10,
  },
  rarityTitle: {
    ...typography.h4,
  },
  fishGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 9,
  },
  fishCard: {
    width: '31.5%',
    minHeight: 116,
    backgroundColor: '#eef7f4',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#c7deda',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    gap: 4,
  },
  fishEmoji: {
    fontSize: 26,
  },
  hiddenFish: {
    opacity: 0.45,
  },
  fishName: {
    ...typography.caption,
    color: '#4f5b56',
    fontWeight: '700',
    textAlign: 'center',
  },
  fishMeta: {
    fontSize: 10,
    lineHeight: 13,
    color: '#7a8c8c',
    textAlign: 'center',
  },
});
