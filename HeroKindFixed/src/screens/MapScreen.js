import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  TextInput, Modal, ScrollView, Animated, PanResponder, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import Avatar from '../components/Avatar';
import UrgencyBadge from '../components/UrgencyBadge';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SHEET_COLLAPSED = SCREEN_HEIGHT * 0.72; // how far down the sheet sits (collapsed)
const SHEET_EXPANDED  = SCREEN_HEIGHT * 0.25; // how far down when expanded

// Melbourne CBD area — real coordinates
const MOCK_PINS = [
  { id: 'n1', type: 'need', latitude: -37.8000, longitude: 144.9600, title: 'Screwdriver needed', poster: { id: 'u2', name: 'Mia L.', level: 2, gender: 'Female' }, urgency: 'High', distance: '0.2 km', category: 'Borrow an item' },
  { id: 'n2', type: 'need', latitude: -37.8050, longitude: 144.9680, title: 'Help moving boxes', poster: { id: 'u3', name: 'James W.', level: 1, gender: 'Male' }, urgency: 'ASAP', distance: '0.5 km', category: 'Physical help' },
  { id: 's1', type: 'supply', latitude: -37.7970, longitude: 144.9630, title: 'Offering drill + tools', poster: { id: 'u6', name: 'David M.', level: 3, gender: 'Male' }, distance: '0.3 km', category: 'Lend an item' },
  { id: 's2', type: 'supply', latitude: -37.8020, longitude: 144.9710, title: 'Free Thai food', poster: { id: 'u7', name: 'Nara P.', level: 2, gender: 'Female' }, distance: '0.6 km', category: 'Share food' },
  { id: 'f1', type: 'friend', latitude: -37.7990, longitude: 144.9560, title: 'Emma R. (Friend)', poster: { id: 'u8', name: 'Emma R.', level: 3, gender: 'Female' }, distance: '0.9 km', category: 'Offer skills' },
];

// My location (Carlton North / Melbourne Uni area)
const MY_LOCATION = { latitude: -37.8010, longitude: 144.9640 };

const PIN_COLOR  = { need: colors.need, supply: colors.supply, friend: colors.friend };
const PIN_BORDER = { need: '#ff6b6b', supply: '#51cf66', friend: '#74c0fc' };
const GENDER_ICON = { Male: '♂️', Female: '♀️', 'Non-binary': '⚧️' };
const GENDER_COLOR = { Male: '#4dabf7', Female: '#f783ac', 'Non-binary': '#a78bfa' };

// Avatar-style marker with glow — no TouchableOpacity, let Marker handle onPress
function PinMarker({ pin }) {
  const color  = PIN_COLOR[pin.type];
  const border = PIN_BORDER[pin.type];
  return (
    <View style={[styles.pinGlow, { shadowColor: color }]}>
      <View style={[styles.pinRing, { borderColor: border }]}>
        <View style={[styles.pinAvatar, { backgroundColor: color }]}>
          <Text style={styles.pinInitial}>{pin.poster.name.charAt(0)}</Text>
        </View>
      </View>
      <View style={[styles.pinTail, { borderTopColor: border }]} />
    </View>
  );
}

