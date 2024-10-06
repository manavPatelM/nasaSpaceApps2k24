import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import {calculatePositio} from '/Users/VFIN/Desktop/solarModel/calcPosition.js'


// Set up scene, camera, and renderer
let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
let renderer = new THREE.WebGLRenderer();



// 1. Create the point light
const pointLight = new THREE.PointLight(0xffffff, 1, 10); // (color, intensity, distance)

// 2. Set the position of the light (e.g., at the center where the sun is)
pointLight.position.set(0, 0, 0); // Adjust the position to match the location of your sun

// 3. Add the light to the scene
scene.add(pointLight);

// Optional: You can also add a light helper to visualize the point light in your scene
const lightHelper = new THREE.PointLightHelper(pointLight);
scene.add(lightHelper);

renderer.shadowMap.enabled = true;



renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);



// Add OrbitControls for user interactivity
let controls = new OrbitControls(camera, renderer.domElement);
camera.position.set(0, 50, 150); // Set initial camera position
controls.update();

// Create a starry sky background
const backgroundGeometry = new THREE.SphereGeometry(500, 64, 64);
const backgroundMaterial = new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load('assets/2k_stars.jpg'),
    side: THREE.BackSide // Inside of the sphere
});
const backgroundMesh = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
scene.add(backgroundMesh);


// Sun (at the center)
// Sun (at the center)
let sunGeometry = new THREE.SphereGeometry(5, 32, 32); // Set to 8 units for the Sun
let sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffcc00 });
// add texture
let sunTexture = new THREE.TextureLoader().load('assets/2k_sun.jpg');
sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });

let sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);




// Updated planet data with appropriate sizes (in units)
// Updated planet data with appropriate sizes in units
// Updated planet data with reduced eccentricity values for circular orbits
// Reduced eccentricity to near-zero for circular orbits
const x = 2;

const planetData = [
    { name: 'Mercury', a: 3.8*x, e: 0.01, i: 7, Ω: 48.33, ω: 1.24, color: 0xffa500, radius: 0.488, speed: 82.64, texture: 'assets/2k_mercury.jpg' },
    { name: 'Venus', a: 7.2*x, e: 0.005, i: 3.39, Ω: 47.68, ω: 0.3, color: 0xf0e68c, radius: 1.210, speed: 32.32, texture: 'assets/2k_venus_surface.jpg' },
    { name: 'Earth', a: 12*x , e: 0.05, i: 0, Ω: 50.26, ω: 40.7, color: 0x87ceeb, radius: 1.274, speed: 19.92, texture: 'assets/2k_earth_daymap.jpg' },
    { name: 'Mars', a: 15.5*x, e: 0.02, i: 1.85, Ω: 49, ω: 71, color: 0xb22222, radius: 0.678, speed: 10.59, texture: 'assets/2k_mars.jpg' }, 
    { name: 'Jupiter', a: 30.2*x, e: 0.03, i: 1.3, Ω: 57.46, ω: 176, color: 0xffd700, radius: 13.982, speed: 1.67, texture: 'assets/2k_jupiter.jpg' },
    { name: 'Saturn', a: 52.3*x, e: 0.02, i: 2.48, Ω: 50.66, ω: 164, color: 0xdda0dd, radius: 11.646, speed: 0.93, texture: 'assets/2k_saturn.jpg' },
    { name: 'Uranus', a: 71.9*x, e: 0.01, i: 0.77, Ω: 50, ω: 10, color: 0x1e90ff, radius: 5.072, speed: 0.24, texture: 'assets/2k_uranus.jpg' },
    { name: 'Neptune', a: 100.6*x, e: 0.01, i: 1.77, Ω: 50.78, ω: 19, color: 0x4682b4, radius: 4.924, speed: 0.12, texture: 'assets/2k_neptune.jpg' }
];

