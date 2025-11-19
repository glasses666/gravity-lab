// Documentation HTML Templates
const docs_en = `
<h2>1. Project Overview</h2>
<p>GravityLab is a professional-grade, real-time N-Body physics simulation engine designed for the web. It combines high-precision astrophysical calculations with modern WebGL rendering to simulate gravitational interactions between hundreds or thousands of celestial bodies.</p>
<h3>The Challenge</h3>
<p>The "N-Body Problem" has a computational complexity of O(N^2). GravityLab implements the <strong>Barnes-Hut Algorithm</strong> using an Octree data structure to reduce complexity to O(N log N), making real-time simulation feasible in a browser.</p>

<h2>2. Key Features</h2>
<ul>
    <li><strong>🚀 Real-Time WebGL Rendering:</strong> Powered by Three.js with Logarithmic Depth Buffer to prevent Z-fighting artifacts.</li>
    <li><strong>🌳 Spatial Partitioning:</strong> Custom Octree implementation for physics optimization.</li>
    <li><strong>⚙️ Symplectic Integrator:</strong> Uses Semi-Implicit Euler for orbital stability, superior to standard Euler methods.</li>
    <li><strong>🎵 Generative Audio:</strong> Real-time SpaceSynth engine using Web Audio API to generate eternal ambient music.</li>
</ul>

<h2>3. Interactive Controls</h2>
<ul>
    <li><strong>Left Drag:</strong> Rotate View</li>
    <li><strong>Right Drag:</strong> Pan View (Toggle in Camera menu)</li>
    <li><strong>Scroll:</strong> Zoom In/Out</li>
    <li><strong>Click Star:</strong> Select and Track object</li>
</ul>

<h2>4. Sandbox Tools</h2>
<p>Use the GUI panel on the right to be the creator:</p>
<ul>
    <li><strong>Gravity (G):</strong> Adjust the gravitational constant in real-time.</li>
    <li><strong>Add Stars:</strong> Inject random stars into the system to create chaos.</li>
    <li><strong>Time Speed:</strong> Slow down time to observe close encounters.</li>
</ul>
`;

const docs_zh = `
<h2>1. 项目概览</h2>
<p>GravityLab 是一个专业级的实时 N 体物理模拟引擎，专为 Web 平台设计。它结合了高精度的天体物理计算和现代 WebGL 渲染技术，用于模拟数百甚至数千个天体之间的引力相互作用。</p>
<h3>技术挑战</h3>
<p>"N 体问题" 的计算复杂度通常为 O(N^2)。本项目实现了基于八叉树数据结构的 <strong>Barnes-Hut 算法</strong>，将复杂度降低到 O(N log N)，使得在浏览器中进行大规模实时模拟成为可能。</p>

<h2>2. 核心特性</h2>
<ul>
    <li><strong>🚀 实时 WebGL 渲染:</strong> 基于 Three.js，采用对数深度缓冲区（Logarithmic Depth Buffer）消除远距离闪烁。</li>
    <li><strong>🌳 空间划分:</strong> 自定义八叉树（Octree）实现，用于物理加速。</li>
    <li><strong>⚙️ 辛普莱克提克积分器:</strong> 采用半隐式欧拉法，相比标准欧拉法提供卓越的轨道能量稳定性。</li>
    <li><strong>🎵 生成式音频:</strong> 内置 SpaceSynth 引擎，利用 Web Audio API 实时合成空灵的背景音乐。</li>
</ul>

<h2>3. 交互操作</h2>
<ul>
    <li><strong>左键拖拽:</strong> 旋转视角</li>
    <li><strong>右键拖拽:</strong> 平移视角（需在 Camera 菜单开启）</li>
    <li><strong>滚轮:</strong> 缩放</li>
    <li><strong>点击星球:</strong> 选中并自动跟踪目标</li>
</ul>

<h2>4. 沙盒工具</h2>
<p>使用右侧的 GUI 面板扮演造物主：</p>
<ul>
    <li><strong>引力 (G):</strong> 实时调节宇宙引力常数。</li>
    <li><strong>添加恒星:</strong> 向系统中投放随机恒星，制造混沌。</li>
    <li><strong>时间流速:</strong> 减慢时间以观察近距离飞掠。</li>
</ul>
`;

