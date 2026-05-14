import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import Avatar from './Avatar';
import UrgencyBadge from './UrgencyBadge';

export default function PostCard({ item, onPress, onRespond }) {
  const isNeed = item.type === 'need';
  const accentColor = isNeed ? colors.need : colors.supply;
  const accentBg = isNeed ? colors.needLight : colors.supplyLight;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {/* Left accent bar */}
      <View style={[styles.accentBar, { backgroundColor: accentColor }]} />

      <View style={styles.body}>
        {/* Header row */}
        <View style={styles.headerRow}>
          <View style={[styles.typePill, { backgroundColor: accentBg }]}>
            <Text style={[styles.typeText, { color: accentColor }]}>
              {isNeed ? '🆘 Need' : '📦 Supply'}
            </Text>
          </View>
          {isNeed ? (
            <UrgencyBadge urgency={item.urgency} />
          ) : (
            <View style={styles.availPill}>
              <Text style={styles.availText}>🕐 {item.availability}</Text>
            </View>
          )}
        </View>

        {/* Title */}
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>

        {/* Description */}
        <Text style={styles.description} numberOfLines={2}>{item.description}</Text>

        {/* Category */}
        <View style={styles.categoryRow}>
          <Text style={styles.category}>{item.category}</Text>
        </View>

        {/* Footer row */}
        <View style={styles.footer}>
          <View style={styles.posterInfo}>
            <Avatar name={item.poster.name} size={32} level={item.poster.level} />
            <View style={styles.posterText}>
              <View style={styles.nameRow}>
                <Text style={styles.posterName}>{item.poster.name}</Text>
                {item.poster.verified && (
                  <Text style={styles.verifiedBadge}>✓</Text>
                )}
              </View>
              <Text style={styles.posterMeta}>
                ⭐ {item.poster.stars} · {item.distance} · {item.timePosted}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.respondBtn, { backgroundColor: accentColor }]}
            onPress={onRespond}
          >
            <Text style={styles.respondText}>Respond</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  accentBar: {
    width: 4,
  },
  body: {
    flex: 1,
    padding: 14,
    gap: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  availPill: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  availText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
  },
  title: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
  },
  categoryRow: {
    flexDirection: 'row',
  },
  category: {
    ...typography.small,
    color: colors.textMuted,
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  posterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  posterText: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  posterName: {
    ...typography.smallBold,
    color: colors.textPrimary,
  },
  verifiedBadge: {
    fontSize: 10,
    color: colors.primary,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 8,
    fontWeight: '700',
  },
  posterMeta: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  respondBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  respondText: {
    ...typography.smallBold,
    color: colors.textWhite,
  },
});