// Adjusted calculatePosition to account for circular orbits
function calculatePosition(planet, time) {
    const { a, e, i, Ω, ω, speed } = planet;
    
    // Circular orbit approximation by keeping eccentricity near zero
    const meanAnomaly = ((time * speed) % 360) * (Math.PI / 180);
    const eccentricAnomaly = meanAnomaly; // Simplified for circular orbits (eccentricity close to 0)

    // Planet's position in its orbital plane
    const x_orbital = a * (Math.cos(eccentricAnomaly)); // Simplified for circular orbit
    const y_orbital = a * Math.sin(eccentricAnomaly);

    // Convert to 3D ecliptic coordinates
    const cosΩ = Math.cos(THREE.MathUtils.degToRad(Ω));
    const sinΩ = Math.sin(THREE.MathUtils.degToRad(Ω));
    const cosi = Math.cos(THREE.MathUtils.degToRad(i));
    const sini = Math.sin(THREE.MathUtils.degToRad(i));
    const cosω = Math.cos(THREE.MathUtils.degToRad(ω));
    const sinω = Math.sin(THREE.MathUtils.degToRad(ω));

    // Ecliptic coordinate transformation
    const x_ecliptic = x_orbital * (cosΩ * cosω - sinΩ * sinω * cosi) - y_orbital * (cosΩ * sinω + sinΩ * cosω * cosi);
    const y_ecliptic = x_orbital * (sinΩ * cosω + cosΩ * sinω * cosi) + y_orbital * (cosω * sinΩ - cosΩ * sinω * cosi);
    const z_ecliptic = x_orbital * (sini * sinω) + y_orbital * (sini * cosω);

    return new THREE.Vector3(-1*x_ecliptic, -1*z_ecliptic, y_ecliptic);
}

// Recalculate orbits with circular paths (reduce eccentricity)
function createOrbitPath(planet) {
    const { a, e, i, Ω, ω } = planet;
    const points = [];
    const segments = 128;  // Number of segments to form the orbital path

    for (let j = 0; j <= segments; j++) {
        const theta = (j / segments) * 2 * Math.PI;  // Angle for current point
        const x_orbital = a * Math.cos(theta); // More circular with less eccentricity
        const y_orbital = a * Math.sin(theta);

        // Transform to ecliptic coordinates
        const cosΩ = Math.cos(THREE.MathUtils.degToRad(Ω));
        const sinΩ = Math.sin(THREE.MathUtils.degToRad(Ω));
        const cosi = Math.cos(THREE.MathUtils.degToRad(i));
        const sini = Math.sin(THREE.MathUtils.degToRad(i));
        const cosω = Math.cos(THREE.MathUtils.degToRad(ω));
        const sinω = Math.sin(THREE.MathUtils.degToRad(ω));

        const x_ecliptic = x_orbital * (cosΩ * cosω - sinΩ * sinω * cosi) - y_orbital * (cosΩ * sinω + sinΩ * cosω * cosi);
        const y_ecliptic = x_orbital * (sinΩ * cosω + cosΩ * sinω * cosi) + y_orbital * (cosω * sinΩ - cosΩ * sinω * cosi);
        const z_ecliptic = x_orbital * (sini * sinω) + y_orbital * (sini * cosω);

        points.push(new THREE.Vector3(-1*x_ecliptic, -1*z_ecliptic, y_ecliptic));
    }

    const orbitGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const orbitMaterial = new THREE.LineBasicMaterial({ color: 0x888888, transparent: true, opacity: 0.5 });
    return new THREE.Line(orbitGeometry, orbitMaterial);
}

// Keep the Sun at the center
sun.position.set(0, 0, 0);



// Create planets, orbits, and their paths
let planetObjects = [];
planetData.forEach((planet) => {
    // Create planet sphere with texture
    const textureLoader = new THREE.TextureLoader();
    const planetTexture = textureLoader.load(planet.texture);
    let planetGeometry = new THREE.SphereGeometry(planet.a * 0.05, 32, 32);
    let planetMaterial = new THREE.MeshBasicMaterial({ map: planetTexture });
    let planetMesh = new THREE.Mesh(planetGeometry, planetMaterial);
    planetMesh.castShadow = true;
    planetMesh.receiveShadow = true;
    scene.add(planetMesh);

    // Create orbit path
    let orbitPath = createOrbitPath(planet);
    scene.add(orbitPath);

    planetObjects.push({ mesh: planetMesh, data: planet });
});

