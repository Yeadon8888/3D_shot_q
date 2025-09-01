// Game variables
let scene, camera, renderer;
let enemies = [];
let bullets = [];
let particles = [];
let username = '';
let score = 0;
let timeLeft = 60;
let gameState = 'start'; // start, playing, ended
let bestScore = 0;
let shootCooldown = 0;
let combo = 0;
let maxCombo = 0;
let comboTimer = 0;
let lastHitTime = 0;
let enemySpawnTimer = 0;
let totalShots = 0;
let hits = 0;

// Movement variables
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let velocity = new THREE.Vector3();
let direction = new THREE.Vector3();
let canJump = false;

// Camera control variables
let euler = new THREE.Euler(0, 0, 0, 'YXZ');
let PI_2 = Math.PI / 2;
let moveSpeed = 5.0;
let mouseSensitivity = 0.002;

// Player collision
let playerHeight = 1.8;
let playerRadius = 0.5;
let playerBounds = new THREE.Box3();

// DOM Elements
const startScreen = document.getElementById('startScreen');
const usernameInput = document.getElementById('usernameInput');
const startButton = document.getElementById('startButton');
const scoreDisplay = document.getElementById('scoreDisplay');
const timerDisplay = document.getElementById('timerDisplay');
const comboDisplay = document.getElementById('comboDisplay');
const crosshair = document.getElementById('crosshair');
const resultsScreen = document.getElementById('resultsScreen');
const finalScore = document.getElementById('finalScore');
const accuracyStat = document.getElementById('accuracyStat');
const targetsStat = document.getElementById('targetsStat');
const comboStat = document.getElementById('comboStat');
const leaderboardBody = document.getElementById('leaderboardBody');
const restartButton = document.getElementById('restartButton');

// Leaderboard data (in a real app, this would be stored on a server)
let leaderboard = [
    { username: 'Player1', score: 500, accuracy: 0.75, timestamp: Date.now() - 10000 },
    { username: 'Player2', score: 450, accuracy: 0.70, timestamp: Date.now() - 20000 },
    { username: 'Player3', score: 400, accuracy: 0.65, timestamp: Date.now() - 30000 },
    { username: 'Player4', score: 350, accuracy: 0.60, timestamp: Date.now() - 40000 },
    { username: 'Player5', score: 300, accuracy: 0.55, timestamp: Date.now() - 50000 }
];

// Initialize the game
function init() {
    // Set up Three.js scene with better visuals
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222244); // Darker blue-gray
    scene.fog = new THREE.Fog(0x222244, 20, 80);  // Extended fog range
    
    // Set up camera with proper FPS settings
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, playerHeight, 5);
    
    // Initialize camera controls
    euler.setFromQuaternion(camera.quaternion);
    
    // Set up renderer with enhanced settings
    renderer = new THREE.WebGLRenderer({ 
        canvas: document.getElementById('gameCanvas'), 
        antialias: true,
        powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap pixel ratio for performance
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    
    // Improved lighting setup
    const ambientLight = new THREE.AmbientLight(0x606060, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 100;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;
    scene.add(directionalLight);
    
    // Add point lights for better scene illumination
    const pointLight1 = new THREE.PointLight(0xffffff, 0.5, 30);
    pointLight1.position.set(10, 10, -10);
    scene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0xffffff, 0.5, 30);
    pointLight2.position.set(-10, 10, -10);
    scene.add(pointLight2);
    
    // Enable shadows
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Add some basic environment
    createEnvironment();
    
    // Event listeners
    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', startGame);
    window.addEventListener('resize', onWindowResize);
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    document.addEventListener('pointerlockchange', onPointerLockChange);
    document.addEventListener('mozpointerlockchange', onPointerLockChange);
    
    // Request pointer lock on canvas click
    renderer.domElement.addEventListener('click', () => {
        if (gameState === 'playing') {
            renderer.domElement.requestPointerLock = renderer.domElement.requestPointerLock || renderer.domElement.mozRequestPointerLock;
            renderer.domElement.requestPointerLock();
        }
    });
    
    // Start animation loop
    animate();
}

// Create enhanced environment with collision boundaries
function createEnvironment() {
    // Ground with shadows
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x444444,
        roughness: 0.7,
        metalness: 0.1
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    
    // Create walls for collision boundaries
    const wallHeight = 5;
    const wallGeometry = new THREE.BoxGeometry(1, wallHeight, 60);
    const wallMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x666666,
        roughness: 0.8,
        metalness: 0.2
    });
    
    // Create boundary walls
    const walls = [
        { x: 25, z: 0, rotY: 0 },    // Right wall
        { x: -25, z: 0, rotY: 0 },   // Left wall
        { x: 0, z: 25, rotY: Math.PI/2 },  // Back wall
        { x: 0, z: -25, rotY: Math.PI/2 }  // Front wall
    ];
    
    walls.forEach(wallPos => {
        const wall = new THREE.Mesh(wallGeometry, wallMaterial);
        wall.position.set(wallPos.x, wallHeight/2, wallPos.z);
        wall.rotation.y = wallPos.rotY;
        wall.castShadow = true;
        wall.receiveShadow = true;
        scene.add(wall);
    });
    
    // Add some decorative structures
    createDecorations();
}

