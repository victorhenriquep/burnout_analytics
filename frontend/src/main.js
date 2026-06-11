// 1. AJUSTE: Mude para a URL real da sua Azure (mantenha o /predict no final)
const API_BASE = "https://burnout-api-analytics-h8ffhrgubdbqcfdv.brazilsouth-01.azurewebsites.net";

function $(id) {
  return document.getElementById(id);
}

$("close-modal").addEventListener("click", closeResultModal);

function showPage(id) {
  document
    .querySelectorAll(".page")
    .forEach((p) => p.classList.remove("active"));

  const page = $(id);
  page.style.display = "block";
  requestAnimationFrame(() => {
    requestAnimationFrame(() => page.classList.add("active"));
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

const sliders = ["productivityScore"];

sliders.forEach((name) => {
  const input = document.querySelector(`input[name="${name}"]`);
  const display = $(`${name}-val`);
  if (!input || !display) return;

  function syncTrack() {
    const pct = ((input.value - input.min) / (input.max - input.min)) * 100;
    input.style.background = `linear-gradient(to right, var(--green) ${pct}%, var(--border) ${pct}%)`;
    display.textContent = input.value;
  }

  input.addEventListener("input", syncTrack);
  syncTrack();
});

const form = $("burnout-form");
const submitBtn = $("submit-btn");
const submitLabel = $("submit-label");
const submitLoading = $("submit-loading");
const formError = $("form-error");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  formError.style.display = "none";

  // Captura os dados formatados para o modelo Python
  const requestData = collectFormData();
  if (!requestData) return;

  setLoading(true);

  try {
    const res = await fetch(`${API_BASE}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestData.payload), // Envia o payload mapeado
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error ?? `Erro ${res.status}`);
    }

    const result = await res.json();
    renderResult(result, requestData.name); // Passa o nome guardado localmente
  } catch (err) {
    formError.textContent =
      err.message || "Não foi possível processar a avaliação. Tente novamente.";
    formError.style.display = "block";
  } finally {
    setLoading(false);
  }
});

function collectFormData() {
  const get = (name) => {
    const el = form.elements[name];
    if (!el) return null;
    if (el.type === "radio") {
      const checked = form.querySelector(`input[name="${name}"]:checked`);
      return checked ? checked.value : null;
    }
    return el.value;
  };

  const nameInput = get("name") || undefined;

  // 2. AJUSTE: As chaves do objeto agora combinam perfeitamente com as colunas do Scikit-Learn
  const payload = {
    Gender: get("gender"),
    Company_Size: get("companySize"),
    Work_Environment: get("workEnvironment"),
    Stress_Level: get("stressLevel"),
    Age: parseInt(get("age")),
    Work_Hours_Per_Day: parseFloat(get("workHoursPerDay")),
    Sleep_Hours: parseFloat(get("sleepHours")),
    Exercise_Hours_Per_Week: parseFloat(get("exerciseHoursPerWeek")),
    Screen_Time_Hours: parseFloat(get("screenTimeHours")),
    Productivity_Score: parseFloat(get("productivityScore")),
    Experience_Years: parseFloat(get("experienceYears")),
    Internet_Speed: parseFloat(get("internetSpeed")),
    Meetings_Per_Day: parseFloat(get("meetingsPerDay"))
  };

  return {
    name: nameInput,
    payload: payload
  };
}

function setLoading(on) {
  submitBtn.disabled = on;
  submitLabel.style.display = on ? "none" : "inline";
  submitLoading.style.display = on ? "inline" : "none";
}

function renderResult(result, name) {
  console.log(result);

  const { hasBurnout, probability } = result;

  const banner = $("result-banner");
  banner.className =
    "result-banner " + (hasBurnout ? "has-burnout" : "no-burnout");

  $("banner-greeting").textContent = name ? `Olá, ${name}` : "Olá";

  $("banner-label").textContent = hasBurnout
    ? "Sinais de burnout identificados"
    : "Sem indicativos de burnout";

  $("banner-message").textContent = hasBurnout
    ? "Sua avaliação indica fatores de risco relevantes."
    : "Sua avaliação não apresenta indicadores significativos de burnout no momento.";

  renderGauge(probability);
  openResultModal();
}

function renderGauge(probability) {
  const pointer = document.getElementById("gauge-pointer");
  const percentage = document.getElementById("gauge-percentage");

  // 3. AJUSTE: Converte de decimal (0.0 - 1.0) para porcentagem exibível (0% - 100%)
  const probValue = probability !== undefined ? probability : 0;
  const pct = (probValue * 100).toFixed(1);

  percentage.textContent = `${pct}%`;

  // Calcula o ângulo correto baseado na porcentagem real
  const angle = -90 + (pct * 180) / 100;
  if (pointer) {
    pointer.style.transform = `rotate(${angle}deg)`;
  }
}

function openResultModal() {
  const modal = document.getElementById("result-modal");
  // Mantém compatibilidade com ambas as formas de estilização do seu projeto
  modal.classList.add("show");
  modal.classList.add("active");
}

function closeResultModal() {
  const modal = document.getElementById("result-modal");
  modal.classList.remove("show");
  modal.classList.remove("active");
}

$("reset-btn").addEventListener("click", () => {
  closeResultModal();
  form.reset();
  
  // Sincroniza novamente os sliders visuais pós-reset
  sliders.forEach((name) => {
    const input = document.querySelector(`input[name="${name}"]`);
    if (input) {
      input.dispatchEvent(new Event("input"));
    }
  });
  
  formError.style.display = "none";
  showPage("page-form");
});

showPage("page-form");
