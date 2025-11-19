import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GUI from 'lil-gui';
import { World } from './core/physics/World';
import { Body } from './core/physics/Body';
import { i18n, languageNames, LocaleKey } from './core/I18n';

// --- DOM Elements ---
const statsElement = document.getElementById('stats-card');
const musicBtn = document.getElementById('music-btn');
const docBtn = document.getElementById('doc-btn');
const langBtn = document.getElementById('lang-btn');
const langDropdown = document.getElementById('lang-dropdown');
const docsModal = document.getElementById('docs-modal');
const closeBtn = document.getElementById('close-btn');
const isMobile = window.innerWidth < 768;

// --- Configuration ---
const CONFIG = {
  particleCount: isMobile ? 150 : 500, 
  particleLimit: 2000, 
  spawnRadius: 400,
  timeScale: 1.0,
  paused: false,
  G: 1.0,
  theta: 0.5,
  useBarnesHut: true,
  trailLength: isMobile ? 40 : 100, 
  showTrails: true,
  enablePan: true,
  cameraTarget: 'Center',
  addCount: 1,
  addMass: 100
};

// --- Globals ---
let selectedBody: Body | null = null;
let gui: GUI | null = null;
let targetGUIController: any = null;

// --- Name Generator ---
const STAR_PREFIXES = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Kepler', 'Proxima', 'Sirius', 'Vega', 'Rigel', 'Deneb'];
const STAR_SUFFIXES = ['Centauri', 'Eridani', 'Majoris', 'Cygni', 'Lyrae', 'Prime', 'Sol', 'X', 'Z', 'Nova', 'Draconis'];

function generateStarName(id: number): string {
    const p = STAR_PREFIXES[Math.floor(Math.random() * STAR_PREFIXES.length)];
    const s = STAR_SUFFIXES[Math.floor(Math.random() * STAR_SUFFIXES.length)];
    return `${p} ${s} ${id}`;
}

// --- Audio Engine ---
class SpaceSynth {
    ctx: AudioContext | null = null;
    masterGain: GainNode | null = null;
    bgmGain: GainNode | null = null;
    isPlaying: boolean = false;
    timerID: number | null = null;

    scale = [130.81, 146.83, 164.81, 196.00, 220.00, 261.63, 293.66, 329.63, 392.00, 440.00];

    init() {
        if (this.ctx) return;
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        this.ctx = new AudioContext();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.5;
        this.masterGain.connect(this.ctx.destination);

        this.bgmGain = this.ctx.createGain();
        this.bgmGain.gain.value = 0.4;
        this.bgmGain.connect(this.masterGain);
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 800; 
        this.bgmGain.disconnect();
        this.bgmGain.connect(filter);
        filter.connect(this.masterGain);
    }

    async toggle() {
        if (!this.ctx) this.init();
        if (!this.ctx) return false;
        if (this.ctx.state === 'suspended') await this.ctx.resume();
        this.isPlaying = !this.isPlaying;
        if (this.isPlaying) this.scheduleNextNote();
        else if (this.timerID) clearTimeout(this.timerID);
        return this.isPlaying;
    }

    scheduleNextNote() {
        if (!this.isPlaying || !this.ctx || !this.bgmGain) return;
        const freq = this.scale[Math.floor(Math.random() * this.scale.length)];
        const duration = 3.0 + Math.random() * 3.0;
        const time = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.connect(this.bgmGain);
        osc.connect(gain);
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.15, time + 1.0); 
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration); 
        osc.start(time);
        osc.stop(time + duration);
        const nextDelay = (2.0 + Math.random() * 2.0) * 1000; 
        this.timerID = window.setTimeout(() => this.scheduleNextNote(), nextDelay);
    }
}
const synth = new SpaceSynth();

// --- Scene Setup ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 5, 50000); 
camera.position.set(0, 400, 600);

