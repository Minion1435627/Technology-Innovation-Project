import React, { useMemo, useState } from 'react';
import {
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
import { mockUser } from '../../data/mockData';

const ACTIONS = [
  { key: 'water', label: 'Water', icon: 'water-outline', color: '#6aa7c8' },
  { key: 'harvest', label: 'Harvest', icon: 'basket-outline', color: '#d78a43' },
  { key: 'sell', label: 'Sell', icon: 'cash-outline', color: '#d0a244' },
];

const LEVEL_RULES = [
  { level: 1, score: 0, name: 'Newcomer' },
  { level: 2, score: 100, name: 'Helper' },
  { level: 3, score: 180, name: 'Trusted Neighbour' },
  { level: 4, score: 300, name: 'Community Pillar' },
  { level: 5, score: 500, name: 'Legend' },
];

const SEED_PACKETS = [
  { key: 'carrot', name: 'Carrot', emoji: '🥕', level: 1, cost: 3, value: 8 },
  { key: 'tomato', name: 'Tomato', emoji: '🍅', level: 2, cost: 5, value: 12 },
  { key: 'strawberry', name: 'Strawberry', emoji: '🍓', level: 3, cost: 8, value: 18 },
  { key: 'corn', name: 'Corn', emoji: '🌽', level: 4, cost: 12, value: 26 },
  { key: 'watermelon', name: 'Watermelon', emoji: '🍉', level: 5, cost: 18, value: 40 },
];

const PLOT_UNLOCK_COSTS = {
  6: 30,
  7: 45,
  8: 65,
  9: 90,
  10: 120,
  11: 155,
  12: 195,
};

const WATER_PACK_COST = 8;
const WATER_PACK_AMOUNT = 3;

const createInitialPlots = () => [
  { id: 1, stage: 'ready', crop: 'carrot' },
  { id: 2, stage: 'sprout', crop: 'tomato' },
  { id: 3, stage: 'seed', crop: 'carrot' },
  { id: 4, stage: 'empty', crop: null },
  { id: 5, stage: 'empty', crop: null },
  { id: 6, stage: 'locked', crop: null },
  { id: 7, stage: 'locked', crop: null },
  { id: 8, stage: 'locked', crop: null },
  { id: 9, stage: 'locked', crop: null },
  { id: 10, stage: 'locked', crop: null },
  { id: 11, stage: 'locked', crop: null },
  { id: 12, stage: 'locked', crop: null },
];

const getLevelFromScore = (score) => {
  return LEVEL_RULES.reduce((highestLevel, rule) => (
    score >= rule.score ? rule.level : highestLevel
  ), 1);
};

const getNextLevelRule = (level) => LEVEL_RULES.find(rule => rule.level === level + 1);

const getSeed = (cropKey) => SEED_PACKETS.find(seed => seed.key === cropKey) || SEED_PACKETS[0];

const cropIcon = (plot) => {
  if (plot.stage === 'locked') return '🔒';
  if (plot.stage === 'empty') return '＋';
  if (plot.stage === 'seed') return '·';
  if (plot.stage === 'sprout') return plot.crop === 'tomato' ? '🌿' : '🌱';
  return getSeed(plot.crop).emoji;
};

const cropLabel = (plot) => {
  if (plot.stage === 'locked') return 'Locked';
  if (plot.stage === 'empty') return 'Empty';
  if (plot.stage === 'seed') return 'Seed';
  if (plot.stage === 'sprout') return 'Growing';
  return 'Ready';
};

export default function FarmerScreen({ navigation }) {
  const playerLevel = mockUser.level;
  const levelName = mockUser.levelName;
  const nextLevel = getNextLevelRule(playerLevel);
  const unlockedSeeds = SEED_PACKETS.filter(seed => seed.level <= playerLevel);

  const [plots, setPlots] = useState(createInitialPlots);
  const [coins, setCoins] = useState(36);
  const [water, setWater] = useState(4);
  const [basket, setBasket] = useState(0);
  const [message, setMessage] = useState('Choose a seed, then tap an empty plot to plant it.');
  const [selectedPlotId, setSelectedPlotId] = useState(1);
  const [selectedSeedKey, setSelectedSeedKey] = useState(unlockedSeeds[unlockedSeeds.length - 1].key);

  const selectedPlot = plots.find(plot => plot.id === selectedPlotId) || plots[0];
  const selectedSeed = getSeed(selectedSeedKey);

  const readyCount = useMemo(
    () => plots.filter(plot => plot.stage === 'ready').length,
    [plots]
  );
  const unlockedPlotCount = useMemo(
    () => plots.filter(plot => plot.stage !== 'locked').length,
    [plots]
  );
  const nextLockedPlot = plots.find(plot => plot.stage === 'locked');
  const nextPlotCost = nextLockedPlot ? PLOT_UNLOCK_COSTS[nextLockedPlot.id] : null;
  const nextGoal = nextLockedPlot
    ? `Earn ${Math.max(nextPlotCost - coins, 0)} more coins to unlock Plot ${nextLockedPlot.id}.`
    : nextLevel
      ? `Reach ${nextLevel.score} weekly points to unlock Level ${nextLevel.level} seeds.`
      : 'All plots and current seed goals are unlocked.';

  const updatePlot = (nextPlot) => {
    setPlots(prev => prev.map(plot => (plot.id === nextPlot.id ? nextPlot : plot)));
  };

  const plantSeedInPlot = (plot) => {
    if (coins < selectedSeed.cost) {
      setMessage(`${selectedSeed.name} seeds cost ${selectedSeed.cost} coins.`);
      return;
    }
    setCoins(prev => prev - selectedSeed.cost);
    updatePlot({ ...plot, stage: 'seed', crop: selectedSeed.key });
    setSelectedPlotId(plot.id);
    setMessage(`${selectedSeed.name} planted in Plot ${plot.id} for ${selectedSeed.cost} coins.`);
  };

  const handlePlotPress = (plot) => {
    if (plot.stage === 'locked') {
      const unlockCost = PLOT_UNLOCK_COSTS[plot.id];
      setMessage(`Plot ${plot.id} is locked${unlockCost ? ` and costs ${unlockCost} coins` : ''}.`);
      return;
    }
    if (plot.stage === 'empty') {
      plantSeedInPlot(plot);
      return;
    }
    setSelectedPlotId(plot.id);
    setMessage(`Plot ${plot.id} selected. Use water or harvest when ready.`);
  };

  const handleAction = (actionKey) => {
    if (actionKey === 'water') {
      if (!['seed', 'sprout'].includes(selectedPlot.stage)) {
        setMessage('Water seeds or growing crops.');
        return;
      }
      if (water < 1) {
        setMessage('The watering can is empty for now.');
        return;
      }
      setWater(prev => prev - 1);
      updatePlot({
        ...selectedPlot,
        stage: selectedPlot.stage === 'seed' ? 'sprout' : 'ready',
      });
      setMessage(selectedPlot.stage === 'seed' ? 'The seed has sprouted.' : 'This crop is ready to harvest.');
      return;
    }

    if (actionKey === 'harvest') {
      if (selectedPlot.stage !== 'ready') {
        setMessage('Only ripe crops can be harvested.');
        return;
      }
      setBasket(prev => prev + getSeed(selectedPlot.crop).value);
      updatePlot({ ...selectedPlot, stage: 'empty', crop: null });
      setMessage('Fresh crop added to your basket.');
      return;
    }

    if (basket < 1) {
      setMessage('Harvest crops before selling.');
      return;
    }
    setCoins(prev => prev + basket);
    setWater(prev => prev + Math.min(2, Math.ceil(basket / 20)));
    setBasket(0);
    setMessage('Sold your basket and restocked a little.');
  };

  const buyNextPlot = () => {
    if (!nextLockedPlot || !nextPlotCost) {
      setMessage('Every plot is already unlocked.');
      return;
    }
    if (coins < nextPlotCost) {
      setMessage(`Plot ${nextLockedPlot.id} costs ${nextPlotCost} coins.`);
      return;
    }
    setCoins(prev => prev - nextPlotCost);
    updatePlot({ ...nextLockedPlot, stage: 'empty' });
    setSelectedPlotId(nextLockedPlot.id);
    setMessage(`Plot ${nextLockedPlot.id} unlocked. More room for crops.`);
  };

  const buyWater = () => {
    if (coins < WATER_PACK_COST) {
      setMessage(`${WATER_PACK_AMOUNT} water costs ${WATER_PACK_COST} coins.`);
      return;
    }
    setCoins(prev => prev - WATER_PACK_COST);
    setWater(prev => prev + WATER_PACK_AMOUNT);
    setMessage(`Bought ${WATER_PACK_AMOUNT} water for ${WATER_PACK_COST} coins.`);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={20} color={colors.primaryDark} />
          <Text style={styles.backText}>Games</Text>
        </TouchableOpacity>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>Farmer Mini Game</Text>
          <Text style={styles.subtitle}>Grow and harvest your crops</Text>
        </View>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>Lv. {playerLevel}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.resources}>
          <ResourcePill icon="cash-outline" label="Coins" value={coins} color="#c59636" />
          <ResourcePill icon="grid-outline" label="Plots" value={`${unlockedPlotCount}/${plots.length}`} color="#6e9f55" />
          <ResourcePill icon="water-outline" label="Water" value={water} color="#5d9fbd" />
        </View>

        <View style={styles.levelProgress}>
          <View>
            <Text style={styles.levelProgressTitle}>Level {playerLevel} · {levelName}</Text>
            <Text style={styles.levelProgressText}>
              {nextLevel
                ? `${mockUser.xp}/${mockUser.xpNext} XP to unlock Level ${nextLevel.level} seeds`
                : `${mockUser.xp} XP · all seed packets unlocked`}
            </Text>
          </View>
          <Ionicons name="sparkles-outline" size={20} color="#b58935" />
        </View>

        <View style={styles.scene}>
          <Image
            source={require('../../../assets/Farmer.png')}
            style={styles.farmerSceneImage}
            resizeMode="contain"
          />
          <View style={styles.rulesCard}>
            <Text style={styles.rulesTitle}>Rules</Text>
            <Text style={styles.rulesText}>1. Level unlocks seeds</Text>
            <Text style={styles.rulesText}>2. Tap empty plot to plant</Text>
            <Text style={styles.rulesText}>3. Coins buy water/plots</Text>
            <Text style={styles.rulesText}>4. Water, harvest, sell</Text>
          </View>
          <View style={styles.sceneTop}>
            <View style={styles.readyPill}>
              <Text style={styles.readyText}>{readyCount} ready</Text>
            </View>
            <View style={styles.weatherPill}>
              <Text style={styles.weatherIcon}>☀</Text>
              <Text style={styles.weatherText}>Morning farm</Text>
            </View>
          </View>

          <View style={styles.avatarCard}>
            <Text style={styles.avatarFace}>Farmer</Text>
            <Text style={styles.avatarLine}>Today feels good for carrots.</Text>
          </View>
        </View>

        <View style={styles.seedPanel}>
          <View style={styles.seedHeader}>
            <View>
              <Text style={styles.seedTitle}>Seed Packets</Text>
              <Text style={styles.seedHint}>Selected: {selectedSeed.name}</Text>
            </View>
            <Text style={styles.seedUnlockText}>{unlockedSeeds.length}/{SEED_PACKETS.length} unlocked</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.seedList}>
            {SEED_PACKETS.map(seed => {
              const unlocked = seed.level <= playerLevel;
              const active = selectedSeedKey === seed.key;
              const neededRule = LEVEL_RULES.find(rule => rule.level === seed.level);
              return (
                <TouchableOpacity
                  key={seed.key}
                  style={[
                    styles.seedPacket,
                    active && styles.seedPacketActive,
                    !unlocked && styles.seedPacketLocked,
                  ]}
                  activeOpacity={unlocked ? 0.82 : 1}
                  onPress={() => {
                    if (!unlocked) {
                      setMessage(`${seed.name} unlocks at Level ${seed.level} (${neededRule.score} weekly points).`);
                      return;
                    }
                    setSelectedSeedKey(seed.key);
                    setMessage(`${seed.name} selected for the next empty plot.`);
                  }}
                >
                  <Text style={[styles.seedEmoji, !unlocked && styles.lockedSeedEmoji]}>{seed.emoji}</Text>
                  <Text style={[styles.seedName, !unlocked && styles.seedNameLocked]}>{seed.name}</Text>
                  <Text style={[styles.seedMeta, !unlocked && styles.seedMetaLocked]}>
                    {unlocked ? `${seed.cost} → ${seed.value}` : `Lv. ${seed.level}`}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.board}>
          <View style={styles.boardHeader}>
            <View>
              <Text style={styles.boardTitle}>Crop Plot</Text>
              <Text style={styles.boardHint}>Selected: Plot {selectedPlot.id} · {cropLabel(selectedPlot)}</Text>
            </View>
            <View style={styles.basketPill}>
              <Ionicons name="basket-outline" size={15} color="#a56934" />
              <Text style={styles.basketText}>{basket}</Text>
            </View>
          </View>
          <View style={styles.shopButtons}>
            <TouchableOpacity
              style={styles.buyWaterButton}
              activeOpacity={0.84}
              onPress={buyWater}
            >
              <Ionicons name="water-outline" size={17} color="#fffdf7" />
              <Text style={styles.shopButtonText}>Buy Water · {WATER_PACK_COST}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.buyPlotButton, !nextLockedPlot && styles.buyPlotButtonDisabled]}
              activeOpacity={nextLockedPlot ? 0.84 : 1}
              onPress={buyNextPlot}
            >
              <Ionicons name="add-circle-outline" size={17} color={nextLockedPlot ? '#fffdf7' : '#9b9385'} />
              <Text style={[styles.shopButtonText, !nextLockedPlot && styles.buyPlotTextDisabled]}>
                {nextLockedPlot ? `Plot ${nextLockedPlot.id} · ${nextPlotCost}` : 'All Plots'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.plotGrid}>
            {plots.map(plot => {
              const selected = plot.id === selectedPlotId;
              return (
                <TouchableOpacity
                  key={plot.id}
                  style={[
                    styles.plot,
                    styles[`plot_${plot.stage}`],
                    selected && styles.plotSelected,
                  ]}
                  activeOpacity={0.82}
                  onPress={() => handlePlotPress(plot)}
                >
                  <Text style={[
                    styles.plotIcon,
                    plot.stage === 'seed' && styles.seedMark,
                    plot.stage === 'locked' && styles.lockedPlotIcon,
                  ]}>
                    {cropIcon(plot)}
                  </Text>
                  <Text style={[
                    styles.plotLabel,
                    plot.stage === 'locked' && styles.lockedPlotLabel,
                  ]}>
                    {cropLabel(plot)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.messageCard}>
          <Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.primaryDark} />
          <Text style={styles.messageText}>{message}</Text>
        </View>

        <View style={styles.goalCard}>
          <Ionicons name="flag-outline" size={18} color="#b58935" />
          <View style={styles.goalCopy}>
            <Text style={styles.goalTitle}>Next Goal</Text>
            <Text style={styles.goalText}>{nextGoal}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          {ACTIONS.map(action => (
            <TouchableOpacity
              key={action.key}
              style={[styles.actionButton, { backgroundColor: action.color }]}
              activeOpacity={0.86}
              onPress={() => handleAction(action.key)}
            >
              <Ionicons name={action.icon} size={19} color="#fffdf7" />
              <Text style={styles.actionText}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
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
    backgroundColor: '#f7f0df',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: '#fbf7eb',
    borderBottomWidth: 1,
    borderBottomColor: '#eadfc8',
  },
  backButton: {
    width: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  backText: {
    ...typography.smallBold,
    color: colors.primaryDark,
  },
  titleBlock: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    ...typography.h3,
    color: '#657468',
  },
  subtitle: {
    ...typography.caption,
    color: '#8f8b7a',
    marginTop: 1,
  },
  levelBadge: {
    width: 72,
    alignItems: 'flex-end',
  },
  levelText: {
    ...typography.smallBold,
    color: '#7e8f64',
    backgroundColor: '#eef4d8',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    overflow: 'hidden',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
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
    backgroundColor: '#fffaf0',
    borderWidth: 1,
    borderColor: '#eadfc8',
    borderRadius: 8,
    paddingHorizontal: 9,
    shadowColor: '#8f7444',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
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
    color: '#554b3d',
  },
  resourceLabel: {
    ...typography.caption,
    color: '#9a907f',
  },
  levelProgress: {
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
  levelProgressTitle: {
    ...typography.bodyBold,
    color: '#5e563f',
  },
  levelProgressText: {
    ...typography.caption,
    color: '#8b7f63',
    marginTop: 2,
  },
  scene: {
    height: 300,
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'space-between',
    // borderWidth: 1,
    // borderColor: '#e5d8bf',
    // backgroundColor: '#e5d8bf',
  },
  farmerSceneImage: {
    position: 'absolute',
    left: -70,
    bottom: -150,
    width: '88%',
    height: '200%',
  },
  sceneTop: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 12,
    gap: 10,
  },
  weatherPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 252, 240, 0.82)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  weatherIcon: {
    color: '#d5a43e',
    fontSize: 14,
    fontWeight: '800',
  },
  weatherText: {
    ...typography.smallBold,
    color: '#68745b',
  },
  readyPill: {
    backgroundColor: 'rgba(239, 246, 217, 0.88)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  readyText: {
    ...typography.smallBold,
    color: '#6d8d4c',
  },
  avatarCard: {
    position: 'absolute',
    right: 0,
    top: 214,
    width: '50%',
    backgroundColor: 'rgba(255, 252, 241, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(222, 205, 169, 0.86)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  avatarFace: {
    ...typography.bodyBold,
    color: '#576750',
  },
  avatarLine: {
    ...typography.caption,
    color: '#897d69',
    marginTop: 2,
  },
  rulesCard: {
    position: 'absolute',
    right: 0,
    top: 78,
    width: '50%',
    backgroundColor: 'rgba(255, 252, 241, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(222, 205, 169, 0.86)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  rulesTitle: {
    ...typography.bodyBold,
    color: '#576750',
    marginBottom: 4,
  },
  rulesText: {
    ...typography.caption,
    color: '#897d69',
    marginTop: 2,
  },
  seedPanel: {
    backgroundColor: '#fffaf0',
    borderWidth: 1,
    borderColor: '#eadfc8',
    borderRadius: 8,
    padding: 12,
    gap: 10,
  },
  seedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  seedTitle: {
    ...typography.h4,
    color: '#5a4f3d',
  },
  seedHint: {
    ...typography.caption,
    color: '#948b78',
    marginTop: 1,
  },
  seedUnlockText: {
    ...typography.caption,
    color: '#7a8d58',
    fontWeight: '700',
  },
  seedList: {
    gap: 9,
    paddingRight: 2,
  },
  seedPacket: {
    width: 96,
    minHeight: 92,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#f7ecd7',
    borderWidth: 1,
    borderColor: '#dfcba9',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  seedPacketActive: {
    backgroundColor: '#eef4d8',
    borderColor: '#7cae62',
    borderWidth: 2,
  },
  seedPacketLocked: {
    backgroundColor: '#eee7da',
    borderColor: '#d8ccba',
  },
  seedEmoji: {
    fontSize: 28,
  },
  lockedSeedEmoji: {
    opacity: 0.38,
  },
  seedName: {
    ...typography.caption,
    color: '#5a4f3d',
    fontWeight: '700',
    textAlign: 'center',
  },
  seedNameLocked: {
    color: '#9b9385',
  },
  seedMeta: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '800',
    color: '#a56934',
  },
  seedMetaLocked: {
    color: '#9b9385',
  },
  board: {
    backgroundColor: '#fffaf0',
    borderWidth: 1,
    borderColor: '#eadfc8',
    borderRadius: 8,
    padding: 13,
    gap: 12,
  },
  boardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  boardTitle: {
    ...typography.h4,
    color: '#5a4f3d',
  },
  boardHint: {
    ...typography.caption,
    color: '#948b78',
    marginTop: 1,
  },
  basketPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#f5e8d4',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  basketText: {
    ...typography.smallBold,
    color: '#a56934',
  },
  shopButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  buyWaterButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 8,
    backgroundColor: '#6aa7c8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  buyPlotButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 8,
    backgroundColor: '#8a9d5f',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  buyPlotButtonDisabled: {
    backgroundColor: '#eee7da',
  },
  buyPlotText: {
    ...typography.smallBold,
    color: '#fffdf7',
  },
  shopButtonText: {
    ...typography.smallBold,
    color: '#fffdf7',
    fontSize: 11,
  },
  buyPlotTextDisabled: {
    color: '#9b9385',
  },
  plotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 8,
  },
  plot: {
    width: '31.5%',
    height: 84,
    flexGrow: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: 8,
  },
  plot_empty: {
    backgroundColor: '#dbc49e',
    borderColor: '#c7a97c',
  },
  plot_seed: {
    backgroundColor: '#b88956',
    borderColor: '#9c6d40',
  },
  plot_sprout: {
    backgroundColor: '#a1784e',
    borderColor: '#7d5837',
  },
  plot_ready: {
    backgroundColor: '#c99661',
    borderColor: '#daa34f',
  },
  plot_locked: {
    backgroundColor: '#eee7da',
    borderColor: '#d2c4af',
  },
  plotSelected: {
    borderWidth: 2,
    borderColor: '#6f9d56',
    shadowColor: '#86a778',
    shadowOpacity: 0.28,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  plotIcon: {
    fontSize: 27,
    color: '#4e3922',
  },
  lockedPlotIcon: {
    fontSize: 23,
    opacity: 0.55,
  },
  seedMark: {
    fontSize: 38,
    lineHeight: 38,
  },
  plotLabel: {
    ...typography.caption,
    color: '#fff8e6',
    fontWeight: '700',
  },
  lockedPlotLabel: {
    color: '#b3aa9b',
  },
  messageCard: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#eef4d8',
    borderWidth: 1,
    borderColor: '#dce8be',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  messageText: {
    ...typography.body,
    color: '#586a45',
    flex: 1,
  },
  goalCard: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff7df',
    borderWidth: 1,
    borderColor: '#ead79e',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  goalCopy: {
    flex: 1,
  },
  goalTitle: {
    ...typography.smallBold,
    color: '#5e563f',
  },
  goalText: {
    ...typography.caption,
    color: '#8b7f63',
    marginTop: 1,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'space-between',
    gap: 0,
  },
  actionButton: {
    width: '31.5%',
    flexGrow: 0,
    minHeight: 52,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#6f5430',
    shadowOpacity: 0.14,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  actionText: {
    ...typography.button,
    fontSize: 13,
    color: '#fffdf7',
  },
});
