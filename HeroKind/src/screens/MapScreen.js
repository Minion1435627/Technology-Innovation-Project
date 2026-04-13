import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, TextInput, Modal,
} from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import Avatar from '../components/Avatar';
import UrgencyBadge from '../components/UrgencyBadge';
import { mockNeeds, mockSupplies } from '../data/mockData';

// Mock map pins to overlay on the placeholder map
const MOCK_PINS = [
  { id: 'n1', type: 'need', x: '30%', y: '40%', title: 'Screwdriver needed', poster: { name: 'Mia L.', level: 2 }, urgency: 'High', distance: '0.2 km', category: 'Borrow an item' },
  { id: 'n2', type: 'need', x: '60%', y: '55%', title: 'Help moving boxes', poster: { name: 'James W.', level: 1 }, urgency: 'ASAP', distance: '0.5 km', category: 'Physical help' },
  { id: 's1', type: 'supply', x: '45%', y: '30%', title: 'Offering drill + tools', poster: { name: 'David M.', level: 3 }, distance: '0.3 km', category: 'Lend an item' },
  { id: 's2', type: 'supply', x: '75%', y: '45%', title: 'Free Thai food', poster: { name: 'Nara P.', level: 2 }, distance: '0.6 km', category: 'Share food' },
  { id: 'f1', type: 'friend', x: '20%', y: '60%', title: 'Emma R. (Friend)', poster: { name: 'Emma R.', level: 3 }, distance: '0.9 km', category: 'Offer skills' },
];

const PIN_COLOR = { need: colors.need, supply: colors.supply, friend: colors.friend };
const PIN_EMOJI = { need: '🆘', supply: '📦', friend: '💙' };