const speedControlsDiv = document.getElementById('speed-controls');
planetData.forEach(planet => {
    const label = document.createElement('label');
    label.innerHTML = `${planet.name} Speed: `;
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = 0;
    slider.max = 100;  // Adjust as needed for speed range
    slider.value = planet.speed;
    slider.classList.add('slider');
    slider.addEventListener('input', () => {
        planet.speed = parseFloat(slider.value);  // Update speed dynamically
    });
    speedControlsDiv.appendChild(label);
    speedControlsDiv.appendChild(slider);
    speedControlsDiv.appendChild(document.createElement('br'));
});
// Label for planets
let label = document.getElementById('label');
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();

// Information box for clicked planets
let infoBox = document.getElementById('info');

window.addEventListener('mousemove', (event) => {
    // Update mouse position for raycasting
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    // Check intersections with planets
    let intersects = raycaster.intersectObjects(planetObjects.map(obj => obj.mesh));
    if (intersects.length > 0) {
        let intersectedObject = intersects[0].object;
        let planet = planetObjects.find(p => p.mesh === intersectedObject);
        label.style.display = 'block';
        label.style.left = event.clientX + 'px';
        label.style.top = event.clientY + 'px';
        label.textContent = planet.data.name; // Display planet name
    } else {
        label.style.display = 'none'; // Hide label if nothing is hovered
    }
});



// Click event for showing information
window.addEventListener('click', () => {
    raycaster.setFromCamera(mouse, camera);
    // Check if a planet is clicked
    let intersects = raycaster.intersectObjects(planetObjects.map(obj => obj.mesh));
    if (intersects.length > 0) {
        let intersectedObject = intersects[0].object;
        let planet = planetObjects.find(p => p.mesh === intersectedObject);
        
        // Render the planet's data page
        // window.location.href = `./dataPages/${planet.data.name.toLowerCase()}.html`;
        window.location.href = `./data/${planet.data.name.toLowerCase()}/main.html`;

        return; // Exit the function to prevent further execution
    }
    // let intersects = raycaster.intersectObjects(planetObjects.map(obj => obj.mesh));
    else {
        infoBox.style.display = 'none'; // Hide info box if nothing is clicked
    }
});

// Moon's data
let moonData = {
    name: 'Moon',
    a: 2, // Semi-major axis (distance from Earth)
    e: 0.05, // Eccentricity (small value for circular orbit)
    i: 5.145, // Inclination in degrees
    Ω: 125.08, // Longitude of the ascending node
    ω: 318.15, // Argument of periapsis
    speed: 125.176, // Orbital speed (adjust as necessary)
    radius: 0.37, // Moon's radius
    texture: 'assets/2k_moon.jpg'
};

// Create the Moon
const moonTexture = new THREE.TextureLoader().load(moonData.texture);
let moonGeometry = new THREE.SphereGeometry(moonData.radius, 32, 32);
let moonMaterial = new THREE.MeshBasicMaterial({ map: moonTexture });
let moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
moonMesh.castShadow = true;
moonMesh.receiveShadow = true;
scene.add(moonMesh);

// Store the moon's mesh to update in the animation loop
let moonObj = { mesh: moonMesh, data: moonData };

// Load the texture for Saturn's rings
const ringTexture = new THREE.TextureLoader().load('assets/2k_saturn_ring_alpha.png');

// Set texture wrapping mode
ringTexture.wrapS = THREE.RepeatWrapping;
ringTexture.wrapT = THREE.RepeatWrapping;
ringTexture.repeat.set(1, 1);

// Create the ring geometry: (inner radius, outer radius, segments)
let ringGeometry = new THREE.RingGeometry(8, 15, 64, 1);

// Create the ring material with transparency
let ringMaterial = new THREE.MeshBasicMaterial({
    map: ringTexture,
    side: THREE.DoubleSide, // Render both sides of the ring
    transparent: true
});

