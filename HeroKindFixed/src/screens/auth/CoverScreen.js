import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { typography } from '../../theme/typography';

const { width } = Dimensions.get('window');

const GREEN = '#86A778';
const GREEN_DARK = '#41503C';
const PAPER = '#F4F0EA';
const ORANGE = '#EF7A38';
const GOLD = '#F4A12D';
const HERO_WIDTH = Math.min(width - 34, 366);

function Sparkle({ style, size = 13, color = '#F0A45B' }) {
  return (
    <Text style={[styles.sparkle, { fontSize: size, lineHeight: size + 2, color }, style]}>
      ✦
    </Text>
  );
}

function PaperTexture() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {Array.from({ length: 34 }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.paperDot,
            {
              left: `${(index * 29) % 100}%`,
              top: `${(index * 47) % 100}%`,
              opacity: index % 3 === 0 ? 0.18 : 0.1,
            },
          ]}
        />
      ))}
      <View style={styles.topWash} />
      <View style={styles.bottomWash} />
    </View>
  );
}

function Avatar({ style, size = 54, skin = '#A76542', hair = '#2D221C', shirt = '#4A8E61' }) {
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }, style]}>
      <View style={[styles.hair, { backgroundColor: hair, width: size * 0.5, height: size * 0.34, borderRadius: size * 0.2, top: size * 0.16 }]} />
      <View style={[styles.face, { backgroundColor: skin, width: size * 0.48, height: size * 0.5, borderRadius: size * 0.24, top: size * 0.28 }]} />
      <View style={[styles.eye, { left: size * 0.36, top: size * 0.48 }]} />
      <View style={[styles.eye, { right: size * 0.36, top: size * 0.48 }]} />
      <View style={[styles.smile, { top: size * 0.6, width: size * 0.14 }]} />
      <View style={[styles.shirt, { backgroundColor: shirt, width: size * 0.64, height: size * 0.28, borderTopLeftRadius: size * 0.2, borderTopRightRadius: size * 0.2 }]} />
    </View>
  );
}

function ConnectionLine({ x1, y1, x2, y2 }) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  return (
    <View
      style={{
        position: 'absolute',
        width: length,
        height: 3,
        backgroundColor: '#E1A24A',
        borderRadius: 2,
        left: (x1 + x2) / 2 - length / 2,
        top: (y1 + y2) / 2 - 1.5,
        transform: [{ rotate: `${angle}deg` }],
        zIndex: 7,
      }}
    />
  );
}

function MapPin() {
  return (
    <View style={styles.pinWrap}>
      <View style={styles.pinHead}>
        <View style={styles.pinHeart}>
          <Ionicons name="heart" size={18} color="#FFFFFF" />
        </View>
      </View>
      <View style={styles.pinPoint} />
    </View>
  );
}

function MapIllustration() {
  return (
    <View style={[styles.hero, { width: HERO_WIDTH, height: HERO_WIDTH * 0.62 }]}>
      <Sparkle style={{ top: 2, left: HERO_WIDTH * 0.21 }} size={16} />
      <Sparkle style={{ top: 23, left: HERO_WIDTH * 0.15 }} size={8} />
      <Sparkle style={{ top: 20, right: HERO_WIDTH * 0.11 }} size={9} color="#9FBC85" />
      <Sparkle style={{ bottom: 22, right: HERO_WIDTH * 0.02 }} size={10} color="#F0A45B" />

      <View style={styles.mapGlow} />
      <View style={styles.mapOval}>
        <View style={[styles.mapPatch, styles.mapPatchA]} />
        <View style={[styles.mapPatch, styles.mapPatchB]} />
        <View style={[styles.mapPatch, styles.mapPatchC]} />
        <View style={[styles.mapPatch, styles.mapPatchD]} />
        <View style={[styles.mapPatch, styles.mapPatchE]} />
        <View style={[styles.mapPark, styles.mapParkA]} />
        <View style={[styles.mapPark, styles.mapParkB]} />
        <View style={[styles.road, styles.roadOne]} />
        <View style={[styles.road, styles.roadTwo]} />
        <View style={[styles.road, styles.roadThree]} />
        <View style={[styles.road, styles.roadFour]} />
        <View style={[styles.road, styles.roadFive]} />
        <View style={[styles.road, styles.roadSix]} />
        <View style={[styles.smallRoad, styles.smallRoadOne]} />
        <View style={[styles.smallRoad, styles.smallRoadTwo]} />
        <View style={[styles.smallRoad, styles.smallRoadThree]} />
        <View style={[styles.smallRoad, styles.smallRoadFour]} />
        <View style={styles.roundabout} />
      </View>

      {/* Connection lines — computed from exact avatar + pin-tip coordinates */}
      {(() => {
        const pinTipX = HERO_WIDTH * 0.5;
        const pinTipY = 83; // pinWrap.top(12) + pinHead(52) + marginTop(-8) + pinPoint(27)
        const left  = { x: HERO_WIDTH * 0.08 + 24, y: HERO_WIDTH * 0.33 + 24 };
        const mid   = { x: HERO_WIDTH * 0.47 + 28, y: HERO_WIDTH * 0.4  + 28 };
        const right = { x: HERO_WIDTH * 0.92 - 22, y: HERO_WIDTH * 0.27 + 22 };
        return [left, mid, right].map((a, i) => (
          <ConnectionLine key={i} x1={a.x} y1={a.y} x2={pinTipX} y2={pinTipY} />
        ));
      })()}

      <Avatar
        size={48}
        skin="#9A5E39"
        hair="#172A25"
        shirt="#3E8C67"
        style={{ left: HERO_WIDTH * 0.08, top: HERO_WIDTH * 0.33 }}
      />
      <Avatar
        size={56}
        skin="#B66F42"
        hair="#2D1C15"
        shirt="#C55236"
        style={{ left: HERO_WIDTH * 0.47, top: HERO_WIDTH * 0.4 }}
      />
      <Avatar
        size={44}
        skin="#D19463"
        hair="#5B3020"
        shirt="#C56755"
        style={{ right: HERO_WIDTH * 0.08, top: HERO_WIDTH * 0.27 }}
      />

      <MapPin />
    </View>
  );
}