export default function MapScreen({ navigation }) {
  const [tooltip, setTooltip] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ need: true, supply: true, friend: true });

  const visiblePins = MOCK_PINS.filter(p => {
    if (!filters[p.type]) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <SafeAreaView style={styles.safe}>

      {/* Search bar overlay */}
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
        <TouchableOpacity
          style={styles.postBtn}
          onPress={() => navigation.navigate('Post')}
        >
          <Text style={styles.postBtnText}>+ Post</Text>
        </TouchableOpacity>
      </View>

      {/* Active filter chips */}
      {(!filters.need || !filters.supply || !filters.friend) && (
        <View style={styles.filterChips}>
          {!filters.need && <View style={styles.chip}><Text style={styles.chipText}>Need hidden</Text></View>}
          {!filters.supply && <View style={styles.chip}><Text style={styles.chipText}>Supply hidden</Text></View>}
          {!filters.friend && <View style={styles.chip}><Text style={styles.chipText}>Friends hidden</Text></View>}
        </View>
      )}

      {/* MOCK MAP */}
      <View style={styles.mapContainer}>
        {/* Map background grid */}
        <View style={styles.mapBg}>
          {/* Road lines (decorative) */}
          <View style={[styles.road, { top: '35%', left: 0, right: 0, height: 10 }]} />
          <View style={[styles.road, { top: '65%', left: 0, right: 0, height: 6 }]} />
          <View style={[styles.road, { left: '40%', top: 0, bottom: 0, width: 10 }]} />
          <View style={[styles.road, { left: '70%', top: 0, bottom: 0, width: 6 }]} />

          {/* Park block */}
          <View style={[styles.park, { top: '10%', left: '10%', width: 80, height: 60 }]} />
          <Text style={[styles.parkLabel, { top: '14%', left: '13%' }]}>🌳 Park</Text>

          {/* Building blocks */}
          <View style={[styles.building, { top: '10%', left: '45%', width: 60, height: 50 }]} />
          <View style={[styles.building, { top: '40%', left: '10%', width: 55, height: 70 }]} />
          <View style={[styles.building, { top: '70%', left: '45%', width: 80, height: 60 }]} />
          <View style={[styles.building, { top: '70%', left: '75%', width: 50, height: 50 }]} />

          {/* Walking radius */}
          <View style={styles.radiusCircle} />

          {/* My location */}
          <View style={[styles.myLocationPin, { top: '48%', left: '38%' }]}>
            <View style={styles.myLocationDot} />
            <View style={styles.myLocationRing} />
          </View>

          {/* Map pins */}
          {visiblePins.map(pin => (
            <TouchableOpacity
              key={pin.id}
              style={[styles.pin, { top: pin.y, left: pin.x, backgroundColor: PIN_COLOR[pin.type] }]}
              onPress={() => setTooltip(pin)}
            >
              <Text style={styles.pinEmoji}>{PIN_EMOJI[pin.type]}</Text>
            </TouchableOpacity>
          ))}

          {/* Map attribution */}
          <Text style={styles.mapLabel}>Carlton North · Melbourne</Text>
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          {[
            { color: colors.need, label: 'Need' },
            { color: colors.supply, label: 'Supply' },
            { color: colors.friend, label: 'Friend' },
            { color: colors.myLocation, label: 'Me' },
          ].map(item => (
            <View key={item.label} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: item.color }]} />
              <Text style={styles.legendLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Tooltip Modal */}
      <Modal visible={!!tooltip} transparent animationType="slide" onRequestClose={() => setTooltip(null)}>
        <TouchableOpacity style={styles.tooltipBackdrop} activeOpacity={1} onPress={() => setTooltip(null)}>
          {tooltip && (
            <View style={styles.tooltipCard}>
              {/* Handle */}
              <View style={styles.tooltipHandle} />

              <View style={styles.tooltipHeader}>
                <Avatar name={tooltip.poster.name} size={48} level={tooltip.poster.level} />
                <View style={styles.tooltipMeta}>
                  <Text style={styles.tooltipName}>{tooltip.poster.name}</Text>
                  <Text style={styles.tooltipDist}>📍 {tooltip.distance} away</Text>
                </View>
                <View style={[styles.tooltipTypeBadge, { backgroundColor: PIN_COLOR[tooltip.type] }]}>
                  <Text style={styles.tooltipTypeText}>{tooltip.type === 'need' ? 'Need' : tooltip.type === 'supply' ? 'Supply' : 'Friend'}</Text>
                </View>
              </View>

              <Text style={styles.tooltipTitle}>{tooltip.title}</Text>
              <Text style={styles.tooltipCategory}>{tooltip.category}</Text>

              {tooltip.urgency && <UrgencyBadge urgency={tooltip.urgency} />}

              <View style={styles.tooltipActions}>
                <TouchableOpacity
                  style={styles.tooltipContactBtn}
                  onPress={() => { setTooltip(null); navigation.navigate('Chat'); }}
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

            {[
              { key: 'need', label: '🔴 Need Help posts', color: colors.need },
              { key: 'supply', label: '🟢 Supply / Offer posts', color: colors.supply },
              { key: 'friend', label: '🔵 Friends & Top Helpers', color: colors.friend },
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 10,
    height: 40,
    gap: 6,
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

  filterChips: { flexDirection: 'row', gap: 8, paddingHorizontal: 12, paddingVertical: 6 },
  chip: { backgroundColor: colors.primaryLight, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  chipText: { ...typography.caption, color: colors.primary },

  // Map
  mapContainer: { flex: 1, position: 'relative' },
  mapBg: {
    flex: 1,
    backgroundColor: '#E8EFF5',
    position: 'relative',
    overflow: 'hidden',
  },
  road: { position: 'absolute', backgroundColor: '#C5CBD2' },
  park: { position: 'absolute', backgroundColor: '#C8E6C9', borderRadius: 8 },
  parkLabel: { position: 'absolute', fontSize: 12, color: '#388E3C' },
  building: { position: 'absolute', backgroundColor: '#B0BEC5', borderRadius: 4 },
  mapLabel: {
    position: 'absolute',
    bottom: 56,
    left: 12,
    ...typography.caption,
    color: colors.textSecondary,
    backgroundColor: 'rgba(255,255,255,0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },

  radiusCircle: {
    position: 'absolute',
    top: '20%',
    left: '15%',
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    backgroundColor: 'rgba(91,79,233,0.05)',
  },

  myLocationPin: {
    position: 'absolute',
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  myLocationDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.myLocation,
    borderWidth: 2,
    borderColor: '#fff',
    zIndex: 2,
  },
  myLocationRing: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(254,211,48,0.25)',
  },

  pin: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    transform: [{ translateX: -18 }, { translateY: -18 }],
  },
  pinEmoji: { fontSize: 16 },

  legend: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255,255,255,0.93)',
    borderRadius: 12,
    padding: 10,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { ...typography.caption, color: colors.textPrimary },

  // Tooltip
  tooltipBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.3)' },
  tooltipCard: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    gap: 12,
  },
  tooltipHandle: {
    width: 40, height: 4, backgroundColor: colors.border,
    borderRadius: 2, alignSelf: 'center', marginBottom: 8,
  },
  tooltipHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  tooltipMeta: { flex: 1 },
  tooltipName: { ...typography.bodyBold, color: colors.textPrimary },
  tooltipDist: { ...typography.small, color: colors.textSecondary },
  tooltipTypeBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  tooltipTypeText: { ...typography.smallBold, color: colors.textWhite },
  tooltipTitle: { ...typography.h4, color: colors.textPrimary },
  tooltipCategory: { ...typography.small, color: colors.textSecondary },
  tooltipActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  tooltipContactBtn: {
    flex: 1, backgroundColor: colors.primary, borderRadius: 12,
    padding: 13, alignItems: 'center',
  },
  tooltipContactText: { ...typography.button, color: colors.textWhite },
  tooltipFriendBtn: {
    flex: 1, borderWidth: 1.5, borderColor: colors.primary,
    borderRadius: 12, padding: 13, alignItems: 'center',
  },
  tooltipFriendText: { ...typography.button, color: colors.primary },

  // Filter sheet
  filterSheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    gap: 16,
  },
  filterTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: 4 },
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
    backgroundColor: colors.primary, borderRadius: 14,
    padding: 14, alignItems: 'center', marginTop: 4,
  },
  applyBtnText: { ...typography.button, color: colors.textWhite },
});