// Add decorative elements to make the scene more interesting
function createDecorations() {
    const decorationMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x888888,
        roughness: 0.6,
        metalness: 0.3
    });
    
    // Add some pillars
    for (let i = 0; i < 8; i++) {
        const pillarGeometry = new THREE.CylinderGeometry(0.8, 0.8, 4, 8);
        const pillar = new THREE.Mesh(pillarGeometry, decorationMaterial);
        
        const angle = (i / 8) * Math.PI * 2;
        pillar.position.x = Math.cos(angle) * 15;
        pillar.position.z = Math.sin(angle) * 15;
        pillar.position.y = 2;
        
        pillar.castShadow = true;
        pillar.receiveShadow = true;
        scene.add(pillar);
    }
}

// Start the game
function startGame() {
    username = usernameInput.value.trim();
    
    // Validate username
    if (username.length < 2 || username.length > 12) {
        alert('Username must be between 2 and 12 characters');
        return;
    }
    
    // Reset game state
    score = 0;
    timeLeft = 60;
    gameState = 'playing';
    enemies = [];
    bullets = [];
    particles = [];
    combo = 0;
    maxCombo = 0;
    comboTimer = 0;
    lastHitTime = 0;
    enemySpawnTimer = 0;
    totalShots = 0;
    hits = 0;
    
    // Reset movement
    moveForward = false;
    moveBackward = false;
    moveLeft = false;
    moveRight = false;
    velocity.set(0, 0, 0);
    canJump = false;
    
    // Reset camera rotation
    euler.set(0, 0, 0, 'YXZ');
    camera.quaternion.setFromEuler(euler);
    
    // Update UI
    startScreen.style.display = 'none';
    resultsScreen.style.display = 'none';
    scoreDisplay.textContent = 'Score: 0';
    timerDisplay.textContent = 'Time: 60';
    comboDisplay.textContent = '';
    
    // Position camera
    camera.position.set(0, playerHeight, 5);
    
    // Spawn initial enemies
    for (let i = 0; i < 3; i++) {
        spawnEnemy();
    }
}

