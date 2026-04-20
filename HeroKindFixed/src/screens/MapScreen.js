import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert,
  TextInput, Modal, ScrollView, Dimensions, ActivityIndicator,
} from 'react-native';
import * as Location from 'expo-location';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import Avatar from '../components/Avatar';
import UrgencyBadge from '../components/UrgencyBadge';
import { usePosts } from '../context/PostsContext';
import { useFriends } from '../context/FriendsContext';
import { useChats } from '../context/ChatContext';
import { usePrivacy } from '../context/PrivacyContext';
import { mockUser, mockOtherUsers, mockChats } from '../data/mockData';

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
  const color = pin.isFriendPost ? PIN_COLOR.friend : PIN_COLOR[pin.type];
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
  const { posts, removePost } = usePosts();
  const { friendIds, addFriend, removeFriend, isFriend } = useFriends();
  const { chats } = useChats();
  const { locationSettings } = usePrivacy();
  const { useLocationForMap } = locationSettings;
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [nearbyOpen, setNearbyOpen] = useState(false);
  const [tooltip, setTooltip]     = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [search, setSearch]       = useState('');
  const [filters, setFilters]     = useState({ need: true, supply: true, friend: true });
  const [genderFilter, setGenderFilter] = useState({ Male: true, Female: true, 'Non-binary': true });
  const [maxDistance, setMaxDistance] = useState(2); // km - default search radius

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

  const recenterMap = () => {
    const loc = useLocationForMap ? (userLocation ?? FALLBACK_LOCATION) : FALLBACK_LOCATION;
    mapRef.current?.animateToRegion({
      latitude: loc.latitude,
      longitude: loc.longitude,
      latitudeDelta: 0.03,
      longitudeDelta: 0.03,
    }, 500);
  };

  useEffect(() => {
    recenterMap();
  }, [useLocationForMap]);

  const centre = useLocationForMap ? (userLocation ?? FALLBACK_LOCATION) : FALLBACK_LOCATION;

  const getPosterProfile = (poster) => {
    if (!poster) return null;
    if (poster.id === mockUser.id) return mockUser;
    return mockOtherUsers[poster.id] ?? poster;
  };

  const getPosterWithPrivacy = (poster) => {
    const profile = getPosterProfile(poster);
    return {
      ...profile,
      ...poster,
      messagePrivacy: profile?.messagePrivacy ?? poster?.messagePrivacy ?? 'everyone',
    };
  };

  const canContactPoster = (poster) => (
    poster?.id !== mockUser.id &&
    ((poster?.messagePrivacy ?? 'everyone') === 'everyone' || isFriend(poster.id))
  );

  // Friends first (by distance), then Need/Supply (by distance)
  const sortedForNearby = (pins) => [
    ...pins.filter(p => p.isFriendPost).sort((a, b) => a.distanceKm - b.distanceKm),
    ...pins.filter(p => !p.isFriendPost).sort((a, b) => a.distanceKm - b.distanceKm),
  ];

  const visiblePins = posts.filter(p => {
    if (p.expiresAt && Date.now() > p.expiresAt) return false;
    const isFriendPost = friendIds.includes(p.poster.id);
    if (isFriendPost && !filters.friend) return false;
    if (!isFriendPost && !filters[p.type]) return false;
    if (p.poster.gender && !genderFilter[p.poster.gender]) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    const dist = getDistanceKm(centre.latitude, centre.longitude, p.latitude, p.longitude);
    if (useLocationForMap && dist > maxDistance) return false;
    return true;
  }).map(p => {
    const dist = getDistanceKm(centre.latitude, centre.longitude, p.latitude, p.longitude);
    const isFriendPost = friendIds.includes(p.poster.id);
    const poster = getPosterWithPrivacy(p.poster);
    return {
      ...p,
      poster,
      isFriendPost,
      distanceKm: dist,
      distance: dist < 1 ? `${Math.round(dist * 1000)} m` : `${dist.toFixed(1)} km`,
    };
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
          showsUserLocation={useLocationForMap}
          showsMyLocationButton={false}
        >
          {useLocationForMap && userLocation && (
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
              key={`${pin.id}_${pin.isFriendPost}`}
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
          {/* Nearby list button */}
          <TouchableOpacity style={styles.nearbyBtn} onPress={() => setNearbyOpen(true)}>
            <Ionicons name="people" size={20} color="#86A778" />
            <Text style={styles.nearbyBtnCount}>{visiblePins.length}</Text>
          </TouchableOpacity>

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

        {/* ── Fixed REQUEST HELP button — pinned above tab bar ── */}
        <View style={styles.fixedRequestBtn}>
          <TouchableOpacity style={styles.requestBtn} onPress={() => navigation.navigate('Post', { userLocation: userLocation ?? FALLBACK_LOCATION })}>
            <Text style={styles.requestBtnText}>+ REQUEST HELP</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Nearby Helpers Modal ── */}
      <Modal visible={nearbyOpen} transparent animationType="slide" onRequestClose={() => setNearbyOpen(false)}>
        <TouchableOpacity style={styles.tooltipBackdrop} activeOpacity={1} onPress={() => setNearbyOpen(false)}>
          <View style={styles.nearbySheet}>
            <View style={styles.tooltipHandle} />
            <View style={styles.nearbySheetHeader}>
              <Ionicons name="people" size={18} color={colors.primary} />
              <Text style={styles.nearbySheetTitle}>NEARBY HELPERS</Text>
              <Text style={styles.nearbySheetSub}>Friends · then by distance</Text>
              <TouchableOpacity onPress={() => setNearbyOpen(false)} style={{ marginLeft: 'auto' }}>
                <Ionicons name="close" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Filters — all synced with map */}
            <TouchableOpacity activeOpacity={1}>
              {/* Radius */}
              <View style={styles.nearbyDistRow}>
                <Text style={styles.nearbyDistLabel}>Radius</Text>
                {!useLocationForMap && (
                  <Text style={styles.nearbyDistDisabledText}>All posts shown</Text>
                )}
                {DISTANCE_OPTIONS.map(d => (
                  <TouchableOpacity
                    key={d}
                    style={[
                      styles.nearbyDistChip,
                      maxDistance === d && useLocationForMap && { backgroundColor: colors.primary },
                      !useLocationForMap && styles.nearbyDistChipDisabled,
                    ]}
                    onPress={() => setMaxDistance(d)}
                    disabled={!useLocationForMap}
                  >
                    <Text style={[
                      styles.nearbyDistChipText,
                      maxDistance === d && useLocationForMap && { color: '#fff' },
                      !useLocationForMap && styles.nearbyDistChipTextDisabled,
                    ]}>
                      {d < 1 ? `${d * 1000}m` : `${d} km`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Post type */}
              <View style={styles.nearbyDistRow}>
                <Text style={styles.nearbyDistLabel}>Type</Text>
                {[
                  { key: 'need',   label: 'Need',   color: colors.need },
                  { key: 'supply', label: 'Supply', color: colors.supply },
                  { key: 'friend', label: 'Friend', color: colors.friend },
                ].map(item => (
                  <TouchableOpacity
                    key={item.key}
                    style={[styles.nearbyDistChip, { borderColor: item.color }, filters[item.key] && { backgroundColor: item.color }]}
                    onPress={() => setFilters(f => ({ ...f, [item.key]: !f[item.key] }))}
                  >
                    <Text style={[styles.nearbyDistChipText, { color: item.color }, filters[item.key] && { color: '#fff' }]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Gender */}
              <View style={[styles.nearbyDistRow, { borderBottomWidth: 0, marginBottom: 0 }]}>
                <Text style={styles.nearbyDistLabel}>Gender</Text>
                {[
                  { key: 'Male',       label: '♂', color: GENDER_COLOR['Male'] },
                  { key: 'Female',     label: '♀', color: GENDER_COLOR['Female'] },
                  { key: 'Non-binary', label: '⚧', color: GENDER_COLOR['Non-binary'] },
                ].map(item => (
                  <TouchableOpacity
                    key={item.key}
                    style={[styles.nearbyDistChip, { borderColor: item.color }, genderFilter[item.key] && { backgroundColor: item.color }]}
                    onPress={() => setGenderFilter(f => ({ ...f, [item.key]: !f[item.key] }))}
                  >
                    <Text style={[styles.nearbyDistChipText, { color: item.color }, genderFilter[item.key] && { color: '#fff' }]}>
                      {item.label} {item.key === 'Non-binary' ? 'NB' : item.key}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableOpacity>

            <View style={{ height: 1, backgroundColor: colors.border, marginBottom: 4 }} />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              {visiblePins.length === 0 ? (
                <Text style={styles.nearbyEmpty}>No posts match your current filters.</Text>
              ) : sortedForNearby(visiblePins).map(pin => (
                <TouchableOpacity
                  key={pin.id}
                  style={styles.sheetRow}
                  onPress={() => { setNearbyOpen(false); setTooltip(pin); }}
                >
                  {(() => {
                    const pinColor = pin.isFriendPost ? PIN_COLOR.friend : PIN_COLOR[pin.type];
                    return (
                      <>
                        <View style={[styles.sheetAvatarRing, { borderColor: pinColor }]}>
                          <View style={[styles.sheetAvatarCircle, { backgroundColor: pinColor }]}>
                            <Text style={styles.sheetAvatarInitial}>{pin.poster.name.charAt(0)}</Text>
                          </View>
                        </View>
                        <View style={styles.sheetInfo}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text style={styles.sheetName}>{pin.poster.name}</Text>
                            {pin.isFriendPost && <Text style={styles.sheetFriendTag}></Text>}
                          </View>
                          <Text style={styles.sheetCategory} numberOfLines={1}>{pin.title}</Text>
                          <Text style={styles.sheetCategorySub}>{pin.category}</Text>
                        </View>
                        <View style={styles.sheetRight}>
                          <Text style={styles.sheetDist}>{pin.distance}</Text>
                          <View style={[styles.sheetTypeBadge, { backgroundColor: pinColor + '22' }]}>
                            <Text style={[styles.sheetTypeText, { color: pinColor }]}>
                              {pin.type === 'need' ? 'Need' : 'Supply'}
                            </Text>
                          </View>
                        </View>
                      </>
                    );
                  })()}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Tooltip Modal */}
      <Modal visible={!!tooltip} transparent animationType="slide" onRequestClose={() => setTooltip(null)}>
        <TouchableOpacity style={styles.tooltipBackdrop} activeOpacity={1} onPress={() => setTooltip(null)}>
          {tooltip && (
            <View style={styles.tooltipCard}>
              <View style={styles.tooltipHandle} />

              {/* Type badge */}
              <View style={styles.tooltipBadgeRow}>
                <View style={[styles.tooltipTypePill, { backgroundColor: PIN_COLOR[tooltip.type] + '22' }]}>
                  <View style={[styles.tooltipTypeDot, { backgroundColor: PIN_COLOR[tooltip.type] }]} />
                  <Text style={[styles.tooltipTypePillText, { color: PIN_COLOR[tooltip.type] }]}>
                    {tooltip.type === 'need' ? 'Need Help' : 'Offering'}
                  </Text>
                  {tooltip.urgency && (
                    <View style={styles.urgencyTag}>
                      <Text style={styles.urgencyTagText}>⚡ {tooltip.urgency}</Text>
                    </View>
                  )}
                </View>
                {tooltip.isFriendPost && (
                  <View style={styles.friendPostBadge}>
                    <View style={styles.friendPostDot} />
                    <Text style={styles.friendPostBadgeText}>Friend</Text>
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
                {tooltip.poster.id === mockUser.id ? (
                  <TouchableOpacity
                    style={styles.tooltipDeleteBtn}
                    onPress={() => {
                      Alert.alert(
                        'Delete Post',
                        'Are you sure you want to remove this post?',
                        [
                          { text: 'Cancel', style: 'cancel' },
                          {
                            text: 'Delete', style: 'destructive',
                            onPress: () => { removePost(tooltip.id); setTooltip(null); },
                          },
                        ]
                      );
                    }}
                  >
                    <Text style={styles.tooltipDeleteText}>🗑 Delete Post</Text>
                  </TouchableOpacity>
                ) : (
                  <>
                    {canContactPoster(tooltip.poster) ? (
                      <TouchableOpacity
                        style={styles.tooltipContactBtn}
                        onPress={() => {
                          setTooltip(null);
                          const existingChat = chats.find(c => c.user?.id === tooltip.poster.id);
                          navigation.navigate('ChatDetail', {
                            chat: existingChat ?? { user: tooltip.poster, postTitle: tooltip.title },
                          });
                        }}
                      >
                        <Text style={styles.tooltipContactText}>💬 Contact</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={[styles.tooltipContactBtn, styles.tooltipContactBtnLocked]}
                        disabled
                      >
                        <Text style={styles.tooltipContactLockedText}>You're not friends yet</Text>
                        <Text style={styles.tooltipContactLockedSub}>Add friend first</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={[styles.tooltipFriendBtn, tooltip && isFriend(tooltip.poster.id) && styles.tooltipFriendBtnActive]}
                      onPress={() => {
                        const pid = tooltip?.poster?.id;
                        if (!pid) return;
                        isFriend(pid) ? removeFriend(pid) : addFriend(pid, tooltip?.poster);
                      }}
                    >
                      <Text style={[styles.tooltipFriendText, tooltip && isFriend(tooltip.poster.id) && styles.tooltipFriendTextActive]}>
                        {tooltip && isFriend(tooltip.poster.id) ? '✓ Friends' : '+ Add Friend'}
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
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
              { key: 'need',   icon: 'help-circle',   color: colors.need,   label: 'Need Help posts' },
              { key: 'supply', icon: 'gift',           color: colors.supply, label: 'Supply / Offer posts' },
              { key: 'friend', icon: 'people',           color: colors.friend, label: 'Friends & Top Helpers' },
            ].map(item => (
              <TouchableOpacity
                key={item.key}
                style={styles.filterRow}
                onPress={() => setFilters(f => ({ ...f, [item.key]: !f[item.key] }))}
              >
                <View style={styles.filterRowLeft}>
                  <Ionicons name={item.icon} size={20} color={item.color} />
                  <Text style={styles.filterRowLabel}>{item.label}</Text>
                </View>
                <View style={[styles.toggle, filters[item.key] && { backgroundColor: colors.primary }]}>
                  <View style={[styles.toggleThumb, filters[item.key] && styles.toggleThumbOn]} />
                </View>
              </TouchableOpacity>
            ))}

            {/* Distance filter */}
            <Text style={[styles.filterSectionLabel, { marginTop: 8 }]}>SEARCH RADIUS</Text>
            {!useLocationForMap && (
              <Text style={styles.filterDisabledHelp}>
                Radius is disabled while current location is off. All posts are visible on the map.
              </Text>
            )}
            <View style={styles.genderChips}>
              {DISTANCE_OPTIONS.map(d => (
                <TouchableOpacity
                  key={d}
                  style={[
                    styles.genderChip,
                    { borderColor: colors.primary },
                    maxDistance === d && useLocationForMap && { backgroundColor: colors.primary },
                    !useLocationForMap && styles.genderChipDisabled,
                  ]}
                  onPress={() => setMaxDistance(d)}
                  disabled={!useLocationForMap}
                >
                  <Text style={[
                    styles.genderChipText,
                    maxDistance === d && useLocationForMap && { color: '#fff' },
                    !useLocationForMap && styles.genderChipTextDisabled,
                  ]}>
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
    position: 'absolute', bottom: 80, right: 16,
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

  // ── Nearby button (search bar) ──
  nearbyBtn: {
    width: 46, height: 46,
    backgroundColor: '#fff',
    borderRadius: 23,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12, shadowRadius: 8, elevation: 5,
  },
  nearbyBtnCount: {
    position: 'absolute', top: 6, right: 6,
    backgroundColor: '#86A778',
    color: '#fff', fontSize: 9, fontWeight: '800',
    borderRadius: 8, paddingHorizontal: 4, paddingVertical: 1,
    overflow: 'hidden',
  },

  // ── Nearby helpers modal sheet ──
  nearbySheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 16, paddingTop: 12,
    maxHeight: '75%',
  },
  nearbySheetHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: colors.border,
    marginBottom: 4,
  },
  nearbySheetTitle: { ...typography.smallBold, color: colors.textPrimary, letterSpacing: 0.5 },
  nearbySheetSub: { ...typography.caption, color: colors.textSecondary },
  nearbyEmpty: { ...typography.body, color: colors.textMuted, textAlign: 'center', paddingVertical: 32 },
  nearbyDistRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: colors.border,
    marginBottom: 4,
  },
  nearbyDistLabel: { ...typography.caption, color: colors.textSecondary, fontWeight: '700', marginRight: 2 },
  nearbyDistChip: {
    borderRadius: 20, borderWidth: 1, borderColor: colors.primary,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  nearbyDistChipText: { ...typography.caption, color: colors.primary, fontWeight: '700' },
  nearbyDistDisabledText: { ...typography.caption, color: colors.textMuted, flex: 1 },
  nearbyDistChipDisabled: { borderColor: colors.border, backgroundColor: colors.background },
  nearbyDistChipTextDisabled: { color: colors.textMuted },

  handleBar: {
    width: 40, height: 4, backgroundColor: colors.border,
    borderRadius: 2, alignSelf: 'center', marginBottom: 10,
  },

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
  sheetCategory: { ...typography.smallBold, color: colors.textSecondary, marginTop: 1 },
  sheetCategorySub: { ...typography.caption, color: colors.textMuted, marginTop: 1 },
  sheetRight: { alignItems: 'flex-end', gap: 4 },
  sheetDist: { ...typography.smallBold, color: colors.textPrimary },
  sheetTypeBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  sheetTypeText: { ...typography.caption, fontWeight: '700' },

  // ── Fixed request help button ──
  fixedRequestBtn: {
    position: 'absolute',
    left: 16, right: 16, bottom: 16,
    zIndex: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  requestBtn: {
    backgroundColor: '#86A778', borderRadius: 14,
    padding: 14, alignItems: 'center',
    shadowColor: '#506C48',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
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
  tooltipContactBtnLocked: {
    backgroundColor: colors.border,
    paddingVertical: 9,
  },
  tooltipContactLockedText: { ...typography.smallBold, color: colors.textSecondary },
  tooltipContactLockedSub: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  tooltipBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  friendPostBadge: {
    backgroundColor: PIN_COLOR.friend + '22',
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
    flexDirection: 'row', alignItems: 'center',
  },
  friendPostDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: PIN_COLOR.friend, marginRight: 5 },
  friendPostBadgeText: { ...typography.caption, color: PIN_COLOR.friend, fontWeight: '700' },
  sheetFriendTag: { fontSize: 13 },

  tooltipFriendBtn: {
    flex: 1, borderWidth: 1.5, borderColor: colors.primary,
    borderRadius: 14, padding: 14, alignItems: 'center',
  },
  tooltipFriendText: { ...typography.button, color: colors.primary },
  tooltipFriendBtnActive: { backgroundColor: colors.primary },
  tooltipFriendTextActive: { color: '#fff' },
  tooltipDeleteBtn: {
    flex: 1, backgroundColor: colors.error + '15', borderWidth: 1.5,
    borderColor: colors.error, borderRadius: 14, padding: 14, alignItems: 'center',
  },
  tooltipDeleteText: { ...typography.button, color: colors.error },

  // Filter
  filterSheet: {
    backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, gap: 16,
  },
  filterTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: 4 },
  filterSectionLabel: { ...typography.caption, color: colors.textMuted, fontWeight: '700', letterSpacing: 0.8 },
  filterDisabledHelp: { ...typography.caption, color: colors.textMuted, marginTop: -8, lineHeight: 17 },
  genderChips: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  genderChip: {
    borderWidth: 1.5, borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  genderChipText: { ...typography.smallBold, color: colors.textPrimary },
  genderChipDisabled: { borderColor: colors.border, backgroundColor: colors.background },
  genderChipTextDisabled: { color: colors.textMuted },
  filterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  filterRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
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
