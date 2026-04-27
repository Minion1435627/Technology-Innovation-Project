import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export default function Avatar3DViewer({ modelUrl, rotation = 0, style, onLoadError }) {
  const [status, setStatus] = useState('loading');
  const [errorText, setErrorText] = useState('');
  const [textureStatus, setTextureStatus] = useState('');
  const pivotRef = useRef(null);
  const targetRotationRef = useRef(0);
  const currentRotationRef = useRef(0);
  const mixerRef = useRef(null);
  const frameRef = useRef(null);

  useEffect(() => {
    targetRotationRef.current = rotation * (Math.PI / 180);
  }, [rotation]);

  useEffect(() => {
    setStatus('loading');
    setErrorText('');
    setTextureStatus('');
  }, [modelUrl]);

  const simplifyMaterial = (mat) => {
    if (!mat) return mat;

    const next = new THREE.MeshPhongMaterial({
      color: mat.color?.clone?.() ?? new THREE.Color(0xffffff),
      map: mat.map ?? null,
      transparent: !!mat.transparent || (typeof mat.opacity === 'number' && mat.opacity < 1),
      opacity: typeof mat.opacity === 'number' ? mat.opacity : 1,
      side: THREE.DoubleSide,
    });

    if (mat.emissive) {
      next.emissive = mat.emissive.clone();
    }
    if (typeof mat.emissiveIntensity === 'number') {
      next.emissiveIntensity = mat.emissiveIntensity;
    }
    if (mat.emissiveMap) {
      next.emissiveMap = mat.emissiveMap;
    }

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
  };

  const createFallbackMaterial = () =>
    new THREE.MeshPhongMaterial({
      color: new THREE.Color('#8fb37b'),
      side: THREE.DoubleSide,
      transparent: false,
      opacity: 1,
    });

  const loadGltfFromUrl = async (url) => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Avatar download failed (${response.status})`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const loader = new GLTFLoader();

    return await new Promise((resolve, reject) => {
      loader.parse(
        arrayBuffer,
        '',
        (gltf) => resolve(gltf),
        (error) => reject(error instanceof Error ? error : new Error(String(error)))
      );
    });
  };

  const onContextCreate = async (gl) => {
    const renderer = new Renderer({ gl });
    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
    renderer.setClearColor(0xfffcf9, 1);
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

    const clock = new THREE.Clock();

    try {
      const gltf = await loadGltfFromUrl(modelUrl);
      const model = gltf.scene;

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
                if (hex && hex !== 'ffffff') {
                  flatColorCount += 1;
                }
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

      if (meshCount === 0) {
        throw new Error('Model contains no visible mesh geometry.');
      }

      const statusParts = [];
      if (baseTextureCount > 0) statusParts.push(`Base texture (${baseTextureCount})`);
      if (extraTextureCount > 0) statusParts.push(`Other maps (${extraTextureCount})`);
      if (vertexColorCount > 0) statusParts.push(`Vertex colors (${vertexColorCount})`);
      if (flatColorCount > 0) statusParts.push(`Flat color (${flatColorCount})`);
      const hasVisibleColorSource =
        baseTextureCount > 0 || extraTextureCount > 0 || vertexColorCount > 0 || flatColorCount > 0;
      if (!hasVisibleColorSource) {
        statusParts.push('No color source found');
        model.traverse((node) => {
          if (!node.isMesh) return;
          if (Array.isArray(node.material)) {
            node.material = node.material.map(() => createFallbackMaterial());
          } else {
            node.material = createFallbackMaterial();
          }
        });
      }

      const summary = statusParts.join(' • ');
      setTextureStatus(summary);
      console.log('[Avatar3D] color source summary:', summary);

      const pivot = new THREE.Group();
      scene.add(pivot);
      pivot.add(model);

      model.updateMatrixWorld(true);
      const rawBox = new THREE.Box3().setFromObject(model);
      if (rawBox.isEmpty()) {
        throw new Error('Model bounds are empty.');
      }
      const rawCenter = rawBox.getCenter(new THREE.Vector3());
      const rawSize = rawBox.getSize(new THREE.Vector3());
      const maxDim = Math.max(rawSize.x, rawSize.y, rawSize.z, 0.001);
      const scale = 1.85 / maxDim;

      model.scale.setScalar(scale);
      model.position.set(
        -rawCenter.x * scale,
        -rawCenter.y * scale,
        -rawCenter.z * scale,
      );

      pivot.updateMatrixWorld(true);
      const fittedBox = new THREE.Box3().setFromObject(pivot);
      if (fittedBox.isEmpty()) {
        throw new Error('Fitted model bounds are empty.');
      }
      const fittedCenter = fittedBox.getCenter(new THREE.Vector3());
      const fittedSize = fittedBox.getSize(new THREE.Vector3());
      const halfHeight = Math.max(fittedSize.y * 0.5, 0.65);
      const distance = (halfHeight / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))) * 1.45;

      camera.position.set(0, fittedCenter.y + fittedSize.y * 0.08, distance);
      camera.lookAt(0, fittedCenter.y, 0);
      camera.updateProjectionMatrix();

      const floor = new THREE.GridHelper(4, 8, 0xe7ddd2, 0xf1e8df);
      floor.position.y = fittedBox.min.y - 0.02;
      scene.add(floor);

      if (gltf.animations?.length) {
        const mixer = new THREE.AnimationMixer(model);
        mixer.clipAction(gltf.animations[0]).play();
        mixerRef.current = mixer;
      }

      pivotRef.current = pivot;
      setStatus('ready');
    } catch (err) {
      console.error('[Avatar3D] load error:', err);
      setErrorText(err?.message ?? String(err));
      setStatus('error');
      onLoadError?.(err);
    }

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);

      const dt = clock.getDelta();
      if (mixerRef.current) mixerRef.current.update(dt);

      if (pivotRef.current) {
        currentRotationRef.current += (targetRotationRef.current - currentRotationRef.current) * 0.22;
        pivotRef.current.rotation.y = currentRotationRef.current;
      }

      renderer.render(scene, camera);
      gl.endFrameEXP();
    };

    animate();
  };

  useEffect(() => {
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      mixerRef.current = null;
      pivotRef.current = null;
      targetRotationRef.current = 0;
      currentRotationRef.current = 0;
    };
  }, []);

  return (
    <View style={[styles.container, style]}>
      <GLView style={StyleSheet.absoluteFill} onContextCreate={onContextCreate} />
      {status === 'loading' && (
        <View style={styles.overlay}>
          <ActivityIndicator color="#86A778" />
          <Text style={styles.hint}>Loading 3D avatar...</Text>
        </View>
      )}
      {status === 'ready' && (
        <View style={styles.readyBadge}>
          <Text style={styles.readyBadgeText}>Original texture</Text>
        </View>
      )}
      {status === 'ready' && textureStatus ? (
        <View style={styles.textureBadge}>
          <Text style={styles.textureBadgeText}>{textureStatus}</Text>
        </View>
      ) : null}
      {status === 'error' && (
        <View style={styles.overlay}>
          <Text style={styles.err}>Could not load model.{'\n'}{errorText || 'Load failed'}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { overflow: 'hidden', backgroundColor: '#fffdf9' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fffdf9',
  },
  hint: { fontSize: 12, color: '#999' },
  err: { fontSize: 12, color: '#e03131', textAlign: 'center', paddingHorizontal: 20 },
  readyBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(134,167,120,0.14)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  readyBadgeText: { fontSize: 11, color: '#5f7f54', fontWeight: '600' },
  textureBadge: {
    position: 'absolute',
    top: 38,
    right: 10,
    backgroundColor: 'rgba(95, 127, 84, 0.1)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    maxWidth: '65%',
  },
  textureBadgeText: { fontSize: 11, color: '#6b6b6b', fontWeight: '600' },
});