// Spawn a new enemy
function spawnEnemy() {
    if (enemies.length >= 15) return; // Max enemies limit
    
    // Enhanced enemy visuals with better materials
    const geometries = [
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.SphereGeometry(0.7, 16, 16),
        new THREE.ConeGeometry(0.6, 1.2, 8),
        new THREE.OctahedronGeometry(0.8)
    ];
    
    const materials = [
        new THREE.MeshStandardMaterial({ 
            color: 0xff3333, 
            emissive: 0x330000,
            roughness: 0.4,
            metalness: 0.6
        }), // Enhanced Red
        new THREE.MeshStandardMaterial({ 
            color: 0x3333ff, 
            emissive: 0x000033,
            roughness: 0.4,
            metalness: 0.6
        }), // Enhanced Blue
        new THREE.MeshStandardMaterial({ 
            color: 0x33ff33, 
            emissive: 0x003300,
            roughness: 0.4,
            metalness: 0.6
        }), // Enhanced Green
        new THREE.MeshStandardMaterial({ 
            color: 0xffff33, 
            emissive: 0x333300,
            roughness: 0.4,
            metalness: 0.6
        })  // Enhanced Yellow
    ];
    
    const geometry = geometries[Math.floor(Math.random() * geometries.length)];
    const material = materials[Math.floor(Math.random() * materials.length)];
    
    const enemy = new THREE.Mesh(geometry, material);
    enemy.castShadow = true;
    enemy.receiveShadow = true;
    
    // Position enemy randomly in a limited area, avoiding pillars
    let validPosition = false;
    let attempts = 0;
    
    while (!validPosition && attempts < 20) {
        enemy.position.x = (Math.random() - 0.5) * 40;
        enemy.position.y = 1;
        enemy.position.z = -(Math.random() * 30 + 5);
        
        // Check distance to pillars
        validPosition = true;
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const pillarX = Math.cos(angle) * 15;
            const pillarZ = Math.sin(angle) * 15;
            
            const dist = Math.sqrt(
                Math.pow(enemy.position.x - pillarX, 2) + 
                Math.pow(enemy.position.z - pillarZ, 2)
            );
            
            if (dist < 3) {
                validPosition = false;
                break;
            }
        }
        attempts++;
    }
    
    // If couldn't find valid position, place in center area
    if (!validPosition) {
        enemy.position.set(0, 1, -10);
    }
    
    // Store additional properties
    enemy.health = 1;
    enemy.speed = new THREE.Vector3(
        (Math.random() - 0.5) * 0.03,
        0,
        (Math.random() - 0.5) * 0.03
    );
    enemy.rotationSpeed = new THREE.Vector3(
        Math.random() * 0.01,
        Math.random() * 0.02,
        Math.random() * 0.01
    );
    
    scene.add(enemy);
    enemies.push(enemy);
}

// Handle keyboard input
function onKeyDown(event) {
    switch (event.keyCode) {
        case 38: // up
        case 87: // w
            moveForward = true;
            break;
        case 37: // left
        case 65: // a
            moveLeft = true;
            break;
        case 40: // down
        case 83: // s
            moveBackward = true;
            break;
        case 39: // right
        case 68: // d
            moveRight = true;
            break;
        case 32: // space
            event.preventDefault();
            if (canJump) {
                velocity.y = 8; // Jump force
                canJump = false;
            }
            break;
    }
}

function onKeyUp(event) {
    switch (event.keyCode) {
        case 38: // up
        case 87: // w
            moveForward = false;
            break;
        case 37: // left
        case 65: // a
            moveLeft = false;
            break;
        case 40: // down
        case 83: // s
            moveBackward = false;
            break;
        case 39: // right
        case 68: // d
            moveRight = false;
            break;
    }
}

// Improved mouse movement for FPS controls
function onMouseMove(event) {
    if (gameState !== 'playing') return;
    if (document.pointerLockElement !== renderer.domElement) return;
    
    const movementX = event.movementX || event.mozMovementX || 0;
    const movementY = event.movementY || event.mozMovementY || 0;
    
    euler.setFromQuaternion(camera.quaternion);
    
    euler.y -= movementX * mouseSensitivity;
    euler.x -= movementY * mouseSensitivity;
    
    // Clamp vertical rotation
    euler.x = Math.max(-PI_2, Math.min(PI_2, euler.x));
    
    camera.quaternion.setFromEuler(euler);
}

// Handle pointer lock change
function onPointerLockChange() {
    if (document.pointerLockElement === renderer.domElement || 
        document.mozPointerLockElement === renderer.domElement) {
        // Pointer is locked
    } else {
        // Pointer was unlocked, pause game or show menu
    }
}

