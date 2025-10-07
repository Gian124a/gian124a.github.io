// === FUNCIÓN PRINCIPAL DE ANIMACIÓN ===
function animationButtonMenu() {
  const menu = document.getElementById("menu-container");
  const activeBg = document.getElementById("active-bg");
  const links = menu.querySelectorAll("a");
  const buttonMenu = document.getElementById("button-menu");

  // --- Controla el movimiento del fondo activo ---
  function moveBgTo(link) {
    const isMobile = window.innerWidth < 1024; // lg breakpoint
    const offset = isMobile ? link.offsetTop : link.offsetLeft;
    const size = isMobile ? link.offsetHeight : link.offsetWidth;

    // Transforma dependiendo del tipo de menú
    activeBg.style.transform = isMobile
      ? `translateY(${offset}px)`
      : `translateX(${offset}px)`;

    // Ajusta ancho/alto del fondo activo
    if (isMobile) {
      activeBg.style.height = `${size}px`;
      activeBg.style.width = `calc(100% - 8px)`; // margen visual lateral
    } else {
      activeBg.style.width = `${size}px`;
      activeBg.style.height = `calc(100% - 8px)`;
    }
  }

  // --- Marca un link como activo ---
  function activateLink(link) {
    links.forEach(l => l.classList.remove("active", "pointer-events-none"));
    link.classList.add("active", "pointer-events-none");
    moveBgTo(link);
  }

  // --- Evento de clic en los links ---
  links.forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      activateLink(link);

      // Si está en móvil, cierra el menú al seleccionar
      if (window.innerWidth < 1024) {
        menu.classList.remove("open");
      }
    });
  });

  // --- Mueve el fondo al primer elemento al cargar ---
  window.addEventListener("load", () => {
    activateLink(links[0]);
  });

  // --- Reajusta la posición al redimensionar ---
  window.addEventListener("resize", () => {
    const activeLink = document.querySelector("a.active") || links[0];
    moveBgTo(activeLink);
  });

  // --- Abre / Cierra menú en móviles ---
  buttonMenu.addEventListener("click", () => {
    menu.classList.toggle("open");
  });
}

// Inicializa la función
animationButtonMenu();
