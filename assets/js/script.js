import * as THREE from 'https://cdn.skypack.dev/three@0.129.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js';
import { gsap } from 'https://cdn.skypack.dev/gsap';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(10, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 13;

const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('container3D').appendChild(renderer.domElement);

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(500, 500, 500);
scene.add(directionalLight);

// Load 3D Model
let bee;
let mixer;
const loader = new GLTFLoader();

loader.load(
    './demon_bee_full_texture.glb',
    (gltf) => {
        bee = gltf.scene;
        bee.position.y = -1;
        bee.rotation.y = 1.5;
        scene.add(bee);

        mixer = new THREE.AnimationMixer(bee);
        mixer.clipAction(gltf.animations[0]).play();
    },
    (xhr) => {
        console.log(`Model ${Math.round((xhr.loaded / xhr.total) * 100)}% loaded`);
    },
    (error) => {
        console.error('An error occurred while loading the model:', error);
    }
);

// Animation loop
const reRender3D = () => {
    requestAnimationFrame(reRender3D);
    renderer.render(scene, camera);
    if (mixer) mixer.update(0.02);
};
reRender3D();

// Scroll-linked animation configuration
const modelPositions = [
    {
        id: 'section1',
        position: { x: 0, y: -1, z: 0 },
        rotation: { x: 0, y: 1.5, z: 0 }
    },
    {
        id: 'section2',
        position: { x: 1, y: -0.5, z: -5 },
        rotation: { x: 0.5, y: -0.5, z: 0 }
    },
    {
        id: 'section3',
        position: { x: -1, y: -1, z: -5 },
        rotation: { x: 0.3, y: -0.5, z: 0 }
    }
];

// Model movement on scroll
const modelMove = () => {
    const sections = document.querySelectorAll('.section');
    let currentSectionId = null;

    sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= window.innerHeight / 3) {
            currentSectionId = section.id;
        }
    });

    if (currentSectionId) {
        const target = modelPositions.find((item) => item.id === currentSectionId);
        if (target && bee) {
            // Use GSAP for smooth movement
            gsap.to(bee.position, {
                x: target.position.x,
                y: target.position.y,
                z: target.position.z,
                duration: 3,
                ease: 'power2.out',
            });
            gsap.to(bee.rotation, {
                x: target.rotation.x,
                y: target.rotation.y,
                z: target.rotation.z,
                duration: 3,
                ease: 'power2.out',
            });
        }
    }
};

// Scroll event listener
window.addEventListener('scroll', () => {
    if (bee) {
        modelMove();
    }
});
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix(); // Recalculate projection matrix
});