// Handle mouse click for shooting
function onMouseDown(event) {
    if (gameState !== 'playing') return;
    if (event.button !== 0) return; // Only left mouse button
    
    // Check shoot cooldown
    if (shootCooldown > 0) return;
    
    shootCooldown = 12; // 0.2 seconds at 60fps
    totalShots++;
    
    // Enhanced shooting with visual feedback
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    
    // Create muzzle flash effect
    createMuzzleFlash();
    
    // Check for intersections with enemies
    const intersects = raycaster.intersectObjects(enemies);
    
    if (intersects.length > 0) {
        // Hit an enemy
        const enemy = intersects[0].object;
        hits++;
        destroyEnemy(enemy);
        
        // Calculate score with combo multiplier
        combo++;
        if (combo > maxCombo) maxCombo = combo;
        lastHitTime = Date.now();
        
        let multiplier = 1;
        if (combo >= 8) {
            multiplier = 2;
        } else if (combo >= 5) {
            multiplier = 1.5;
        } else if (combo >= 2) {
            multiplier = 1.2;
        }
        
        // Base score increases with time (difficulty)
        const baseScore = 10 + Math.floor((60 - timeLeft) / 10) * 5;
        const points = Math.floor(baseScore * multiplier);
        score += points;
        
        // Update UI
        scoreDisplay.textContent = `Score: ${score}`;
        comboDisplay.textContent = `Combo x${multiplier.toFixed(1)} (${combo})`;
        comboDisplay.style.color = '#ff5555';
        
        // Create hit effect
        createHitEffect(intersects[0].point);
        
        // Enhanced hit feedback
        crosshair.style.borderColor = '#00ff00';
        crosshair.style.transform = 'translate(-50%, -50%) scale(1.2)';
        setTimeout(() => {
            crosshair.style.borderColor = '#ffffff';
            crosshair.style.transform = 'translate(-50%, -50%) scale(1.0)';
        }, 150);
    } else {
        // Missed shot - visual feedback
        combo = 0;
        comboDisplay.textContent = '';
        
        crosshair.style.borderColor = '#ff4444';
        setTimeout(() => {
            crosshair.style.borderColor = '#ffffff';
        }, 200);
    }
}

// Destroy an enemy
function destroyEnemy(enemy) {
    // Remove from scene
    scene.remove(enemy);
    
    // Remove from enemies array
    const index = enemies.indexOf(enemy);
    if (index !== -1) {
        enemies.splice(index, 1);
    }
    
    // Create explosion effect
    createExplosion(enemy.position);
}

// Create hit effect
function createHitEffect(position) {
    // Show floating score
    const scoreElement = document.createElement('div');
    scoreElement.textContent = `+${Math.floor(10 + (60 - timeLeft) / 10) * 5}`;
    scoreElement.style.position = 'absolute';
    scoreElement.style.left = `${Math.random() * 50 + 25}%`;
    scoreElement.style.top = `${Math.random() * 50 + 25}%`;
    scoreElement.style.color = '#ffff00';
    scoreElement.style.fontSize = '20px';
    scoreElement.style.pointerEvents = 'none';
    scoreElement.style.zIndex = '6';
    scoreElement.style.transition = 'opacity 1s';
    document.getElementById('uiLayer').appendChild(scoreElement);
    
    // Animate and remove
    setTimeout(() => {
        scoreElement.style.opacity = '0';
        setTimeout(() => {
            if (scoreElement.parentNode) {
                scoreElement.parentNode.removeChild(scoreElement);
            }
        }, 1000);
    }, 100);
}

// Enhanced explosion effect
function createExplosion(position) {
    for (let i = 0; i < 20; i++) {
        const particleGeometry = new THREE.SphereGeometry(0.05 + Math.random() * 0.1, 6, 6);
        const particleMaterial = new THREE.MeshBasicMaterial({ 
            color: new THREE.Color().setHSL(Math.random() * 0.1, 1, 0.5 + Math.random() * 0.5),
            transparent: true
        });
        const particle = new THREE.Mesh(particleGeometry, particleMaterial);
        
        particle.position.copy(position);
        particle.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 0.8,
            Math.random() * 0.8,
            (Math.random() - 0.5) * 0.8
        );
        particle.angularVelocity = new THREE.Vector3(
            (Math.random() - 0.5) * 0.2,
            (Math.random() - 0.5) * 0.2,
            (Math.random() - 0.5) * 0.2
        );
        
        scene.add(particle);
        particles.push({
            mesh: particle,
            life: 40 + Math.random() * 20,
            maxLife: 40 + Math.random() * 20
        });
    }
}