function Divider() {
  return (
    <View style={styles.dividerRow}>
      <View style={styles.dividerLine} />
      <View style={styles.dividerDiamond} />
      <View style={styles.dividerLine} />
    </View>
  );
}

function FeatureBadge({ icon, label }) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureIconWrap}>
        <Ionicons name={icon} size={26} color={GREEN} />
      </View>
      <Text style={styles.featureLabel}>{label}</Text>
    </View>
  );
}

export default function CoverScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <PaperTexture />
      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <MapIllustration />

        <Text style={styles.appName}>HelpMate</Text>
        <Text style={styles.tagline}>can keep you safe</Text>
        <Divider />

        <View style={styles.featureRow}>
          <FeatureBadge icon="shield-checkmark-outline" label="Trust" />
          <FeatureBadge icon="megaphone-outline"        label="Help" />
          <FeatureBadge icon="ribbon-outline"           label="Rewards" />
        </View>

        <TouchableOpacity
          style={styles.ctaBtn}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.86}
        >
          <Text style={styles.ctaBtnText}>Let's Get Started</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>INFO90010 | March 2026</Text>
        <Text style={styles.footerSub}>
          Top contributors in your local community are ranked 
          based on their activity and reputation.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: PAPER,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingTop: 24,
    paddingBottom: 24,
    gap: 6,
  },
  paperDot: {
    position: 'absolute',
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#B7B0A6',
  },
  topWash: {
    position: 'absolute',
    top: -28,
    left: -26,
    width: width * 0.62,
    height: 96,
    borderBottomRightRadius: 92,
    backgroundColor: '#D9E4D0',
    opacity: 0.34,
  },
  bottomWash: {
    position: 'absolute',
    right: -44,
    bottom: -54,
    width: width * 0.64,
    height: 118,
    borderTopLeftRadius: 120,
    backgroundColor: '#BFD4B6',
    opacity: 0.48,
  },
  sparkle: {
    position: 'absolute',
    fontWeight: '700',
    zIndex: 20,
  },
  hero: {
    marginTop: 10,
    marginBottom: 12,
  },
  mapGlow: {
    position: 'absolute',
    left: '10%',
    top: '7%',
    width: '80%',
    height: '78%',
    borderRadius: 132,
    backgroundColor: '#D7E3CE',
    opacity: 0.62,
  },
  mapOval: {
    position: 'absolute',
    left: '8%',
    top: '9%',
    width: '84%',
    height: '67%',
    borderRadius: 140,
    backgroundColor: '#E3DFC9',
    overflow: 'hidden',
    transform: [{ rotate: '-8deg' }],
  },
  mapPatch: {
    position: 'absolute',
    backgroundColor: '#D2CDBA',
    opacity: 0.64,
  },
  mapPatchA: {
    left: 12,
    top: 12,
    width: 72,
    height: 34,
    borderRadius: 7,
  },
  mapPatchB: {
    right: 24,
    top: 14,
    width: 88,
    height: 34,
    borderRadius: 7,
  },
  mapPatchC: {
    left: 86,
    bottom: 11,
    width: 82,
    height: 32,
    borderRadius: 7,
  },
  mapPatchD: {
    left: 14,
    bottom: 17,
    width: 56,
    height: 38,
    borderRadius: 7,
  },
  mapPatchE: {
    right: 10,
    bottom: 21,
    width: 70,
    height: 36,
    borderRadius: 7,
  },
  mapPark: {
    position: 'absolute',
    backgroundColor: '#BFD4A8',
    opacity: 0.75,
  },
  mapParkA: {
    left: 92,
    top: 42,
    width: 54,
    height: 34,
    borderRadius: 10,
  },
  mapParkB: {
    right: 78,
    bottom: 42,
    width: 46,
    height: 28,
    borderRadius: 9,
  },
  road: {
    position: 'absolute',
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.78)',
  },
  roadOne: {
    left: -18,
    top: 35,
    width: 310,
    transform: [{ rotate: '15deg' }],
  },
  roadTwo: {
    left: 8,
    top: 84,
    width: 300,
    transform: [{ rotate: '-19deg' }],
  },
  roadThree: {
    left: 102,
    top: -18,
    width: 164,
    transform: [{ rotate: '68deg' }],
  },
  roadFour: {
    left: 42,
    top: -8,
    width: 164,
    transform: [{ rotate: '101deg' }],
  },
  roadFive: {
    right: -28,
    top: 58,
    width: 188,
    transform: [{ rotate: '42deg' }],
  },
  roadSix: {
    left: -20,
    bottom: 22,
    width: 182,
    transform: [{ rotate: '-38deg' }],
  },
  smallRoad: {
    position: 'absolute',
    height: 4,
    borderRadius: 3,
    backgroundColor: 'rgba(248,246,237,0.72)',
  },
  smallRoadOne: {
    left: 42,
    top: 18,
    width: 72,
    transform: [{ rotate: '-18deg' }],
  },
  smallRoadTwo: {
    right: 48,
    top: 49,
    width: 88,
    transform: [{ rotate: '12deg' }],
  },
  smallRoadThree: {
    left: 72,
    bottom: 28,
    width: 74,
    transform: [{ rotate: '22deg' }],
  },
  smallRoadFour: {
    right: 16,
    bottom: 52,
    width: 68,
    transform: [{ rotate: '-28deg' }],
  },
  roundabout: {
    position: 'absolute',
    left: '48%',
    top: '43%',
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 5,
    borderColor: 'rgba(255,255,255,0.78)',
    backgroundColor: '#C7D7AF',
  },
  avatar: {
    position: 'absolute',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    backgroundColor: '#E5F0D7',
    shadowColor: '#5F6D54',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 8,
  },
  hair: {
    position: 'absolute',
    zIndex: 2,
  },
  face: {
    position: 'absolute',
    zIndex: 3,
  },
  eye: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#241915',
    zIndex: 6,
  },
  smile: {
    position: 'absolute',
    height: 3,
    borderRadius: 2,
    backgroundColor: '#7C3228',
    zIndex: 6,
  },
  shirt: {
    position: 'absolute',
    bottom: -3,
    zIndex: 1,
  },
  pinWrap: {
    position: 'absolute',
    left: '50%',
    top: 12,
    marginLeft: -26,
    alignItems: 'center',
    zIndex: 12,
  },
  pinHead: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: ORANGE,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.24,
    shadowRadius: 9,
    elevation: 8,
  },
  pinHeart: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinPoint: {
    width: 0,
    height: 0,
    marginTop: -8,
    borderLeftWidth: 15,
    borderRightWidth: 15,
    borderTopWidth: 27,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: ORANGE,
  },
  appName: {
    fontSize: 31,
    lineHeight: 38,
    fontWeight: '800',
    color: GREEN_DARK,
    marginTop: 4,
  },
  tagline: {
    ...typography.body,
    fontSize: 15,
    color: '#67645F',
    marginTop: -2,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 26,
  },
  dividerLine: {
    width: 100,
    height: 1,
    backgroundColor: '#CDD8C5',
  },
  dividerDiamond: {
    width: 12,
    height: 12,
    marginHorizontal: 8,
    backgroundColor: '#B9CDAF',
    transform: [{ rotate: '45deg' }],
  },
  featureRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 28,
  },
  featureItem: {
    width: '31%',
    alignItems: 'center',
  },
  featureIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E4EFD8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 2,
  },
  featureLabel: {
    ...typography.body,
    color: '#514F4A',
    marginTop: 2,
  },
  ctaBtn: {
    width: '100%',
    maxWidth: 300,
    borderRadius: 8,
    backgroundColor: GREEN,
    paddingVertical: 13,
    alignItems: 'center',
    shadowColor: '#506C48',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 13,
  },
  ctaBtnText: {
    ...typography.button,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    ...typography.caption,
    color: '#8F8A84',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 14,
    marginBottom: 10,
  },
  footerSub: {
    ...typography.body,
    color: '#625D58',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 310,
  },
});