const renderer = new THREE.WebGLRenderer({ 
    antialias: true,
    powerPreference: "high-performance",
    logarithmicDepthBuffer: true 
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enablePan = CONFIG.enablePan;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.2;

const world = new World();
world.G = CONFIG.G;

// --- Visuals ---
const bodyMeshMap = new Map<Body, THREE.Mesh>();
const bodyTrailMap = new Map<Body, THREE.Line>();

const sphereGeometry = new THREE.SphereGeometry(1, 16, 16);
const selectionGeo = new THREE.RingGeometry(1.2, 1.4, 32);
const selectionMat = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
const selectionMesh = new THREE.Mesh(selectionGeo, selectionMat);
selectionMesh.visible = false;
selectionMesh.rotation.x = -Math.PI / 2; 
scene.add(selectionMesh);

const canvas = document.createElement('canvas');
canvas.width = 64; canvas.height = 64;
const ctx = canvas.getContext('2d');
if(ctx) {
    const grad = ctx.createRadialGradient(32,32,0,32,32,32);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
    grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0,0,64,64);
}
const starTexture = new THREE.CanvasTexture(canvas);
const trailsGroup = new THREE.Group();
scene.add(trailsGroup);

function createBodyVisual(body: Body, isStar: boolean = false) {
    const material = new THREE.MeshBasicMaterial({ 
        color: body.color, 
        transparent: isStar, 
        blending: isStar ? THREE.AdditiveBlending : THREE.NormalBlending
    });

    const mesh = new THREE.Mesh(sphereGeometry, material);
    mesh.position.copy(body.position);
    mesh.scale.setScalar(body.radius);
    
    mesh.userData.body = body;
    
    if (isStar) {
        const spriteMat = new THREE.SpriteMaterial({ 
            map: starTexture, 
            color: body.color, 
            transparent: true, 
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const sprite = new THREE.Sprite(spriteMat);
        sprite.scale.set(body.radius * 12, body.radius * 12, 1); 
        mesh.add(sprite);
    }
    
    scene.add(mesh);
    bodyMeshMap.set(body, mesh);

    if (CONFIG.showTrails) {
        const points = new Array(CONFIG.trailLength).fill(body.position.clone());
        const trailGeo = new THREE.BufferGeometry().setFromPoints(points);
        const trailMat = new THREE.LineBasicMaterial({ 
            color: body.color, 
            transparent: true, 
            opacity: isStar ? 0.5 : 0.2,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });
        const trail = new THREE.Line(trailGeo, trailMat);
        trail.frustumCulled = false;
        trailsGroup.add(trail);
        bodyTrailMap.set(body, trail);
    }
}

function clearAndSetupScene() {
    for (const mesh of bodyMeshMap.values()) {
        scene.remove(mesh);
        if (mesh.children.length > 0) mesh.remove(mesh.children[0]); 
        (mesh.material as THREE.Material).dispose();
        mesh.geometry.dispose();
    }
    bodyMeshMap.clear();
    
    for (const trail of bodyTrailMap.values()) {
        trailsGroup.remove(trail);
        trail.geometry.dispose();
        (trail.material as THREE.Material).dispose();
    }
    bodyTrailMap.clear();

    for(const body of world.bodies) {
        createBodyVisual(body, body.mass > 100); 
    }
}

// --- Interaction Logic ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function selectBody(body: Body | null) {
    selectedBody = body;
    if (body) {
        CONFIG.cameraTarget = body.id.toString(); 
        // Force GUI update
        if (targetGUIController) targetGUIController.updateDisplay();
        selectionMesh.visible = true;
        selectionMesh.scale.setScalar(body.radius * 1.5);
    } else {
        selectionMesh.visible = false;
        CONFIG.cameraTarget = 'Center';
        if (targetGUIController) targetGUIController.updateDisplay();
    }
}

function onMouseClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    // Prevent selecting when clicking on UI elements
    if (target.closest('.lil-gui') || target.closest('#ui-layer') || target.closest('#lang-dropdown')) return;

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(Array.from(bodyMeshMap.values()));

    if (intersects.length > 0) {
        const obj = intersects[0].object;
        const body = obj.userData.body as Body;
        if (body) {
            selectBody(body);
        }
    }
}
window.addEventListener('click', onMouseClick);

// --- GUI Logic ---
function updateTargetOptions() {
    if(targetGUIController) {
        const options: Record<string, string> = {};
        options[i18n.get('track_center')] = 'Center';
        
        const sortedBodies = [...world.bodies].sort((a,b) => b.mass - a.mass).slice(0, 15);
        sortedBodies.forEach(b => {
            options[`${b.name} (${Math.round(b.mass)})`] = b.id.toString();
        });
        
        // Ensure selected body is in the list
        if (selectedBody && !sortedBodies.includes(selectedBody)) {
             options[`${selectedBody.name} (${Math.round(selectedBody.mass)})`] = selectedBody.id.toString();
        }

        targetGUIController.options(options);
    }
}

function updateDocsContent() {
    const contentEl = document.querySelector('#docs-content');
    const htmlContent = (i18n.data as any).docs_content;
    if (contentEl && htmlContent) {
        contentEl.innerHTML = htmlContent;
    }
}

// --- Scenarios ---
let currentScenario = 'galaxy';

function addRandomStars() {
    for(let i=0; i<CONFIG.addCount; i++) {
        const r = CONFIG.spawnRadius * Math.sqrt(Math.random());
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.sin(phi) * Math.sin(theta);
        const z = r * Math.cos(phi);
        
        const vScale = 2.0;
        const vx = (Math.random() - 0.5) * vScale;
        const vy = (Math.random() - 0.5) * vScale;
        const vz = (Math.random() - 0.5) * vScale;

        const body = new Body(x, y, z, CONFIG.addMass, Math.pow(CONFIG.addMass, 1/3) * 0.5, Math.random() * 0xffffff);
        body.velocity.set(vx, vy, vz);
        world.addBody(body);
        createBodyVisual(body, CONFIG.addMass > 100);
    }
    updateTargetOptions();
}

function initGalaxy() {
    currentScenario = 'galaxy';
    world.clear();
    world.timeStep = 0.1; 
    world.G = CONFIG.G;
    
    const center = new Body(0, 0, 0, 20000, 8, 0xffaa00, "Sagittarius A*");
    world.addBody(center);
    
    const count = Math.min(CONFIG.particleCount, CONFIG.particleLimit);
    const arms = 3;
    const armSpread = 0.5;
    
    for (let i = 0; i < count; i++) {
        const dist = CONFIG.spawnRadius * Math.sqrt(Math.random()) * (0.1 + 0.9); 
        const spiralAngle = (dist / CONFIG.spawnRadius) * Math.PI * 3;
        const armAngle = (Math.floor(Math.random() * arms) / arms) * Math.PI * 2;
        const randomOffset = (Math.random() - 0.5) * armSpread;
        const angle = spiralAngle + armAngle + randomOffset;
        const x = Math.cos(angle) * dist;
        const z = Math.sin(angle) * dist;
        const y = (Math.random() - 0.5) * (dist * 0.1);
        const vel = Math.sqrt(world.G * center.mass / dist);
        const body = new Body(x, y, z, Math.random() * 2 + 0.5, Math.random() * 0.5 + 0.2);
        body.velocity.set(-Math.sin(angle) * vel, 0, Math.cos(angle) * vel);
        const distRatio = dist / CONFIG.spawnRadius;
        const hue = 0.1 + (0.6 * distRatio);
        body.color = new THREE.Color().setHSL(hue, 0.8, 0.6).getHex();
        world.addBody(body);
    }
    clearAndSetupScene(); 
    updateTargetOptions();
    controls.autoRotateSpeed = 0.2;
}

function initBinary() {
    currentScenario = 'binary';
    world.clear();
    world.timeStep = 0.05;
    world.G = CONFIG.G;
    
    const mass = 5000;
    const dist = 150 + (Math.random() - 0.5) * 50; 
    const v = Math.sqrt(world.G * mass / (4 * dist)); 
    
    const s1 = new Body(-dist, 0, 0, mass, 6, 0xff5555, "Alpha Primary"); 
    s1.velocity.set(0, (Math.random()-0.5)*v*0.1, v);
    
    const s2 = new Body(dist, 0, 0, mass, 5, 0x5555ff, "Beta Companion"); 
    s2.velocity.set(0, (Math.random()-0.5)*v*0.1, -v);
    
    world.addBody(s1); world.addBody(s2);
    
    const debrisCount = Math.min(CONFIG.particleCount, CONFIG.particleLimit) * 0.6;
    for(let i=0; i<debrisCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = dist * 2.5 + Math.random() * 300; 
        const vOrb = Math.sqrt(world.G * (2*mass) / r); 
        const p = new Body(Math.cos(angle)*r, (Math.random()-0.5)*5, Math.sin(angle)*r, 1, 0.5);
        p.velocity.set(-Math.sin(angle)*vOrb + (Math.random()-0.5)*vOrb*0.1, (Math.random()-0.5)*vOrb*0.1, Math.cos(angle)*vOrb + (Math.random()-0.5)*vOrb*0.1);
        p.color = 0xeeeeee;
        world.addBody(p);
    }
    clearAndSetupScene();
    updateTargetOptions();
    controls.autoRotateSpeed = 1.0;
}

function initThreeBody() {
    currentScenario = 'threebody';
    world.clear();
    world.timeStep = 0.02;
    world.G = CONFIG.G;
    
    const mInner = 3000;
    const dInner = 100 + (Math.random() - 0.5) * 20; 
    const vInner = Math.sqrt(world.G * mInner / (4 * dInner));
    
    const s1 = new Body(-dInner, 0, 0, mInner, 5, 0xffcc00, "Sun A");
    s1.velocity.set(0, 0, vInner);
    const s2 = new Body(dInner, 0, 0, mInner, 5, 0xffcc00, "Sun B");
    s2.velocity.set(0, 0, -vInner);
    
    const mOuter = 1000;
    const dOuter = 400 + (Math.random() - 0.5) * 50; 
    const vOuter = Math.sqrt(world.G * (2*mInner) / dOuter);
    
    const s3 = new Body(0, 0, dOuter, mOuter, 4, 0x00ccff, "Proxima C");
    s3.velocity.set(vOuter, 0, 0);
    
    world.addBody(s1); world.addBody(s2); world.addBody(s3); 
    clearAndSetupScene();
    updateTargetOptions();
    controls.autoRotateSpeed = 1.0;
}

// --- GUI Construction ---
function buildGUI() {
    if (gui) gui.destroy();
    gui = new GUI({ title: i18n.get('title') });
    if (isMobile) gui.close();

    const ctrlFolder = gui.addFolder(i18n.get('folder_control'));
    ctrlFolder.add(CONFIG, 'timeScale', 0.0, 3.0).name(i18n.get('time_speed'));
    ctrlFolder.add(CONFIG, 'paused').name(i18n.get('pause'));
    ctrlFolder.add(CONFIG, 'G', 0.1, 10.0, 0.01).name(i18n.get('gravity')).onChange((v: number) => { world.G = v; });
    ctrlFolder.add(CONFIG, 'particleCount', 100, 2000, 100).name(i18n.get('base_count')).onFinishChange(() => {
        if(currentScenario === 'galaxy') initGalaxy();
        else if(currentScenario === 'binary') initBinary();
        else if(currentScenario === 'threebody') initThreeBody();
    });
    ctrlFolder.add(CONFIG, 'showTrails').name(i18n.get('show_trails')).onChange(() => clearAndSetupScene());

    const camFolder = gui.addFolder(i18n.get('folder_camera'));
    camFolder.add(CONFIG, 'enablePan').name(i18n.get('enable_pan')).onChange((v: boolean) => { controls.enablePan = v; });
    
    const opts: Record<string, string> = {};
    opts[i18n.get('track_center')] = 'Center';
    
    targetGUIController = camFolder.add(CONFIG, 'cameraTarget', opts).name(i18n.get('track_object'))
        .listen() 
        .onChange((v: string) => {
            if (v === 'Center') {
                selectedBody = null;
                selectionMesh.visible = false;
            } else {
                const id = parseInt(v);
                const body = world.bodies.find(b => b.id === id);
                if (body) selectBody(body);
            }
        });

    const sandboxFolder = gui.addFolder(i18n.get('folder_sandbox'));
    sandboxFolder.add(CONFIG, 'addCount', 1, 50, 1).name(i18n.get('add_amount'));
    sandboxFolder.add(CONFIG, 'addMass', 10, 10000, 10).name(i18n.get('mass_per_star'));
    sandboxFolder.add({ add: addRandomStars }, 'add').name(i18n.get('btn_add_stars'));

    const sceneFolder = gui.addFolder(i18n.get('folder_scenarios'));
    const funcs = {
        [i18n.get('scene_galaxy')]: initGalaxy,
        [i18n.get('scene_binary')]: initBinary,
        [i18n.get('scene_threebody')]: initThreeBody
    };
    sceneFolder.add(funcs, i18n.get('scene_galaxy'));
    sceneFolder.add(funcs, i18n.get('scene_binary'));
    sceneFolder.add(funcs, i18n.get('scene_threebody'));
}

// --- Event Listeners ---
if (langBtn && langDropdown) {
    Object.entries(languageNames).forEach(([code, name]) => {
        const item = document.createElement('div');
        item.className = 'lang-item';
        item.textContent = name;
        item.onclick = () => {
            i18n.setLocale(code as LocaleKey);
            langDropdown.classList.remove('show');
        };
        langDropdown.appendChild(item);
    });
    langBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        langDropdown.classList.toggle('show');
    });
    window.addEventListener('click', () => {
        langDropdown.classList.remove('show');
    });
}