// Create muzzle flash effect
function createMuzzleFlash() {
    const flash = document.createElement('div');
    flash.style.position = 'absolute';
    flash.style.top = '50%';
    flash.style.left = '50%';
    flash.style.transform = 'translate(-50%, -50%)';
    flash.style.width = '40px';
    flash.style.height = '40px';
    flash.style.background = 'radial-gradient(circle, rgba(255,255,100,0.8) 0%, rgba(255,100,0,0.4) 50%, transparent 100%)';
    flash.style.borderRadius = '50%';
    flash.style.pointerEvents = 'none';
    flash.style.zIndex = '7';
    document.getElementById('uiLayer').appendChild(flash);
    
    setTimeout(() => {
        if (flash.parentNode) {
            flash.parentNode.removeChild(flash);
        }
    }, 100);
}

// Enhanced particle system
function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life--;
        
        if (p.life <= 0) {
            scene.remove(p.mesh);
            particles.splice(i, 1);
        } else {
            // Update position with gravity
            p.mesh.velocity.y -= 0.02; // Gravity effect
            p.mesh.position.add(p.mesh.velocity);
            
            // Update rotation
            if (p.mesh.angularVelocity) {
                p.mesh.rotation.x += p.mesh.angularVelocity.x;
                p.mesh.rotation.y += p.mesh.angularVelocity.y;
                p.mesh.rotation.z += p.mesh.angularVelocity.z;
            }
            
            // Update opacity and scale
            const lifeRatio = p.life / p.maxLife;
            p.mesh.material.opacity = lifeRatio;
            p.mesh.scale.setScalar(1 + (1 - lifeRatio) * 0.5);
        }
    }
}

