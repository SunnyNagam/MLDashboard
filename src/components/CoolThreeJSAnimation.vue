<template>
  <div ref="container" class="threejs-container"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import * as THREE from "three";

const props = defineProps({
  containerId: {
    type: String,
    default: "threejs-container",
  },
});

const container = ref(null);
let scene,
  camera,
  renderer,
  shapes = [],
  velocities = [],
  light;
let mouseX = 0,
  mouseY = 0;

const init = () => {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.value.appendChild(renderer.domElement);

  // Add a light source
  light = new THREE.DirectionalLight(0xffffff, 1.0); // Reduced intensity
  light.position.set(50, 50, 40);
  scene.add(light);

  // Add ambient light for softer shadows
  const ambientLight = new THREE.AmbientLight(0xffffff, 2.5); // Increased intensity
  scene.add(ambientLight);

  const frustumSize = 60;
  const aspect = window.innerWidth / window.innerHeight;
  const frustumHeight = frustumSize;
  const frustumWidth = frustumSize * aspect;

  for (let i = 0; i < 40; i++) {
    const geometry = new THREE.SphereGeometry(
      ((Math.random() + Math.random() + Math.random()) / 3) * 6 + 3, // Increased size variance
      Math.random() * 9 + 1,
      Math.random() * 9 + 1
    );
    const pastelColors = [
      0xffc0cb, // Pink
      0xffb6c1, // LightPink
      0xffe4b5, // Moccasin
      0xffe4e1, // MistyRose
      0xfff0f5, // LavenderBlush
      0xfffacd, // LemonChiffon
      0xfff8dc, // Cornsilk
      0xf0e68c, // Khaki
      0xe6e6fa, // Lavender
      0xadd8e6, // LightBlue
    ];
    const material = new THREE.MeshStandardMaterial({
      color: pastelColors[Math.floor(Math.random() * pastelColors.length)],
      roughness: 0.9, // Adjust for subtle shading
      metalness: 0.0, // Adjust for subtle shading
      transparent: true, // Enable transparency
      opacity: 1, // Start fully opaque
    });
    const shape = new THREE.Mesh(geometry, material);
    shape.position.x = Math.random() * frustumWidth - frustumWidth / 2;
    shape.position.y = Math.random() * frustumHeight - frustumHeight / 2;
    shape.position.z = Math.random() * -80 + 20;
    shape.material.opacity = 1;
    shape.castShadow = true; // Enable shadow casting for the shape
    shapes.push(shape);
    velocities.push([
      Math.random() * 0.08 - 0.04,
      Math.random() * 0.08 - 0.04,
      Math.random() * 0.08 - 0.04,
    ]);
    scene.add(shape);
  }

  camera.position.z = 30;
  onScroll();
};

const animate = () => {
  requestAnimationFrame(animate);
  //shape.rotation.x += 0.01;
  //shape.rotation.y += 0.01;
  camera.position.x += (mouseY - camera.position.x) * 1.5;
  camera.position.y += (mouseX - camera.position.y) * 1.5;
  //shape.material.color.setHex(Math.random() * 0xffffff);
  shapes.forEach((shape, i) => {
    shape.position.x += velocities[i][0];
    shape.position.y += velocities[i][1];
    shape.position.z += velocities[i][2];
    shape.rotation.x += velocities[i][0] * 0.5;
    shape.rotation.y += velocities[i][1] * 0.5;

    // Bounce off walls
    if (shape.position.x < -20 || shape.position.x > 20) velocities[i][0] *= -1;
    if (shape.position.y < -20 || shape.position.y > 20) velocities[i][1] *= -1;
    if (shape.position.z < -30 || shape.position.z > 30) velocities[i][2] *= -1;

    bounceOffEachOther(shape, i);
  });
  renderer.render(scene, camera);
};

const bounceOffEachOther = (shape, i) => {
  for (let j = i + 1; j < shapes.length; j++) {
    const otherShape = shapes[j];
    const dx = shape.position.x - otherShape.position.x;
    const dy = shape.position.y - otherShape.position.y;
    const dz = shape.position.z - otherShape.position.z;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    const minDistance =
      shape.geometry.parameters.radius + otherShape.geometry.parameters.radius;

    if (distance < minDistance) {
      // Calculate normal vector
      const nx = dx / distance;
      const ny = dy / distance;
      const nz = dz / distance;

      // Calculate relative velocity
      const relativeVelocityX = velocities[i][0] - velocities[j][0];
      const relativeVelocityY = velocities[i][1] - velocities[j][1];
      const relativeVelocityZ = velocities[i][2] - velocities[j][2];

      // Calculate relative velocity in terms of the normal direction
      const normalVelocity =
        relativeVelocityX * nx +
        relativeVelocityY * ny +
        relativeVelocityZ * nz;

      // Do not resolve if velocities are separating
      if (normalVelocity > 0) {
        return;
      }

      // Calculate restitution (bounciness)
      const restitution = 0.8;

      // Calculate impulse scalar
      const impulse = (-(1 + restitution) * normalVelocity) / 2;

      // Apply impulse
      velocities[i][0] += impulse * nx;
      velocities[i][1] += impulse * ny;
      velocities[i][2] += impulse * nz;

      velocities[j][0] -= impulse * nx;
      velocities[j][1] -= impulse * ny;
      velocities[j][2] -= impulse * nz;

      // Move spheres apart to prevent sticking
      const correction = (minDistance - distance) / 2;
      shape.position.x += nx * correction;
      shape.position.y += ny * correction;
      shape.position.z += nz * correction;
      otherShape.position.x -= nx * correction;
      otherShape.position.y -= ny * correction;
      otherShape.position.z -= nz * correction;
    }
  }
};

const onMouseMove = (event) => {
  mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
  light.position.x = mouseX * 100; // Adjust the multiplier as needed
  light.position.y = mouseY * 100;
};

const onScroll = () => {
  const containerElement = document.getElementById(props.containerId);
  if (!containerElement) return;

  const containerRect = containerElement.getBoundingClientRect();
  const containerHeight = containerRect.height;

  // Calculate the container's top position relative to the document
  const containerTop = containerRect.top + window.scrollY;

  // Calculate how much of the container has been scrolled past
  const scrolledPast = Math.max(
    -200,
    Math.min(window.scrollY - containerTop, containerHeight)
  );

  // Calculate the scroll progress as a percentage
  const scrollPercent = scrolledPast / containerHeight;

  camera.position.z = 30 - scrollPercent * 100;

  const opacity = Math.min(1 - (scrollPercent + 0.1) * 2, 1);
  console.log(opacity);
  // Update shape opacities
  shapes.forEach((shape) => {
    shape.material.opacity = opacity;
  });
};

onMounted(() => {
  init();
  animate();
  window.addEventListener("resize", onWindowResize);
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("scroll", onScroll);
});

onUnmounted(() => {
  if (renderer) {
    renderer.dispose();
  }
  window.removeEventListener("resize", onWindowResize);
  window.removeEventListener("mousemove", onMouseMove);
  window.removeEventListener("scroll", onScroll);
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
