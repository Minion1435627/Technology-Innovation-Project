import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Alert,
  Image,
  Animated,
  PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

const GREEN          = '#86A778';
const HANDLE_IDLE    = '#888';
const DARK_BG        = '#1a1a1a';
const OVERLAY_COLOR  = 'rgba(0,0,0,0.55)';
const HANDLE_SIZE    = 24;
const CONTAINER_SIZE = 320;
const INITIAL_FRAME  = 280;
const MIN_FRAME      = 100;
const MIN_SCALE      = 1;
const MAX_SCALE      = 4;
const CC             = CONTAINER_SIZE / 2; // container center

const INIT_F = {
  x: (CONTAINER_SIZE - INITIAL_FRAME) / 2,
  y: (CONTAINER_SIZE - INITIAL_FRAME) / 2,
  w: INITIAL_FRAME,
  h: INITIAL_FRAME,
};

function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }

function pinchDistance(touches) {
  const dx = touches[0].pageX - touches[1].pageX;
  const dy = touches[0].pageY - touches[1].pageY;
  return Math.sqrt(dx * dx + dy * dy);
}

function clampFrame({ x, y, w, h }) {
  w = clamp(w, MIN_FRAME, CONTAINER_SIZE);
  h = clamp(h, MIN_FRAME, CONTAINER_SIZE);
  x = clamp(x, 0, CONTAINER_SIZE - w);
  y = clamp(y, 0, CONTAINER_SIZE - h);
  return { x, y, w, h };
}

