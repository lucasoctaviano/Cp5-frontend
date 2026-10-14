
(() => {
  "use strict";

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  // Tema: Light, Dark ou System, com persistência.
  const themeSelectOptions = ["light", "dark", "system"];
  let themePreference = localStorage.getItem("techflow-theme") || "system";
  if (!themeSelectOptions.includes(themePreference)) themePreference = "system";

  function applyTheme(preference) {
    themePreference = preference;
    const shouldBeDark = preference === "dark" ||
      (preference === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

    document.documentElement.classList.toggle("dark", shouldBeDark);
    localStorage.setItem("techflow-theme", preference);

    const themeButton = $("#theme-action");
    if (themeButton) {
      themeButton.innerHTML = `Tema: ${preferenceLabel(preference)} <span>◐</span>`;
    }
  }

  function preferenceLabel(value) {
    return value === "light" ? "Light" : value === "dark" ? "Dark" : "System";
  }

  applyTheme(themePreference);

  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    if (themePreference === "system") applyTheme("system");
  });

  // Sidebar responsiva.
  const sidebar = $("#sidebar");
  const overlay = $("#sidebar-overlay");

  function openSidebar() {
    sidebar.classList.remove("-translate-x-full");
    overlay.classList.remove("hidden");
    document.body.classList.add("overflow-hidden");
  }

  function closeSidebar() {
    sidebar.classList.add("-translate-x-full");
    overlay.classList.add("hidden");
    document.body.classList.remove("overflow-hidden");
  }

  $("#open-sidebar").addEventListener("click", openSidebar);
  $("#close-sidebar").addEventListener("click", closeSidebar);
  overlay.addEventListener("click", closeSidebar);

  $$("#sidebar a").forEach(link => {
    link.addEventListener("click", () => {
      if (window.innerWidth < 1024) closeSidebar();
    });
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 1024) closeSidebar();
  });

  // Dropdown do usuário.
  const userMenuButton = $("#user-menu-button");
  const userDropdown = $("#user-dropdown");

  function setDropdown(open) {
    userDropdown.classList.toggle("hidden", !open);
    userMenuButton.setAttribute("aria-expanded", String(open));
  }

  userMenuButton.addEventListener("click", event => {
    event.stopPropagation();
    setDropdown(userDropdown.classList.contains("hidden"));
  });

  document.addEventListener("click", event => {
    if (!userDropdown.contains(event.target) &&
        !userMenuButton.contains(event.target)) {
      setDropdown(false);
    }
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      setDropdown(false);
      closeSidebar();
      closeModal();
    }

    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      $("#project-search").focus();
    }
  });

  // Toast para feedback de ações.
  let toastTimer;

  function showToast(title, message, kind = "success") {
    const toast = $("#toast");

    $("#toast-title").textContent = title;
    $("#toast-message").textContent = message;

    toast.classList.remove("hidden", "toast-visible");
    toast.classList.add("toast-visible");
    toast.classList.toggle("border-rose-200", kind === "error");
    toast.classList.toggle("dark:border-rose-900", kind === "error");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
      toast.classList.add("hidden");
      toast.classList.remove("toast-visible");
    }, 3500);
  }

  // Pesquisa e filtro dos projetos.
  const searchInputs = [
    $("#project-search"),
    $("#mobile-project-search")
  ].filter(Boolean);

  const filter = $("#project-filter");
  const projectGrid = $("#project-grid");
  const emptyState = $("#empty-projects");

  function filterProjects(value) {
    const query = value.trim().toLocaleLowerCase("pt-BR");

    searchInputs.forEach(input => {
      if (input.value !== value) input.value = value;
    });

    let visible = 0;

    $$(".project-card", projectGrid).forEach(card => {
      const matchesText = (
        card.dataset.name + " " + card.textContent
      ).toLocaleLowerCase("pt-BR").includes(query);

      const matchesStatus =
        filter.value === "all" || card.dataset.status === filter.value;

      const show = matchesText && matchesStatus;

      card.classList.toggle("hidden", !show);

      if (show) visible++;
    });

    emptyState.classList.toggle("hidden", visible !== 0);

    $("#project-total").textContent =
      `${visible} ${visible === 1 ? "projeto" : "projetos"}`;
  }

  searchInputs.forEach(input => {
    input.addEventListener("input", () => filterProjects(input.value));
  });

  filter.addEventListener("change", () => {
    filterProjects(searchInputs[0]?.value || "");
  });

  $("#mobile-search-toggle").addEventListener("click", () => {
    const mobileSearch = $("#mobile-search");

    mobileSearch.classList.toggle("hidden");

    if (!mobileSearch.classList.contains("hidden")) {
      $("#mobile-project-search").focus();
    }
  });

  // Modal de cadastro de projetos.
  const modal = $("#project-modal");
  const form = $("#project-form");
  const nameInput = $("#project-name");
  const deadlineInput = $("#project-deadline");
  const descriptionInput = $("#project-description");

  let previousFocus = null;

  function openModal() {
    previousFocus = document.activeElement;

    modal.classList.remove("hidden");
    modal.classList.add("flex");
    document.body.classList.add("overflow-hidden");

    setTimeout(() => nameInput.focus(), 50);

    closeSidebar();
  }

  function closeModal() {
    if (modal.classList.contains("hidden")) return;

    modal.classList.add("hidden");
    modal.classList.remove("flex");
    document.body.classList.remove("overflow-hidden");

    if (previousFocus && typeof previousFocus.focus === "function") {
      previousFocus.focus();
    }
  }

  $("#new-project-button").addEventListener("click", openModal);
  $("#sidebar-new-project").addEventListener("click", openModal);
  $("#close-modal").addEventListener("click", closeModal);
  $("#cancel-modal").addEventListener("click", closeModal);

  modal.addEventListener("click", event => {
    if (event.target === modal) closeModal();
  });

  // Define a data mínima do prazo usando o horário local.
  function localDateISO(date = new Date()) {
    const offset = date.getTimezoneOffset();

    return new Date(date.getTime() - offset * 60000)
      .toISOString()
      .slice(0, 10);
  }

  deadlineInput.min = localDateISO();

  descriptionInput.addEventListener("input", () => {
    $("#description-counter").textContent =
      `${descriptionInput.value.length}/500`;
  });

  // Validação visual dos campos.
  function setFieldError(field, message) {
    const error = $(`[data-error-for="${field.id}"]`);

    field.setAttribute("aria-invalid", message ? "true" : "false");
    field.classList.toggle("border-rose-500", Boolean(message));

    if (error) error.textContent = message || "";
  }

  function validateField(field) {
    const value = field.value.trim();
    let message = "";

    if (field.required && !value) {
      message = "Este campo é obrigatório.";
    } else if (field.id === "project-name" && value.length < 3) {
      message = "Informe pelo menos 3 caracteres.";
    } else if (
      field.id === "project-description" &&
      value.length < 10
    ) {
      message = "A descrição deve ter pelo menos 10 caracteres.";
    } else if (
      field.id === "project-deadline" &&
      value &&
      value < localDateISO()
    ) {
      message = "O prazo não pode estar no passado.";
    }

    setFieldError(field, message);

    return !message;
  }

  const fieldsToValidate = [
    nameInput,
    $("#project-owner"),
    $("#project-category"),
    deadlineInput,
    descriptionInput
  ];

  fieldsToValidate.forEach(field => {
    field.addEventListener("blur", () => validateField(field));

    field.addEventListener("input", () => {
      if (field.getAttribute("aria-invalid") === "true") {
        validateField(field);
      }
    });

    field.addEventListener("change", () => {
      if (field.getAttribute("aria-invalid") === "true") {
        validateField(field);
      }
    });
  });

  // Cria o card de um novo projeto.
  function createProjectCard(data) {
    const card = document.createElement("article");

    card.className = "project-card group";
    card.dataset.name = data.name;
    card.dataset.status = "Planejamento";

    const icon = data.category.includes("Design") ? "✳" :
      data.category.includes("Marketing") ? "↗" :
      data.category.includes("Dados") ? "▤" :
      data.category.includes("Operações") ? "⌘" :
      data.category.includes("People") ? "▧" : "▣";

    const iconColor = data.category.includes("Design") ? "violet" :
      data.category.includes("Marketing") ? "pink" :
      data.category.includes("Dados") ? "emerald" :
      data.category.includes("Operações") ? "amber" : "sky";

    const priorityDot = data.priority === "Alta" ? "bg-rose-500" :
      data.priority === "Média" ? "bg-amber-500" : "bg-emerald-500";

    const formattedDate = new Date(`${data.deadline}T12:00:00`)
      .toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      });

    card.innerHTML = `
      <div class="mb-5 flex items-start justify-between gap-3">
        <div class="flex items-center gap-3 min-w-0">
          <div class="project-symbol bg-${iconColor}-100 text-${iconColor}-700 dark:bg-${iconColor}-950 dark:text-${iconColor}-300">${icon}</div>
          <div class="min-w-0">
            <h4 class="truncate font-bold text-slate-900 transition-colors group-hover:text-brand-600 dark:text-white dark:group-hover:text-indigo-300"></h4>
            <p class="mt-1 text-xs text-slate-500"></p>
          </div>
        </div>
        <button class="project-menu" aria-label="Opções do novo projeto">•••</button>
      </div>

      <div class="mb-4 flex flex-wrap items-center gap-2">
        <span class="status-pill status-planning">Planejamento</span>
        <span class="priority-pill">
          <span class="h-1.5 w-1.5 rounded-full ${priorityDot}"></span>
        </span>
      </div>

      <p class="mb-5 text-sm leading-6 text-slate-500 dark:text-slate-400"></p>

      <div class="mb-4 flex items-center justify-between text-xs">
        <span class="font-medium text-slate-500">Progresso</span>
        <span class="font-bold">0%</span>
      </div>

      <div class="progress-track">
        <div class="h-full w-0 rounded-full bg-${iconColor}-500 transition-all duration-500"></div>
      </div>

      <div class="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
        <div class="flex -space-x-2">
          <span class="avatar bg-indigo-500">${data.owner.split(" ").map(part => part[0]).slice(0, 2).join("")}</span>
        </div>
        <span class="text-xs text-slate-500">▣ ${formattedDate}</span>
      </div>
    `;

    $("h4", card).textContent = data.name;
    $("p", card).textContent = data.category;

    const pills = $$(".priority-pill", card);

    if (pills[0]) {
      pills[0].lastElementChild.after(
        document.createTextNode(`${data.priority} prioridade`)
      );
    }

    const paragraphs = $$("p", card);

    paragraphs[paragraphs.length - 1].textContent = data.description;

    // Permite mostrar feedback no menu do novo card.
    $(".project-menu", card).addEventListener("click", () => {
      showToast(
        "Opções do projeto",
        `Projeto: ${data.name}. As ações avançadas são demonstrativas.`
      );
    });

    return card;
  }

  // Envio e validação do formulário.
  form.addEventListener("submit", event => {
    event.preventDefault();

    const valid = fieldsToValidate.map(validateField).every(Boolean);

    if (!valid) {
      const firstInvalid = fieldsToValidate.find(
        field => field.getAttribute("aria-invalid") === "true"
      );

      firstInvalid?.focus();

      const alert = $("#form-alert");

      alert.className =
        "mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300";

      alert.textContent =
        "Confira os campos destacados antes de continuar.";

      alert.classList.remove("hidden");

      return;
    }

    const data = {
      name: nameInput.value.trim(),
      owner: $("#project-owner").value,
      category: $("#project-category").value,
      priority: $("#project-priority").value,
      deadline: deadlineInput.value,
      description: descriptionInput.value.trim()
    };

    const card = createProjectCard(data);

    projectGrid.prepend(card);

    form.reset();

    fieldsToValidate.forEach(field => setFieldError(field, ""));

    $("#description-counter").textContent = "0/500";
    $("#form-alert").classList.add("hidden");

    filter.value = "all";
    filterProjects("");

    closeModal();

    showToast(
      "Projeto criado!",
      `${data.name} foi adicionado à lista. Os dados ficam nesta sessão e não são enviados a um servidor.`
    );

    updateSubmitState();
  });

  // Seletor de tema.
  $("#theme-action").addEventListener("click", () => {
    setDropdown(false);
    showThemeChooser();
  });

  function showThemeChooser() {
    let panel = $("#theme-chooser");

    if (panel) {
      panel.remove();
      return;
    }

    panel = document.createElement("div");
    panel.id = "theme-chooser";

    panel.className =
      "fixed bottom-4 left-4 z-[80] w-[calc(100%-2rem)] max-w-xs rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-700 dark:bg-slate-900 sm:bottom-6 sm:left-auto sm:right-6";

    panel.innerHTML = `
      <div class="mb-3 flex items-center justify-between">
        <div>
          <p class="text-sm font-bold text-slate-900 dark:text-white">Aparência</p>
          <p class="text-xs text-slate-500 dark:text-slate-400">Escolha como o painel aparece.</p>
        </div>
        <button id="theme-close" class="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Fechar opções de tema">✕</button>
      </div>

      <div class="grid grid-cols-3 gap-2">
        <button data-theme="light" class="theme-choice">☀️<span>Light</span></button>
        <button data-theme="dark" class="theme-choice">🌙<span>Dark</span></button>
        <button data-theme="system" class="theme-choice">◐<span>System</span></button>
      </div>

      <p class="mt-3 text-xs text-slate-500 dark:text-slate-400">A preferência fica salva neste navegador.</p>
    `;

    document.body.appendChild(panel);

    $$(".theme-choice", panel).forEach(button => {
      button.className +=
        button.dataset.theme === themePreference ? " theme-choice-active" : "";

      button.addEventListener("click", () => {
        applyTheme(button.dataset.theme);

        $$(".theme-choice", panel).forEach(item => {
          item.classList.toggle(
            "theme-choice-active",
            item.dataset.theme === themePreference
          );
        });
      });
    });

    $("#theme-close", panel).addEventListener("click", () => panel.remove());
  }

  // Ações demonstrativas da interface.
  $("#settings-shortcut").addEventListener("click", showThemeChooser);

  $("#profile-action").addEventListener("click", () => {
    setDropdown(false);
    showToast(
      "Perfil demonstrativo",
      "A área de perfil pode ser conectada a uma página própria."
    );
  });

  $("#logout-action").addEventListener("click", () => {
    setDropdown(false);
    showToast(
      "Sessão demonstrativa",
      "Este protótipo não possui autenticação."
    );
  });

  $("#notifications-button").addEventListener("click", () => {
    showToast(
      "Notificações",
      "Você está em dia com as atualizações mais recentes."
    );
  });

  // Exportação dos projetos visíveis para CSV.
  $("#export-button").addEventListener("click", () => {
    const rows = [
      ["Projeto", "Status"],
      ...$$(".project-card", projectGrid)
        .filter(card => !card.classList.contains("hidden"))
        .map(card => [card.dataset.name, card.dataset.status])
    ];

    const csv = rows.map(row =>
      row.map(value =>
        `"${String(value).replaceAll('"', '""')}"`
      ).join(";")
    ).join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "techflow-projetos.csv";
    link.click();

    URL.revokeObjectURL(url);

    showToast(
      "Exportação iniciada",
      "O arquivo CSV foi gerado com os projetos visíveis."
    );
  });

  $("#view-all-button").addEventListener("click", () => {
    filter.value = "all";
    filterProjects("");

    showToast(
      "Lista completa",
      "Todos os projetos disponíveis estão sendo exibidos."
    );
  });

  $("#activity-see-all").addEventListener("click", () => {
    showToast(
      "Atividades",
      "Esta tela apresenta uma amostra das atividades recentes."
    );
  });

  $("#calendar-button").addEventListener("click", () => {
    showToast(
      "Calendário",
      "A integração com calendário não faz parte deste protótipo."
    );
  });

  $("#chart-period").addEventListener("change", event => {
    const multipliers = {
      week: [42, 58, 64, 46, 50, 72, 80, 60, 67, 88, 35, 48, 26, 32],
      month: [32, 47, 55, 62, 70, 58, 82, 75, 66, 91, 48, 60, 40, 72],
      year: [25, 40, 36, 58, 52, 70, 64, 83, 73, 90, 61, 76, 48, 68]
    };

    const values = multipliers[event.target.value];

    $$(".chart-bars", $("#productivity-chart")).forEach((barGroup, index) => {
      const first = barGroup.children[0];
      const second = barGroup.children[1];

      first.style.height = values[index * 2] + "%";
      second.style.height = values[index * 2 + 1] + "%";
    });
  });

  $$(".project-menu").forEach(button => {
    button.addEventListener("click", () => {
      const card = button.closest(".project-card");

      showToast(
        "Opções do projeto",
        `Projeto: ${card.dataset.name}. As ações avançadas são demonstrativas.`
      );
    });
  });

  // Desabilita o botão até os campos obrigatórios estarem válidos.
  function updateSubmitState() {
    const ready = fieldsToValidate.every(field =>
      field.value.trim() && validateField(field)
    );

    $("#submit-project").disabled = !ready;
  }

  fieldsToValidate.forEach(field => {
    field.addEventListener("input", updateSubmitState);
    field.addEventListener("change", updateSubmitState);
  });

  $("#submit-project").disabled = true;
})();
