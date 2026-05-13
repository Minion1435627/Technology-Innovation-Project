import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

// ProfileScreen's DEFAULT_MODEL_ROTATION = 90° makes the model face forward.
// The leaderboard uses the same rotation so both screens show the same orientation.
// If the model still appears sideways, adjust this constant (try Math.PI / 2 or -Math.PI / 2).
const FRONT_FACING_ROTATION_Y = Math.PI;

// Static 3D avatar for the leaderboard podium.
// No rotation controls, no animation, no debug overlays.
// Material handling mirrors Avatar3DViewer exactly so colors match.
export default function LeaderboardAvatar3D({ modelUrl, size = 64, onReady, onLoadError, style }) {
  const [status, setStatus] = useState('loading');
  const frameRef = useRef(null);

  useEffect(() => {
    setStatus('loading');
  }, [modelUrl]);

  useEffect(() => {
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    };
  }, []);

  const onContextCreate = async (gl) => {
    const renderer = new Renderer({ gl });
    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
    renderer.setClearColor(0xfffcf9, 0);
    if ('outputColorSpace' in renderer && THREE.SRGBColorSpace) {
      renderer.outputColorSpace = THREE.SRGBColorSpace;
    } else if ('outputEncoding' in renderer && THREE.sRGBEncoding) {
      renderer.outputEncoding = THREE.sRGBEncoding;
    }
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      36,
      gl.drawingBufferWidth / gl.drawingBufferHeight,
      0.01,
      1000,
    );

    scene.add(new THREE.AmbientLight(0xffffff, 1.15));
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
    keyLight.position.set(2.4, 3.6, 4.5);
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.7);
    fillLight.position.set(-3.2, 2.0, 2.2);
    scene.add(fillLight);
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.45);
    rimLight.position.set(0.8, 2.0, -3.0);
    scene.add(rimLight);

    try {
      const response = await fetch(modelUrl);
      if (!response.ok) throw new Error(`Avatar download failed (${response.status})`);
      const arrayBuffer = await response.arrayBuffer();

      const loader = new GLTFLoader();
      const gltf = await new Promise((resolve, reject) => {
        loader.parse(
          arrayBuffer,
          '',
          resolve,
          (e) => reject(e instanceof Error ? e : new Error(String(e))),
        );
      });

      const model = gltf.scene;

      // Material detection — identical to Avatar3DViewer so colors/fallbacks match.
      let meshCount = 0;
      let baseTextureCount = 0;
      let extraTextureCount = 0;
      let vertexColorCount = 0;
      let flatColorCount = 0;
      model.updateMatrixWorld(true);
      model.traverse((node) => {
        if (node.isMesh && node.geometry) {
          meshCount += 1;
          if (node.geometry?.attributes?.color) {
            vertexColorCount += 1;
          }
          if (node.material) {
            const materials = Array.isArray(node.material) ? node.material : [node.material];
            const safeMaterials = materials.map((mat) => {
              if (!mat) return;
              mat.side = THREE.DoubleSide;
              if (typeof mat.opacity === 'number' && mat.opacity === 0) {
                mat.opacity = 1;
              }
              if (mat.map) {
                baseTextureCount += 1;
                if ('colorSpace' in mat.map && THREE.SRGBColorSpace) {
                  mat.map.colorSpace = THREE.SRGBColorSpace;
                } else if ('encoding' in mat.map && THREE.sRGBEncoding) {
                  mat.map.encoding = THREE.sRGBEncoding;
                }
                mat.map.flipY = false;
                mat.map.needsUpdate = true;
              }
              if (mat.emissiveMap) {
                extraTextureCount += 1;
                if ('colorSpace' in mat.emissiveMap && THREE.SRGBColorSpace) {
                  mat.emissiveMap.colorSpace = THREE.SRGBColorSpace;
                } else if ('encoding' in mat.emissiveMap && THREE.sRGBEncoding) {
                  mat.emissiveMap.encoding = THREE.sRGBEncoding;
                }
                mat.emissiveMap.flipY = false;
                mat.emissiveMap.needsUpdate = true;
              }
              if (mat.metalnessMap) extraTextureCount += 1;
              if (mat.roughnessMap) extraTextureCount += 1;
              if (mat.normalMap) extraTextureCount += 1;
              if (mat.aoMap) extraTextureCount += 1;
              if (mat.vertexColors) vertexColorCount += 1;
              if (mat.color && typeof mat.color.getHexString === 'function') {
                const hex = mat.color.getHexString();
                if (hex && hex !== 'ffffff') flatColorCount += 1;
              }
              mat.needsUpdate = true;
              return simplifyMaterial(mat);
            });
            node.material = Array.isArray(node.material) ? safeMaterials : safeMaterials[0];
          }
          node.castShadow = false;
          node.receiveShadow = false;
        }
      });

      if (meshCount === 0) throw new Error('Model contains no visible mesh geometry.');

      // If the model has no color source, apply the same green fallback Avatar3DViewer uses.
      const hasVisibleColorSource =
        baseTextureCount > 0 || extraTextureCount > 0 || vertexColorCount > 0 || flatColorCount > 0;
      if (!hasVisibleColorSource) {
        model.traverse((node) => {
          if (!node.isMesh) return;
          if (Array.isArray(node.material)) {
            node.material = node.material.map(() => createFallbackMaterial());
          } else {
            node.material = createFallbackMaterial();
          }
        });
      }

      const pivot = new THREE.Group();
      scene.add(pivot);
      pivot.add(model);
      model.updateMatrixWorld(true);

      const rawBox = new THREE.Box3().setFromObject(model);
      if (rawBox.isEmpty()) throw new Error('Model bounds are empty.');
      const rawCenter = rawBox.getCenter(new THREE.Vector3());
      const rawSize = rawBox.getSize(new THREE.Vector3());
      const scale = 1.85 / Math.max(rawSize.x, rawSize.y, rawSize.z, 0.001);
      model.scale.setScalar(scale);
      model.position.set(-rawCenter.x * scale, -rawCenter.y * scale, -rawCenter.z * scale);

      pivot.updateMatrixWorld(true);
      const fittedBox = new THREE.Box3().setFromObject(pivot);
      if (fittedBox.isEmpty()) throw new Error('Fitted model bounds are empty.');
      const fittedCenter = fittedBox.getCenter(new THREE.Vector3());
      const fittedSize = fittedBox.getSize(new THREE.Vector3());
      const halfHeight = Math.max(fittedSize.y * 0.5, 0.65);
      const distance = (halfHeight / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))) * 1.45;
      camera.position.set(0, fittedCenter.y + fittedSize.y * 0.08, distance);
      camera.lookAt(0, fittedCenter.y, 0);
      camera.updateProjectionMatrix();

      pivot.rotation.y = FRONT_FACING_ROTATION_Y;

      setStatus('ready');
      onReady?.();
    } catch (err) {
      console.error('[LeaderboardAvatar3D] load error:', err);
      setStatus('error');
      onLoadError?.(err);
    }

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      renderer.render(scene, camera);
      gl.endFrameEXP();
    };
    animate();
  };

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: 0,
          overflow: 'hidden',
          backgroundColor: 'transparent',
        },
        style,
      ]}
    >
      <GLView style={StyleSheet.absoluteFill} onContextCreate={onContextCreate} />
      {status === 'loading' && (
        <View
          style={[StyleSheet.absoluteFill, styles.loadingOverlay]}
          pointerEvents="none"
        >
          <ActivityIndicator color="#86A778" size="small" />
        </View>
      )}
    </View>
  );
}

