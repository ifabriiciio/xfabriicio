import { lazy, Suspense, useEffect, useState } from "react";
import Portafolio from "./pages/Portafolio.jsx";

const Perfil = lazy(() => import("./pages/Perfil.jsx"));

function App() {
  const [startSpin, setStartSpin] = useState(false);
  const [route, setRoute] = useState(() =>
    window.location.hash === "#/perfil" ? "perfil" : "inicio",
  );

  useEffect(() => {
    const blockContextMenu = (event) => event.preventDefault();
    const blockDevToolsShortcuts = (event) => {
      const key = event.key.toLowerCase();
      const devToolsShortcut =
        key === "f12" ||
        (event.ctrlKey && event.shiftKey && ["i", "j", "c"].includes(key)) ||
        (event.ctrlKey && key === "u") ||
        (event.metaKey && event.altKey && ["i", "j", "c"].includes(key));

      if (devToolsShortcut) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    document.addEventListener("contextmenu", blockContextMenu);
    document.addEventListener("keydown", blockDevToolsShortcuts);

    return () => {
      document.removeEventListener("contextmenu", blockContextMenu);
      document.removeEventListener("keydown", blockDevToolsShortcuts);
    };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setStartSpin(true), 1200);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const updateRoute = () => {
      setRoute(window.location.hash === "#/perfil" ? "perfil" : "inicio");
    };

    window.addEventListener("hashchange", updateRoute);
    return () => window.removeEventListener("hashchange", updateRoute);
  }, []);

  if (route === "perfil") {
    return (
      <Suspense fallback={null}>
        <Perfil />
      </Suspense>
    );
  }

  return (
    <main className="page-shell">
      <div className="ambient ambient-purple" aria-hidden="true" />
      <div className="ambient ambient-blue" aria-hidden="true" />
      <div className="grid-glow" aria-hidden="true" />

      <header className="topbar">
        <a className="wordmark" href="#/" aria-label="Fabricio, inicio">
          <span className="wordmark-mark">F</span>
          <span>FABRICIO</span>
        </a>
        <span className="topbar-note">
          <span className="status-dot" />
          MI ESPACIO PERSONAL
        </span>
      </header>

      <section className="intro" id="inicio" aria-labelledby="intro-title">
        <div className="eyebrow">
          <span className="eyebrow-line" />
          HOLA, QUÉ BUENO TENERTE POR ACÁ
        </div>

        <h1 id="intro-title">
          Bienvenido a
          <br />
          <span>mi espacio.</span>
        </h1>

        <p className="intro-copy">
          Un rincón para compartir quién soy, lo que me inspira y las cosas que
          voy creando.
        </p>

        <div
          className={`actions ${startSpin ? "spin-active" : ""}`}
          aria-label="Navegación principal"
        >
          <button
            className="inicio-card inicio-perfil"
            type="button"
            onClick={() => {
              window.location.hash = "/perfil";
            }}
          >
            <span className="inicio-card-inner">
              <span className="inicio-circle">
                <video
                  src="/Perfil.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  draggable="false"
                />
              </span>
              <span className="inicio-card-title">Perfil</span>
              <span className="inicio-card-desc">Conocé más sobre mí</span>
            </span>
          </button>

          <Portafolio />
        </div>

        <div className="scroll-cue" aria-hidden="true">
          <span />
          ELEGÍ POR DÓNDE EMPEZAR
        </div>
      </section>

      <section className="profile-wrap" aria-labelledby="profile-title">
        <div className="section-heading">
          <span className="section-kicker">UN POCO SOBRE MÍ</span>
          <span className="section-rule" />
          <span className="section-index">01 / 01</span>
        </div>

        <article className="profile-card">
          <div className="profile-photo-wrap">
            <img
              className="profile-photo"
              src="/profile.png"
              alt="Retrato artístico para el perfil de Fabricio"
              draggable="false"
            />
            <span className="photo-caption">F. / CREATIVO</span>
          </div>

          <div className="profile-content">
            <div className="profile-overline">
              <span className="status-dot" />
              PERFIL PERSONAL
            </div>
            <h2 id="profile-title">
              Hola, soy <span>Fabricio.</span>
            </h2>
            <p className="profile-description">
              Soy de Argentina y me apasionan el diseño y la música. Disfruto
              creando, explorando ideas y compartiendo mi creatividad.
            </p>

            <div className="profile-divider" />

            <dl className="profile-facts">
              <div>
                <dt>UBICACIÓN</dt>
                <dd>
                  <span className="flag" aria-hidden="true">🇦🇷</span>
                  Argentina
                </dd>
              </div>
              <div>
                <dt>ME INSPIRA</dt>
                <dd>Diseño &amp; música</dd>
              </div>
            </dl>
          </div>

          <span className="card-corner card-corner-top" aria-hidden="true" />
          <span className="card-corner card-corner-bottom" aria-hidden="true" />
        </article>
      </section>

      <footer className="footer">
        <span>HECHO CON CARIÑO</span>
        <span className="footer-mark">F</span>
        <span>© {new Date().getFullYear()} FABRICIO</span>
      </footer>
    </main>
  );
}

export default App;