// Base English (Fallback)
const base = {
    title: "GravityLab",
    subtitle: "Interactive Gravity Sandbox",
    initializing: "Initializing...",
    stats_format: "N: {count} | G: {G} | FPS: {fps}",
    folder_control: "Control", folder_camera: "Camera", folder_sandbox: "Sandbox Tools", folder_scenarios: "Scenarios",
    time_speed: "Time Speed", pause: "Pause", gravity: "Gravity (G)", base_count: "Base Count", show_trails: "Show Trails",
    enable_pan: "Enable Pan", track_object: "Track Object", track_center: "Free / Center", track_body: "Star {i} (Mass {mass})", track_custom: "Custom Selection",
    add_amount: "Add Amount", mass_per_star: "Mass per Star", btn_add_stars: "✨ Add Stars",
    scene_galaxy: "Galaxy", scene_binary: "Binary Star", scene_threebody: "Three Body",
    docs_title: "GravityLab Specs", 
    docs_content: docs_en // New field for full HTML content
};

export const en = { ...base };
export const zh = { ...base, title: "引力实验室", subtitle: "交互式引力沙盒", initializing: "初始化中...", stats_format: "数: {count} | G: {G} | FPS: {fps}", folder_control: "控制", folder_camera: "相机", folder_sandbox: "沙盒", folder_scenarios: "场景", time_speed: "时间流速", pause: "暂停", gravity: "引力(G)", base_count: "数量", show_trails: "轨迹", enable_pan: "平移", track_object: "追踪", track_center: "自由/中心", track_body: "星体 {i} (质量 {mass})", track_custom: "手动选择", add_amount: "添加数", mass_per_star: "质量", btn_add_stars: "✨ 添加恒星", scene_galaxy: "银河系", scene_binary: "双星", scene_threebody: "三体", docs_title: "说明文档", docs_content: docs_zh };
export const ja = { ...base, title: "グラビティ・ラボ", subtitle: "重力サンドボックス", initializing: "初期化中...", folder_control: "操作", folder_camera: "カメラ", folder_sandbox: "サンドボックス", folder_scenarios: "シナリオ", time_speed: "速度", pause: "一時停止", gravity: "重力(G)", base_count: "数", show_trails: "軌跡", enable_pan: "パン移動", track_object: "追跡", track_center: "自由/中心", track_body: "星 {i} (質量 {mass})", track_custom: "手動選択", btn_add_stars: "✨ 星を追加", scene_galaxy: "銀河", scene_binary: "連星", scene_threebody: "三体", docs_title: "仕様書" };
export const es = { ...base, title: "GravityLab", subtitle: "Simulador de Gravedad", folder_control: "Control", folder_camera: "Cámara", folder_sandbox: "Herramientas", folder_scenarios: "Escenarios", time_speed: "Velocidad", pause: "Pausa", gravity: "Gravedad", base_count: "Cantidad", show_trails: "Rastros", enable_pan: "Panorámica", track_object: "Seguir", track_center: "Libre / Centro", btn_add_stars: "✨ Añadir Estrellas", scene_galaxy: "Galaxia", scene_binary: "Binaria", scene_threebody: "Tres Cuerpos", docs_title: "Especificaciones" };
export const fr = { ...base, title: "GravityLab", subtitle: "Bac à Sable Gravitationnel", folder_control: "Contrôle", folder_camera: "Caméra", folder_sandbox: "Outils", folder_scenarios: "Scénarios", time_speed: "Vitesse", pause: "Pause", gravity: "Gravité", base_count: "Nombre", show_trails: "Traînées", enable_pan: "Panoramique", track_object: "Suivre", track_center: "Libre / Centre", btn_add_stars: "✨ Ajouter", scene_galaxy: "Galaxie", scene_binary: "Binaire", scene_threebody: "Trois Corps", docs_title: "Spécifications" };
export const de = { ...base, title: "GravityLab", subtitle: "Schwerkraft-Sandbox", folder_control: "Steuerung", folder_camera: "Kamera", folder_sandbox: "Werkzeuge", folder_scenarios: "Szenarien", time_speed: "Geschwindigkeit", pause: "Pause", gravity: "Schwerkraft", base_count: "Anzahl", show_trails: "Schweife", enable_pan: "Schwenken", track_object: "Verfolgen", track_center: "Frei / Zentrum", btn_add_stars: "✨ Sterne", scene_galaxy: "Galaxie", scene_binary: "Doppelstern", scene_threebody: "Dreikörper", docs_title: "Spezifikationen" };
export const ru = { ...base, title: "ГравитиЛаб", subtitle: "Гравитационная песочница", folder_control: "Управление", folder_camera: "Камера", folder_sandbox: "Инструменты", folder_scenarios: "Сценарии", time_speed: "Скорость", pause: "Пауза", gravity: "Гравитация", base_count: "Количество", show_trails: "Следы", enable_pan: "Панорама", track_object: "Следить", track_center: "Свободно / Центр", btn_add_stars: "✨ Добавить", scene_galaxy: "Галактика", scene_binary: "Двойная звезда", scene_threebody: "Три тела" };
export const pt = { ...base, title: "GravityLab", subtitle: "Sandbox Gravitacional", folder_control: "Controle", folder_camera: "Câmera", folder_sandbox: "Ferramentas", folder_scenarios: "Cenários", time_speed: "Velocidade", pause: "Pausa", gravity: "Gravidade", base_count: "Quantidade", show_trails: "Rastros", enable_pan: "Panorâmica", track_object: "Seguir", track_center: "Livre / Centro", btn_add_stars: "✨ Adicionar", scene_galaxy: "Galáxia", scene_binary: "Binária", scene_threebody: "Três Corpos" };
export const ko = { ...base, title: "그래비티 랩", subtitle: "중력 샌드박스", initializing: "초기화 중...", folder_control: "제어", folder_camera: "카메라", folder_sandbox: "도구", folder_scenarios: "시나리오", time_speed: "속도", pause: "일시정지", gravity: "중력(G)", base_count: "수량", show_trails: "궤적", enable_pan: "이동", track_object: "추적", track_center: "자유 / 중심", btn_add_stars: "✨ 별 추가", scene_galaxy: "은하", scene_binary: "이중성", scene_threebody: "삼체" };
export const it = { ...base, title: "GravityLab", subtitle: "Sandbox Gravitazionale", folder_control: "Controllo", folder_camera: "Telecamera", folder_sandbox: "Strumenti", folder_scenarios: "Scenari", time_speed: "Velocità", pause: "Pausa", gravity: "Gravità", base_count: "Quantità", show_trails: "Scie", enable_pan: "Panoramica", track_object: "Segui", track_center: "Libero / Centro", btn_add_stars: "✨ Aggiungi", scene_galaxy: "Galassia", scene_binary: "Binario", scene_threebody: "Tre Corpi" };
export const hi = { ...base, title: "ग्रेविटी लैब", subtitle: "गुरुत्वाकर्षण सैंडबॉक्स", folder_control: "नियंत्रण", folder_camera: "कैमरा", folder_sandbox: "उपकरण", folder_scenarios: "परिदृश्य", time_speed: "गति", pause: "रोकें", gravity: "गुरुत्वाकर्षण", base_count: "संख्या", show_trails: "ट्रेल्स", enable_pan: "पैन", track_object: "ट्रैक", track_center: "मुक्त / केंद्र", btn_add_stars: "✨ तारे जोड़ें", scene_galaxy: "आकाशगंगा", scene_binary: "द्विआधारी तारा", scene_threebody: "तीन शरीर" };
export const ar = { ...base, title: "مختبر الجاذبية", subtitle: "صندوق رمل الجاذبية", folder_control: "تحكم", folder_camera: "كاميرا", folder_sandbox: "أدوات", folder_scenarios: "سيناريوهات", time_speed: "سرعة", pause: "إيقاف", gravity: "جاذبية", base_count: "عدد", show_trails: "مسارات", enable_pan: "تحريك", track_object: "تتبع", track_center: "حر / مركز", btn_add_stars: "✨ إضافة نجوم", scene_galaxy: "مجرة", scene_binary: "نجم ثنائي", scene_threebody: "ثلاثة أجسام" };
export const tr = { ...base, title: "KütleÇekim Lab", subtitle: "Yerçekimi Kum Havuzu", folder_control: "Kontrol", folder_camera: "Kamera", folder_sandbox: "Araçlar", folder_scenarios: "Senaryolar", time_speed: "Hız", pause: "Duraklat", gravity: "Yerçekimi", base_count: "Miktar", show_trails: "İzler", enable_pan: "Kaydır", track_object: "Takip Et", track_center: "Serbest / Merkez", btn_add_stars: "✨ Yıldız Ekle", scene_galaxy: "Galaksi", scene_binary: "Çift Yıldız", scene_threebody: "Üç Cisim" };
export const vi = { ...base, title: "Phòng Thí Nghiệm Hấp Dẫn", subtitle: "Hộp Cát Trọng Lực", folder_control: "Điều khiển", folder_camera: "Máy quay", folder_sandbox: "Công cụ", folder_scenarios: "Kịch bản", time_speed: "Tốc độ", pause: "Tạm dừng", gravity: "Trọng lực", base_count: "Số lượng", show_trails: "Vệt", enable_pan: "Di chuyển", track_object: "Theo dõi", track_center: "Tự do / Trung tâm", btn_add_stars: "✨ Thêm Sao", scene_galaxy: "Thiên hà", scene_binary: "Sao Đôi", scene_threebody: "Ba Vật Thể" };
export const th = { ...base, title: "ห้องทดลองแรงโน้มถ่วง", subtitle: "กระบะทรายแรงโน้มถ่วง", folder_control: "ควบคุม", folder_camera: "กล้อง", folder_sandbox: "เครื่องมือ", folder_scenarios: "สถานการณ์", time_speed: "ความเร็ว", pause: "หยุดชั่วคราว", gravity: "แรงโน้มถ่วง", base_count: "จำนวน", show_trails: "เส้นทาง", enable_pan: "เลื่อน", track_object: "ติดตาม", track_center: "อิสระ / ศูนย์กลาง", btn_add_stars: "✨ เพิ่มดาว", scene_galaxy: "กาแล็กซี", scene_binary: "ดาวคู่", scene_threebody: "สามวัตถุ" };
export const id = { ...base, title: "Lab Gravitasi", subtitle: "Kotak Pasir Gravitasi", folder_control: "Kontrol", folder_camera: "Kamera", folder_sandbox: "Alat", folder_scenarios: "Skenario", time_speed: "Kecepatan", pause: "Jeda", gravity: "Gravitasi", base_count: "Jumlah", show_trails: "Jejak", enable_pan: "Geser", track_object: "Lacak", track_center: "Bebas / Pusat", btn_add_stars: "✨ Tambah Bintang", scene_galaxy: "Galaksi", scene_binary: "Bintang Ganda", scene_threebody: "Tiga Benda" };
export const nl = { ...base, title: "ZwaartekrachtLab", subtitle: "Zwaartekracht Zandbak", folder_control: "Besturing", folder_camera: "Camera", folder_sandbox: "Tools", folder_scenarios: "Scenario's", time_speed: "Snelheid", pause: "Pauze", gravity: "Zwaartekracht", base_count: "Aantal", show_trails: "Sporen", enable_pan: "Pannen", track_object: "Volgen", track_center: "Vrij / Centrum", btn_add_stars: "✨ Sterren Toevoegen", scene_galaxy: "Melkweg", scene_binary: "Dubbelster", scene_threebody: "Drie Lichamen" };
export const pl = { ...base, title: "Lab Grawitacji", subtitle: "Piaskownica Grawitacyjna", folder_control: "Sterowanie", folder_camera: "Kamera", folder_sandbox: "Narzędzia", folder_scenarios: "Scenariusze", time_speed: "Prędkość", pause: "Pauza", gravity: "Grawitacja", base_count: "Ilość", show_trails: "Ślady", enable_pan: "Przesuwanie", track_object: "Śledź", track_center: "Wolny / Środek", btn_add_stars: "✨ Dodaj Gwiazdy", scene_galaxy: "Galaktyka", scene_binary: "Gwiazda Podwójna", scene_threebody: "Trzy Ciała" };