// Mirrors Avatar3DViewer's simplifyMaterial exactly.
function simplifyMaterial(mat) {
  if (!mat) return mat;
  const next = new THREE.MeshPhongMaterial({
    color: mat.color?.clone?.() ?? new THREE.Color(0xffffff),
    map: mat.map ?? null,
    transparent: !!mat.transparent || (typeof mat.opacity === 'number' && mat.opacity < 1),
    opacity: typeof mat.opacity === 'number' ? mat.opacity : 1,
    side: THREE.DoubleSide,
  });
  if (mat.emissive) next.emissive = mat.emissive.clone();
  if (typeof mat.emissiveIntensity === 'number') next.emissiveIntensity = mat.emissiveIntensity;
  if (mat.emissiveMap) next.emissiveMap = mat.emissiveMap;
  if (next.map) {
    if ('colorSpace' in next.map && THREE.SRGBColorSpace) {
      next.map.colorSpace = THREE.SRGBColorSpace;
    } else if ('encoding' in next.map && THREE.sRGBEncoding) {
      next.map.encoding = THREE.sRGBEncoding;
    }
    next.map.flipY = false;
    next.map.needsUpdate = true;
  }
  if (next.emissiveMap) {
    if ('colorSpace' in next.emissiveMap && THREE.SRGBColorSpace) {
      next.emissiveMap.colorSpace = THREE.SRGBColorSpace;
    } else if ('encoding' in next.emissiveMap && THREE.sRGBEncoding) {
      next.emissiveMap.encoding = THREE.sRGBEncoding;
    }
    next.emissiveMap.flipY = false;
    next.emissiveMap.needsUpdate = true;
  }
  next.needsUpdate = true;
  next.skinning = !!mat.skinning;
  return next;
}

// Same green fallback Avatar3DViewer uses when no color source is detected.
function createFallbackMaterial() {
  return new THREE.MeshPhongMaterial({
    color: new THREE.Color('#8fb37b'),
    side: THREE.DoubleSide,
    transparent: false,
    opacity: 1,
  });
}

const styles = StyleSheet.create({
  loadingOverlay: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
});
