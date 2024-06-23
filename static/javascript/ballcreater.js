import gsap from "gsap";
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.165.0/examples/jsm/controls/OrbitControls.js";
import { FontLoader } from "https://cdn.jsdelivr.net/npm/three@0.165.0/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "https://cdn.jsdelivr.net/npm/three@0.165.0/examples/jsm/geometries/TextGeometry.js";

// Creating Scene & Canvas
const scene = new THREE.Scene();
const canvas = document.querySelector('.webgl');

// Creating Sphere
const geometry = new THREE.SphereGeometry(0.5, 64, 64);
const material = new THREE.MeshStandardMaterial({
    color: "#14b5ff",
    roughness: 0.2,
});
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

// Creating Lights
const light = new THREE.PointLight(0xffffff, 1, 100);
light.position.set(0, 2, 2);
light.intensity = 1.25;
scene.add(light);

const ambientLight = new THREE.AmbientLight(0x897979);
ambientLight.intensity = 1.25;
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(0, 0, 10).normalize();
directionalLight.intensity = 1.25;
scene.add(directionalLight);

// Sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
};

// Define aspect ratio
const aspect = sizes.width / sizes.height;
const frustumSize = 15;

// Create the orthographic camera
const camera = new THREE.OrthographicCamera(
    frustumSize * aspect / -2,
    frustumSize * aspect / 2,
    frustumSize / 2,
    frustumSize / -2,
    0.1,
    1000
);

const controls = new OrbitControls(camera, canvas);
camera.position.set(50, 50, 50);
camera.lookAt(scene.position);
controls.update();

// Function to create grid and number line
function createGrid(size, divisions, plane, color) {
    const gridMaterial = new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: 0.3 });
    const gridHelper = new THREE.GridHelper(size, divisions, color, color);
    gridHelper.material = gridMaterial;
    if (plane === 'XZ') {
        gridHelper.rotation.x = 0;
    } else if (plane === 'YZ') {
        gridHelper.rotation.z = Math.PI / 2;
    } else if (plane === 'XY') {
        gridHelper.rotation.x = Math.PI / 2;
    }
    scene.add(gridHelper);

    // Add number line
    const loader = new FontLoader();
    loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
        for (let i = -size / 2; i <= size / 2; i += size / divisions) {
            const textGeometry = new TextGeometry(i.toString(), {
                font: font,
                size: 0.3,
                depth: 0.05
            });
            const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
            const textMesh = new THREE.Mesh(textGeometry, textMaterial);
            if (plane === 'XZ') {
                textMesh.position.set(i, 0, 0); // X axis
            } else if (plane === 'YZ') {
                textMesh.position.set(0, i, 0); // Y axis
            } else if (plane === 'XY') {
                textMesh.position.set(0, 0, i); // Z axis
            }
            scene.add(textMesh);
        }

        // Add axis labels
        const addLabel = (text, position, color) => {
            const labelGeometry = new TextGeometry(text, {
                font: font,
                size: 2,
                depth: 0.1
            });
            const labelMaterial = new THREE.MeshBasicMaterial({ color: color });
            const labelMesh = new THREE.Mesh(labelGeometry, labelMaterial);
            labelMesh.position.copy(position);
            scene.add(labelMesh);
        };

        addLabel('X', new THREE.Vector3(size / 2 + 5, 0, 0), 0xff0000);
        addLabel('Y', new THREE.Vector3(0, size / 2 + 5, 0), 0x00ff00);
        addLabel('Z', new THREE.Vector3(0, 0, size / 2 + 5), 0x0000ff);
    });
}

// Create grids
const gridSize = 20; // Adjust as needed
const gridDivisions = 20; // Adjust as needed
createGrid(gridSize, gridDivisions, 'XZ', 0xff0000); // Red grid on XZ plane
createGrid(gridSize, gridDivisions, 'YZ', 0x00ff00); // Green grid on YZ plane
createGrid(gridSize, gridDivisions, 'XY', 0x0000ff); // Blue grid on XY plane

// Custom Axes Helper Function
function createCustomAxes(size) {
    const vertices = new Float32Array([
        -size, 0, 0, size, 0, 0,
        0, -size, 0, 0, size, 0,
        0, 0, -size, 0, 0, size
    ]);

    const colors = new Float32Array([
        1, 0, 0, 1, 0, 0,
        0, 1, 0, 0, 1, 0,
        0, 0, 1, 0, 0, 1
    ]);

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.LineBasicMaterial({ vertexColors: true });

    const axes = new THREE.LineSegments(geometry, material);
    scene.add(axes);
}

createCustomAxes(gridSize / 2);

// Rendering Sphere
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(2);
renderer.render(scene, camera);

// Resizing Window
window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    const aspect = sizes.width / sizes.height;
    camera.left = -frustumSize * aspect / 2;
    camera.right = frustumSize * aspect / 2;
    camera.top = frustumSize / 2;
    camera.bottom = -frustumSize / 2;

    camera.updateProjectionMatrix();
    renderer.setSize(sizes.width, sizes.height);
});

function animate() {
    renderer.render(scene, camera);
    window.requestAnimationFrame(animate);
}
animate();

// Timeline Magic
const tl = gsap.timeline({ defaults: { duration: 1 } });
tl.fromTo(mesh.scale, { z: 0, x: 0, y: 0 }, { z: 1, x: 1, y: 1 });
tl.fromTo('nav', { y: "-100%" }, { y: "0%" });
tl.fromTo('.title', { opacity: 0 }, { opacity: 1 });

function updateBallPositionInScene(x, y, z) {
    gsap.to(mesh.position, { x: x, y: y, z: z, duration: 1 });
}

// Fetch initial ball position from the server
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/getballposition');
        const data = await response.json();

        if (data.status === 'success') {
            const { x, y, z } = data;
            updateBallPositionInScene(x, y, z);
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Error fetching ball position:', error);
    }
});

// Handle form submission to update ball position
const form = document.querySelector("form");

form.addEventListener('submit', function (event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const x = parseFloat(formData.get('Xvalue'));
    const y = parseFloat(formData.get('Yvalue'));
    const z = parseFloat(formData.get('Zvalue'));

    // Validate the input values
    if (isNaN(x) || isNaN(y) || isNaN(z)) {
        alert('Please enter valid numerical values for X, Y, and Z.');
        return;
    }

    if (x < -10 || x > 10 || y < -10 || y > 10 || z < -10 || z > 10) {
        alert('Please enter values for X, Y, and Z between -10 and 10.');
        return;
    }

    updateBallPositionInScene(x, y, z);
    sendBallPositionUpdate(x, y, z);
    form.reset()
});

// Send ball position update to the server
async function sendBallPositionUpdate(x, y, z) {
    try {
        const response = await fetch('updateballposition', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ "Xvalue": x, "Yvalue": y, "Zvalue": z })
        });

        const data = await response.json();

        if (data.status !== 'success') {
            alert(data.message);
        }
    } catch (error) {
        console.error('Error sending ball position update:', error);
    }
}

// WebSocket connection for real-time updates
const socket = io();

socket.on('update_ballposition', (data) => {
    if (data.status === 'success') {
        updateBallPositionInScene(data.x, data.y, data.z);
    } else {
        console.error('Failed to update ball position:', data.message);
    }
});