// Create the ring mesh
let saturnRings = new THREE.Mesh(ringGeometry, ringMaterial);


// Rotate and position the rings correctly
saturnRings.rotation.x = Math.PI / 2;

// Add the rings to Saturn’s position
let saturn = planetObjects.find(p => p.data.name === 'Saturn');
if (saturn) {
    saturnRings.position.set(saturn.mesh.position.x, saturn.mesh.position.y, saturn.mesh.position.z);
    scene.add(saturnRings);
}
const asteroidCount = 1000; // Number of asteroids
const asteroids = new THREE.Group(); // Create a group to hold all asteroids

// Loop to create the asteroids
for (let i = 0; i < asteroidCount; i++) {
    // Random radius between Mars and Jupiter
    const radius = THREE.MathUtils.randFloat(35, 56); // Adjust based on your scene's scale

    // Random angle around the Sun
    const angle = THREE.MathUtils.randFloat(0, 2 * Math.PI);

    // Random position within the belt's region
    const x = radius * Math.cos(angle);
    const y = THREE.MathUtils.randFloat(-5, 5); // Small variation in Y (height)
    const z = radius * Math.sin(angle);

    // Create a small asteroid (random size)
    const asteroidGeometry = new THREE.SphereGeometry(THREE.MathUtils.randFloat(0.1, 0.3), 8, 8);
    const asteroidMaterial = new THREE.MeshBasicMaterial({ color: 0x888888 }); // Gray-ish color

    const asteroidMesh = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
    
    // Set the asteroid's position
    asteroidMesh.position.set(x, y, z);

    // Add the asteroid to the group
    asteroids.add(asteroidMesh);
}

// Add the asteroid belt to the scene
scene.add(asteroids);

// Function to animate asteroid rotation (simulate orbiting)
function animateAsteroids() {
    asteroids.children.forEach(asteroid => {
        const distance = Math.sqrt(asteroid.position.x ** 2 + asteroid.position.z ** 2);
        const speed = 0.05 / distance; // Faster closer to the Sun
        asteroid.position.x = asteroid.position.x * Math.cos(speed) - asteroid.position.z * Math.sin(speed);
        asteroid.position.z = asteroid.position.z * Math.cos(speed) + asteroid.position.x * Math.sin(speed);
    });
}

planetObjects.forEach((planetObj) => {
    if (planetObj.data.name === 'Earth') {
        planetObj.moon = moonMesh;  // Associate moon with Earth
    }
});



// Calculate the Moon's position relative to Earth
// 
// In the animation loop, update the Moon's position relative to Earth
function animate() {
    requestAnimationFrame(animate);

    let time = Date.now() * 0.001;

    // Move planets along their orbits
    planetObjects.forEach((planetObj) => {
        let position = calculatePosition(planetObj.data, time);
        planetObj.mesh.position.set(position.x, position.y, position.z);
    });

    // Move the moon relative to Earth's position
    let earthObj = planetObjects.find(p => p.data.name === 'Earth');
    if (earthObj) {
        let moonPosition = calculatePosition(moonObj.data, time); // Calculate moon's orbit
        moonMesh.position.set(
            earthObj.mesh.position.x + moonPosition.x, // Offset by Earth's position
            earthObj.mesh.position.y + moonPosition.y,
            earthObj.mesh.position.z + moonPosition.z
        );
    }
    animateAsteroids();
    // Update the position of Saturn's rings relative to Saturn
    let saturnObj = planetObjects.find(p => p.data.name === 'Saturn');
    if (saturnObj) {
        saturnRings.position.set(saturnObj.mesh.position.x, saturnObj.mesh.position.y, saturnObj.mesh.position.z);
    }

    controls.update();
    renderer.render(scene, camera);
}


animate();


// Handle window resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Toggle planet visibility
document.getElementById('togglePlanets').addEventListener('change', (e) => {
    planetObjects.forEach(planet => planet.mesh.visible = e.target.checked);
    moonMesh.visible = e.target.checked;
    
    saturnRings.visible = e.target.checked;
});