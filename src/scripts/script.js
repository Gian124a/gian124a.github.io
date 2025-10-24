// === FUNCIÓN PRINCIPAL DE ANIMACIÓN ===
function animationButtonMenu() {
  const menu = document.getElementById('menu-container');
  const activeBg = document.getElementById('active-bg');
  const links = menu.querySelectorAll('a');
  const buttonMenu = document.getElementById('button-menu');
  let userClicked = false;
  let clickTimeout;
  
  // --- Controla el movimiento del fondo activo ---
  function moveBgTo(link) {
    // Determina si el menú es vertical (móvil) u horizontal (escritorio/móvil horizontal)
    // basándose en el estilo computado, que es más fiable que el ancho de la ventana.
    const isMobile = window.getComputedStyle(menu).flexDirection === 'column';

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
    links.forEach(l => l.classList.remove('active', 'pointer-events-none'));
    link.classList.add('active', 'pointer-events-none');
    moveBgTo(link);
  }

  // --- Scroll suave a la sección con offset para el header ---
  function scrollToSection(targetId) {
    const targetSection = document.getElementById(targetId);
    if (!targetSection) return;

    const header = document.querySelector('header');
    let headerOffset = 0;

    // Solo necesitamos compensar la altura del header si este es 'fixed',
    // ya que es el único caso en el que se superpone al contenido.
    if (header && window.getComputedStyle(header).position === 'fixed') {
        headerOffset = header.offsetHeight;
    }

    // Calculamos la posición final restando el offset del header si es necesario.
    const elementPosition = targetSection.getBoundingClientRect().top; 
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
  }

  // --- Evento de clic en los links ---
  links.forEach(link => {
    link.addEventListener("click", e => {
      // Prevenimos el comportamiento por defecto para manejar el scroll manualmente
      e.preventDefault();

      // Marcar que el usuario hizo clic para desactivar temporalmente el scrollspy
      userClicked = true;
      clearTimeout(clickTimeout);
      clickTimeout = setTimeout(() => userClicked = false, 1000); // Reactivar después de 1s

      // 1. Activar el link visualmente
      activateLink(link);

      // 2. Hacer scroll a la sección
      scrollToSection(link.getAttribute('href').substring(1));

      // Si está en móvil, cierra el menú al seleccionar
      if (window.innerWidth < 1024) {
        menu.classList.remove('open');
      }
    });
  });

  // --- Actualiza el link activo mientras se hace scroll ---
  function updateActiveLinkOnScroll() {
    const sections = Array.from(links).map(link => {
      const id = link.getAttribute('href')?.substring(1);
      return id ? document.getElementById(id) : null;
    }).filter(Boolean); // Filtra nulos si algún enlace no tiene href o sección

    const observerOptions = {
      root: null, // Observa en el viewport principal
      rootMargin: '-50% 0px -50% 0px', // Activa cuando el centro de la sección cruza el centro de la pantalla
      threshold: 0
    };

    const observer = new IntersectionObserver(entries => {
      if (userClicked) return; // Si el usuario acaba de hacer clic, no hacer nada

      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          const correspondingLink = menu.querySelector(`a[href="#${sectionId}"]`);
          if (correspondingLink) {
            activateLink(correspondingLink);
          }
        }
      });
    }, observerOptions);

    sections.forEach(section => {
      if (section) observer.observe(section);
    });
  }

  // --- Mueve el fondo al primer elemento al cargar ---
  window.addEventListener('load', () => {
    activateLink(links[0]);
    updateActiveLinkOnScroll(); // Inicia el observador de scroll
  });

  // --- Reajusta la posición al redimensionar ---
  window.addEventListener('resize', () => {
    const activeLink = document.querySelector('a.active') || links[0];
    moveBgTo(activeLink);
  });

  // --- Abre / Cierra menú en móviles ---
  buttonMenu.addEventListener('click', () => {
    menu.classList.toggle('open');
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
        const dotsToShow = Math.min(Math.ceil(totalCards / (window.innerWidth >= 640 ? 2 : 1)), maxDots); // Muestra 2 tarjetas en sm y superior
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

            const isSmScreen = window.innerWidth >= 640; // sm breakpoint
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
            threshold: 0.1 // Reducido para detectar la visibilidad de las tarjetas de forma más fiable
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

    // === LÓGICA MODAL DE PROYECTOS (DINÁMICO) ===
    function setupProjectModals() {
        const modal = document.getElementById('project-modal-template');
        const openButtons = document.querySelectorAll('.open-project-modal-btn');
        const closeButton = document.getElementById('close-project-modal-btn');

        if (!modal || openButtons.length === 0 || !closeButton) {
            console.warn("Faltan elementos para el modal de proyectos (plantilla, botones de abrir/cerrar).");
            return;
        }

        const modalImage = document.getElementById('modal-project-image');
        const modalPlaceholder = document.getElementById('modal-project-placeholder');
        const modalTitle = document.getElementById('modal-project-title');
        const modalDescription = document.getElementById('modal-project-description');
        const modalLink = document.getElementById('modal-project-link');

        openButtons.forEach(button => {
            button.addEventListener('click', () => {
                // 1. Encontrar la tarjeta de proyecto más cercana
                const projectCard = button.closest('.project-card');
                if (!projectCard) return;

                // 2. Extraer la información de la tarjeta
                const imageContainer = projectCard.querySelector('.project-image');
                const imageSrc = imageContainer?.src; // .src solo existe en elementos <img>

                const titleText = projectCard.querySelector('.project-title')?.textContent;
                const descriptionText = projectCard.querySelector('.project-description')?.textContent;
                const projectUrl = projectCard.dataset.projectUrl;

                // 3. Poblar el modal con la información
                if (imageSrc && modalImage && modalPlaceholder) {
                    // Si hay una imagen, la mostramos y ocultamos el texto
                    modalImage.src = imageSrc;
                    modalImage.classList.remove('hidden');
                    modalPlaceholder.classList.add('hidden');
                } else if (modalImage && modalPlaceholder) {
                    // Si no hay imagen, ocultamos la imagen y mostramos el texto
                    modalImage.classList.add('hidden');
                    modalPlaceholder.classList.remove('hidden');
                }

                if (modalTitle) modalTitle.textContent = titleText || 'Sin título';
                if (modalDescription) modalDescription.textContent = descriptionText || 'Sin descripción.';
                if (modalLink) {
                    modalLink.href = projectUrl || '#';
                    // Ocultar el botón si no hay URL
                    modalLink.style.display = projectUrl && projectUrl !== '#' ? 'flex' : 'none';
                }

                // 4. Mostrar el modal
                modal.classList.remove('opacity-0', 'pointer-events-none');
                modal.classList.add('opacity-100', 'pointer-events-auto');
                modal.querySelector('div:first-child').classList.remove('scale-95', 'opacity-0');
                modal.querySelector('div:first-child').classList.add('scale-100', 'opacity-100');
            });
        });

        // Evento para cerrar el modal
        closeButton.addEventListener('click', () => {
            modal.classList.remove('opacity-100', 'pointer-events-auto');
            modal.classList.add('opacity-0', 'pointer-events-none');
            modal.querySelector('div:first-child').classList.remove('scale-100', 'opacity-100');
            modal.querySelector('div:first-child').classList.add('scale-95', 'opacity-0');
        });
    }

    setupProjectModals();


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
                // Para la transición, manipulamos opacidad y pointer-events
                modal.classList.remove('opacity-0', 'pointer-events-none');
                modal.classList.add('opacity-100', 'pointer-events-auto');
                // También para la card interna, para un efecto de "zoom"
                modal.querySelector('div:first-child').classList.remove('scale-95', 'opacity-0');
                modal.querySelector('div:first-child').classList.add('scale-100', 'opacity-100');
            });
        });

        // Evento para cerrar el modal
        closeButton.addEventListener('click', () => {
            // Para la transición, manipulamos opacidad y pointer-events
            modal.classList.remove('opacity-100', 'pointer-events-auto');
            modal.classList.add('opacity-0', 'pointer-events-none');
            modal.querySelector('div:first-child').classList.remove('scale-100', 'opacity-100');
            modal.querySelector('div:first-child').classList.add('scale-95', 'opacity-0');
        });
    }

    setupSkillsModals();

    // === LÓGICA DE VALIDACIÓN DEL FORMULARIO DE CONTACTO ===
    function setupFormValidation() {
        const form = document.getElementById('contact-form');
        if (!form) {
            console.warn("No se encontró el formulario de contacto con el ID 'contact-form'.");
            return;
        }

        const fields = {
            name: { required: true, message: 'El nombre completo es obligatorio.' },
            email: { required: true, isEmail: true, message: 'Por favor, introduce un correo electrónico válido.' },
            phone: { required: true, isPhone: true, message: 'El teléfono es obligatorio.', invalidMessage: 'Por favor, introduce un número de teléfono válido.' },
            asunto: { required: true, message: 'El asunto es obligatorio.' },
            message: { required: true, message: 'El mensaje no puede estar vacío.' }
        };

        const validateEmail = (email) => {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(String(email).toLowerCase());
        };

        const validatePhone = (phone) => {
            const re = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im;
            return re.test(String(phone));
        };

        const validateField = (input) => {
            const fieldName = input.name;
            const config = fields[fieldName];
            let isValid = true;

            if (config.required && !input.value.trim()) {
                showError(input, config.message);
                isValid = false;
            } else if (config.isEmail && !validateEmail(input.value.trim())) {
                showError(input, config.message);
                isValid = false;
            } else if (config.isPhone && input.value.trim() && !validatePhone(input.value.trim())) {
                showError(input, config.invalidMessage);
                isValid = false;
            } else {
                clearError(input);
            }
            return isValid;
        };

        const showError = (input, message) => {
            const formField = input.parentElement;
            const errorContainer = formField.querySelector('.error-message');
            errorContainer.textContent = message;
            input.classList.add('input-error');
        };

        const clearError = (input) => {
            const formField = input.parentElement;
            const errorContainer = formField.querySelector('.error-message');
            errorContainer.textContent = '';
            input.classList.remove('input-error');
        };

        let toastTimeout;
        const showToast = (message, type = 'success') => {
            const toast = document.getElementById('toast-notification');
            if (!toast) return;

            clearTimeout(toastTimeout);

            // Reiniciar estado de color
            toast.classList.remove('success', 'error');

            toast.textContent = message;
            toast.classList.add(type); // 'success' or 'error'
            
            // Mostrar el toast con una transición suave
            toast.classList.remove('opacity-0', 'pointer-events-none');
            toast.classList.add('opacity-100', 'pointer-events-auto');

            toastTimeout = setTimeout(() => {
                toast.classList.replace('opacity-100', 'opacity-0');
                toast.classList.add('pointer-events-none');
            }, 5000); // Ocultar después de 5 segundos
        };

        form.addEventListener('submit', async (e) => {
            e.preventDefault(); // Prevenir siempre el envío por defecto para manejarlo con JS

            let isValid = true;
            for (const fieldName in fields) {
                if (!validateField(form.elements[fieldName])) {
                    isValid = false;
                }
            }

            const submitButton = form.querySelector('button[type="submit"]');

            if (isValid) {
                // El formulario es válido, enviar con Fetch
                const originalButtonText = submitButton.textContent;
                submitButton.disabled = true;
                submitButton.textContent = 'Enviando...';

                try {
                    const response = await fetch(form.action, {
                        method: form.method,
                        body: new FormData(form),
                        headers: { 'Accept': 'application/json' }
                    });

                    if (response.ok) {
                        showToast('¡Gracias! Tu mensaje ha sido enviado.', 'success');
                        form.reset(); // Limpiar el formulario
                    } else {
                        throw new Error('Hubo un problema con el envío.');
                    }
                } catch (error) {
                    showToast('Error al enviar. Inténtalo de nuevo.', 'error');
                } finally {
                    submitButton.disabled = false;
                    submitButton.textContent = originalButtonText;
                }
            } else {
                // Opcional: Enfocar el primer campo con error
                const firstErrorField = form.querySelector('.input-error');
                if (firstErrorField) firstErrorField.focus();
            }
        });

        // Validar en tiempo real mientras el usuario escribe o sale del campo
        for (const fieldName in fields) {
            const input = form.elements[fieldName];
            input.addEventListener('input', () => validateField(input));
            input.addEventListener('blur', () => validateField(input));
        }
    }

    setupFormValidation();

    // === GESTIÓN INTELIGENTE DE SCROLL TÁCTIL ===
    function setupSmartScroll() {
        const scrollContainers = document.querySelectorAll('#scroll-container, #projects-scroll-container, #skills-scroll-container');

        scrollContainers.forEach(container => {
            let touchStartX = 0;
            let touchStartY = 0;
            let lastTouchY = 0;
            let scrollDirection = '';

            container.addEventListener('touchstart', (e) => {
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
                lastTouchY = e.touches[0].clientY;
                scrollDirection = '';
            }, { passive: false });

            container.addEventListener('touchmove', (e) => {
                const deltaX = e.touches[0].clientX - touchStartX;
                const deltaY = e.touches[0].clientY - touchStartY;

                if (!scrollDirection) {
                    if (Math.abs(deltaY) > Math.abs(deltaX)) {
                        scrollDirection = 'vertical';
                    } else {
                        scrollDirection = 'horizontal';
                    }
                }

                if (scrollDirection === 'vertical') {
                    e.preventDefault();
                    const currentTouchY = e.touches[0].clientY;
                    const scrollAmount = lastTouchY - currentTouchY;
                    window.scrollBy(0, scrollAmount);
                    lastTouchY = currentTouchY;
                }
            }, { passive: false });

            container.addEventListener('touchend', () => {
                scrollDirection = '';
            });
        });
    }

    setupSmartScroll();
});

// Inicializa la función
animationButtonMenu();
