const API_BASE = "http://127.0.0.1:5000";

function $(id) {
  return document.getElementById(id);
}

$("close-modal").addEventListener("click", closeResultModal);

$("reset-btn").addEventListener("click", () => {
  closeResultModal();

  form.reset();

  sliders.forEach((name) => {
    const input = document.querySelector(`input[name="${name}"]`);
    if (input) {
      input.dispatchEvent(new Event("input"));
    }
  });

  formError.style.display = "none";
});

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

  const data = collectFormData();
  if (!data) return;

  setLoading(true);

  try {
    const res = await fetch(`${API_BASE}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error ?? `Erro ${res.status}`);
    }

    const result = await res.json();
    renderResult(result, data.name);
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

  const errors = [];

  if (errors.length) {
    formError.textContent = errors.join(" ");
    formError.style.display = "block";
    return null;
  }

  return {
    name: get("name") || undefined,
    age: parseInt(get("age")),
    gender: get("gender"),
    country: get("country"),
    jobRole: get("jobRole"),
    companySize: get("companySize"),
    workEnvironment: get("workEnvironment"),
    experienceYears: parseInt(get("experienceYears")),
    workHoursPerDay: parseInt(get("workHoursPerDay")),
    meetingsPerDay: parseInt(get("meetingsPerDay")),
    internetSpeedMbps: parseInt(get("internetSpeed")),
    sleepHours: parseFloat(get("sleepHours")),
    exerciseHoursPerWeek: parseFloat(get("exerciseHoursPerWeek")),
    screenTimeHours: parseFloat(get("screenTimeHours")),
    stressLevel: get("stressLevel"),
    productivityScore: parseInt(get("productivityScore")),
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

  $("banner-greeting").textContent =
    name ? `Olá, ${name}` : "Olá";

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

  percentage.textContent = `${probability}%`;

  const angle = -90 + (probability * 180) / 100;

  pointer.style.transform = `rotate(${angle}deg)`;
}

function openResultModal() {
  document
    .getElementById("result-modal")
    .classList.add("show");
}

function closeResultModal() {
  document
    .getElementById("result-modal")
    .classList.remove("show");
}

$("reset-btn").addEventListener("click", () => {
  form.reset();
  // re-sync sliders after reset
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
