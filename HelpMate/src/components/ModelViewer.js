import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

/**
 * Renders a remote GLB using Three.js + OrbitControls inside a WebView.
 * - Textures load correctly (full browser context)
 * - User drags on the model to rotate (OrbitControls handles touch natively)
 * - postMessage lock/unlock disables the parent ScrollView during drag
 */
export default function ModelViewer({ modelUrl, style, onLockScroll, onUnlockScroll }) {
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    html, body { width:100%; height:100%; overflow:hidden; background:#f8f8f8; }
    canvas { display:block; }
    #msg {
      position:absolute; bottom:8px; left:0; right:0;
      text-align:center; font:12px/1 sans-serif; color:#aaa; pointer-events:none;
    }
  </style>
</head>
<body>
  <div id="msg">Loading…</div>
  <script type="importmap">
  {"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.166.1/build/three.module.js","three/addons/":"https://cdn.jsdelivr.net/npm/three@0.166.1/examples/jsm/"}}
  </script>
  <script type="module">
    import * as THREE from 'three';
    import { GLTFLoader }    from 'three/addons/loaders/GLTFLoader.js';
    import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

    const W = window.innerWidth, H = window.innerHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(W, H);
    renderer.setClearColor(0xf8f8f8);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, W / H, 0.01, 1000);
    camera.position.set(0, 1.2, 3.5);

    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const sun = new THREE.DirectionalLight(0xffffff, 1.2);
    sun.position.set(2, 4, 3);
    scene.add(sun);
    const fill = new THREE.DirectionalLight(0xffffff, 0.4);
    fill.position.set(-3, 1, -2);
    scene.add(fill);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan  = false;
    controls.enableZoom = true;
    controls.minDistance = 1;
    controls.maxDistance = 8;
    controls.target.set(0, 0.5, 0);
    controls.update();

    new GLTFLoader().load(
      '${modelUrl}',
      (gltf) => {
        const model = gltf.scene;
        const box   = new THREE.Box3().setFromObject(model);
        const c     = box.getCenter(new THREE.Vector3());
        const s     = box.getSize(new THREE.Vector3());
        const sc    = 2 / Math.max(s.x, s.y, s.z);
        model.scale.setScalar(sc);
        model.position.set(-c.x * sc, -c.y * sc, -c.z * sc);
        scene.add(model);
        document.getElementById('msg').style.display = 'none';
      },
      null,
      () => { document.getElementById('msg').textContent = 'Could not load model'; }
    );

    // Tell React Native to lock / unlock its ScrollView during touch
    const rn = () => window.ReactNativeWebView;
    renderer.domElement.addEventListener('pointerdown',  () => rn()?.postMessage('lock'));
    renderer.domElement.addEventListener('pointerup',    () => rn()?.postMessage('unlock'));
    renderer.domElement.addEventListener('pointercancel',() => rn()?.postMessage('unlock'));

    (function animate() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    })();
  </script>
</body>
</html>`;

  const handleMessage = (e) => {
    const d = e.nativeEvent.data;
    if (d === 'lock')   onLockScroll?.();
    if (d === 'unlock') onUnlockScroll?.();
  };

  return (
    <View style={[styles.container, style]}>
      <WebView
        source={{ html }}
        style={styles.wv}
        originWhitelist={['*']}
        javaScriptEnabled
        allowFileAccess
        allowUniversalAccessFromFileURLs
        mixedContentMode="always"
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
        backgroundColor="#f8f8f8"
        onMessage={handleMessage}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { overflow: 'hidden' },
  wv: { flex: 1 },
});
