// ===== THREE.JS 3D VOXEL BACKGROUND =====
let scene, camera, renderer, blocks = [], mouseX = 0, mouseY = 0;

function init3D() {
  const container = document.getElementById('three-bg');
  if (!container) return;

  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0a0a0f, 0.018);

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 2, 12);

  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  // Ambient light
  const ambient = new THREE.AmbientLight(0x334455, 0.6);
  scene.add(ambient);

  // Point lights
  const light1 = new THREE.PointLight(0x4ade80, 2, 30);
  light1.position.set(5, 8, 5);
  scene.add(light1);

  const light2 = new THREE.PointLight(0xa78bfa, 1.5, 30);
  light2.position.set(-5, 3, -5);
  scene.add(light2);

  const light3 = new THREE.PointLight(0x60a5fa, 1, 25);
  light3.position.set(0, -3, 8);
  scene.add(light3);

  // Minecraft block colors
  const blockTypes = [
    { color: 0x4ade80, emissive: 0x1a6b35, name: 'emerald' },
    { color: 0xa78bfa, emissive: 0x4a3580, name: 'amethyst' },
    { color: 0x60a5fa, emissive: 0x2a4a80, name: 'diamond' },
    { color: 0x6b8553, emissive: 0x2a3520, name: 'grass' },
    { color: 0x8b6914, emissive: 0x3a2d0a, name: 'wood' },
    { color: 0x808080, emissive: 0x333333, name: 'stone' },
    { color: 0xfb923c, emissive: 0x6b3d18, name: 'copper' },
  ];

  // Create floating blocks
  for (let i = 0; i < 35; i++) {
    const type = blockTypes[Math.floor(Math.random() * blockTypes.length)];
    const size = Math.random() * 0.5 + 0.2;
    const geo = new THREE.BoxGeometry(size, size, size);

    const mat = new THREE.MeshPhongMaterial({
      color: type.color,
      emissive: type.emissive,
      transparent: true,
      opacity: Math.random() * 0.4 + 0.15,
      shininess: 80,
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(
      (Math.random() - 0.5) * 24,
      (Math.random() - 0.5) * 14,
      (Math.random() - 0.5) * 16 - 4
    );
    mesh.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );

    mesh.userData = {
      rotSpeedX: (Math.random() - 0.5) * 0.008,
      rotSpeedY: (Math.random() - 0.5) * 0.008,
      floatSpeed: Math.random() * 0.003 + 0.001,
      floatOffset: Math.random() * Math.PI * 2,
      baseY: mesh.position.y,
      driftX: (Math.random() - 0.5) * 0.003,
    };

    blocks.push(mesh);
    scene.add(mesh);
  }

  // Edge glow lines between nearby blocks
  const lineMat = new THREE.LineBasicMaterial({
    color: 0x4ade80,
    transparent: true,
    opacity: 0.06,
  });

  for (let i = 0; i < blocks.length; i++) {
    for (let j = i + 1; j < blocks.length; j++) {
      const d = blocks[i].position.distanceTo(blocks[j].position);
      if (d < 5) {
        const geo = new THREE.BufferGeometry().setFromPoints([
          blocks[i].position, blocks[j].position
        ]);
        const line = new THREE.Line(geo, lineMat);
        scene.add(line);
      }
    }
  }

  // Mouse parallax
  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  animate3D();
}

function animate3D() {
  requestAnimationFrame(animate3D);
  const time = Date.now() * 0.001;

  blocks.forEach(b => {
    b.rotation.x += b.userData.rotSpeedX;
    b.rotation.y += b.userData.rotSpeedY;
    b.position.y = b.userData.baseY + Math.sin(time * b.userData.floatSpeed * 100 + b.userData.floatOffset) * 0.5;
    b.position.x += b.userData.driftX;

    // Wrap around
    if (b.position.x > 14) b.position.x = -14;
    if (b.position.x < -14) b.position.x = 14;
  });

  // Camera parallax
  camera.position.x += (mouseX * 1.5 - camera.position.x) * 0.02;
  camera.position.y += (-mouseY * 0.8 + 2 - camera.position.y) * 0.02;
  camera.lookAt(0, 0, 0);

  renderer.render(scene, camera);
}

// Initialize on load
if (document.getElementById('three-bg')) {
  init3D();
}
