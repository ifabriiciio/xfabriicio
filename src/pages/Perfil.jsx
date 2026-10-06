import { useState, useRef, useEffect } from "react";
import "./perfil.css";
import { motion, AnimatePresence } from "framer-motion";
import Particles from "react-tsparticles";
import { Howl } from "howler";
import { Canvas, useFrame } from "@react-three/fiber";

export default function Perfil() {
  const tabAnimation = {
  initial: { opacity: 0, y: 40, filter: "blur(10px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  transition: { duration: 0.5, ease: "easeOut" }
};
  const [tab, setTab] = useState("biografia");
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
const [notifications, setNotifications] = useState([]);
const [hasUnread, setHasUnread] = useState(false);
useEffect(() => {
  const stored = JSON.parse(localStorage.getItem("notifs")) || [];

  if (stored.length === 0) {
const initial = [
  { id: 1, text: "🚀 Sistema de notificaciones activo", read: false }
];


    localStorage.setItem("notifs", JSON.stringify(initial));
    setNotifications(initial);
    setHasUnread(true);
  } else {
    setNotifications(stored);
    setHasUnread(stored.some(n => !n.read));
  }
}, []);

const addNotification = (text) => {
  const newNotif = {
    id: Date.now(),
    text,
    read: false
  };

  setNotifications(prev => {
    // 🔥 agregamos la nueva arriba
    let updated = [newNotif, ...prev];

    // 🔥 límite de 5
    if (updated.length > 5) {
      updated = updated.slice(0, 5);
    }

    localStorage.setItem("notifs", JSON.stringify(updated));
    return updated;
  });

  setHasUnread(true);
};



  /* 🔥 NUEVO */
  const [showMarried, setShowMarried] = useState(false);
   
const [showPlaylist, setShowPlaylist] = useState(false);
const [currentSong, setCurrentSong] = useState(4);
const [isPlaying, setIsPlaying] = useState(true);
const [volume, setVolume] = useState(0.8);
const [progress, setProgress] = useState(0);
const [duration, setDuration] = useState(326);
const [isShuffle, setIsShuffle] = useState(false);
const [isRepeat, setIsRepeat] = useState(false);

const soundRef = useRef(null);
const rafRef = useRef(null);

const songs = [
  {
    title: "First Date",
    artist: "Blink-182",
    duration: "2:51",
    src: "/music/Blink-182 - First Date.mp3",
    cover: "/music/caratula2.jpg",
  },
  {
    title: "Everytime",
    artist: "Simple Plan",
    duration: "3:45",
    src: "/music/Simple plan - Everytime.mp3",
    cover: "/music/caratula3.jpg",
  },
  {
    title: "Bedingfield",
    artist: "Simple Plan",
    duration: "3:45",
    src: "/music/Simple Plan - Jet lag ft Natasha Bedingfield.mp3",
    cover: "/music/caratula1.jpg",
  },
  {
    title: "In Too Deep",
    artist: "Sum 41",
    duration: "3:27",
    src: "/music/Sum 41 - In Too Deep.mp3",
    cover: "/music/caratula4.jpg",
  },

  {
    title: "Superman",
    artist: "Eminem",
    duration: "5:50",
    src: "/music/Eminem - Superman ft. Dina Rae.mp3",
    cover: "/music/caratula6.jpg",
  },
];

const current = songs[currentSong];

const formatTime = (seconds = 0) => {
  if (!Number.isFinite(seconds)) return "0:00";
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${min}:${sec}`;
};

const stopFrame = () => {
  if (rafRef.current) cancelAnimationFrame(rafRef.current);
  rafRef.current = null;
};

const updateProgress = () => {
  const sound = soundRef.current;

  if (sound) {
    const seek = sound.seek();
    if (typeof seek === "number") setProgress(seek);
    rafRef.current = requestAnimationFrame(updateProgress);
  }
};

const nextSong = () => {
  setCurrentSong((prev) => {
    if (isShuffle) {
      let next = Math.floor(Math.random() * songs.length);
      if (next === prev) next = (next + 1) % songs.length;
      return next;
    }

    return (prev + 1) % songs.length;
  });
};

const prevSong = () => {
  setCurrentSong((prev) => (prev === 0 ? songs.length - 1 : prev - 1));
};

useEffect(() => {
  stopFrame();

  if (soundRef.current) {
    soundRef.current.stop();
    soundRef.current.unload();
  }

  const sound = new Howl({
    src: [current.src],
    html5: true,
    volume,
    preload: true,
    onload: () => {
      const realDuration = sound.duration();
      if (Number.isFinite(realDuration) && realDuration > 0) {
        setDuration(realDuration);
      }
    },
    onplay: () => {
      setIsPlaying(true);
      updateProgress();
    },
    onplayerror: () => {
      setIsPlaying(false);
      sound.once("unlock", () => {
        if (soundRef.current === sound) {
          setIsPlaying(true);
          sound.play();
        }
      });
    },
    onloaderror: (_id, error) => {
      setIsPlaying(false);
      console.error(`No se pudo cargar la canción: ${current.src}`, error);
    },
    onpause: () => {
      setIsPlaying(false);
      stopFrame();
    },
    onstop: () => {
      setIsPlaying(false);
      stopFrame();
    },
    onend: () => {
      stopFrame();
      setProgress(0);

      if (isRepeat) {
        sound.seek(0);
        sound.play();
        return;
      }

      nextSong();
    },
  });

  soundRef.current = sound;
  setProgress(0);

  if (isPlaying) {
    sound.play();
    sound.fade(0, volume, 700);
  }

  return () => {
    stopFrame();
    sound.stop();
    sound.unload();
  };
}, [currentSong, isRepeat, isShuffle]);

useEffect(() => {
  if (soundRef.current) soundRef.current.volume(volume);
}, [volume]);

const togglePlay = () => {
  const sound = soundRef.current;
  if (!sound) return;

  if (isPlaying) {
    sound.fade(volume, 0, 250);
    setTimeout(() => sound.pause(), 260);
  } else {
    sound.volume(0);
    sound.play();
    sound.fade(0, volume, 500);
  }
};

const changeProgress = (e) => {
  const next = Number(e.target.value);
  setProgress(next);
  if (soundRef.current) soundRef.current.seek(next);
};

const changeVolume = (e) => {
  setVolume(Number(e.target.value));
};

const selectSong = (index) => {
  setCurrentSong(index);
  setIsPlaying(true);
  setShowPlaylist(false);
};
const images = [
  "https://xatimg.com/image/jN2YqsC7uGaf.jpg",
  "https://xatimg.com/image/9qkFRCmuGMSL.png",
  "https://xatimg.com/image/ibSwoEavtz4T.png",
  "https://xatimg.com/image/GzvDhkI3Hw2w.jpg",
  "https://xatimg.com/image/XWDq7k8GtAKi.jpg"
];

const [active, setActive] = useState(0);
function FriendInfoCard({ icon, label, value }) {
  return (
    <motion.div
      className="modal-friend-card"
      whileHover={{ scale: 1.025, x: 4 }}
      transition={{ duration: 0.2 }}
    >
      <div className="modal-friend-icon">{icon}</div>

      <div className="modal-friend-text">
        <span>{label}</span>
        <p>{value}</p>
      </div>
    </motion.div>
  );
}

function FriendSvgClose() {
  return <svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" /></svg>;
}
function FriendSvgUsers() {
  return <svg viewBox="0 0 24 24"><path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"/><path d="M2.5 21c.8-4.5 4-7 6.5-7s5.7 2.5 6.5 7"/><path d="M17 10a3 3 0 1 0 0-6"/><path d="M16.5 14c2.6.3 4.4 2.3 5 5"/></svg>;
}
function FriendSvgUser() {
  return <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c1-5 4.4-7 8-7s7 2 8 7"/></svg>;
}
function FriendSvgId() {
  return <svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="3"/><circle cx="8.5" cy="12" r="2"/><path d="M13 10h5M13 14h4M6 17c.7-1.6 4.3-1.6 5 0"/></svg>;
}
function FriendSvgPin() {
  return <svg viewBox="0 0 24 24"><path d="M12 22s7-6.3 7-12a7 7 0 0 0-14 0c0 5.7 7 12 7 12Z"/><circle cx="12" cy="10" r="2.6"/></svg>;
}
function FriendSvgChat() {
  return <svg viewBox="0 0 24 24"><path d="M4 5.5h16v10.5H8l-4 3.5v-14Z"/><path d="M8 11h.01M12 11h.01M16 11h.01"/></svg>;
}
function FriendSvgHeart() {
  return <svg viewBox="0 0 24 24"><path d="M12 21s-7.5-4.5-9.5-8.6C.7 8.7 2.8 5.3 6.3 5.3c2 0 3.6 1.1 4.7 2.8 1.1-1.7 2.7-2.8 4.7-2.8 3.5 0 5.6 3.4 3.8 7.1C19.5 16.5 12 21 12 21Z"/></svg>;
}
const rotate = (dir) => {
  setActive((prev) => (prev + dir + images.length) % images.length);
};

// autoplay (giro automático)
useEffect(() => {
  const interval = setInterval(() => {
    setActive((prev) => (prev + 1) % images.length);
  }, 3000);

  return () => clearInterval(interval);
}, [images.length]);

function FireEffect() {
  const meshRef = useRef();

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.material.uniforms.uTime.value = clock.elapsedTime;
    }
  });
  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[3, 1.2]} />
      <shaderMaterial
        transparent
        uniforms={{
          uTime: { value: 0 },
        }}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
          }
        `}
fragmentShader={`
  varying vec2 vUv;
  uniform float uTime;

  float noise(vec2 p) {
    return sin(p.x * 10.0 + uTime) * sin(p.y * 10.0 + uTime);
  }

  void main() {
    vec2 uv = vUv;

    // 🔥 movimiento hacia arriba (clave)
    uv.y += uTime * 0.6;

    float n = noise(uv);

    // 🔥 forma de llama (más fuerte abajo, se desvanece arriba)
    float flame = smoothstep(0.0, 0.6, vUv.y + n * 0.2);
    flame *= (1.0 - vUv.y);

    float fireShade = smoothstep(0.12, 0.9, flame);
    vec3 color = mix(vec3(0.025), vec3(0.92), fireShade);

    gl_FragColor = vec4(color, flame * 0.72);
  }
`}
      />
    </mesh>
  );
}
  return (
    <div className="perfil perfil-lock">
      {/* FONDO */}
      <div className="bg-overlay"></div>

      {/* HEADER */}
      <div className="perfil-header">
        <div className="perfil-center">

<div className="avatar-container">

  {/* aro base */}
  <div className="avatar-base-ring"></div>

  {/* arco giratorio */}
  <div className="avatar-arc"></div>

  <img
    className="avatar"
    src="https://xatimg.com/image/MMFJq9bmMn3S.jpg"
    alt="avatar"
  />
</div>

            <div className="status-wrap">

            {/* ONLINE */}
            <div className="status-indicator online"></div>
            <span className="status-text">Online</span>

            {/* 🔥 MARRIED HEART */}
<div className="married-wrap">
  <button
    className="married-heart"
    onClick={() => {
      setShowMarried(true);
      addNotification("💖 Abriste Married");
    }}
  >
    ❤
    <span className="married-tooltip">Married</span>
  </button>
</div>

          </div>

<div className="fire-container">
  <Canvas className="fire-bg">
    <FireEffect />
  </Canvas>

  <motion.h1
    className="username fire-text"
    animate={{ opacity: [0.9, 1, 0.85, 1] }}
    transition={{ duration: 1.2, repeat: Infinity }}
  >
    Fabricio
  </motion.h1>
</div>
          <p className="user-id">1537898900</p>

        </div>
      </div>

{/* 🔥 MODAL MARRIED PRO SVG */}
<MarriedModalPro
  showMarried={showMarried}
  setShowMarried={setShowMarried}
/>

      {/* 🔥 BARRA */}
      <div className="glass-bar">

        <div
          className="active-box"
          style={{
            transform: `translateX(${
              tab === "biografia"
                ? "10%"
                : tab === "galeria"
                ? "130%"
                : tab === "comunidad"
                ? "247%"
                : "366%"
            })`
          }}
        />

        <div
          className={`glass-item ${tab === "biografia" ? "active" : ""}`}
onClick={() => {
  setTab("biografia");
  addNotification("👤 Entraste a Biografía");
}}

        >
          <div className="icon-box">
            <svg viewBox="0 0 24 24">
              <path d="M12 12c2.5 0 4-1.5 4-4s-1.5-4-4-4-4 1.5-4 4 1.5 4 4 4z" />
              <path d="M4 20c0-3.5 3-6 8-6s8 2.5 8 6" />
            </svg>
          </div>
          <span>Biografia</span>
          {tab === "biografia" && <div className="active-line"></div>}
        </div>

<div className="divider"></div>

<div
  className={`glass-item ${tab === "galeria" ? "active" : ""}`}
  onClick={() => {
    setTab("galeria");
    addNotification("🖼️ Abriste Galería");
  }}
>
  <div className="icon-box">
    <svg viewBox="0 0 24 24">
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <circle cx="9" cy="10" r="1.5" />
      <path d="M21 16l-5-5-4 4-2-2-5 5" />
    </svg>
  </div>
  <span>Galeria</span>
  {tab === "galeria" && <div className="active-line"></div>}
</div>

<div className="divider"></div>

<div
  className={`glass-item ${tab === "comunidad" ? "active" : ""}`}
  onClick={() => {
    setTab("comunidad");
    addNotification("🌐 Entraste a Comunidad");
  }}
>
  <div className="icon-box">
    <svg viewBox="0 0 24 24">
      <path d="M16 11c1.5 0 3-1.5 3-3s-1.5-3-3-3-3 1.5-3 3 1.5 3 3 3z" />
      <path d="M8 11c1.5 0 3-1.5 3-3S9.5 5 8 5 5 6.5 5 8s1.5 3 3 3z" />
      <path d="M2 20c0-3 3-5 6-5" />
      <path d="M14 15c3 0 8 2 8 5" />
    </svg>
  </div>

  <span>Comunidad</span>
  {tab === "comunidad" && <div className="active-line"></div>}
</div>

<div className="divider"></div>

<div
  className={`glass-item ${tab === "hogar" ? "active" : ""}`}
  onClick={() => {
    setTab("hogar");
    addNotification("🏠 Entraste a Hogar");
  }}
>
  <div className="icon-box">
    <svg viewBox="0 0 24 24">
      <path d="M3 10L12 4l9 6" />
      <path d="M5 10v10h14V10" />
    </svg>
  </div>
  <span>Hogar</span>
  {tab === "hogar" && <div className="active-line"></div>}
</div>
      </div>

{/* 🔥 NUEVO PANEL SUPERIOR DERECHA */}
<div className="top-actions">

      {/* 🔔 NOTIFICACIONES */}
      <div className="notif-wrap">
        <button
          className="top-btn notif-btn"
onClick={() => {
  const isOpening = !showNotifications;
  setShowNotifications(isOpening);
 addNotification("� Entraste a Perfil");
  if (isOpening) {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    setHasUnread(false);
    localStorage.setItem("notifs", JSON.stringify(updated));
  }
}}
        >
          {/* ICONO 🔔 */}
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M12 3C9.8 3 8 4.8 8 7V9.2C8 10.1 7.7 11 7.2 11.7L6 13.5V15H18V13.5L16.8 11.7C16.3 11 16 10.1 16 9.2V7C16 4.8 14.2 3 12 3Z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M10 18C10.5 19 11.2 19.5 12 19.5C12.8 19.5 13.5 19 14 18"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>

{hasUnread && <span className="notif-dot"></span>}
        </button>
{showNotifications && (
  <div className="notif-panel">
    <h4>Novedades</h4>

    <div className="notif-list">
      {notifications.map((n) => (
        <div key={n.id} className="notif-item">
          {!n.read && <span className="notif-badge"></span>}
          {n.text}
        </div>
      ))}
    </div>
  </div>
)}


  </div>

{/* 🏠 INICIO */}
<button
  className="top-btn portfolio-btn"
  onClick={() => {
    window.location.hash = "/";
  }}
>
  <svg viewBox="0 0 24 24" fill="none">
    <path
      d="M3 10.5L12 4L21 10.5"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5 10V19C5 19.6 5.4 20 6 20H10V14H14V20H18C18.6 20 19 19.6 19 19V10"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  </svg>

  <span>Inicio</span>
</button>

        {/* 💼 PORTAFOLIO */}
      <button
        className="top-btn portfolio-btn"
        onClick={() => {
          window.open(
            "https://soriafabriii-sys.github.io/Portafolio/",
            "_blank",
            "noopener,noreferrer",
          );
        }}
      >
        <svg viewBox="0 0 24 24" fill="none">
          <path
            d="M3 8C3 6.9 3.9 6 5 6H19C20.1 6 21 6.9 21 8V17C21 18.1 20.1 19 19 19H5C3.9 19 3 18.1 3 17V8Z"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path
            d="M9 6V5C9 4.4 9.4 4 10 4H14C14.6 4 15 4.4 15 5V6"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path
            d="M3 12C6 13.5 18 13.5 21 12"
            stroke="currentColor"
            strokeWidth="1.6"
          />
        </svg>

        <span>Portafolio</span>
      </button>
    </div>

      {/* 🔥 NUEVA DIVISION 3 COLUMNAS */}
      <div className="main-layout">
        <div className="social-floating">

  <a href="https://xat.com/fondos" target="_blank" className="social-float-btn">
    <svg viewBox="0 0 24 24">
      <path d="M3 10.5L12 4L21 10.5"/>
      <path d="M5 10V19H10V14H14V19H19V10"/>
    </svg>
  </a>

  <a href="https://instagram.com/TU_USER" target="_blank" className="social-float-btn">
    <svg viewBox="0 0 24 24">
      <rect x="3" y="3" width="18" height="18" rx="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17" cy="7" r="1"/>
    </svg>
  </a>

  <a href="https://facebook.com/TU_USER" target="_blank" className="social-float-btn">
    <svg viewBox="0 0 24 24">
      <path d="M14 3h4v4h-4v4h4v4h-4v6h-4v-6H8v-4h2V7c0-2 1.5-4 4-4z"/>
    </svg>
  </a>

<a 
  href="https://wa.me/TUNUMERO" 
  target="_blank" 
  className="social-float-btn whatsapp-btn"
>
  <svg viewBox="0 0 24 24">
    <path d="M21 12a9 9 0 11-4-7.5L21 3l-1.5 4A9 9 0 0121 12z"/>
    <path d="M9 10c1 2 3 4 5 5l2-1 1 2-2 1c-3-1-6-4-7-7l1-2 2 1-1 2z"/>
  </svg>
</a>


</div>

{/* IZQUIERDA FRIENDS */}
<div className="perfil-friends-panel">

  <h3>Friends</h3>

  <div className="friends-list">
    <div className="friends-track">

      {/* 🔹 LISTA ORIGINAL */}
<div
  className="friend"
  onClick={() => {
    const friendData = {
      name: "Fabricio",
      user: "@xfabriciio",
      id: "1537898900",
      country: "Argentina",
      flag: "https://flagcdn.com/ar.svg",
      phrase: "Mi Hermanita del alma 💖",
      img: "https://xatimg.com/image/MMFJq9bmMn3S.jpg"
    };

    setSelectedFriend(friendData);
    addNotification(`👤 Abriste a ${friendData.name}`);
  }}
>
  <img src="https://xatimg.com/image/MMFJq9bmMn3S.jpg" />

  <div className="friend-info">
    <p>Fabricio</p>
    <span>@xfabriciio</span>
    <div className="friend-status">Online</div>
  </div>

  <a
    href="https://xat.me/xfabriciio"
    target="_blank"
    className="friend-btn"
    onClick={(e) => e.stopPropagation()} // 🔥 IMPORTANTE
  >
    xat.me
  </a>
</div>


{/* 🔹 Mariis♥ */}
<div
  className="friend"
  onClick={() => {
    const friendData = {
      name: "Mariis♥",
      user: "@zSemPiternAz",
      id: "1483649245",
      country: "España",
      flag: "https://flagcdn.com/es.svg",
      phrase: "Mi bffa 💖",
      img: "https://xatimg.com/image/XrbiBgWqx91m.png"
    };

    setSelectedFriend(friendData);
    addNotification(`👤 Abriste a ${friendData.name}`);
  }}
>
  <img src="https://xatimg.com/image/XrbiBgWqx91m.png" />
  <div className="friend-info">
    <p>Mariis♥</p>
    <span>@zSemPiternAz</span>
    <div className="friend-status">Online</div>
  </div>
  <a
    href="https://xat.me/zSemPiternAz"
    target="_blank"
    className="friend-btn"
    onClick={(e) => e.stopPropagation()}
  >
    xat.me
  </a>
</div>

{/* 🔹 Mariis♥ */}
<div
  className="friend"
  onClick={() => {
    const friendData = {
      name: "Paola♥",
      user: "@Paoluchisss",
      id: "1481238440",
      country: "Venezuela",
      flag: "https://flagcdn.com/ve.svg",
      phrase: "Mi Hermanita del alma 💖",
      img: "https://xatimg.com/image/olCuzqKiPQ9E.png"
    };

    setSelectedFriend(friendData);
    addNotification(`👤 Abriste a ${friendData.name}`);
  }}
>
  <img src="https://xatimg.com/image/olCuzqKiPQ9E.png" />
  <div className="friend-info">
    <p>Paola♥</p>
    <span>@Paoluchisss</span>
    <div className="friend-status">Online</div>
  </div>
  <a
    href="https://xat.me/Paoluchisss"
    target="_blank"
    className="friend-btn"
    onClick={(e) => e.stopPropagation()}
  >
    xat.me
  </a>
</div>

{/* 🔹 Oriana♥ */}
<div
  className="friend"
  onClick={() => {
    const friendData = {
      name: "Oriana♥",
      user: "@Oriana",
      id: "1550045880",
      country: "Venezuela",
      flag: "https://flagcdn.com/ve.svg",
      phrase: "Hermana querida 💖",
      img: "https://xatimg.com/image/DOJ3iYzwQcwj.png"
    };

    setSelectedFriend(friendData);
    addNotification(`👤 Abriste a ${friendData.name}`);
  }}
>
  <img src="https://xatimg.com/image/DOJ3iYzwQcwj.png" />
  <div className="friend-info">
    <p>Oriana♥</p>
    <span>@Oriana</span>
    <div className="friend-status">Online</div>
  </div>
  <a
    href="https://xat.me/Oriana"
    target="_blank"
    className="friend-btn"
    onClick={(e) => e.stopPropagation()}
  >
    xat.me
  </a>
</div>

{/* 🔹 Diana♥ */}
<div
  className="friend"
  onClick={() => {
    const friendData = {
      name: "Diana♥",
      user: "@Angieeeeex",
      id: "1526462128",
      country: "Mexico",
      flag: "https://flagcdn.com/mx.svg",
      phrase: "Mi Amix del alma 💖",
      img: "https://xatimg.com/image/3iqlKP23meUj.png"
    };

    setSelectedFriend(friendData);
    addNotification(`👤 Abriste a ${friendData.name}`);
  }}
>
  <img src="https://xatimg.com/image/3iqlKP23meUj.png" />
  <div className="friend-info">
    <p>Diana♥</p>
    <span>@Angieeeeex</span>
    <div className="friend-status">Online</div>
  </div>
  <a
    href="https://xat.me/Angieeeeex"
    target="_blank"
    className="friend-btn"
    onClick={(e) => e.stopPropagation()}
  >
    xat.me
  </a>
</div>

{/* 🔹 Gaby♥ */}
<div
  className="friend"
  onClick={() => {
    const friendData = {
      name: "Gaby♥",
      user: "@Gaby",
      id: "7700077",
      country: "México",
      flag: "https://flagcdn.com/mx.svg",
      phrase: "Gaby amiga de corazon 💖",
      img: "https://xatimg.com/image/2iHkxBBc3MHa.png"
    };

    setSelectedFriend(friendData);
    addNotification(`👤 Abriste a ${friendData.name}`);
  }}
>
  <img src="https://xatimg.com/image/2iHkxBBc3MHa.png" />
  <div className="friend-info">
    <p>Gaby♥</p>
    <span>@Gaby</span>
    <div className="friend-status">Online</div>
  </div>
  <a
    href="https://xat.me/Gaby"
    target="_blank"
    className="friend-btn"
    onClick={(e) => e.stopPropagation()}
  >
    xat.me
  </a>
</div>

{/* 🔹 Elizabeth♥ */}
<div
  className="friend"
  onClick={() => {
    const friendData = {
      name: "Elizabeth♥",
      user: "@Elizabbeth",
      id: "111111",
      country: "Mexico",
      flag: "https://flagcdn.com/mx.svg",
      phrase: "Mi mentora y amiga 💖",
      img: "https://xatimg.com/image/lE3I2TanmMlu.png"
    };

    setSelectedFriend(friendData);
    addNotification(`👤 Abriste a ${friendData.name}`);
  }}
>
  <img src="https://xatimg.com/image/lE3I2TanmMlu.png" />
  <div className="friend-info">
    <p>Elizabeth♥</p>
    <span>@Elizabbeth</span>
    <div className="friend-status">Online</div>
  </div>
  <a
    href="https://xat.me/Elizabbeth"
    target="_blank"
    className="friend-btn"
    onClick={(e) => e.stopPropagation()}
  >
    xat.me
  </a>
</div>

{/* 🔹 Lyeh♥ */}
<div
  className="friend"
  onClick={() => {
    const friendData = {
      name: "Lyeh♥",
      user: "@iiLyehhhhh",
      id: "1538388263",
      country: "Mexico",
      flag: "https://flagcdn.com/mx.svg",
      phrase: "Mi amiga del alma 💖",
      img: "https://xatimg.com/image/w66ipr8PM99u.png"
    };

    setSelectedFriend(friendData);
    addNotification(`👤 Abriste a ${friendData.name}`);
  }}
>
  <img src="https://xatimg.com/image/w66ipr8PM99u.png" />
  <div className="friend-info">
    <p>Lyeh♥</p>
    <span>@iiLyehhhhh</span>
    <div className="friend-status">Online</div>
  </div>
  <a
    href="https://xat.me/iiLyehhhhh"
    target="_blank"
    className="friend-btn"
    onClick={(e) => e.stopPropagation()}
  >
    xat.me
  </a>
</div>

{/* 🔹 Rulis♥ */}
<div
  className="friend"
  onClick={() => {
    const friendData = {
      name: "Rulis♥",
      user: "@RuLis",
      id: "643981803",
      country: "Panama",
      flag: "https://flagcdn.com/pa.svg",
      phrase: "Amigaa 💖",
      img: "https://xatimg.com/image/FFp5QHGPbD1N.png"
    };

    setSelectedFriend(friendData);
    addNotification(`👤 Abriste a ${friendData.name}`);
  }}
>
  <img src="https://xatimg.com/image/FFp5QHGPbD1N.png" />
  <div className="friend-info">
    <p>Rulis♥</p>
    <span>@RuLis</span>
    <div className="friend-status">Online</div>
  </div>
  <a
    href="https://xat.me/RuLis"
    target="_blank"
    className="friend-btn"
    onClick={(e) => e.stopPropagation()}
  >
    xat.me
  </a>
</div>


      {/* 🔥 DUPLICADO (NO TOCADO) */}
      {/* TODO LO DEMÁS LO DEJÉ IGUAL */}

    </div>
  </div>
</div>

{/* 🔥 MODAL FRIEND PRO */}
<AnimatePresence>
  {selectedFriend && (
    <motion.div
      className="modal-friend-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => setSelectedFriend(null)}
    >
      <motion.div
        className="modal-friend-box"
        initial={{ opacity: 0, scale: 0.88, y: 35 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ type: "spring", stiffness: 160, damping: 18 }}
        onClick={(e) => e.stopPropagation()}
      >
        <Particles
          className="modal-friend-particles"
          options={{
            fullScreen: false,
            background: { color: "transparent" },
            particles: {
              number: { value: 38 },
              color: { value: ["#ff4dff", "#a855f7", "#ffffff"] },
              shape: { type: "circle" },
              opacity: { value: { min: 0.15, max: 0.75 } },
              size: { value: { min: 1, max: 3 } },
              move: {
                enable: true,
                speed: 0.45,
                direction: "top",
                outModes: "out",
              },
            },
          }}
        />

        <div className="modal-friend-bg" />
        <div className="modal-friend-light modal-friend-light-one" />
        <div className="modal-friend-light modal-friend-light-two" />

        <div className="modal-friend-dots modal-friend-dots-top-left" />
        <div className="modal-friend-dots modal-friend-dots-bottom-left" />
        <div className="modal-friend-dots modal-friend-dots-bottom-right" />

        <button
          className="modal-friend-close"
          onClick={() => setSelectedFriend(null)}
        >
          <FriendSvgClose />
        </button>

        <div className="modal-friend-head">
          <FriendSvgUsers />
          <div>
            <h3>AMIGOS</h3>
            <p>Friend Profile</p>
          </div>
        </div>

        <div className="modal-friend-layout">
          <section className="modal-friend-left">
            <motion.div
              className="modal-friend-avatar-orbit"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />

            <motion.div
              className="modal-friend-avatar-frame"
              initial={{ scale: 0.96 }}
              animate={{ scale: [0.96, 1, 0.96] }}
              transition={{
                duration: 4.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <img
                src={selectedFriend.img}
                alt={selectedFriend.name}
                className="modal-friend-avatar-img"
              />
            </motion.div>


          </section>

          <section className="modal-friend-right">
            <FriendInfoCard
              icon={<FriendSvgUser />}
              label="Nombre"
              value={selectedFriend.name}
            />

            <FriendInfoCard
              icon={<FriendSvgId />}
              label="ID"
              value={selectedFriend.id}
            />

            <div className="modal-friend-card">
              <div className="modal-friend-icon">
                <FriendSvgPin />
              </div>

              <div className="modal-friend-text">
                <span>País</span>
                <p className="modal-friend-country">
                  <img
                    src={selectedFriend.flag}
                    alt={selectedFriend.country}
                    className="modal-friend-flag"
                  />
                  {selectedFriend.country}
                </p>
              </div>
            </div>

            <div className="modal-friend-about">
              <div className="modal-friend-icon">
                <FriendSvgChat />
              </div>

              <div className="modal-friend-text">
                <span>Sobre mí</span>
                <p>{selectedFriend.phrase}</p>
              </div>
            </div>

            <a
              href={`https://xat.me/${
                selectedFriend.name?.toLowerCase?.() || selectedFriend.id
              }`}
              target="_blank"
              rel="noopener noreferrer"
              className="modal-friend-xat"
            >
              <FriendSvgHeart />
              <span>xat.me</span>
            </a>
          </section>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>


        {/* CENTRO CONTENIDO */}
        <div className="center-content">
{tab === "biografia" && (
  <motion.div
    className="bio-card"
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >

    <div className="bio-content">

      {/* IZQUIERDA */}
      <div className="bio-left">

        <div className="bio-item">
          <div className="bio-row">
            <svg viewBox="0 0 24 24">
              <path d="M12 12c2.5 0 4-1.5 4-4s-1.5-4-4-4-4 1.5-4 4 1.5 4 4 4z"/>
              <path d="M4 20c0-3.5 3-6 8-6s8 2.5 8 6"/>
            </svg>
            <span>NOMBRE</span>
          </div>
          <p>Fabricio</p>
        </div>

        <div className="bio-item">
          <div className="bio-row">
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9"/>
              <path d="M12 7v5l3 3"/>
            </svg>
            <span>EDAD</span>
          </div>
          <p>30 años</p>
        </div>

        <div className="bio-item">
          <div className="bio-row">
            <svg viewBox="0 0 24 24">
              <path d="M12 21s-6-5-6-10a6 6 0 1112 0c0 5-6 10-6 10z"/>
              <circle cx="12" cy="11" r="2"/>
            </svg>
            <span>UBICACIÓN</span>
          </div>
          <p>Argentina</p>
        </div>


        <div className="bio-item">
          <div className="bio-row">
            <svg viewBox="0 0 24 24">
              <path d="M12 21s-8-4.5-8-10a5 5 0 019-3 5 5 0 019 3c0 5.5-8 10-8 10z"/>
            </svg>
            <span>PASIÓN</span>
          </div>
          <p>Diseño & Música</p>
        </div>

{/* PAIS CON BANDERA */}
<div className="bio-item">
  <div className="bio-row">
    <svg viewBox="0 0 24 24">
      <path d="M3 3v18"/>
      <path d="M3 4h14l-2 4 2 4H3"/>
    </svg>
    <span>PAÍS</span>
  </div>

<div className="country-flag">
  
    <span>Argentina</span>
  <img
    src="https://flagcdn.com/ar.svg"
    alt="Bandera de Argentina"
  />

</div>
</div>


      </div>

      {/* DERECHA */}
      <div className="bio-right">
        <img
          src="https://xatimg.com/image/Gg6qszAVoJGW.png"
          alt="neon"
        />
      </div>

    </div>

    {/* SOBRE MI */}
    <div className="bio-about">
      <h3>SOBRE MÍ</h3>
      <p>
        Me gusta crear, diseñar y escuchar música.
        Disfruto los videojuegos y la tecnología.
        Siempre con la mente en las nubes
        y los pies en la tierra.
      </p>
    </div>

    {/* ICONOS PRO */}
    <div className="bio-icons">

      {/* 🎵 MÚSICA */}
      <div className="bio-icon">
        <svg viewBox="0 0 24 24">
          <path d="M9 18V5l11-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
        <span>Música</span>
      </div>

      {/* 🎮 GAMING */}
      <div className="bio-icon">
        <svg viewBox="0 0 24 24">
          <rect x="3" y="8" width="18" height="8" rx="4" />
          <path d="M8 12h.01M16 12h.01" />
          <path d="M7 12h2M8 11v2" />
        </svg>
        <span>Gaming</span>
      </div>

      {/* ✏️ DISEÑO */}
      <div className="bio-icon">
        <svg viewBox="0 0 24 24">
          <path d="M3 21l3-1 12-12-2-2L4 18l-1 3z" />
          <path d="M14 4l2 2" />
        </svg>
        <span>Diseño</span>
      </div>

      {/* 💻 CODE */}
      <div className="bio-icon">
        <svg viewBox="0 0 24 24">
          <path d="M8 6L3 12L8 18" />
          <path d="M16 6L21 12L16 18" />
        </svg>
        <span>Code</span>
      </div>

      {/* ✈️ VIAJAR */}
      <div className="bio-icon">
        <svg viewBox="0 0 24 24">
          <path d="M2 16l20-8-8 20-2-8-8-4z" />
        </svg>
        <span>Viajar</span>
      </div>

    </div>

  </motion.div>
)}

{tab === "galeria" && (
  <motion.div
    className="gallery-container"
    {...tabAnimation}
  >

    <div className="carousel">
      <button className="nav left" onClick={() => rotate(-1)}>
        <svg width="24" height="24" fill="none">
          <path d="M15 6l-6 6 6 6" stroke="white" strokeWidth="2"/>
        </svg>
      </button>

      <div className="coverflow">
        {images.map((img, i) => {
          const offset = i - active;

          return (
            <div
              key={i}
              className={`card ${offset === 0 ? "active" : ""}`}
              style={{
                transform: `
                  translateX(${offset * 200}px)
                  rotateY(${offset * -70}deg)
                  scale(${offset === 0 ? 1 : 0.95})
                `,
                zIndex: 100 - Math.abs(offset),
                opacity: Math.abs(offset) > 3 ? 0 : 1
              }}
            >
              <img src={img} alt="" />
            </div>
          );
        })}
      </div>

      <button className="nav right" onClick={() => rotate(1)}>
        <svg width="24" height="24" fill="none">
          <path d="M9 6l6 6-6 6" stroke="white" strokeWidth="2"/>
        </svg>
      </button>
    </div>

    <div className="dots">
      {images.map((_, i) => (
        <span key={i} className={i === active ? "dot active" : "dot"} />
      ))}
    </div>

  </motion.div>
)}


{tab === "comunidad" && (
  <motion.div
    className="community-container"
    {...tabAnimation}
  >

    <div className="community-card">
      
      {/* IMAGEN IZQUIERDA */}
      <div className="community-image">
        <img src="https://xatimg.com/image/7Ge6Y0oTuPqH.png" alt="setup" />
      </div>

      {/* CONTENIDO */}
      <div className="community-content">
        <h3>Mis Inicios</h3>

        <div className="community-box">
          <div className="community-icon community-glass">
            <svg width="28" height="28" fill="none">
              <circle cx="9" cy="10" r="3" stroke="#556df7" strokeWidth="2"/>
              <circle cx="19" cy="10" r="3" stroke="#5573f7" strokeWidth="2"/>
              <path d="M3 22c1.5-3 4-5 6-5s4.5 2 6 5" stroke="#5573f7" strokeWidth="2"/>
              <path d="M13 22c1.5-3 4-5 6-5s4.5 2 6 5" stroke="#5573f7" strokeWidth="2"/>
            </svg>
          </div>

          <div>
            <h4>DÓNDE PERTENEZCO</h4>
            <p>
              Soy parte de{" "}
              <a 
                href="https://xat.com/fondos" 
                target="_blank" 
                rel="noopener noreferrer"
                className="link-fondos"
              >
                Fondos
              </a>, una comunidad de diseño gráfico en xat
              donde crecí como diseñador y comparto mi creatividad.
            </p>
          </div>
        </div>

        <div className="community-box">
          <div className="community-icon community-glass">
            <svg width="28" height="28" fill="none">
              <rect x="3" y="5" width="22" height="14" rx="3" stroke="#5573f7" strokeWidth="2"/>
              <path d="M8 23h12" stroke="#557bf7" strokeWidth="2"/>
            </svg>
          </div>

          <div>
            <h4>MI PASIÓN</h4>
            <p>
              El diseño gráfico es mi mundo. Disfruto crear, aprender y mejorar
              cada día en este arte digital.
            </p>
          </div>
        </div>

        {/* ICONOS ABAJO */}
        <div className="community-icons">

          <div className="community-icon-box">
            <div className="community-glass">
              <svg width="26" height="26" fill="none">
                <path d="M13 3l3 7h7l-5.5 4 2 7L13 17l-6.5 4 2-7L3 10h7z"
                  stroke="#558ef7" strokeWidth="2"/>
              </svg>
            </div>
            <span>Creatividad</span>
          </div>

          <div className="community-icon-box">
            <div className="community-glass">
              <svg width="26" height="26" fill="none">
                <rect x="3" y="5" width="20" height="12" rx="2"
                  stroke="#5573f7" strokeWidth="2"/>
                <path d="M8 21h8" stroke="#5573f7" strokeWidth="2"/>
              </svg>
            </div>
            <span>Diseño</span>
          </div>

          <div className="community-icon-box">
            <div className="community-glass">
              <svg width="26" height="26" fill="none">
                <path d="M13 2v4M13 20v4M4 13h4M16 13h4"
                  stroke="#5573f7" strokeWidth="2"/>
              </svg>
            </div>
            <span>Inspiración</span>
          </div>

          <div className="community-icon-box">
            <div className="community-glass">
              <svg width="26" height="26" fill="none">
                <path d="M13 21s-7-4.5-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.5-7 10-7 10z"
                  stroke="#5580f7" strokeWidth="2"/>
              </svg>
            </div>
            <span>Pasión</span>
          </div>

        </div>

      </div>
    </div>

  </motion.div>
)}




{tab === "hogar" && (
  <div className="home-wrapper">

    {/* 🔥 TITULO PRO */}
    <div className="home-header">
      <h2 className="home-title">
        <span>MIS</span> LUGARES
      </h2>
      <p className="home-sub">Donde todo puedo estar</p>
    </div>

<div className="home-cards">

  {/* 🔹 FONDOS */}
  <div className="home-card">
    <img 
      src="https://xatimg.com/image/WnW52omNWhYv.png"
      alt="fondos"
      className="home-img"
    />

    <div className="home-card-content">

      <div className="home-title-row">
        <div className="home-icon">
          <svg viewBox="0 0 24 24">
            <path d="M12 3a9 9 0 100 18c1.5 0 2.5-1 2.5-2 0-1-.5-1.5-.5-2.5 0-1.5 1.5-2 3-2 1.5 0 3-1.5 3-3.5A8.5 8.5 0 0012 3z"/>
            <circle cx="8" cy="10" r="1"/>
            <circle cx="12" cy="8" r="1"/>
            <circle cx="16" cy="10" r="1"/>
          </svg>
        </div>

        <h3>
          <a 
            href="https://xat.com/fondos" 
            target="_blank"
            rel="noopener noreferrer"
            className="link-fondos"
          >
            FONDOS
          </a>
        </h3>
      </div>

      <p>Comunidad de diseño donde soy parte.</p>

    </div>
  </div>

</div>

    {/* 🔥 FOOTER GLASS */}
    <div className="home-footer-glass">
      Gracias por ser parte de este viaje.
    </div>

  </div>
)}
        </div>

{/* 🎧 REPRODUCTOR PRO */}
<div className="player-wrapper">
  <motion.div
    className="neon-player"
    initial={{ opacity: 0, y: 40, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.5 }}
  >
    <div className="np-stars" />

    <button className="np-menu" type="button" onClick={() => setShowPlaylist(true)}>
      <svg viewBox="0 0 24 24">
        <path d="M4 7H20M4 12H16M4 17H12" />
      </svg>
    </button>

    <div className="np-sliders">
      <svg viewBox="0 0 24 24">
        <path d="M6 4V20" />
        <path d="M12 4V20" />
        <path d="M18 4V20" />
        <path d="M4.5 9H7.5" />
        <path d="M10.5 15H13.5" />
        <path d="M16.5 7H19.5" />
      </svg>
    </div>

    <div className="np-orbit-wrap">
      <motion.div

      />

      <motion.div
        className="np-cover-ring"
        animate={{
          boxShadow: isPlaying
            ? "0 0 35px rgba(181, 48, 255, .85), 0 0 60px rgba(40, 203, 255, .45)"
            : "0 0 22px rgba(116, 68, 255, .45)",
        }}
      >
        <motion.img
          src={current.cover}
          alt={current.title}
          className="np-cover-img"
          animate={{ scale: isPlaying ? [1, 1.035, 1] : 1 }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </div>



    <div className="np-info">
      <h3>{current.artist}</h3>
      <p>{current.title}</p>
    </div>

    <div className="np-wave">
      {Array.from({ length: 36 }).map((_, i) => (
        <motion.span
          key={i}
          animate={{
            height: isPlaying ? [8, 12 + ((i * 13) % 34), 10] : 8,
            opacity: isPlaying ? [0.6, 1, 0.75] : 0.35,
          }}
          transition={{
            duration: 0.8 + (i % 4) * 0.12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.02,
          }}
        />
      ))}
    </div>

    <div className="np-progress-wrap">
      <span>{formatTime(progress)}</span>
      <input
        type="range"
        min="0"
        max={duration || 0}
        step="0.1"
        value={progress}
        onChange={changeProgress}
        style={{ "--range": `${duration ? (progress / duration) * 100 : 0}%` }}
      />
      <span>{formatTime(duration)}</span>
    </div>

    <div className="np-controls">
      <button
        type="button"
        className={isShuffle ? "active" : ""}
        onClick={() => setIsShuffle((p) => !p)}
      >
        <svg viewBox="0 0 24 24">
          <path d="M16 3H21V8" />
          <path d="M4 20L21 3" />
          <path d="M21 16V21H16" />
          <path d="M15 15L21 21" />
          <path d="M4 4L9 9" />
        </svg>
      </button>

      <button type="button" onClick={prevSong}>
        <svg viewBox="0 0 24 24">
          <path d="M11 19L2 12L11 5V19Z" />
          <line x1="14" y1="5" x2="14" y2="19" />
        </svg>
      </button>

      <motion.button
        type="button"
        className="play"
        onClick={togglePlay}
        whileTap={{ scale: 0.86 }}
      >
        {isPlaying ? (
          <svg viewBox="0 0 24 24">
            <rect x="6" y="5" width="4" height="14" rx="1" />
            <rect x="14" y="5" width="4" height="14" rx="1" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24">
            <path d="M6 4L20 12L6 20V4Z" />
          </svg>
        )}
      </motion.button>

      <button type="button" onClick={nextSong}>
        <svg viewBox="0 0 24 24">
          <path d="M13 5L22 12L13 19V5Z" />
          <line x1="10" y1="5" x2="10" y2="19" />
        </svg>
      </button>

      <button
        type="button"
        className={isRepeat ? "active" : ""}
        onClick={() => setIsRepeat((p) => !p)}
      >
        <svg viewBox="0 0 24 24">
          <path d="M17 1L21 5L17 9" />
          <path d="M3 11V9A4 4 0 017 5H21" />
          <path d="M7 23L3 19L7 15" />
          <path d="M21 13V15A4 4 0 0117 19H3" />
        </svg>
      </button>
    </div>

    <div className="np-volume">
      <svg viewBox="0 0 24 24" className="vol-icon">
        <path d="M5 9V15H9L14 20V4L9 9H5Z" />
        {volume === 0 && (
          <>
            <line x1="16" y1="8" x2="20" y2="16" />
            <line x1="20" y1="8" x2="16" y2="16" />
          </>
        )}
        {volume > 0.33 && <path d="M16 9C17.5 10.5 17.5 13.5 16 15" />}
        {volume > 0.66 && <path d="M18.5 7C20.5 10 20.5 14 18.5 17" />}
      </svg>

      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={volume}
        onChange={changeVolume}
        style={{ "--range": `${volume * 100}%` }}
      />

      <span>{Math.round(volume * 100)}%</span>
    </div>

    <AnimatePresence>
      {showPlaylist && (
        <motion.div
          className="np-playlist-full"
          initial={{ opacity: 0, x: 45 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 45 }}
        >
          <div className="np-pl-header">
            <h3>PLAYLIST</h3>
            <button type="button" onClick={() => setShowPlaylist(false)}>✕</button>
          </div>

          <div className="np-pl-tabs">
            <button className="active" type="button">Canciones</button>
            <button type="button">Favoritas</button>
          </div>

          <div className="np-pl-list">
            {songs.map((song, index) => (
              <motion.button
                type="button"
                key={song.title}
                className={`np-pl-item ${index === currentSong ? "active" : ""}`}
                onClick={() => selectSong(index)}
                whileTap={{ scale: 0.98 }}
              >
                <span className="np-index">{index + 1}</span>
                <img src={song.cover} alt="" />
                <span className="np-meta">
                  <strong>{song.title}</strong>
                  <small>{song.artist}</small>
                </span>
                <span className="np-time">{song.duration}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
</div>
      </div>
    </div>
  );
}

/* =========================================================
   🔥 MODAL MARRIED PRO SVG - COMPONENTE
========================================================= */

function MarriedModalPro({ showMarried, setShowMarried }) {
  return (
    <AnimatePresence>
      {showMarried && (
        <motion.div
          className="married-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowMarried(false)}
        >
          <motion.div
            className="married-modal-pro"
            initial={{ opacity: 0, scale: 0.9, y: 35 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: "spring", stiffness: 160, damping: 18 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Particles
              className="married-particles"
              options={{
                fullScreen: false,
                background: { color: "transparent" },
                particles: {
                  number: { value: 42 },
                  color: { value: ["#ff5eb8", "#ffc0df", "#ffffff"] },
                  shape: { type: "circle" },
                  opacity: { value: { min: 0.15, max: 0.75 } },
                  size: { value: { min: 1, max: 3 } },
                  move: { enable: true, speed: 0.55, direction: "top", outModes: "out" },
                },
              }}
            />

            <div className="married-bg-layer" />
            <div className="married-magic-light light-a" />
            <div className="married-magic-light light-b" />
            <div className="married-flower flower-left" />
            <div className="married-flower flower-right" />
            <div className="married-petal petal-a" />
            <div className="married-petal petal-b" />

            <button className="married-close-pro" onClick={() => setShowMarried(false)}>
              <SvgClose />
            </button>



            <FloatingSvgHearts />

            <div className="married-layout-pro">
              <section className="married-left-pro">
                <motion.div
                  className="avatar-orbit-pro"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                />

                <motion.div
                  className="avatar-frame-pro"
                  initial={{ scale: 0.96 }}
                  animate={{ scale: [0.96, 1, 0.96] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <img
                    src="https://xatimg.com/image/ESnawXFUp7uj.png"
                    className="avatar-img-pro"
                    alt="avatar"
                  />
                  <motion.div
                    className="avatar-heart-svg"
                    animate={{ scale: [1, 1.15, 1], rotate: [-8, 8, -8] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <SvgHeartFilled />
                  </motion.div>
                </motion.div>



                <a
                  href="https://xat.me/116447265"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="xat-btn-pro"
                >
                  <SvgHeartSmall />
                  <span>xat.me</span>
                </a>
              </section>

              <section className="married-right-pro">
                <div className="title-married-pro">
                  <SvgHeartSmall />
                  <h2>Married</h2>
                  <SvgHeartSmall />
                </div>

                <div className="title-line-pro">
                  <i />
                  <SvgHeartOutline />
                  <i />
                </div>

                <InfoCardPro
  icon={<SvgUserLove />}
  label="Nombre"
  value="Day"
  deco={<SvgHeartSmall />}
/>
                <InfoCardPro icon={<SvgIdCard />} label="ID" value="116447265" deco={<SvgEnvelope />} />

                <div className="info-card-pro quote-card-pro">
                  <div className="icon-box-pro"><SvgQuote /></div>
                  <div className="info-text-pro">
                    <span>Frase</span>
                    <p>Contigo, cada momento se convierte en mi lugar favorito.</p>
                  </div>
                  <div className="quote-mark-pro"><SvgQuoteBig /></div>
                </div>

                <div className="info-card-pro">
                  <div className="icon-box-pro"><SvgMapPin /></div>
<div className="info-text-pro">
  <span>País</span>

  <div className="country-pro">
    <p>Argentina</p>

    <img
      className="flag-pro"
      src="https://flagcdn.com/ar.svg"
      alt="Argentina"
    />
  </div>
</div>
</div>

                <InfoCardPro icon={<SvgShieldHeart />} label="Estado" value="Married" deco={<SvgHeartGem />} />
              </section>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function InfoCardPro({ icon, label, value, deco }) {
  return (
    <motion.div className="info-card-pro" whileHover={{ scale: 1.025, x: 4 }} transition={{ duration: 0.2 }}>
      <div className="icon-box-pro">{icon}</div>
      <div className="info-text-pro">
        <span>{label}</span>
        <p>{value}</p>
      </div>
      <div className="deco-svg-pro">{deco}</div>
    </motion.div>
  );
}

function FloatingSvgHearts() {
  return (
    <div className="floating-svg-hearts">
      {["h-a", "h-b", "h-c", "h-d", "h-e", "h-f"].map((c, i) => (
        <motion.div
          key={c}
          className={`floating-heart-svg ${c}`}
          animate={{ y: [0, -22, 0], scale: [1, 1.22, 1], opacity: [0.55, 1, 0.55] }}
          transition={{ duration: 3.2 + i * 0.45, repeat: Infinity, ease: "easeInOut", delay: i * 0.25 }}
        >
          {i % 2 === 0 ? <SvgHeartFilled /> : <SvgHeartOutline />}
        </motion.div>
      ))}
    </div>
  );
}

function SvgClose() { return <svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" /></svg>; }
function SvgDiamond() { return <svg viewBox="0 0 64 64"><path d="M12 18l10-10h20l10 10-20 36L12 18z"/><path d="M12 18h40M22 8l10 46M42 8L32 54M22 8l-10 10M42 8l10 10"/></svg>; }
function SvgHeartSmall() { return <svg viewBox="0 0 24 24"><path d="M12 21s-7.5-4.5-9.5-8.6C.7 8.7 2.8 5.3 6.3 5.3c2 0 3.6 1.1 4.7 2.8 1.1-1.7 2.7-2.8 4.7-2.8 3.5 0 5.6 3.4 3.8 7.1C19.5 16.5 12 21 12 21z"/></svg>; }
function SvgHeartFilled() { return <svg viewBox="0 0 64 64"><path d="M32 56S8 41.8 8 24.3C8 14.8 14.5 9 22.2 9c4.7 0 8.1 2.4 9.8 5.4C33.7 11.4 37.1 9 41.8 9 49.5 9 56 14.8 56 24.3 56 41.8 32 56 32 56z"/></svg>; }
function SvgHeartOutline() { return <svg viewBox="0 0 24 24"><path d="M12 21s-7.5-4.5-9.5-8.6C.7 8.7 2.8 5.3 6.3 5.3c2 0 3.6 1.1 4.7 2.8 1.1-1.7 2.7-2.8 4.7-2.8 3.5 0 5.6 3.4 3.8 7.1C19.5 16.5 12 21 12 21z"/></svg>; }
function SvgCalendar() { return <svg viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="15" rx="3"/><path d="M8 3v4M16 3v4M4 10h16"/><path d="M9 15l2 2 4-5"/></svg>; }
function SvgIdCard() { return <svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="3"/><circle cx="8.5" cy="12" r="2.2"/><path d="M13 10h5M13 14h4M6 17c.7-1.6 4.3-1.6 5 0"/></svg>; }
function SvgQuote() { return <svg viewBox="0 0 24 24"><path d="M8 10h4v4c0 3-2 5-5 6M16 10h4v4c0 3-2 5-5 6"/></svg>; }
function SvgQuoteBig() { return <svg viewBox="0 0 64 64"><path d="M23 17h14v14c0 9-6 15-16 17M45 17h14v14c0 9-6 15-16 17"/></svg>; }
function SvgMapPin() { return <svg viewBox="0 0 24 24"><path d="M12 21s7-6.1 7-12a7 7 0 0 0-14 0c0 5.9 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>; }
function SvgShieldHeart() { return <svg viewBox="0 0 24 24"><path d="M12 22s8-3.7 8-10V5l-8-3-8 3v7c0 6.3 8 10 8 10z"/><path d="M12 16s-4-2.4-4-5a2.6 2.6 0 0 1 4-2.1A2.6 2.6 0 0 1 16 11c0 2.6-4 5-4 5z"/></svg>; }
function SvgEnvelope() { return <svg viewBox="0 0 64 64"><rect x="10" y="18" width="44" height="30" rx="5"/><path d="M12 21l20 16 20-16"/><path d="M12 47l15-14M52 47L37 33"/></svg>; }
function SvgHeartGem() { return <svg viewBox="0 0 64 64"><path d="M32 56S9 42 9 24c0-9 6-15 14-15 4 0 7 2 9 5 2-3 5-5 9-5 8 0 14 6 14 15 0 18-23 32-23 32z"/><path d="M15 22h34M22 10l10 46M42 10L32 56"/></svg>; }
function SvgRoseMini() { return <svg viewBox="0 0 64 64"><path d="M32 34c9 0 15-6 15-13 0-6-5-11-12-8-2-6-10-6-13 0-7-2-12 3-12 9 0 7 7 12 16 12h6z"/><path d="M32 34c-2 8-8 13-18 16M34 34c6 4 10 9 12 17M28 36c0 8 1 14 4 20"/></svg>; }
function SvgRose() { return <svg viewBox="0 0 120 120"><path d="M60 63c18 0 31-12 31-28 0-13-12-23-26-16-6-13-24-12-29 1-16-3-27 8-25 22 2 14 18 21 37 21h12z"/><path d="M55 63c-3 19-18 31-42 38M65 63c18 10 28 22 33 44M58 65c0 17 3 31 10 45"/><path d="M38 36c8-8 19-7 24 2M67 30c10 2 15 9 14 18M24 43c8 8 18 10 30 7"/></svg>; }
function SvgUserLove() {
  return (
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c.8-4 4-6 7-6s6.2 2 7 6" />
      <path d="M17.5 7.5s-2-1.2-2-3a1.8 1.8 0 0 1 3-1.3 1.8 1.8 0 0 1 3 1.3c0 1.8-2 3-4 4z" />
    </svg>
  );
}