export default function MapScreen({ navigation }) {
  const mapRef    = useRef(null);
  const sheetAnim = useRef(new Animated.Value(SHEET_COLLAPSED)).current;
  const lastY     = useRef(SHEET_COLLAPSED);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [tooltip, setTooltip]     = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [search, setSearch]       = useState('');
  const [filters, setFilters]     = useState({ need: true, supply: true, friend: true });
  const [genderFilter, setGenderFilter] = useState({ Male: true, Female: true, 'Non-binary': true });

  // Pan responder for dragging the sheet
  const panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, g) => {
      const next = Math.max(SHEET_EXPANDED, Math.min(SHEET_COLLAPSED, lastY.current + g.dy));
      sheetAnim.setValue(next);
    },
    onPanResponderRelease: (_, g) => {
      const next = lastY.current + g.dy;
      const snapTo = next < (SHEET_EXPANDED + SHEET_COLLAPSED) / 2 ? SHEET_EXPANDED : SHEET_COLLAPSED;
      Animated.spring(sheetAnim, { toValue: snapTo, useNativeDriver: false, bounciness: 4 }).start();
      lastY.current = snapTo;
      setSheetOpen(snapTo === SHEET_EXPANDED);
    },
  })).current;

  const toggleSheet = () => {
    const snapTo = sheetOpen ? SHEET_COLLAPSED : SHEET_EXPANDED;
    Animated.spring(sheetAnim, { toValue: snapTo, useNativeDriver: false, bounciness: 4 }).start();
    lastY.current = snapTo;
    setSheetOpen(!sheetOpen);
  };

  const recenterMap = () => {
    mapRef.current?.animateToRegion({
      latitude: MY_LOCATION.latitude,
      longitude: MY_LOCATION.longitude,
      latitudeDelta: 0.03,
      longitudeDelta: 0.03,
    }, 500);
  };

  const visiblePins = MOCK_PINS.filter(p => {
    if (!filters[p.type]) return false;
    if (p.poster.gender && !genderFilter[p.poster.gender]) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>

      {/* Search bar */}
      <View style={styles.searchOverlay}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search nearby posts…"
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.filterBtn} onPress={() => setFilterOpen(true)}>
          <Text style={styles.filterIcon}>⚙️</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.postBtn} onPress={() => navigation.navigate('Post')}>
          <Text style={styles.postBtnText}>+ Post</Text>
        </TouchableOpacity>
      </View>

      {/* Map fills remaining space */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFillObject}
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            latitude: MY_LOCATION.latitude,
            longitude: MY_LOCATION.longitude,
            latitudeDelta: 0.03,
            longitudeDelta: 0.03,
          }}
          showsUserLocation={true}
          showsMyLocationButton={false}
        >
          <Circle
            center={MY_LOCATION}
            radius={600}
            strokeColor={colors.primary}
            strokeWidth={2}
            fillColor="rgba(91,79,233,0.07)"
          />
          {visiblePins.map(pin => (
            <Marker
              key={pin.id}
              coordinate={{ latitude: pin.latitude, longitude: pin.longitude }}
              anchor={{ x: 0.5, y: 1 }}
              onPress={() => setTooltip(pin)}
              tracksViewChanges={false}
            >
              <PinMarker pin={pin} />
            </Marker>
          ))}
        </MapView>

        {/* Recenter */}
        <TouchableOpacity style={styles.recenterBtn} onPress={recenterMap}>
          <Text style={styles.recenterIcon}>📍</Text>
        </TouchableOpacity>

        {/* Legend */}
        <View style={styles.legend}>
          {[
            { color: colors.need,   label: 'Need' },
            { color: colors.supply, label: 'Supply' },
            { color: colors.friend, label: 'Friend' },
          ].map(item => (
            <View key={item.label} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: item.color }]} />
              <Text style={styles.legendLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Pull-up bottom sheet ── */}
        <Animated.View style={[styles.sheet, { top: sheetAnim }]}>
          {/* Drag handle */}
          <View style={styles.sheetHandle} {...panResponder.panHandlers}>
            <View style={styles.handleBar} />
            <TouchableOpacity onPress={toggleSheet} style={styles.sheetHeaderRow}>
              <Text style={styles.sheetTitle}>NEARBY HELPERS</Text>
              <Text style={styles.sheetSubtitle}>Sorted by Distance</Text>
              <Text style={styles.sheetChevron}>{sheetOpen ? '▾' : '▴'}</Text>
            </TouchableOpacity>
          </View>

          {/* Scrollable list */}
          <ScrollView style={styles.sheetList} showsVerticalScrollIndicator={false}>
            {visiblePins.map(pin => (
              <TouchableOpacity
                key={pin.id}
                style={styles.sheetRow}
                onPress={() => setTooltip(pin)}
              >
                {/* Avatar with coloured ring */}
                <View style={[styles.sheetAvatarRing, { borderColor: PIN_COLOR[pin.type] }]}>
                  <View style={[styles.sheetAvatarCircle, { backgroundColor: PIN_COLOR[pin.type] }]}>
                    <Text style={styles.sheetAvatarInitial}>{pin.poster.name.charAt(0)}</Text>
                  </View>
                </View>

                <View style={styles.sheetInfo}>
                  <Text style={styles.sheetName}>{pin.poster.name}</Text>
                  <Text style={styles.sheetCategory}>{pin.category}</Text>
                </View>

                <View style={styles.sheetRight}>
                  <Text style={styles.sheetDist}>{pin.distance}</Text>
                  <View style={[styles.sheetTypeBadge, { backgroundColor: PIN_COLOR[pin.type] + '22' }]}>
                    <Text style={[styles.sheetTypeText, { color: PIN_COLOR[pin.type] }]}>
                      {pin.type === 'need' ? 'Need' : pin.type === 'supply' ? 'Supply' : 'Friend'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Request help button */}
          <View style={styles.sheetFooter}>
            <TouchableOpacity style={styles.requestBtn} onPress={() => navigation.navigate('Post')}>
              <Text style={styles.requestBtnText}>+ REQUEST HELP</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>

      {/* Tooltip Modal */}
      <Modal visible={!!tooltip} transparent animationType="slide" onRequestClose={() => setTooltip(null)}>
        <TouchableOpacity style={styles.tooltipBackdrop} activeOpacity={1} onPress={() => setTooltip(null)}>
          {tooltip && (
            <View style={styles.tooltipCard}>
              <View style={styles.tooltipHandle} />

              {/* Type badge */}
              <View style={[styles.tooltipTypePill, { backgroundColor: PIN_COLOR[tooltip.type] + '22' }]}>
                <View style={[styles.tooltipTypeDot, { backgroundColor: PIN_COLOR[tooltip.type] }]} />
                <Text style={[styles.tooltipTypePillText, { color: PIN_COLOR[tooltip.type] }]}>
                  {tooltip.type === 'need' ? '🆘 Need Help' : tooltip.type === 'supply' ? '📦 Offering' : '💙 Friend'}
                </Text>
                {tooltip.urgency && (
                  <View style={styles.urgencyTag}>
                    <Text style={styles.urgencyTagText}>⚡ {tooltip.urgency}</Text>
                  </View>
                )}
              </View>

              {/* Title */}
              <Text style={styles.tooltipTitle}>{tooltip.title}</Text>

              {/* Category & distance */}
              <View style={styles.tooltipMeta2}>
                <Text style={styles.tooltipMetaItem}>🏷️ {tooltip.category}</Text>
                <Text style={styles.tooltipMetaDot}>·</Text>
                <Text style={styles.tooltipMetaItem}>📍 {tooltip.distance} away</Text>
              </View>

              {/* Divider */}
              <View style={styles.divider} />

              {/* User row */}
              <TouchableOpacity
                style={styles.tooltipUserRow}
                onPress={() => {
                  setTooltip(null);
                  navigation.navigate('UserProfile', { userId: tooltip.poster.id });
                }}
              >
                <Avatar name={tooltip.poster.name} size={44} level={tooltip.poster.level} />
                <View style={styles.tooltipUserInfo}>
                  <View style={styles.tooltipNameRow}>
                    <Text style={styles.tooltipName}>{tooltip.poster.name}</Text>
                    <Text style={styles.tooltipVerified}>✓</Text>
                  </View>
                  <Text style={styles.tooltipUserSub}>
                    {tooltip.poster.gender ? `${GENDER_ICON[tooltip.poster.gender]} ${tooltip.poster.gender} · ` : ''}Level {tooltip.poster.level} · Tap to view profile →
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Actions */}
              <View style={styles.tooltipActions}>
                <TouchableOpacity
                  style={styles.tooltipContactBtn}
                  onPress={() => {
                    setTooltip(null);
                    navigation.navigate('ChatDetail', {
                      chat: { user: { id: tooltip.poster.id, name: tooltip.poster.name }, postTitle: tooltip.title }
                    });
                  }}
                >
                  <Text style={styles.tooltipContactText}>💬 Contact</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tooltipFriendBtn}>
                  <Text style={styles.tooltipFriendText}>+ Add Friend</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </TouchableOpacity>
      </Modal>

      {/* Filter Modal */}
      <Modal visible={filterOpen} transparent animationType="slide" onRequestClose={() => setFilterOpen(false)}>
        <TouchableOpacity style={styles.tooltipBackdrop} activeOpacity={1} onPress={() => setFilterOpen(false)}>
          <View style={styles.filterSheet}>
            <View style={styles.tooltipHandle} />
            <Text style={styles.filterTitle}>Filter Map</Text>

            {/* Post type filters */}
            <Text style={styles.filterSectionLabel}>POST TYPE</Text>
            {[
              { key: 'need',   label: '🔴 Need Help posts' },
              { key: 'supply', label: '🟢 Supply / Offer posts' },
              { key: 'friend', label: '🔵 Friends & Top Helpers' },
            ].map(item => (
              <TouchableOpacity
                key={item.key}
                style={styles.filterRow}
                onPress={() => setFilters(f => ({ ...f, [item.key]: !f[item.key] }))}
              >
                <Text style={styles.filterRowLabel}>{item.label}</Text>
                <View style={[styles.toggle, filters[item.key] && { backgroundColor: colors.primary }]}>
                  <View style={[styles.toggleThumb, filters[item.key] && styles.toggleThumbOn]} />
                </View>
              </TouchableOpacity>
            ))}

            {/* Gender filter */}
            <Text style={[styles.filterSectionLabel, { marginTop: 8 }]}>POSTER GENDER</Text>
            <View style={styles.genderChips}>
              {['Male', 'Female', 'Non-binary'].map(g => (
                <TouchableOpacity
                  key={g}
                  style={[
                    styles.genderChip,
                    { borderColor: GENDER_COLOR[g] },
                    genderFilter[g] && { backgroundColor: GENDER_COLOR[g] },
                  ]}
                  onPress={() => setGenderFilter(f => ({ ...f, [g]: !f[g] }))}
                >
                  <Text style={[styles.genderChipText, genderFilter[g] && { color: '#fff' }]}>
                    {GENDER_ICON[g]} {g}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.applyBtn} onPress={() => setFilterOpen(false)}>
              <Text style={styles.applyBtnText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  searchOverlay: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 10, gap: 8,
    backgroundColor: colors.card,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.background, borderRadius: 12,
    paddingHorizontal: 10, height: 40, gap: 6,
  },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, ...typography.body, color: colors.textPrimary },
  clearIcon: { fontSize: 14, color: colors.textMuted, padding: 4 },
  filterBtn: {
    width: 40, height: 40, backgroundColor: colors.background,
    borderRadius: 12, alignItems: 'center', justifyContent: 'center',
  },
  filterIcon: { fontSize: 18 },
  postBtn: {
    backgroundColor: colors.primary, borderRadius: 12,
    paddingHorizontal: 14, height: 40, alignItems: 'center', justifyContent: 'center',
  },
  postBtnText: { ...typography.smallBold, color: colors.textWhite },

  // Map
  mapContainer: { flex: 1, position: 'relative' },

  recenterBtn: {
    position: 'absolute', bottom: 200, right: 16,
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 4, elevation: 4,
  },
  recenterIcon: { fontSize: 22 },

  legend: {
    position: 'absolute', top: 12, right: 12,
    backgroundColor: 'rgba(255,255,255,0.93)',
    borderRadius: 12, padding: 10, gap: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { ...typography.caption, color: colors.textPrimary },

  // ── Avatar-style marker ──
  pinGlow: {
    alignItems: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 8,
  },
  pinRing: {
    width: 48, height: 48, borderRadius: 24,
    borderWidth: 3,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#fff',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 4, elevation: 4,
  },
  pinAvatar: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: 'center', justifyContent: 'center',
  },
  pinInitial: { fontSize: 16, fontWeight: '700', color: '#fff' },
  pinTail: {
    width: 0, height: 0,
    borderLeftWidth: 6, borderRightWidth: 6, borderTopWidth: 8,
    borderLeftColor: 'transparent', borderRightColor: 'transparent',
    marginTop: -1,
  },

  // ── Bottom sheet ──
  sheet: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.12, shadowRadius: 12, elevation: 16,
  },
  sheetHandle: {
    paddingTop: 10, paddingBottom: 6,
    paddingHorizontal: 20,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
  },
  handleBar: {
    width: 40, height: 4, backgroundColor: colors.border,
    borderRadius: 2, alignSelf: 'center', marginBottom: 10,
  },
  sheetHeaderRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
  },
  sheetTitle: { ...typography.smallBold, color: colors.textPrimary, letterSpacing: 0.5 },
  sheetSubtitle: { ...typography.caption, color: colors.textSecondary, flex: 1 },
  sheetChevron: { fontSize: 14, color: colors.textMuted },

  sheetList: { maxHeight: 280, paddingHorizontal: 16 },

  sheetRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  sheetAvatarRing: {
    width: 52, height: 52, borderRadius: 26,
    borderWidth: 2.5,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#fff',
  },
  sheetAvatarCircle: {
    width: 42, height: 42, borderRadius: 21,
    alignItems: 'center', justifyContent: 'center',
  },
  sheetAvatarInitial: { fontSize: 18, fontWeight: '700', color: '#fff' },
  sheetInfo: { flex: 1 },
  sheetName: { ...typography.bodyBold, color: colors.textPrimary },
  sheetCategory: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  sheetRight: { alignItems: 'flex-end', gap: 4 },
  sheetDist: { ...typography.smallBold, color: colors.textPrimary },
  sheetTypeBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  sheetTypeText: { ...typography.caption, fontWeight: '700' },

  sheetFooter: {
    padding: 16, borderTopWidth: 1, borderTopColor: colors.border,
  },
  requestBtn: {
    backgroundColor: colors.primary, borderRadius: 14,
    padding: 14, alignItems: 'center',
  },
  requestBtnText: { ...typography.button, color: '#fff', letterSpacing: 0.5 },

  // Tooltip
  tooltipBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.35)' },
  tooltipCard: {
    backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, gap: 14,
  },
  tooltipHandle: {
    width: 40, height: 4, backgroundColor: colors.border,
    borderRadius: 2, alignSelf: 'center', marginBottom: 4,
  },
  tooltipTypePill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, alignSelf: 'flex-start',
  },
  tooltipTypeDot: { width: 8, height: 8, borderRadius: 4 },
  tooltipTypePillText: { ...typography.smallBold },
  urgencyTag: {
    backgroundColor: '#FF6B3522', borderRadius: 10,
    paddingHorizontal: 8, paddingVertical: 2, marginLeft: 4,
  },
  urgencyTagText: { ...typography.caption, color: '#FF6B35', fontWeight: '700' },

  tooltipTitle: { ...typography.h3, color: colors.textPrimary },

  tooltipMeta2: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tooltipMetaItem: { ...typography.small, color: colors.textSecondary },
  tooltipMetaDot: { ...typography.small, color: colors.textMuted },

  divider: { height: 1, backgroundColor: colors.border },

  tooltipUserRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  tooltipUserInfo: { flex: 1 },
  tooltipNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tooltipName: { ...typography.bodyBold, color: colors.textPrimary },
  tooltipVerified: {
    fontSize: 11, color: '#fff', backgroundColor: colors.primary,
    borderRadius: 8, paddingHorizontal: 4, paddingVertical: 1, overflow: 'hidden',
  },
  tooltipUserSub: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },

  tooltipActions: { flexDirection: 'row', gap: 10 },
  tooltipContactBtn: {
    flex: 1, backgroundColor: colors.primary, borderRadius: 14, padding: 14, alignItems: 'center',
  },
  tooltipContactText: { ...typography.button, color: colors.textWhite },
  tooltipFriendBtn: {
    flex: 1, borderWidth: 1.5, borderColor: colors.primary,
    borderRadius: 14, padding: 14, alignItems: 'center',
  },
  tooltipFriendText: { ...typography.button, color: colors.primary },

  // Filter
  filterSheet: {
    backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, gap: 16,
  },
  filterTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: 4 },
  filterSectionLabel: { ...typography.caption, color: colors.textMuted, fontWeight: '700', letterSpacing: 0.8 },
  genderChips: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  genderChip: {
    borderWidth: 1.5, borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  genderChipText: { ...typography.smallBold, color: colors.textPrimary },
  filterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  filterRowLabel: { ...typography.body, color: colors.textPrimary },
  toggle: {
    width: 48, height: 28, borderRadius: 14,
    backgroundColor: colors.border, padding: 2, justifyContent: 'center',
  },
  toggleThumb: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: '#fff',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.15, shadowRadius: 2, elevation: 2,
  },
  toggleThumbOn: { alignSelf: 'flex-end' },
  applyBtn: {
    backgroundColor: colors.primary, borderRadius: 14, padding: 14, alignItems: 'center', marginTop: 4,
  },
  applyBtnText: { ...typography.button, color: colors.textWhite },
});
