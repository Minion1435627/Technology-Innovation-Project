import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

const LEVEL_COLORS = [
  colors.level1,
  colors.level2,
  colors.level3,
  colors.level4,
  colors.level5,
];

const LEVEL_EMOJIS = ['🌱', '⭐', '🏅', '💎', '👑'];

export default function Avatar({ name = '', size = 44, level = 1, showBadge = true, style, imageUri }) {
  const initials = name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const bgColor = LEVEL_COLORS[(level - 1) % LEVEL_COLORS.length];
  const badgeEmoji = LEVEL_EMOJIS[(level - 1) % LEVEL_EMOJIS.length];
  const fontSize = size * 0.36;
  const badgeSize = size * 0.35;

  return (
    <View style={[styles.wrapper, style]}>
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
        />
      ) : (
      <View
        style={[
          styles.circle,
          { width: size, height: size, borderRadius: size / 2, backgroundColor: bgColor },
        ]}
      >
        <Text style={[styles.initials, { fontSize }]}>{initials}</Text>
      </View>
      )}
      {showBadge && (
        <View
          style={[
            styles.badge,
            {
              width: badgeSize,
              height: badgeSize,
              borderRadius: badgeSize / 2,
              bottom: -2,
              right: -2,
            },
          ]}
        >
          <Text style={{ fontSize: badgeSize * 0.6 }}>{badgeEmoji}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: colors.textWhite,
    fontWeight: '700',
  },
  badge: {
    position: 'absolute',
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
});
