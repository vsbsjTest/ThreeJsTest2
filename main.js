// Erforderliche Bibliotheken einbinden
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
// Erzeugung der Szene, Kamera und Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const loadingManager = new THREE.LoadingManager();

const progressbar = document.getElementById('progress-bar');

loadingManager.onProgress = function(url, loaded, total){
  progressbar.value = (loaded/total) * 100;
}
const progressBarContainer = document.querySelector('.progress-bar-container');

loadingManager.onLoad = function() {
  progressBarContainer.style.display = 'none';
}

const hdriTexture = new THREE.TextureLoader().load('/hdri/himmel_1.jpg');

// Erstelle eine Kugelgeometrie für den Hintergrund
const hdriBackground = new THREE.Mesh(
  new THREE.SphereGeometry(500, 60, 40),
  new THREE.MeshBasicMaterial({ map: hdriTexture, side: THREE.BackSide })
);

// Füge den Hintergrund zur Szene hinzu
scene.add(hdriBackground);


// Erzeugung und Positionierung der Lichtquelle
const light = new THREE.DirectionalLight(0xFFAF52, 5.5);
light.position.set(-100, 60, 100  );
//(x, y, z) x=nach rechts, y= nach oben
light.target.position.set(1, 1, 1);
light.castShadow = true;
const helper = new THREE.DirectionalLightHelper(light, 5);
scene.add(helper);

scene.add(light);
scene.add(light.target);

const light2 = new THREE.DirectionalLight(0x4E66F5 , 0.8);
light2.position.set(100, 60, -100  );
//(x, y, z) x=nach rechts, y= nach oben
light2.target.position.set(1, 1, 1);
light2.castShadow = true;
const helper2 = new THREE.DirectionalLightHelper(light, 5);
scene.add(helper2);

scene.add(light2);
scene.add(light2.target);
// Erzeugung des GLTF-Loaders
const loader = new GLTFLoader(loadingManager);


let wegModel;
let innenModel;

// Laden der GLTF-Datei für 'weg.gltf'
loader.load('models/test.gltf', function(gltfWeg) {
  // Hinzufügen der geladenen Szene zur Haupt-Szene
  scene.add(gltfWeg.scene);
  wegModel = gltfWeg.scene;


  // Setze die Transparenz des Modells auf den Anfangswert
  wegModel.traverse(function (child) {
    if (child.isMesh) {
      child.material.transparent = true;
      child.material.opacity = 1;
    }
  });

  // Positionierung des Modells "weg.gltf"
  const wegBox = new THREE.Box3().setFromObject(wegModel);
  const wegCenter = wegBox.getCenter(new THREE.Vector3());
  wegModel.position.copy(wegCenter);
}, undefined, function(error) {
  console.error(error);
});

//loader.load('models/nyftertestinnen.gltf', function(gltfInnen) {
//scene.add(gltfInnen.scene);
//innenModel = gltfInnen.scene;

//const innenBox = new THREE.Box3().setFromObject(innenModel);
//const innenCenter = innenBox.getCenter(new THREE.Vector3());
//innenModel.position.copy(innenCenter);
//}, undefined, function(error) {
//console.error(error);
//});
 
// Positionierung der Kamera
camera.position.set(7, 4.5, 20);

// Erzeugung des OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);

// Funktion für das Rendern der Szene
function animate() {
  hdriBackground.rotation.y += 0.00045;

  // Aktualisiere die Szene und führe die Animationsschleife fort
  renderer.render(scene, camera);
  requestAnimationFrame(animate);

  // Aktualisiere das OrbitControls-Objekt
  controls.update();

  // Berechne die Entfernung zwischen der Kamera und dem Modell "weg.gltf"
  const wegDistance = camera.position.distanceTo(wegModel.position);

  // Passe die Transparenz des Modells "weg.gltf" basierend auf der Entfernung an
  wegModel.traverse(function (child) {
    if (child.isMesh) {
      const wegMaxDistance = 10; // Der maximale Abstand, bei dem das Modell vollständig transparent wird
      const wegMinOpacity = 0; // Die minimale Transparenz, die das Modell haben kann

      // Überprüfe, ob die Entfernung 2 ist, und setze die Transparenz entsprechend
      if (wegDistance < 5 ) {
        child.material.transparent = true;
        child.material.opacity = 0;
      } else {
        // Berechne die neue Transparenz basierend auf der Entfernung
        const wegOpacity = 1 - (wegMaxDistance - (0.75 * wegDistance)) / wegMaxDistance;
        child.material.transparent = true;
        child.material.opacity = Math.max(wegOpacity, wegMinOpacity);
      }
    }
  });

  
  renderer.render(scene, camera);
}
animate();

//directional light dass die farbe #4E66F5 ohne schatten
//ambient aclusion an
//bloom an

//das model mit lichtern zur sonne drehen
//screen spave reflections