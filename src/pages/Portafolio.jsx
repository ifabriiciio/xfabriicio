const portfolioUrl = "https://soriafabriii-sys.github.io/Portafolio/";

export default function Portafolio() {
  return (
    <a
      className="inicio-card inicio-portafolio"
      href={portfolioUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Abrir portafolio en una pestaña nueva"
    >
      <span className="inicio-card-inner">
        <span className="inicio-circle">
          <img src="/Portafolio.jpg" alt="" draggable="false" />
        </span>
        <span className="inicio-card-title">Portafolio</span>
        <span className="inicio-card-desc">Mis diseños y proyectos</span>
      </span>
    </a>
  );
}
