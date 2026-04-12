import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  TextInput, Modal, ScrollView, Animated, PanResponder, Dimensions, ActivityIndicator,
} from 'react-native';
import * as Location from 'expo-location';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import Avatar from '../components/Avatar';
import UrgencyBadge from '../components/UrgencyBadge';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SHEET_COLLAPSED = SCREEN_HEIGHT * 0.72; // how far down the sheet sits (collapsed)
const SHEET_EXPANDED  = SCREEN_HEIGHT * 0.25; // how far down when expanded

// Pins centred near Docklands / Marvel Stadium (-37.8144, 144.9398)
const MOCK_PINS = [
  { id: 'n1', type: 'need',   latitude: -37.8130, longitude: 144.9420, title: 'Need a screwdriver for IKEA shelf',       poster: { id: 'u2', name: 'Mia L.',    level: 2, gender: 'Female',     stars: 4.6 }, urgency: 'High', category: 'Borrow an item',  description: 'Moving into a new place — need a Phillips screwdriver for about 30 mins. Happy to come to you!', timePosted: '5 min ago' },
  { id: 'n2', type: 'need',   latitude: -37.8160, longitude: 144.9450, title: 'Help carrying boxes up 3 flights',         poster: { id: 'u3', name: 'James W.',  level: 1, gender: 'Male',       stars: 4.9 }, urgency: 'ASAP', category: 'Physical help',   description: 'Moving day! Need 2 people for about an hour. Will shout pizza and drinks.', timePosted: '12 min ago' },
  { id: 'n3', type: 'need',   latitude: -37.8115, longitude: 144.9370, title: 'Borrow a bicycle pump',                    poster: { id: 'u4', name: 'Sophie K.', level: 4, gender: 'Female',     stars: 5.0 }, urgency: 'Medium', category: 'Borrow an item', description: 'Flat tyre before uni — just need a pump for a minute.', timePosted: '20 min ago' },
  { id: 'n4', type: 'need',   latitude: -37.8175, longitude: 144.9340, title: 'Help with Python assignment',               poster: { id: 'u5', name: 'Ryo T.',    level: 2, gender: 'Male',       stars: 4.3 }, urgency: 'Low',  category: 'Study / Skills', description: 'Stuck on a pandas data cleaning task. Can anyone spare 30 mins over video call?', timePosted: '1 hr ago' },
  { id: 'n5', type: 'need',   latitude: -37.8095, longitude: 144.9435, title: 'Need someone to walk my dog',               poster: { id: 'u9', name: 'Lena B.',   level: 2, gender: 'Female',     stars: 4.7 }, urgency: 'Medium', category: 'Pet care',       description: 'Away for the afternoon, dog needs a 30-min walk around the waterfront.', timePosted: '35 min ago' },
  { id: 's1', type: 'supply', latitude: -37.8138, longitude: 144.9408, title: 'Offering drill + full toolset',             poster: { id: 'u6', name: 'David M.', level: 3, gender: 'Male',       stars: 4.7 }, category: 'Lend an item',   description: 'Happy to lend my drill, screwdrivers, and hammer. Available Sat–Sun. Please return Sunday night.', availability: 'Sat–Sun this weekend', timePosted: '15 min ago' },
  { id: 's2', type: 'supply', latitude: -37.8155, longitude: 144.9385, title: 'Free leftover Thai food',                   poster: { id: 'u7', name: 'Nara P.',  level: 2, gender: 'Female',     stars: 4.9 }, category: 'Share food',     description: 'Made too much dinner. Come grab some before 9pm tonight!', availability: 'Tonight until 9 PM', timePosted: '30 min ago' },
  { id: 's3', type: 'supply', latitude: -37.8120, longitude: 144.9460, title: 'Can help with React / JS questions',        poster: { id: 'u8', name: 'Emma R.',  level: 3, gender: 'Female',     stars: 4.8 }, category: 'Offer skills',   description: '3rd year CS student. Happy to help with frontend questions this afternoon.', availability: 'Today 2–6 PM', timePosted: '45 min ago' },
  { id: 's4', type: 'supply', latitude: -37.8108, longitude: 144.9395, title: 'Giving away houseplants',                   poster: { id: 'u10', name: 'Omar S.', level: 1, gender: 'Male',       stars: 4.5 }, category: 'Free item',      description: 'Moving out and can\'t take my plants. Free to good homes — pothos, spider plant, snake plant.', availability: 'This weekend', timePosted: '2 hrs ago' },
  { id: 'f1', type: 'friend', latitude: -37.8148, longitude: 144.9428, title: 'Emma R. is nearby',                         poster: { id: 'u8', name: 'Emma R.',  level: 3, gender: 'Female',     stars: 4.8 }, category: 'Friend',         description: 'Emma is a trusted neighbour — she has helped 12 people this month!', timePosted: 'online now' },
  { id: 'f2', type: 'friend', latitude: -37.8125, longitude: 144.9352, title: 'David M. is nearby',                        poster: { id: 'u6', name: 'David M.', level: 4, gender: 'Male',       stars: 4.7 }, category: 'Friend',         description: 'David is a Community Pillar — top helper this week with 380 pts!', timePosted: '10 min ago' },
];