// End the game
function endGame() {
    gameState = 'ended';
    
    // Calculate stats
    const accuracy = totalShots > 0 ? (hits / totalShots).toFixed(2) : 0;
    
    // Update results screen
    finalScore.textContent = `Score: ${score}`;
    accuracyStat.textContent = `${(accuracy * 100).toFixed(0)}%`;
    targetsStat.textContent = hits;
    comboStat.textContent = maxCombo;
    
    // Update leaderboard
    leaderboard.push({
        username: username,
        score: score,
        accuracy: parseFloat(accuracy),
        timestamp: Date.now()
    });
    
    // Sort leaderboard
    leaderboard.sort((a, b) => b.score - a.score);
    
    // Keep only top 10
    if (leaderboard.length > 10) {
        leaderboard = leaderboard.slice(0, 10);
    }
    
    // Update leaderboard display
    leaderboardBody.innerHTML = '';
    leaderboard.forEach((entry, index) => {
        const row = document.createElement('tr');
        if (entry.username === username) {
            row.classList.add('highlight');
        }
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${entry.username}</td>
            <td>${entry.score}</td>
            <td>${(entry.accuracy * 100).toFixed(0)}%</td>
        `;
        
        leaderboardBody.appendChild(row);
    });
    
    // Show results screen
    resultsScreen.style.display = 'flex';
    
    // Exit pointer lock
    document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock;
    document.exitPointerLock();
}

// Handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    if (gameState === 'playing') {
        // Update game logic
        updateGame();
    }
    
    // Render scene
    renderer.render(scene, camera);
}

// Update game state
function updateGame() {
    // Update cooldowns
    if (shootCooldown > 0) {
        shootCooldown--;
    }
    
    // Camera rotation is now handled in onMouseMove, no smoothing needed for FPS controls
    
    // Update player movement
    updateMovement();
    
    // Update combo timer
    if (combo > 0 && Date.now() - lastHitTime > 3000) {
        combo = 0;
        comboDisplay.textContent = '';
    }
    
    // Update combo display color
    if (combo > 0) {
        const timeSinceLastHit = Date.now() - lastHitTime;
        if (timeSinceLastHit > 2000) {
            comboDisplay.style.color = '#ff9999';
        } else if (timeSinceLastHit > 1000) {
            comboDisplay.style.color = '#ffcccc';
        }
    }
    
    // Move enemies
    enemies.forEach(enemy => {
        // Apply movement
        enemy.position.add(enemy.speed);
        
        // Rotate enemy
        enemy.rotation.x += enemy.rotationSpeed.x;
        enemy.rotation.y += enemy.rotationSpeed.y;
        enemy.rotation.z += enemy.rotationSpeed.z;
        
        // Enhanced enemy boundary system with wall collision
        const boundary = 22;
        if (enemy.position.x > boundary || enemy.position.x < -boundary) {
            enemy.speed.x *= -1;
            enemy.position.x = Math.max(-boundary, Math.min(boundary, enemy.position.x));
        }
        
        if (enemy.position.z > 22 || enemy.position.z < -boundary) {
            enemy.speed.z *= -1;
            enemy.position.z = Math.max(-boundary, Math.min(22, enemy.position.z));
        }
        
        // Pillar collision for enemies
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const pillarX = Math.cos(angle) * 15;
            const pillarZ = Math.sin(angle) * 15;
            
            const distToPillar = Math.sqrt(
                Math.pow(enemy.position.x - pillarX, 2) + 
                Math.pow(enemy.position.z - pillarZ, 2)
            );
            
            if (distToPillar < 1.5) {
                // Bounce off pillar
                const dirX = (enemy.position.x - pillarX) / distToPillar;
                const dirZ = (enemy.position.z - pillarZ) / distToPillar;
                enemy.speed.x = dirX * 0.03;
                enemy.speed.z = dirZ * 0.03;
                
                enemy.position.x = pillarX + dirX * 1.5;
                enemy.position.z = pillarZ + dirZ * 1.5;
                break;
            }
        }
    });
    
    // Spawn enemies periodically
    enemySpawnTimer++;
    if (enemySpawnTimer >= 600) { // Every 10 seconds at 60fps
        enemySpawnTimer = 0;
        // Spawn 2 new enemies
        spawnEnemy();
        spawnEnemy();
    }
    
    // Update particles
    updateParticles();
    
    // Update timer
    timeLeft -= 1/60; // Assuming 60fps
    timerDisplay.textContent = `Time: ${Math.max(0, Math.ceil(timeLeft))}`;
    
    // Check if game should end
    if (timeLeft <= 0) {
        endGame();
    }
}

// Enhanced player movement with proper physics and collision
function updateMovement() {
    const delta = 1/60; // Assume 60fps for consistent movement
    
    // Get camera direction
    direction.set(0, 0, 0);
    
    const forward = new THREE.Vector3();
    const right = new THREE.Vector3();
    
    camera.getWorldDirection(forward);
    forward.y = 0; // Keep movement on horizontal plane
    forward.normalize();
    
    right.crossVectors(forward, camera.up).normalize();
    
    // Calculate desired movement
    if (moveForward) direction.add(forward);
    if (moveBackward) direction.sub(forward);
    if (moveRight) direction.add(right);
    if (moveLeft) direction.sub(right);
    
    if (direction.length() > 0) {
        direction.normalize();
        direction.multiplyScalar(moveSpeed * delta);
        
        // Test new position for collisions
        const newPosition = camera.position.clone();
        newPosition.add(direction);
        
        // Simple boundary collision detection
        const boundary = 23; // Keep player inside walls
        newPosition.x = Math.max(-boundary, Math.min(boundary, newPosition.x));
        newPosition.z = Math.max(-boundary, Math.min(boundary, newPosition.z));
        newPosition.y = playerHeight; // Keep at consistent height
        
        // Check collision with pillars (simple cylinder collision)
        let collision = false;
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const pillarX = Math.cos(angle) * 15;
            const pillarZ = Math.sin(angle) * 15;
            
            const distToPillar = Math.sqrt(
                Math.pow(newPosition.x - pillarX, 2) + 
                Math.pow(newPosition.z - pillarZ, 2)
            );
            
            if (distToPillar < (playerRadius + 0.8)) {
                collision = true;
                break;
            }
        }
        
        if (!collision) {
            camera.position.copy(newPosition);
        }
    }
    
    // Apply gravity and ground collision
    if (camera.position.y > playerHeight) {
        velocity.y -= 9.8 * delta; // Gravity
        camera.position.y += velocity.y * delta;
        
        if (camera.position.y <= playerHeight) {
            camera.position.y = playerHeight;
            velocity.y = 0;
            canJump = true;
        }
    } else {
        canJump = true;
    }
}

// Initialize the game when the page loads
window.onload = init;