import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Dimensions, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { typography } from '../../theme/typography';

const { width } = Dimensions.get('window');

const GREEN      = '#5C7A5F';
const ORANGE     = '#EF7A38';
const HERO_WIDTH = Math.min(width - 34, 366);

// ── Illustration components (same as CoverScreen) ──────────────────────────

function Sparkle({ style, size = 13, color = '#F0A45B' }) {
  return (
    <Text style={[{ position: 'absolute', fontSize: size, lineHeight: size + 2, color, fontWeight: '700', zIndex: 20 }, style]}>
      ✦
    </Text>
  );
}

function Avatar({ style, size = 54, skin = '#A76542', hair = '#2D221C', shirt = '#4A8E61' }) {
  return (
    <View style={[{
      position: 'absolute',
      width: size, height: size, borderRadius: size / 2,
      alignItems: 'center',
      overflow: 'hidden',
      borderWidth: 3, borderColor: '#FFFFFF',
      backgroundColor: '#E5F0D7',
      shadowColor: '#5F6D54',
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.16, shadowRadius: 8, elevation: 6,
      zIndex: 8,
    }, style]}>
      <View style={{ position: 'absolute', zIndex: 2, backgroundColor: hair,   width: size * 0.5,  height: size * 0.34, borderRadius: size * 0.2, top: size * 0.16 }} />
      <View style={{ position: 'absolute', zIndex: 3, backgroundColor: skin,   width: size * 0.48, height: size * 0.5,  borderRadius: size * 0.24, top: size * 0.28 }} />
      <View style={{ position: 'absolute', zIndex: 6, width: 4, height: 4, borderRadius: 2, backgroundColor: '#241915', left: size * 0.36, top: size * 0.48 }} />
      <View style={{ position: 'absolute', zIndex: 6, width: 4, height: 4, borderRadius: 2, backgroundColor: '#241915', right: size * 0.36, top: size * 0.48 }} />
      <View style={{ position: 'absolute', zIndex: 6, height: 3, borderRadius: 2, backgroundColor: '#7C3228', top: size * 0.6, width: size * 0.14 }} />
      <View style={{ position: 'absolute', zIndex: 1, backgroundColor: shirt,  width: size * 0.64, height: size * 0.28, borderTopLeftRadius: size * 0.2, borderTopRightRadius: size * 0.2, bottom: -3 }} />
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
    <View style={{
      position: 'absolute',
      left: '50%', top: 12, marginLeft: -26,
      alignItems: 'center', zIndex: 12,
    }}>
      <View style={{
        width: 52, height: 52, borderRadius: 26,
        backgroundColor: ORANGE,
        alignItems: 'center', justifyContent: 'center',
        shadowColor: ORANGE,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.24, shadowRadius: 9, elevation: 8,
      }}>
        <View style={{
          width: 30, height: 30, borderRadius: 15,
          backgroundColor: 'rgba(255,255,255,0.18)',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Ionicons name="heart" size={18} color="#FFFFFF" />
        </View>
      </View>
      <View style={{
        width: 0, height: 0,
        marginTop: -8,
        borderLeftWidth: 15, borderRightWidth: 15, borderTopWidth: 27,
        borderLeftColor: 'transparent', borderRightColor: 'transparent',
        borderTopColor: ORANGE,
      }} />
    </View>
  );
}

function MapIllustration() {
  // pin tip coordinates inside the hero view
  const pinTipX = HERO_WIDTH * 0.5;
  const pinTipY = 83; // pinWrap top(12) + pinHead(52) + marginTop(-8) + pinPoint(27)

  const avatarLeft  = { x: HERO_WIDTH * 0.08 + 24, y: HERO_WIDTH * 0.33 + 24 };
  const avatarMid   = { x: HERO_WIDTH * 0.47 + 28, y: HERO_WIDTH * 0.4  + 28 };
  const avatarRight = { x: HERO_WIDTH * 0.92 - 22, y: HERO_WIDTH * 0.27 + 22 };

  return (
    <View style={{ width: HERO_WIDTH, height: HERO_WIDTH * 0.62, marginBottom: 4 }}>
      <Sparkle style={{ top: 2,  left:  HERO_WIDTH * 0.21 }} size={16} />
      <Sparkle style={{ top: 23, left:  HERO_WIDTH * 0.15 }} size={8} />
      <Sparkle style={{ top: 20, right: HERO_WIDTH * 0.11 }} size={9}  color="#9FBC85" />
      <Sparkle style={{ bottom: 22, right: HERO_WIDTH * 0.02 }} size={10} color="#F0A45B" />

      {/* Soft glow behind oval */}
      <View style={{
        position: 'absolute',
        left: '10%', top: '7%', width: '80%', height: '78%', borderRadius: 132,
        backgroundColor: '#D7E3CE', opacity: 0.62,
      }} />

      {/* Map oval */}
      <View style={{
        position: 'absolute',
        left: '8%', top: '9%', width: '84%', height: '67%', borderRadius: 140,
        backgroundColor: '#E3DFC9', overflow: 'hidden',
        transform: [{ rotate: '-8deg' }],
      }}>
        {/* City block patches */}
        <View style={{ position: 'absolute', backgroundColor: '#D2CDBA', opacity: 0.64, left: 12,  top: 12,    width: 72, height: 34, borderRadius: 7 }} />
        <View style={{ position: 'absolute', backgroundColor: '#D2CDBA', opacity: 0.64, right: 24, top: 14,    width: 88, height: 34, borderRadius: 7 }} />
        <View style={{ position: 'absolute', backgroundColor: '#D2CDBA', opacity: 0.64, left: 86,  bottom: 11, width: 82, height: 32, borderRadius: 7 }} />
        <View style={{ position: 'absolute', backgroundColor: '#D2CDBA', opacity: 0.64, left: 14,  bottom: 17, width: 56, height: 38, borderRadius: 7 }} />
        <View style={{ position: 'absolute', backgroundColor: '#D2CDBA', opacity: 0.64, right: 10, bottom: 21, width: 70, height: 36, borderRadius: 7 }} />
        {/* Parks */}
        <View style={{ position: 'absolute', backgroundColor: '#BFD4A8', opacity: 0.75, left: 92,  top: 42,    width: 54, height: 34, borderRadius: 10 }} />
        <View style={{ position: 'absolute', backgroundColor: '#BFD4A8', opacity: 0.75, right: 78, bottom: 42, width: 46, height: 28, borderRadius: 9  }} />
        {/* Main roads */}
        {[
          { left: -18, top: 35,     width: 310, rotate: '15deg'   },
          { left: 8,   top: 84,     width: 300, rotate: '-19deg'  },
          { left: 102, top: -18,    width: 164, rotate: '68deg'   },
          { left: 42,  top: -8,     width: 164, rotate: '101deg'  },
          { right: -28, top: 58,    width: 188, rotate: '42deg'   },
          { left: -20, bottom: 22,  width: 182, rotate: '-38deg'  },
        ].map((r, i) => (
          <View key={i} style={[{
            position: 'absolute', height: 7, borderRadius: 4,
            backgroundColor: 'rgba(255,255,255,0.78)',
            transform: [{ rotate: r.rotate }],
          }, r]} />
        ))}
        {/* Small roads */}
        {[
          { left: 42,  top: 18,    width: 72, rotate: '-18deg' },
          { right: 48, top: 49,    width: 88, rotate: '12deg'  },
          { left: 72,  bottom: 28, width: 74, rotate: '22deg'  },
          { right: 16, bottom: 52, width: 68, rotate: '-28deg' },
        ].map((r, i) => (
          <View key={i} style={[{
            position: 'absolute', height: 4, borderRadius: 3,
            backgroundColor: 'rgba(248,246,237,0.72)',
            transform: [{ rotate: r.rotate }],
          }, r]} />
        ))}
        {/* Roundabout */}
        <View style={{
          position: 'absolute', left: '48%', top: '43%',
          width: 28, height: 28, borderRadius: 14,
          borderWidth: 5, borderColor: 'rgba(255,255,255,0.78)',
          backgroundColor: '#C7D7AF',
        }} />
      </View>

      {/* Connection lines */}
      {[avatarLeft, avatarMid, avatarRight].map((a, i) => (
        <ConnectionLine key={i} x1={a.x} y1={a.y} x2={pinTipX} y2={pinTipY} />
      ))}

      {/* Avatars */}
      <Avatar size={48} skin="#9A5E39" hair="#172A25" shirt="#3E8C67" style={{ left: HERO_WIDTH * 0.08, top: HERO_WIDTH * 0.33 }} />
      <Avatar size={56} skin="#B66F42" hair="#2D1C15" shirt="#C55236" style={{ left: HERO_WIDTH * 0.47, top: HERO_WIDTH * 0.4  }} />
      <Avatar size={44} skin="#D19463" hair="#5B3020" shirt="#C56755" style={{ right: HERO_WIDTH * 0.08, top: HERO_WIDTH * 0.27 }} />

      <MapPin />
    </View>
  );
}

// ── Login screen ────────────────────────────────────────────────────────────

export default function LoginScreen({ navigation }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);

  return (
    <View style={styles.safe}>
      <View style={styles.blobTopLeft} />
      <View style={styles.blobTopRight} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <MapIllustration />

          <Text style={styles.appName}>HelpMate</Text>

          <View style={styles.card}>
            {/* Email */}
            <View style={styles.inputWrap}>
              <Ionicons name="mail-outline" size={18} color="#9AAE9D" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#B8C4BA"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Password */}
            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color="#9AAE9D" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Enter your password"
                placeholderTextColor="#B8C4BA"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPw}
              />
              <TouchableOpacity onPress={() => setShowPw(v => !v)} style={styles.eyeBtn}>
                <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={18} color="#9AAE9D" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.forgotBtn}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginBtn}
              onPress={() => navigation.replace('Main')}
              activeOpacity={0.85}
            >
              <Text style={styles.loginBtnText}>Login</Text>
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity style={styles.socialBtn}>
              <Text style={styles.googleG}>G</Text>
              <Text style={styles.socialBtnText}>Continue with Google</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.socialBtn, { marginTop: 12 }]}>
              <Ionicons name="call-outline" size={18} color="#4A6350" />
              <Text style={styles.socialBtnText}>Continue with Phone Number</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.registerRow}>
            <Text style={styles.registerPrompt}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#EDE8DC' },
  scroll: { alignItems: 'center', paddingTop: 60, paddingBottom: 40 },

  blobTopLeft: {
    position: 'absolute', top: -50, left: -50,
    width: 150, height: 150, borderRadius: 75,
    backgroundColor: '#C8DCB8', opacity: 0.55,
  },
  blobTopRight: {
    position: 'absolute', top: -30, right: -40,
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: '#D0E4C0', opacity: 0.4,
  },

  appName: {
    fontSize: 28, fontWeight: '800',
    color: '#2C3620', letterSpacing: 0.3,
    marginBottom: 16,
  },

  card: {
    width: width - 40,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08, shadowRadius: 20, elevation: 6,
  },

  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F5F7F5',
    borderRadius: 12, borderWidth: 1, borderColor: '#DDE8DD',
    marginBottom: 14, paddingHorizontal: 12,
    paddingVertical: 14,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, ...typography.body, color: '#2C3E2D', padding: 0 },
  eyeBtn: { padding: 4 },

  forgotBtn: { alignSelf: 'flex-end', marginBottom: 20, marginTop: -4 },
  forgotText: { ...typography.small, color: GREEN, fontWeight: '600' },

  loginBtn: {
    backgroundColor: GREEN, borderRadius: 14,
    paddingVertical: 15, alignItems: 'center',
    shadowColor: GREEN,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28, shadowRadius: 10, elevation: 5,
  },
  loginBtnText: { fontSize: 16, fontWeight: '700', color: '#fff', letterSpacing: 0.3 },

  dividerRow: {
    flexDirection: 'row', alignItems: 'center',
    marginVertical: 20, gap: 8,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E8EEE8' },
  dividerText: { ...typography.small, color: '#9AAE9D' },

  socialBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderRadius: 14, borderWidth: 1.5, borderColor: '#D4E4D4',
    paddingVertical: 13, gap: 10, backgroundColor: '#FAFCFA',
  },
  googleG: { fontSize: 16, fontWeight: '800', color: '#4285F4' },
  socialBtnText: { ...typography.bodyBold, color: '#4A6350' },

  registerRow: {
    flexDirection: 'row', justifyContent: 'center',
    alignItems: 'center', marginTop: 24,
  },
  registerPrompt: { ...typography.body, color: '#7A8F7D' },
  registerLink: { ...typography.bodyBold, color: GREEN, textDecorationLine: 'underline' },
});
