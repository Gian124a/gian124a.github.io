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

document.addEventListener('DOMContentLoaded', () => {
    const scrollContainer = document.getElementById('scroll-container');
    const dotEducacion = document.getElementById('dot-educacion');
    const dotExperiencia = document.getElementById('dot-experiencia');
    
    const sections = [
        document.getElementById('section-educacion'),
        document.getElementById('section-experiencia')
    ];

    if (!scrollContainer || !dotEducacion || !dotExperiencia || sections.some(s => !s)) {
        console.error("Faltan elementos HTML con los IDs requeridos (scroll-container, dot-educacion, etc.).");
        return;
    }

    // Usamos IntersectionObserver para detectar qué sección está completamente visible
    const observerOptions = {
        root: scrollContainer,
        rootMargin: '0px',
        // Umbral de 0.9 (90% de visibilidad) para asegurar que el snap ha terminado
        threshold: 0.9 
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // La sección ha entrado en el viewport
                const sectionId = entry.target.id;
                
                // Función para cambiar colores
                const setActiveDot = (activeId) => {
                    if (activeId === 'section-educacion') {
                        // Sección 1 Activa (Morado)
                        dotEducacion.classList.replace('bg-secundary-500', 'bg-primary-500');
                        // Sección 2 Inactiva (Gris)
                        dotExperiencia.classList.replace('bg-primary-500', 'bg-secundary-500');
                    } else if (activeId === 'section-experiencia') {
                        // Sección 2 Activa (Morado)
                        dotExperiencia.classList.replace('bg-secundary-500', 'bg-primary-500');
                        // Sección 1 Inactiva (Gris)
                        dotEducacion.classList.replace('bg-primary-500', 'bg-secundary-500');
                    }
                };

                setActiveDot(sectionId);
            }
        });
    }, observerOptions);

    // Observar cada sección para saber cuándo entra en el viewport
    sections.forEach(section => {
        observer.observe(section);
    });
    
    // Configurar el estado inicial al cargar la página (Educación debe ser Morado)
    dotEducacion.classList.add('bg-primary-500');
    dotExperiencia.classList.add('bg-neutral-500');

    // === LÓGICA DE CARRUSEL GENÉRICA ===
    function setupCarousel(scrollContainerId, dotsContainerId, cardSelector) {
        const scrollContainer = document.getElementById(scrollContainerId);
        const dotsContainer = document.getElementById(dotsContainerId);
        const cards = document.querySelectorAll(cardSelector);

        if (!scrollContainer || !dotsContainer || cards.length === 0) {
            console.warn(`Faltan elementos para el carrusel: ${scrollContainerId}, ${dotsContainerId}, o ${cardSelector}.`);
            return;
        }

        const totalCards = cards.length;
        const maxDots = 5;

        // 1. Crear los puntos dinámicamente
        dotsContainer.innerHTML = ''; // Limpiar puntos existentes
        const dotsToShow = Math.min(Math.ceil(totalCards / (window.innerWidth >= 640 ? 2 : 1)), maxDots);
        for (let i = 0; i < dotsToShow; i++) {
            const dot = document.createElement('div');
            dot.classList.add('w-4', 'h-4', 'rounded-full', 'transition-all', 'duration-300');
            dot.classList.add(i === 0 ? 'bg-primary-500' : 'bg-secundary-500');
            dotsContainer.appendChild(dot);
        }

        const dots = dotsContainer.querySelectorAll('div');

        // Función para actualizar los puntos
        const updateDots = (visibleIndex) => {
            const isLgScreen = window.innerWidth >= 1024;
            if (isLgScreen) { // En pantallas grandes, el carrusel está desactivado
                dotsContainer.style.display = 'none';
                return;
            }
            dotsContainer.style.display = 'flex';

            const isSmScreen = window.innerWidth >= 640;
            const itemsPerPage = isSmScreen ? 2 : 1;
            const totalPages = Math.ceil(totalCards / itemsPerPage);
            const currentPage = Math.floor(visibleIndex / itemsPerPage);

            // Ocultar puntos si no son necesarios
            dots.forEach((dot, index) => {
                dot.style.display = index < Math.min(totalPages, maxDots) ? 'flex' : 'none';
            });

            // Resetear todos los puntos
            dots.forEach(dot => {
                dot.classList.replace('bg-primary-500', 'bg-secundary-500');
                dot.classList.remove('scale-75');
            });

            if (totalPages <= maxDots) {
                if (dots[currentPage]) {
                    dots[currentPage].classList.replace('bg-secundary-500', 'bg-primary-500');
                }
            } else {
                const lastPageIndex = totalPages - 1;
                const lastDotIndex = maxDots - 1;
                let dotIndexToActivate = 0;

                if (currentPage < maxDots - 1) {
                    dotIndexToActivate = currentPage;
                } else if (currentPage === lastPageIndex) {
                    dotIndexToActivate = lastDotIndex;
                } else {
                    dotIndexToActivate = maxDots - 2;
                }

                if (dots[dotIndexToActivate]) {
                    dots[dotIndexToActivate].classList.replace('bg-secundary-500', 'bg-primary-500');
                }

                if (currentPage < lastPageIndex && dots[lastDotIndex]) {
                    dots[lastDotIndex].classList.add('scale-75');
                }
            }
        };

        // 2. Usar IntersectionObserver para el estado activo
        const observerOptions = {
            root: scrollContainer,
            rootMargin: '0px',
            threshold: 0.8
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const visibleIndex = Array.from(cards).indexOf(entry.target);
                    updateDots(visibleIndex);
                }
            });
        }, observerOptions);

        // 3. Observar cada tarjeta
        cards.forEach(card => observer.observe(card));

        // 4. Estado inicial y re-evaluación al cambiar tamaño
        const handleResize = () => {
            const firstVisibleCard = Array.from(cards).find(card => card.offsetParent !== null) || cards[0];
            const visibleIndex = Array.from(cards).indexOf(firstVisibleCard);
            updateDots(visibleIndex);
        };
        
        window.addEventListener('resize', handleResize);
        handleResize(); // Llamada inicial
    }

    // Inicializar carrusel para Proyectos
    setupCarousel('projects-scroll-container', 'project-dots-container', '.project-card');
    
    // Inicializar carrusel para Habilidades
    setupCarousel('skills-scroll-container', 'skills-dots-container', '.skill-card');

    // === LÓGICA MODAL DE HABILIDADES (DINÁMICO) ===
    function setupSkillsModals() {
        const modal = document.getElementById('skill-modal-template');
        const openButtons = document.querySelectorAll('.open-skill-modal-btn');
        const closeButton = document.getElementById('close-skill-modal-btn');

        if (!modal || openButtons.length === 0 || !closeButton) {
            console.warn("Faltan elementos para el modal de habilidades (plantilla, botones de abrir/cerrar).");
            return;
        }

        const modalIcon = document.getElementById('modal-skill-icon');
        const modalTitle = document.getElementById('modal-skill-title');
        const modalDescription = document.getElementById('modal-skill-description');

        openButtons.forEach(button => {
            button.addEventListener('click', () => {
                // 1. Encontrar la tarjeta de habilidad más cercana
                const skillCard = button.closest('.skill-card');
                if (!skillCard) return;

                // 2. Extraer la información de la tarjeta
                const iconSrc = skillCard.querySelector('.skill-icon')?.src;
                const titleText = skillCard.querySelector('.skill-title')?.textContent;
                const descriptionText = skillCard.querySelector('.skill-description')?.textContent;

                // 3. Poblar el modal con la información
                if (modalIcon) modalIcon.src = iconSrc || '';
                if (modalTitle) modalTitle.textContent = titleText || 'Sin título';
                if (modalDescription) modalDescription.textContent = descriptionText || 'Sin descripción.';

                // 4. Mostrar el modal
                modal.classList.remove('hidden');
                modal.classList.add('flex'); // Usamos flex para centrar el contenido
            });
        });

        // Evento para cerrar el modal
        closeButton.addEventListener('click', () => {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        });
    }

    setupSkillsModals();
});

// Inicializa la función
animationButtonMenu();