export default function AvatarCropEditor({ visible, imageUri, onConfirm, onCancel }) {
  const [resolvedW, setResolvedW]       = useState(0);
  const [resolvedH, setResolvedH]       = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [frame, setFrame]               = useState(INIT_F);
  const [activeHandle, setActiveHandle] = useState(null);

  const frameRef  = useRef(INIT_F);
  const baseWRef  = useRef(INITIAL_FRAME);
  const baseHRef  = useRef(INITIAL_FRAME);

  // Image transform animated + raw refs
  const animTX    = useRef(new Animated.Value(0)).current;
  const animTY    = useRef(new Animated.Value(0)).current;
  const animScale = useRef(new Animated.Value(MIN_SCALE)).current;
  const txRef     = useRef(0);
  const tyRef     = useRef(0);
  const scaleRef  = useRef(MIN_SCALE);

  // PanResponder internal state
  const initPinchRef  = useRef(null);
  const prevTouches   = useRef([]);

  // Handle gesture: frame snapshot at drag start
  const startFrameH = useRef(null);

  // applyFrame is reassigned each render so gesture callbacks always get the latest version
  const applyFrameRef = useRef(null);
  applyFrameRef.current = (rawFrame) => {
    const f  = clampFrame(rawFrame);
    frameRef.current = f;
    setFrame(f);

    // Bump scale if image no longer covers the new frame
    const bW = baseWRef.current, bH = baseHRef.current;
    let s    = scaleRef.current;
    const minS = Math.max(MIN_SCALE, f.w / bW, f.h / bH);
    if (s < minS) { s = minS; scaleRef.current = s; animScale.setValue(s); }

    // Clamp translation: image must still fully cover frame
    const maxTX = f.x - CC + bW * s / 2;
    const minTX = f.x + f.w - CC - bW * s / 2;
    const maxTY = f.y - CC + bH * s / 2;
    const minTY = f.y + f.h - CC - bH * s / 2;
    const tx = clamp(txRef.current, minTX, maxTX);
    const ty = clamp(tyRef.current, minTY, maxTY);
    txRef.current = tx; tyRef.current = ty;
    animTX.setValue(tx); animTY.setValue(ty);
  };

  // ── Resolve image dimensions ────────────────────────────────────────────────
  useEffect(() => {
    if (!imageUri) return;
    Image.getSize(
      imageUri,
      (w, h) => { setResolvedW(w); setResolvedH(h); },
      ()      => { setResolvedW(1000); setResolvedH(1000); },
    );
  }, [imageUri]);

  // ── Reset state when modal opens ────────────────────────────────────────────
  useEffect(() => {
    if (!visible) return;
    frameRef.current = INIT_F;
    setFrame(INIT_F);
    setActiveHandle(null);
    animTX.setValue(0); animTY.setValue(0); animScale.setValue(MIN_SCALE);
    txRef.current = 0; tyRef.current = 0; scaleRef.current = MIN_SCALE;
    setIsProcessing(false);
  }, [visible]);

  // ── Base display size: shorter side fills INITIAL_FRAME at scale=1 ─────────
  const { baseW, baseH } = useMemo(() => {
    if (!resolvedW || !resolvedH) return { baseW: INITIAL_FRAME, baseH: INITIAL_FRAME };
    const asp = resolvedW / resolvedH;
    return asp >= 1
      ? { baseW: INITIAL_FRAME * asp, baseH: INITIAL_FRAME }
      : { baseW: INITIAL_FRAME,       baseH: INITIAL_FRAME / asp };
  }, [resolvedW, resolvedH]);

  useEffect(() => { baseWRef.current = baseW; baseHRef.current = baseH; }, [baseW, baseH]);

  // ── 8 handle gestures (created once; dynamic values read via refs) ──────────
  const handleGestures = useMemo(() => {
    function make(id) {
      return Gesture.Pan()
        .runOnJS(true)
        .minDistance(0)
        .onBegin(() => {
          startFrameH.current = { ...frameRef.current };
          setActiveHandle(id);
        })
        .onUpdate((e) => {
          const sf = startFrameH.current;
          if (!sf) return;
          const dx = e.translationX, dy = e.translationY;
          let { x, y, w, h } = sf;

          // Corners maintain 1:1 aspect ratio
          if (id === 'TL') {
            const d = (dx + dy) / 2;
            const sz = Math.max(MIN_FRAME, sf.w - d);
            x = sf.x + sf.w - sz; y = sf.y + sf.h - sz; w = sz; h = sz;
          } else if (id === 'TR') {
            const d = (dx - dy) / 2;
            const sz = Math.max(MIN_FRAME, sf.w + d);
            y = sf.y + sf.h - sz; w = sz; h = sz;
          } else if (id === 'BL') {
            const d = (-dx + dy) / 2;
            const sz = Math.max(MIN_FRAME, sf.w + d);
            x = sf.x + sf.w - sz; w = sz; h = sz;
          } else if (id === 'BR') {
            const sz = Math.max(MIN_FRAME, sf.w + (dx + dy) / 2);
            w = sz; h = sz;
          }
          // Edges allow free resize
          else if (id === 'TC') {
            const newH = Math.max(MIN_FRAME, sf.h - dy);
            y = sf.y + sf.h - newH; h = newH;
          } else if (id === 'BC') {
            h = Math.max(MIN_FRAME, sf.h + dy);
          } else if (id === 'ML') {
            const newW = Math.max(MIN_FRAME, sf.w - dx);
            x = sf.x + sf.w - newW; w = newW;
          } else if (id === 'MR') {
            w = Math.max(MIN_FRAME, sf.w + dx);
          }

          applyFrameRef.current({ x, y, w, h });
        })
        .onEnd(() => {
          startFrameH.current = null;
          setActiveHandle(null);
        })
        .onFinalize(() => {
          startFrameH.current = null;
          setActiveHandle(null);
        });
    }

    return {
      TL: make('TL'), TC: make('TC'), TR: make('TR'),
      ML: make('ML'), MR: make('MR'),
      BL: make('BL'), BC: make('BC'), BR: make('BR'),
    };
  }, []); // intentionally empty — all live data accessed through refs

  // ── PanResponder: image pan + pinch-to-zoom ─────────────────────────────────
  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder:        () => true,
    onStartShouldSetPanResponderCapture: () => false, // yield to rngh handle gestures
    onMoveShouldSetPanResponder:         () => true,
    onMoveShouldSetPanResponderCapture:  () => false,

    onPanResponderGrant: () => {
      initPinchRef.current = null;
      prevTouches.current  = [];
    },

    onPanResponderMove: (evt) => {
      const touches = evt.nativeEvent.touches;
      const bW = baseWRef.current, bH = baseHRef.current;
      const f  = frameRef.current;
      const s  = scaleRef.current;

      if (touches.length >= 2) {
        const dist = pinchDistance(touches);
        if (initPinchRef.current === null) {
          initPinchRef.current = { dist, scale: s };
          prevTouches.current  = touches;
          return;
        }
        const newScale = clamp(
          initPinchRef.current.scale * (dist / initPinchRef.current.dist),
          Math.max(MIN_SCALE, f.w / bW, f.h / bH), // never shrink below cover-frame minimum
          MAX_SCALE,
        );
        scaleRef.current = newScale;
        animScale.setValue(newScale);

        const prev = prevTouches.current;
        if (prev.length >= 2) {
          const dCX = ((touches[0].pageX + touches[1].pageX) - (prev[0].pageX + prev[1].pageX)) / 2;
          const dCY = ((touches[0].pageY + touches[1].pageY) - (prev[0].pageY + prev[1].pageY)) / 2;
          const maxTX = f.x - CC + bW * newScale / 2;
          const minTX = f.x + f.w - CC - bW * newScale / 2;
          const maxTY = f.y - CC + bH * newScale / 2;
          const minTY = f.y + f.h - CC - bH * newScale / 2;
          txRef.current = clamp(txRef.current + dCX, minTX, maxTX);
          tyRef.current = clamp(tyRef.current + dCY, minTY, maxTY);
          animTX.setValue(txRef.current);
          animTY.setValue(tyRef.current);
        }
        prevTouches.current = touches;

      } else if (touches.length === 1) {
        if (initPinchRef.current !== null) {
          // Transition from pinch to single-finger — re-anchor
          initPinchRef.current = null;
          prevTouches.current  = touches;
          return;
        }
        const prev = prevTouches.current;
        if (prev.length >= 1) {
          const dX   = touches[0].pageX - prev[0].pageX;
          const dY   = touches[0].pageY - prev[0].pageY;
          const maxTX = f.x - CC + bW * s / 2;
          const minTX = f.x + f.w - CC - bW * s / 2;
          const maxTY = f.y - CC + bH * s / 2;
          const minTY = f.y + f.h - CC - bH * s / 2;
          txRef.current = clamp(txRef.current + dX, minTX, maxTX);
          tyRef.current = clamp(tyRef.current + dY, minTY, maxTY);
          animTX.setValue(txRef.current);
          animTY.setValue(tyRef.current);
        }
        prevTouches.current = touches;
      }
    },

    onPanResponderRelease: () => {
      initPinchRef.current = null;
      prevTouches.current  = [];
    },
  }), []);

  // ── Confirm crop ─────────────────────────────────────────────────────────────
  async function handleConfirmCrop() {
    setIsProcessing(true);
    try {
      const s  = scaleRef.current;
      const tx = txRef.current;
      const ty = tyRef.current;
      const f  = frameRef.current;
      const bW = baseWRef.current;
      const bH = baseHRef.current;

      // Image visual top-left in container coords
      const imgLeft = CC + tx - bW * s / 2;
      const imgTop  = CC + ty - bH * s / 2;

      // Scale factor: original image pixels per display pixel
      const toOrigX = resolvedW / (bW * s);
      const toOrigY = resolvedH / (bH * s);

      const originX = Math.max(0, Math.round((f.x - imgLeft) * toOrigX));
      const originY = Math.max(0, Math.round((f.y - imgTop)  * toOrigY));
      const cropW   = Math.min(resolvedW - originX, Math.round(f.w * toOrigX));
      const cropH   = Math.min(resolvedH - originY, Math.round(f.h * toOrigY));

      const result = await manipulateAsync(
        imageUri,
        [
          { crop: { originX, originY, width: cropW, height: cropH } },
          { resize: { width: 512, height: 512 } },
        ],
        { compress: 0.85, format: SaveFormat.JPEG },
      );
      onConfirm(result.uri);
    } catch (err) {
      Alert.alert('Crop failed', err.message ?? 'Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  const ready       = resolvedW > 0 && resolvedH > 0;
  const borderColor = activeHandle ? GREEN : HANDLE_IDLE;

  const { x: fx, y: fy, w: fw, h: fh } = frame;

  const HANDLES = [
    { id: 'TL', cx: fx,        cy: fy        },
    { id: 'TC', cx: fx + fw/2, cy: fy        },
    { id: 'TR', cx: fx + fw,   cy: fy        },
    { id: 'ML', cx: fx,        cy: fy + fh/2 },
    { id: 'MR', cx: fx + fw,   cy: fy + fh/2 },
    { id: 'BL', cx: fx,        cy: fy + fh   },
    { id: 'BC', cx: fx + fw/2, cy: fy + fh   },
    { id: 'BR', cx: fx + fw,   cy: fy + fh   },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onCancel}
    >
      <SafeAreaView style={styles.safe}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onCancel} hitSlop={12}>
            <Text style={styles.headerBtn}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Crop Photo</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Crop area */}
        <View style={styles.cropArea}>
          {ready ? (
            <View style={styles.outerContainer}>

              {/* Image layer — clipped to container bounds */}
              <View style={styles.imageContainer} {...panResponder.panHandlers}>
                <Animated.Image
                  source={{ uri: imageUri }}
                  style={[
                    { width: baseW, height: baseH },
                    { transform: [{ translateX: animTX }, { translateY: animTY }, { scale: animScale }] },
                  ]}
                  resizeMode="cover"
                />

                {/* Dark overlay: 4 strips surrounding the crop frame */}
                <View pointerEvents="none" style={StyleSheet.absoluteFill}>
                  {/* top */}
                  <View style={[styles.strip, { top: 0, left: 0, right: 0, height: fy }]} />
                  {/* bottom */}
                  <View style={[styles.strip, { top: fy + fh, left: 0, right: 0, height: CONTAINER_SIZE - fy - fh }]} />
                  {/* left */}
                  <View style={[styles.strip, { top: fy, left: 0, width: fx, height: fh }]} />
                  {/* right */}
                  <View style={[styles.strip, { top: fy, left: fx + fw, right: 0, height: fh }]} />
                </View>
              </View>

              {/* Frame border + handles — NOT clipped, so handles can sit on the border */}
              <View style={StyleSheet.absoluteFill} pointerEvents="box-none">

                {/* Frame border */}
                <View
                  pointerEvents="none"
                  style={{
                    position: 'absolute',
                    left: fx, top: fy,
                    width: fw, height: fh,
                    borderWidth: 1.5,
                    borderColor,
                  }}
                />

                {/* 8 draggable handles */}
                {HANDLES.map(h => (
                  <GestureDetector key={h.id} gesture={handleGestures[h.id]}>
                    <View
                      style={{
                        position: 'absolute',
                        left:         h.cx - HANDLE_SIZE / 2,
                        top:          h.cy - HANDLE_SIZE / 2,
                        width:        HANDLE_SIZE,
                        height:       HANDLE_SIZE,
                        borderRadius: HANDLE_SIZE / 2,
                        backgroundColor: activeHandle === h.id ? GREEN : HANDLE_IDLE,
                      }}
                    />
                  </GestureDetector>
                ))}
              </View>

            </View>
          ) : (
            <ActivityIndicator color={GREEN} size="large" />
          )}
        </View>

        {/* Hint */}
        <Text style={styles.hint}>
          Corners keep 1:1 · Edges resize freely · Drag image to reposition
        </Text>

        {/* Confirm */}
        <TouchableOpacity
          style={[styles.confirmBtn, (!ready || isProcessing) && styles.btnDisabled]}
          onPress={handleConfirmCrop}
          disabled={!ready || isProcessing}
        >
          {isProcessing
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.confirmBtnText}>Confirm Crop →</Text>
          }
        </TouchableOpacity>

      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DARK_BG },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerBtn:    { color: '#aaa', fontSize: 16 },
  headerTitle:  { flex: 1, textAlign: 'center', color: '#fff', fontSize: 17, fontWeight: '600' },
  headerSpacer: { width: 50 },

  cropArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  outerContainer: {
    width: CONTAINER_SIZE,
    height: CONTAINER_SIZE,
  },

  imageContainer: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },

  strip: { position: 'absolute', backgroundColor: OVERLAY_COLOR },

  hint: { color: '#888', fontSize: 12, textAlign: 'center', marginTop: 16, marginBottom: 8 },

  confirmBtn: {
    backgroundColor: GREEN,
    marginHorizontal: 24,
    marginBottom: 16,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#506C48',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  btnDisabled:    { opacity: 0.5 },
  confirmBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
