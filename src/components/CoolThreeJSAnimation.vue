<template>
  <div ref="container" class="threejs-container"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import * as THREE from "three";

const container = ref(null);
let scene, camera, renderer, shape;

const init = () => {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    90,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.value.appendChild(renderer.domElement);

  const geometry = new THREE.TorusGeometry(5, 1.5, 16, 100);
  const material = new THREE.MeshBasicMaterial({
    color: 0x000000,
    wireframe: true,
  });
  shape = new THREE.Mesh(geometry, material);
  scene.add(shape);

  camera.position.z = 5;
  shape.rotation.x = 0.0;
  shape.rotation.y = Math.PI / 2;
};

const animate = () => {
  requestAnimationFrame(animate);
  shape.rotation.x += 0.003;
  shape.rotation.y += 0.001;
  renderer.render(scene, camera);
};

onMounted(() => {
  init();
  animate();
  window.addEventListener("resize", onWindowResize);
});

onUnmounted(() => {
  if (renderer) {
    renderer.dispose();
  }
  window.removeEventListener("resize", onWindowResize);
});

const onWindowResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
};
</script>

<style scoped>
.threejs-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
}
</style>
