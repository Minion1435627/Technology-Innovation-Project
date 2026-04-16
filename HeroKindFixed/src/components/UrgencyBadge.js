import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

const URGENCY_MAP = {
  Low: { bg: colors.urgencyLow + '22', text: colors.urgencyLow, border: colors.urgencyLow },
  Medium: { bg: colors.urgencyMedium + '22', text: '#C89B00', border: colors.urgencyMedium },
  High: { bg: colors.urgencyHigh + '22', text: colors.urgencyHigh, border: colors.urgencyHigh },
  ASAP: { bg: colors.urgencyAsap + '22', text: colors.urgencyAsap, border: colors.urgencyAsap },
};

export default function UrgencyBadge({ urgency }) {
  const style = URGENCY_MAP[urgency] || URGENCY_MAP.Low;
  return (
    <View style={[styles.badge, { backgroundColor: style.bg, borderColor: style.border }]}>
      <Text style={[styles.text, { color: style.text }]}>{urgency}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
    borderWidth: 1,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