// Distance options in km
const DISTANCE_OPTIONS = [0.5, 1, 2, 5];

// Haversine formula — returns distance in km
function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Fallback location if permission denied
const FALLBACK_LOCATION = { latitude: -37.8144, longitude: 144.9398 };

const PIN_COLOR  = { need: colors.need, supply: colors.supply, friend: colors.friend };
const PIN_BORDER = { need: '#ff6b6b', supply: '#51cf66', friend: '#74c0fc' };
const GENDER_ICON = { Male: '♂️', Female: '♀️', 'Non-binary': '⚧️' };
const GENDER_COLOR = { Male: '#4dabf7', Female: '#f783ac', 'Non-binary': '#a78bfa' };

// Warm, humanized map style
const WARM_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#f5ebe0' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#6b4f3a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#fff8f0' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#e8d5c4' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#fcd5a2' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#e8b87a' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#fff3e8' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#aad3e8' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#5b8fa8' }] },
  { featureType: 'park', elementType: 'geometry', stylers: [{ color: '#c8e6c0' }] },
  { featureType: 'park', elementType: 'labels.text.fill', stylers: [{ color: '#4a7c59' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#ede0d4' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#c8e6c0' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#d4a97a' }] },
  { featureType: 'administrative.land_parcel', elementType: 'labels.text.fill', stylers: [{ color: '#9a7b6a' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#f0ddd0' }] },
  { featureType: 'transit.station', elementType: 'labels.icon', stylers: [{ saturation: -20 }] },
  { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
  { featureType: 'landscape.man_made', elementType: 'geometry', stylers: [{ color: '#ede0d4' }] },
];

// Circular marker with colour glow
function PinMarker({ pin }) {
  const color = PIN_COLOR[pin.type];
  return (
    <View style={styles.pinWrapper}>
      {/* Outer glow ring — semi-transparent circle */}
      <View style={[styles.pinGlowRing, {
        backgroundColor: color + '30',
        shadowColor: color,
      }]} />
      {/* Inner white border ring */}
      <View style={[styles.pinRing, { borderColor: color }]}>
        {/* Coloured avatar circle */}
        <View style={[styles.pinAvatar, { backgroundColor: color }]}>
          <Text style={styles.pinInitial}>{pin.poster.name.charAt(0)}</Text>
        </View>
      </View>
    </View>
  );
}

export default function MapScreen({ navigation }) {
  const insets  = useSafeAreaInsets();
  const mapRef  = useRef(null);
  const sheetAnim = useRef(new Animated.Value(SHEET_COLLAPSED)).current;
  const lastY     = useRef(SHEET_COLLAPSED);
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [tooltip, setTooltip]     = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [search, setSearch]       = useState('');
  const [filters, setFilters]     = useState({ need: true, supply: true, friend: true });
  const [genderFilter, setGenderFilter] = useState({ Male: true, Female: true, 'Non-binary': true });
  const [maxDistance, setMaxDistance] = useState(2); // km

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
        setUserLocation(coords);
        mapRef.current?.animateToRegion({ ...coords, latitudeDelta: 0.03, longitudeDelta: 0.03 }, 500);
      } else {
        setUserLocation(FALLBACK_LOCATION);
      }
      setLocationLoading(false);
    })();
  }, []);

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
    const loc = userLocation ?? FALLBACK_LOCATION;
    mapRef.current?.animateToRegion({
      latitude: loc.latitude,
      longitude: loc.longitude,
      latitudeDelta: 0.03,
      longitudeDelta: 0.03,
    }, 500);
  };

  const centre = userLocation ?? FALLBACK_LOCATION;
  const visiblePins = MOCK_PINS.filter(p => {
    if (!filters[p.type]) return false;
    if (p.poster.gender && !genderFilter[p.poster.gender]) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    const dist = getDistanceKm(centre.latitude, centre.longitude, p.latitude, p.longitude);
    if (dist > maxDistance) return false;
    return true;
  }).map(p => {
    const dist = getDistanceKm(centre.latitude, centre.longitude, p.latitude, p.longitude);
    return { ...p, distanceKm: dist, distance: dist < 1 ? `${Math.round(dist * 1000)} m` : `${dist.toFixed(1)} km` };
  });

  return (
    <View style={styles.safe}>

      {/* Map fills ALL space edge-to-edge */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFillObject}
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            latitude: FALLBACK_LOCATION.latitude,
            longitude: FALLBACK_LOCATION.longitude,
            latitudeDelta: 0.03,
            longitudeDelta: 0.03,
          }}
          showsUserLocation={true}
          showsMyLocationButton={false}
        >
          {userLocation && (
            <Circle
              center={userLocation}
              radius={maxDistance * 1000}
              strokeColor={colors.primary}
              strokeWidth={2}
              fillColor="rgba(91,79,233,0.06)"
            />
          )}
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

        {/* Location loading overlay */}
        {locationLoading && (
          <View style={styles.locationLoading}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.locationLoadingText}>Finding your location…</Text>
          </View>
        )}

        {/* Floating search bar — pushed below status bar */}
        <View style={[styles.searchOverlay, { top: insets.top + 10 }]}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color={colors.textMuted} style={{ marginLeft: 4 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search nearby posts…"
              placeholderTextColor={colors.textMuted}
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity style={styles.filterBtn} onPress={() => setFilterOpen(true)}>
            <Ionicons name="options-outline" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Legend — horizontal row under search bar */}
        <View style={[styles.legend, { top: insets.top + 66 }]}>
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

        {/* Recenter — blue arrow icon */}
        <TouchableOpacity style={styles.recenterBtn} onPress={recenterMap}>
          <Ionicons name="navigate" size={22} color="#4A90E2" />
        </TouchableOpacity>

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

              {/* Description */}
              {tooltip.description && (
                <Text style={styles.tooltipDescription}>{tooltip.description}</Text>
              )}

              {/* Availability */}
              {tooltip.availability && (
                <View style={styles.availabilityRow}>
                  <Text style={styles.availabilityText}>🕐 {tooltip.availability}</Text>
                </View>
              )}

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

            {/* Distance filter */}
            <Text style={[styles.filterSectionLabel, { marginTop: 8 }]}>SEARCH RADIUS</Text>
            <View style={styles.genderChips}>
              {DISTANCE_OPTIONS.map(d => (
                <TouchableOpacity
                  key={d}
                  style={[
                    styles.genderChip,
                    { borderColor: colors.primary },
                    maxDistance === d && { backgroundColor: colors.primary },
                  ]}
                  onPress={() => setMaxDistance(d)}
                >
                  <Text style={[styles.genderChipText, maxDistance === d && { color: '#fff' }]}>
                    {d < 1 ? `${d * 1000}m` : `${d} km`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

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

    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },

  searchOverlay: {
    position: 'absolute',
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    zIndex: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingHorizontal: 12,
    height: 46,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
  searchInput: { flex: 1, ...typography.body, color: colors.textPrimary },
  filterBtn: {
    width: 46, height: 46,
    backgroundColor: '#fff',
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },

  // Map
  mapContainer: { flex: 1, position: 'relative' },
  locationLoading: {
    position: 'absolute', bottom: 120, alignSelf: 'center',
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 6, elevation: 4,
    zIndex: 10,
  },
  locationLoadingText: { ...typography.small, color: colors.textSecondary },

  recenterBtn: {
    position: 'absolute', bottom: 210, right: 16,
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15, shadowRadius: 8, elevation: 6,
  },

  legend: {
    position: 'absolute',
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    zIndex: 10,
  },
  legendItem: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
  },
  legendDot: { width: 9, height: 9, borderRadius: 5 },
  legendLabel: { ...typography.caption, color: colors.textPrimary, fontWeight: '600' },

  // ── Circular marker with glow ──
  pinWrapper: {
    width: 56, height: 56,
    alignItems: 'center', justifyContent: 'center',
  },
  pinGlowRing: {
    position: 'absolute',
    width: 56, height: 56, borderRadius: 28,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 0,
  },
  pinRing: {
    width: 44, height: 44, borderRadius: 22,
    borderWidth: 3,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
  },
  pinAvatar: {
    width: 34, height: 34, borderRadius: 17,
    alignItems: 'center', justifyContent: 'center',
  },
  pinInitial: { fontSize: 15, fontWeight: '800', color: '#fff' },

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
  tooltipDescription: { ...typography.body, color: colors.textSecondary, lineHeight: 20 },
  availabilityRow: {
    backgroundColor: colors.primaryLight, borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 5, alignSelf: 'flex-start',
  },
  availabilityText: { ...typography.caption, color: colors.primary, fontWeight: '600' },

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