if (musicBtn) {
    musicBtn.addEventListener('click', async () => {
        musicBtn.style.transform = "scale(0.9)";
        setTimeout(() => musicBtn.style.transform = "scale(1)", 100);
        try {
            const isPlaying = await synth.toggle();
            musicBtn.textContent = isPlaying ? '⏸' : '🎵';
            musicBtn.style.background = isPlaying ? 'rgba(10, 132, 255, 0.4)' : 'var(--glass-bg)';
        } catch (e) {}
    });
}

if (docBtn && docsModal && closeBtn) {
    docBtn.addEventListener('click', () => {
        docsModal.classList.add('open');
    });
    closeBtn.addEventListener('click', () => {
        docsModal.classList.remove('open');
    });
}

// Initialize
buildGUI();
updateDocsContent();
i18n.onChange(() => {
    buildGUI();
    updateTargetOptions(); // Re-populate list as labels might change or ctrl is recreated
    updateDocsContent();
});

// Start
initGalaxy();

let lastTime = 0;
function animate(time: number) {
    requestAnimationFrame(animate);
    const delta = (time - lastTime) / 1000;
    lastTime = time;

    if (selectedBody) {
        const targetPos = new THREE.Vector3(selectedBody.position.x, selectedBody.position.y, selectedBody.position.z);
        controls.target.lerp(targetPos, 0.1);
        selectionMesh.position.copy(targetPos);
        selectionMesh.lookAt(camera.position); 
    }

    controls.update();

    if (!CONFIG.paused && CONFIG.timeScale > 0) {
        const steps = Math.ceil(CONFIG.timeScale); 
        const dt = world.timeStep * (CONFIG.timeScale / steps); 
        const originalDt = world.timeStep;
        world.timeStep = dt;
        
        for(let i=0; i<steps; i++) {
            world.step();
        }
        world.timeStep = originalDt;
        
        const bodiesToRemove: Body[] = [];
        for(const [body, mesh] of bodyMeshMap.entries()) {
            if(!world.bodies.includes(body)) {
                bodiesToRemove.push(body);
                scene.remove(mesh);
                if (mesh.children.length > 0) mesh.remove(mesh.children[0]); 
                (mesh.material as THREE.Material).dispose();
                mesh.geometry.dispose();
                const trail = bodyTrailMap.get(body);
                if(trail) {
                    trailsGroup.remove(trail);
                    trail.geometry.dispose();
                    (trail.material as THREE.Material).dispose();
                    bodyTrailMap.delete(body);
                }
                if (selectedBody === body) {
                    selectBody(null);
                }
            }
        }
        bodiesToRemove.forEach(body => bodyMeshMap.delete(body));

        for(const body of world.bodies) {
            if(!bodyMeshMap.has(body)) {
                if (body.name.startsWith('Star-')) body.name = generateStarName(body.id);
                createBodyVisual(body, body.mass > 100); 
            }
            const mesh = bodyMeshMap.get(body);
            if (mesh) {
                mesh.position.copy(body.position);
                mesh.scale.setScalar(body.radius); 
                if (CONFIG.showTrails) {
                    const trail = bodyTrailMap.get(body);
                    if (trail) {
                        const positions = trail.geometry.attributes.position.array as Float32Array;
                        positions.copyWithin(0, 3);
                        const last = (CONFIG.trailLength - 1) * 3;
                        positions[last] = body.position.x;
                        positions[last+1] = body.position.y;
                        positions[last+2] = body.position.z;
                        trail.geometry.attributes.position.needsUpdate = true;
                    }
                }
            }
        }
    }

    renderer.render(scene, camera);

    if(statsElement) {
        const template = i18n.get('stats_format');
        statsElement.textContent = template
            .replace('{count}', world.bodies.length.toString())
            .replace('{G}', world.G.toFixed(2))
            .replace('{fps}', Math.round(1/delta).toString());
    }
}
animate(0);

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
