const allergyOptions = [
  {
    id: "milk",
    label: "Leite / lactose",
    ingredientWords: ["leite", "lactose", "caseina", "soro de leite", "manteiga", "creme de leite"],
    externalTags: ["en:milk", "en:lactose"],
  },
  {
    id: "gluten",
    label: "Gluten",
    ingredientWords: ["trigo", "gluten", "cevada", "centeio", "malte", "farinha de trigo"],
    externalTags: ["en:gluten"],
  },
  {
    id: "peanut",
    label: "Amendoim",
    ingredientWords: ["amendoim", "pasta de amendoim", "oleo de amendoim"],
    externalTags: ["en:peanuts"],
  },
  {
    id: "nuts",
    label: "Castanhas",
    ingredientWords: ["castanha", "amendoa", "noz", "avela", "avelan", "pistache", "caju"],
    externalTags: ["en:nuts", "en:tree-nuts"],
  },
  {
    id: "soy",
    label: "Soja",
    ingredientWords: ["soja", "lecitina de soja", "proteina de soja"],
    externalTags: ["en:soybeans", "en:soy"],
  },
  {
    id: "egg",
    label: "Ovo",
    ingredientWords: ["ovo", "clara", "gema", "albumina"],
    externalTags: ["en:eggs"],
  },
  {
    id: "fish",
    label: "Peixe",
    ingredientWords: ["peixe", "atum", "sardinha", "anchova"],
    externalTags: ["en:fish"],
  },
  {
    id: "sesame",
    label: "Gergelim",
    ingredientWords: ["gergelim", "tahine"],
    externalTags: ["en:sesame-seeds"],
  },
];

const sampleProducts = [
  {
    code: "7891000100103",
    name: "Iogurte natural integral",
    brand: "Demo Mercado",
    quantity: "170 g",
    source: "Base local",
    nutriScore: "B",
    novaGroup: 2,
    ingredients: "Leite integral pasteurizado e fermentos lacteos.",
    allergens: ["milk"],
    nutrition: {
      energyKcal: 63,
      carbs: 4.7,
      sugars: 4.7,
      protein: 3.5,
      fat: 3.3,
      saturatedFat: 2.1,
      transFat: 0,
      fiber: 0,
      sodiumMg: 50,
    },
  },
  {
    code: "7891000200201",
    name: "Aveia em flocos integral",
    brand: "Demo Graos",
    quantity: "250 g",
    source: "Base local",
    nutriScore: "A",
    novaGroup: 1,
    ingredients: "Aveia integral em flocos. Pode conter trigo, cevada e centeio.",
    allergens: ["gluten"],
    nutrition: {
      energyKcal: 389,
      carbs: 66.3,
      sugars: 1,
      protein: 16.9,
      fat: 6.9,
      saturatedFat: 1.2,
      transFat: 0,
      fiber: 10.6,
      sodiumMg: 2,
    },
  },
  {
    code: "7891000300309",
    name: "Barra de amendoim com chocolate",
    brand: "Demo Snacks",
    quantity: "40 g",
    source: "Base local",
    nutriScore: "D",
    novaGroup: 4,
    ingredients: "Amendoim torrado, acucar, cobertura sabor chocolate, leite em po, cacau e lecitina de soja.",
    allergens: ["peanut", "milk", "soy"],
    nutrition: {
      energyKcal: 498,
      carbs: 42,
      sugars: 30,
      protein: 16,
      fat: 30,
      saturatedFat: 9,
      transFat: 0,
      fiber: 5,
      sodiumMg: 180,
    },
  },
  {
    code: "7891000400407",
    name: "Pao integral fatiado",
    brand: "Demo Padaria",
    quantity: "400 g",
    source: "Base local",
    nutriScore: "C",
    novaGroup: 4,
    ingredients: "Farinha de trigo integral, farinha de trigo enriquecida, agua, fermento, acucar, oleo vegetal, sal e conservadores. Contem gluten. Pode conter soja.",
    allergens: ["gluten", "soy"],
    nutrition: {
      energyKcal: 248,
      carbs: 42,
      sugars: 5,
      protein: 9,
      fat: 4,
      saturatedFat: 0.8,
      transFat: 0,
      fiber: 6.5,
      sodiumMg: 430,
    },
  },
  {
    code: "7891000500505",
    name: "Bebida de amendoas sem acucar",
    brand: "Demo Bebidas",
    quantity: "1 L",
    source: "Base local",
    nutriScore: "B",
    novaGroup: 3,
    ingredients: "Agua, amendoas, calcio, sal marinho, estabilizantes e vitaminas.",
    allergens: ["nuts"],
    nutrition: {
      energyKcal: 22,
      carbs: 0.5,
      sugars: 0.2,
      protein: 0.8,
      fat: 1.7,
      saturatedFat: 0.2,
      transFat: 0,
      fiber: 0.4,
      sodiumMg: 60,
    },
  },
];

const state = {
  allergies: new Set(JSON.parse(localStorage.getItem("nutri-ai-allergies") || "[]")),
  product: sampleProducts[0],
  stream: null,
  scannerTimer: null,
  detector: null,
  zxingReader: null,
  zxingControls: null,
};

const elements = {
  allergyList: document.querySelector("#allergyList"),
  productView: document.querySelector("#productView"),
  sourceBadge: document.querySelector("#sourceBadge"),
  aiSourceBadge: document.querySelector("#aiSourceBadge"),
  heroProfileCount: document.querySelector("#heroProfileCount"),
  searchForm: document.querySelector("#searchForm"),
  productSearch: document.querySelector("#productSearch"),
  barcodeForm: document.querySelector("#barcodeForm"),
  barcodeInput: document.querySelector("#barcodeInput"),
  startScanner: document.querySelector("#startScanner"),
  stopScanner: document.querySelector("#stopScanner"),
  scannerVideo: document.querySelector("#scannerVideo"),
  scannerStatus: document.querySelector("#scannerStatus"),
  chatForm: document.querySelector("#chatForm"),
  chatInput: document.querySelector("#chatInput"),
  chatLog: document.querySelector("#chatLog"),
};

function normalizeText(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function escapeHTML(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatNumber(value, suffix = "") {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "Nao informado";
  }

  const maximumFractionDigits = Math.abs(Number(value)) >= 100 ? 0 : 1;
  return `${Number(value).toLocaleString("pt-BR", { maximumFractionDigits })}${suffix}`;
}

function saveAllergies() {
  localStorage.setItem("nutri-ai-allergies", JSON.stringify([...state.allergies]));
}

function renderAllergyOptions() {
  elements.allergyList.innerHTML = allergyOptions
    .map((allergy) => {
      const checked = state.allergies.has(allergy.id) ? "checked" : "";
      return `
        <label class="allergy-option">
          <input type="checkbox" value="${allergy.id}" ${checked} />
          <span>${escapeHTML(allergy.label)}</span>
        </label>
      `;
    })
    .join("");

  elements.allergyList.querySelectorAll("input").forEach((input) => {
    input.addEventListener("change", () => {
      if (input.checked) {
        state.allergies.add(input.value);
      } else {
        state.allergies.delete(input.value);
      }
      saveAllergies();
      renderProfileCount();
      renderProduct();
    });
  });
}

function renderProfileCount() {
  const count = state.allergies.size;
  elements.heroProfileCount.textContent = count === 1 ? "1 alergia" : `${count} alergias`;
}

function getDetectedAllergens(product) {
  if (!product) return [];

  const ingredientText = normalizeText(product.ingredients || "");
  const existing = new Set(product.allergens || []);

  allergyOptions.forEach((option) => {
    const foundByIngredient = option.ingredientWords.some((word) => ingredientText.includes(normalizeText(word)));
    if (foundByIngredient) existing.add(option.id);
  });

  return allergyOptions.filter((option) => existing.has(option.id));
}

function evaluateProduct(product) {
  const detected = getDetectedAllergens(product);
  const conflicts = detected.filter((item) => state.allergies.has(item.id));
  const nutrition = product?.nutrition || {};
  const warnings = [];

  if (conflicts.length) {
    return {
      level: "danger",
      title: "Alerta para seu perfil",
      message: `Este produto indica ${conflicts.map((item) => item.label).join(", ")}. Evite consumir sem confirmar o rotulo fisico e orientacao profissional.`,
      conflicts,
      warnings,
    };
  }

  if (nutrition.sugars > 20) warnings.push("alto teor de acucares");
  if (nutrition.saturatedFat > 5) warnings.push("gordura saturada elevada");
  if (nutrition.sodiumMg > 400) warnings.push("sodio alto");
  if ((product.novaGroup || 0) >= 4) warnings.push("ultraprocessado");

  if (warnings.length) {
    return {
      level: "warn",
      title: "Consumo com atencao",
      message: `Nao ha conflito direto com suas alergias selecionadas, mas o produto merece cuidado por: ${warnings.join(", ")}.`,
      conflicts,
      warnings,
    };
  }

  return {
    level: "ok",
    title: "Sem alerta direto",
    message: "Nao encontramos conflito com as alergias selecionadas. Mesmo assim, confira sempre o rotulo e a lista de ingredientes.",
    conflicts,
    warnings,
  };
}

function productInitial(name = "?") {
  return normalizeText(name).slice(0, 2).toUpperCase() || "?";
}

function renderProduct() {
  const product = state.product;
  elements.sourceBadge.textContent = product?.source || "Base local";

  if (!product) {
    elements.productView.innerHTML = `
      <div class="empty-state">
        <div>
          <h3>Nenhum produto selecionado</h3>
          <p>Use a busca, digite um codigo de barras ou leia pela camera.</p>
        </div>
      </div>
    `;
    return;
  }

  const result = evaluateProduct(product);
  const detected = getDetectedAllergens(product);
  const nutritionRows = [
    ["Valor energetico", formatNumber(product.nutrition.energyKcal, " kcal")],
    ["Carboidratos", formatNumber(product.nutrition.carbs, " g")],
    ["Acucares totais", formatNumber(product.nutrition.sugars, " g")],
    ["Proteinas", formatNumber(product.nutrition.protein, " g")],
    ["Gorduras totais", formatNumber(product.nutrition.fat, " g")],
    ["Gorduras saturadas", formatNumber(product.nutrition.saturatedFat, " g")],
    ["Gorduras trans", formatNumber(product.nutrition.transFat, " g")],
    ["Fibras", formatNumber(product.nutrition.fiber, " g")],
    ["Sodio", formatNumber(product.nutrition.sodiumMg, " mg")],
  ];

  const imageMarkup = product.image
    ? `<img class="product-image" src="${escapeHTML(product.image)}" alt="">`
    : `<div class="product-initial" aria-hidden="true">${escapeHTML(productInitial(product.name))}</div>`;

  elements.productView.innerHTML = `
    <div class="product-top">
      ${imageMarkup}
      <div>
        <h3 class="product-name">${escapeHTML(product.name)}</h3>
        <div class="product-meta">
          <span>${escapeHTML(product.brand || "Marca nao informada")}</span>
          <span>Codigo ${escapeHTML(product.code || "sem codigo")}</span>
          <span>${escapeHTML(product.quantity || "Por 100 g/ml")}</span>
          <span>Nutri-Score ${escapeHTML(product.nutriScore || "N/A")}</span>
        </div>
      </div>
    </div>

    <div class="risk-strip ${result.level}">
      <strong>${escapeHTML(result.title)}</strong>
      <p>${escapeHTML(result.message)}</p>
    </div>

    <div class="nutrition-layout">
      <table class="nutrition-table">
        <thead>
          <tr>
            <th>Nutriente</th>
            <th>Por 100 g/ml</th>
          </tr>
        </thead>
        <tbody>
          ${nutritionRows
            .map(
              ([label, value]) => `
                <tr>
                  <td>${escapeHTML(label)}</td>
                  <td>${escapeHTML(value)}</td>
                </tr>
              `
            )
            .join("")}
        </tbody>
      </table>

      <div class="insight-list">
        <div class="${result.level === "danger" ? "alert" : result.level === "warn" ? "warning" : ""}">
          <strong>Alergicos detectados</strong>
          <p>${detected.length ? detected.map((item) => item.label).join(", ") : "Nao informado pelo produto."}</p>
        </div>
        <div class="${(product.novaGroup || 0) >= 4 ? "warning" : ""}">
          <strong>Processamento</strong>
          <p>Grupo NOVA ${escapeHTML(product.novaGroup || "N/A")}. Quanto maior o grupo, maior tende a ser o nivel de processamento.</p>
        </div>
        <div>
          <strong>Leitura rapida</strong>
          <p>${escapeHTML(createShortNutritionRead(product))}</p>
        </div>
      </div>
    </div>

    <div class="ingredients-box">
      <h3>Ingredientes</h3>
      <p>${escapeHTML(product.ingredients || "Lista de ingredientes nao informada.")}</p>
    </div>
  `;
}

function createShortNutritionRead(product) {
  const nutrition = product.nutrition || {};
  const notes = [];

  if (nutrition.protein >= 10) notes.push("boa presenca de proteina");
  if (nutrition.fiber >= 5) notes.push("boa fonte de fibras");
  if (nutrition.sugars > 20) notes.push("muito acucar");
  if (nutrition.sodiumMg > 400) notes.push("sodio elevado");
  if (nutrition.saturatedFat > 5) notes.push("gordura saturada elevada");

  return notes.length ? notes.join(", ") : "perfil nutricional simples; observe porcao e ingredientes.";
}

function setProduct(product) {
  state.product = product;
  renderProduct();
}

function findLocalProduct(query) {
  const normalized = normalizeText(query);
  const digits = String(query).replace(/\D/g, "");
  return sampleProducts.find((product) => {
    const haystack = normalizeText(`${product.name} ${product.brand} ${product.code}`);
    return product.code === digits || haystack.includes(normalized);
  });
}

async function searchProduct(query) {
  const clean = query.trim();
  if (!clean) return;

  renderLoading(`Buscando "${clean}"...`);

  try {
    const digits = clean.replace(/\D/g, "");
    const externalProduct = digits.length >= 8 ? await fetchByBarcode(digits) : await fetchByName(clean);

    if (externalProduct) {
      setProduct(externalProduct);
      return;
    }

    const local = findLocalProduct(clean);
    if (local) {
      setProduct(local);
      return;
    }

    renderNotFound(clean);
  } catch (error) {
    const local = findLocalProduct(clean);
    if (local) {
      setProduct({ ...local, source: "Backup local" });
      return;
    }

    renderError(clean, error);
  }
}

function renderLoading(message) {
  elements.sourceBadge.textContent = "Buscando";
  elements.productView.innerHTML = `
    <div class="empty-state">
      <div>
        <h3>${escapeHTML(message)}</h3>
        <p>Consultando o banco mundial Open Food Facts e o backup local do projeto.</p>
      </div>
    </div>
  `;
}

function renderNotFound(query) {
  state.product = null;
  elements.sourceBadge.textContent = "Sem resultado";
  elements.productView.innerHTML = `
    <div class="empty-state">
      <div>
        <h3>Nao encontrei "${escapeHTML(query)}"</h3>
        <p>Confira a escrita, tente um codigo de barras completo ou use um dos produtos de exemplo.</p>
      </div>
    </div>
  `;
}

function renderError(query, error) {
  state.product = null;
  elements.sourceBadge.textContent = "Erro";
  elements.productView.innerHTML = `
    <div class="empty-state">
      <div>
        <h3>Busca indisponivel</h3>
        <p>Nao foi possivel consultar "${escapeHTML(query)}" agora. Detalhe: ${escapeHTML(error.message || "erro desconhecido")}.</p>
      </div>
    </div>
  `;
}

async function fetchJSON(url) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 9000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
  } finally {
    window.clearTimeout(timeout);
  }
}

async function fetchByBarcode(code) {
  try {
    const data = await fetchJSON(`api/products/barcode/${encodeURIComponent(code)}`);
    if (data.product) return data.product;
  } catch (error) {
    // Static hosts such as GitHub Pages do not run the backend API.
  }

  const fields = "code,product_name,brands,quantity,image_front_url,nutriments,ingredients_text,allergens_tags,categories_tags,nutriscore_grade,nova_group";
  const data = await fetchJSON(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json?fields=${fields}`);
  return data.status === 1 && data.product ? mapOpenFoodProduct(data.product) : null;
}

async function fetchByName(name) {
  try {
    const data = await fetchJSON(`api/products/search?q=${encodeURIComponent(name)}`);
    if (data.product) return data.product;
  } catch (error) {
    // Static hosts such as GitHub Pages do not run the backend API.
  }

  const params = new URLSearchParams({
    search_terms: name,
    search_simple: "1",
    action: "process",
    json: "1",
    page_size: "1",
    fields: "code,product_name,brands,quantity,image_front_url,nutriments,ingredients_text,allergens_tags,categories_tags,nutriscore_grade,nova_group",
  });
  const data = await fetchJSON(`https://world.openfoodfacts.org/cgi/search.pl?${params.toString()}`);
  const product = data.products?.[0];
  return product ? mapOpenFoodProduct(product) : null;
}

function readNumber(nutriments, keys, multiplier = 1) {
  for (const key of keys) {
    const value = Number(nutriments?.[key]);
    if (Number.isFinite(value)) return value * multiplier;
  }
  return null;
}

function mapOpenFoodProduct(raw) {
  const tags = raw.allergens_tags || [];
  const allergens = allergyOptions
    .filter((option) => option.externalTags.some((tag) => tags.includes(tag)))
    .map((option) => option.id);

  return {
    code: raw.code || "",
    name: raw.product_name || "Produto sem nome",
    brand: raw.brands || "Marca nao informada",
    quantity: raw.quantity || "Por 100 g/ml",
    image: raw.image_front_url || "",
    source: "Open Food Facts",
    nutriScore: raw.nutriscore_grade ? String(raw.nutriscore_grade).toUpperCase() : "N/A",
    novaGroup: raw.nova_group || null,
    ingredients: raw.ingredients_text || "Ingredientes nao informados pela base consultada.",
    allergens,
    nutrition: {
      energyKcal: readNumber(raw.nutriments, ["energy-kcal_100g", "energy-kcal"]),
      carbs: readNumber(raw.nutriments, ["carbohydrates_100g", "carbohydrates"]),
      sugars: readNumber(raw.nutriments, ["sugars_100g", "sugars"]),
      protein: readNumber(raw.nutriments, ["proteins_100g", "proteins"]),
      fat: readNumber(raw.nutriments, ["fat_100g", "fat"]),
      saturatedFat: readNumber(raw.nutriments, ["saturated-fat_100g", "saturated-fat"]),
      transFat: readNumber(raw.nutriments, ["trans-fat_100g", "trans-fat"]),
      fiber: readNumber(raw.nutriments, ["fiber_100g", "fiber"]),
      sodiumMg: readNumber(raw.nutriments, ["sodium_100g", "sodium"], 1000),
    },
  };
}

async function startScanner() {
  if (!navigator.mediaDevices?.getUserMedia) {
    elements.scannerStatus.textContent = "Camera nao disponivel neste navegador";
    return;
  }

  stopScanner(false);

  try {
    if ("BarcodeDetector" in window) {
      await startNativeBarcodeScanner();
      return;
    }

    if (await startZXingScanner()) {
      return;
    }

    await startPreviewOnlyScanner();
  } catch (error) {
    elements.scannerStatus.textContent = `Camera bloqueada: ${error.message}`;
  }
}

async function startNativeBarcodeScanner() {
  try {
    state.detector = new BarcodeDetector({ formats: ["ean_13", "ean_8", "upc_a", "upc_e", "code_128"] });
    state.stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" } },
      audio: false,
    });
    elements.scannerVideo.srcObject = state.stream;
    await elements.scannerVideo.play();
    elements.scannerStatus.textContent = "Aponte para o codigo";
    scanLoop();
  } catch (error) {
    state.detector = null;
    if (await startZXingScanner()) return;
    await startPreviewOnlyScanner();
  }
}

async function startZXingScanner() {
  const ZXingReader = window.ZXingBrowser?.BrowserMultiFormatReader || window.ZXing?.BrowserMultiFormatReader;
  if (!ZXingReader) return false;

  try {
    state.zxingReader = new ZXingReader();
    elements.scannerStatus.textContent = "Aponte para o codigo";
    const target = elements.scannerVideo;
    const maybeControls = state.zxingReader.decodeFromVideoDevice(null, target, (result, error, controls) => {
      if (controls) state.zxingControls = controls;
      const text = result?.text || result?.getText?.();
      if (text) {
        elements.barcodeInput.value = text;
        elements.productSearch.value = text;
        elements.scannerStatus.textContent = `Codigo ${text} encontrado`;
        stopScanner(false);
        searchProduct(text);
      }
    });

    if (maybeControls?.then) {
      state.zxingControls = await maybeControls;
    } else if (maybeControls?.stop) {
      state.zxingControls = maybeControls;
    }
    return true;
  } catch (error) {
    state.zxingReader = null;
    state.zxingControls = null;
    return false;
  }
}

async function startPreviewOnlyScanner() {
  state.stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: { ideal: "environment" } },
    audio: false,
  });
  elements.scannerVideo.srcObject = state.stream;
  await elements.scannerVideo.play();
  elements.scannerStatus.textContent = "Camera ativa; digite o codigo se a leitura automatica nao aparecer";
}

async function scanLoop() {
  if (!state.stream || !state.detector) return;

  try {
    const codes = await state.detector.detect(elements.scannerVideo);
    if (codes.length) {
      const code = codes[0].rawValue;
      elements.barcodeInput.value = code;
      elements.productSearch.value = code;
      elements.scannerStatus.textContent = `Codigo ${code} encontrado`;
      stopScanner(false);
      searchProduct(code);
      return;
    }
  } catch (error) {
    elements.scannerStatus.textContent = "Tentando ler o codigo...";
  }

  state.scannerTimer = window.requestAnimationFrame(scanLoop);
}

function stopScanner(updateStatus = true) {
  if (state.scannerTimer) {
    window.cancelAnimationFrame(state.scannerTimer);
    state.scannerTimer = null;
  }

  if (state.stream) {
    state.stream.getTracks().forEach((track) => track.stop());
    state.stream = null;
  }

  if (state.zxingControls?.stop) {
    state.zxingControls.stop();
  }
  if (state.zxingReader?.reset) {
    state.zxingReader.reset();
  }
  state.zxingControls = null;
  state.zxingReader = null;
  state.detector = null;
  elements.scannerVideo.srcObject = null;
  if (updateStatus) elements.scannerStatus.textContent = "Camera inativa";
}

function addMessage(role, text) {
  const message = document.createElement("div");
  message.className = `message ${role}`;
  message.textContent = text;
  elements.chatLog.appendChild(message);
  elements.chatLog.scrollTop = elements.chatLog.scrollHeight;
  return message;
}

function answerNutritionQuestion(question) {
  const normalized = normalizeText(question);
  const product = state.product;
  const result = product ? evaluateProduct(product) : null;
  const lines = [];

  if (normalized.includes("alerg")) {
    if (!product) {
      lines.push("Selecione um produto primeiro para eu cruzar ingredientes com seu perfil de alergias.");
    } else {
      lines.push(result.level === "danger" ? result.message : "Nao encontrei conflito direto com as alergias selecionadas nesse produto.");
    }
  }

  if (normalized.includes("tabela") || normalized.includes("nutric") || normalized.includes("equilibr")) {
    if (!product) {
      lines.push("Com um produto selecionado, eu consigo comentar calorias, acucares, fibras, sodio, gorduras e proteinas.");
    } else {
      lines.push(`${product.name}: ${createShortNutritionRead(product)} A leitura depende da porcao real consumida.`);
    }
  }

  if (normalized.includes("diabet") || normalized.includes("acucar") || normalized.includes("glicem")) {
    lines.push("Para controle glicemico, compare carboidratos totais, acucares adicionados e fibras. Produtos com mais fibras e menos acucar costumam ser escolhas melhores.");
  }

  if (normalized.includes("emagrec") || normalized.includes("peso") || normalized.includes("caloria")) {
    lines.push("Para controle de peso, olhe calorias por porcao, saciedade, proteina, fibras e frequencia de consumo. Um alimento isolado nao define a dieta.");
  }

  if (normalized.includes("pressao") || normalized.includes("hipertens") || normalized.includes("sodio") || normalized.includes("sal")) {
    lines.push("Para pressao arterial, observe o sodio. Como referencia pratica, alimentos acima de 400 mg de sodio por 100 g/ml ja merecem atencao.");
  }

  if (normalized.includes("proteina") || normalized.includes("musculo") || normalized.includes("treino")) {
    lines.push("Para apoiar treino, avalie proteina por porcao, qualidade da refeicao completa e distribuicao ao longo do dia.");
  }

  if (!lines.length) {
    lines.push("Posso ajudar a interpretar ingredientes, alergicos, acucar, sodio, fibras, proteinas e escolhas para objetivos comuns.");
    if (product) {
      lines.push(`Produto atual: ${product.name}. ${result.message}`);
    }
  }

  lines.push("Use isso como orientacao geral; para alergias graves, doencas ou dieta clinica, confirme com medico ou nutricionista.");
  return lines.join("\n\n");
}

function bindEvents() {
  elements.searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    searchProduct(elements.productSearch.value);
  });

  elements.barcodeForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const code = elements.barcodeInput.value.trim();
    elements.productSearch.value = code;
    searchProduct(code);
  });

  document.querySelectorAll("[data-query]").forEach((button) => {
    button.addEventListener("click", () => {
      elements.productSearch.value = button.dataset.query;
      searchProduct(button.dataset.query);
    });
  });

  elements.startScanner.addEventListener("click", startScanner);
  elements.stopScanner.addEventListener("click", () => stopScanner());

  elements.chatForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const question = elements.chatInput.value.trim();
    if (!question) return;
    addMessage("user", question);
    elements.chatInput.value = "";
    askAssistant(question);
  });

  document.querySelectorAll("[data-prompt]").forEach((button) => {
    button.addEventListener("click", () => {
      const prompt = button.dataset.prompt;
      addMessage("user", prompt);
      askAssistant(prompt);
    });
  });

  window.addEventListener("beforeunload", () => stopScanner(false));
}

async function askAssistant(question) {
  const pending = addMessage("assistant", "Pensando...");

  try {
    const response = await fetch("api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question,
        product: state.product,
        allergies: [...state.allergies],
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    pending.textContent = data.answer || answerNutritionQuestion(question);
    elements.aiSourceBadge.textContent = data.source === "openai" ? "OpenAI" : "Backup local";
  } catch (error) {
    pending.textContent = answerNutritionQuestion(question);
    elements.aiSourceBadge.textContent = "Backup local";
  }

  elements.chatLog.scrollTop = elements.chatLog.scrollHeight;
}

function init() {
  renderAllergyOptions();
  renderProfileCount();
  renderProduct();
  bindEvents();
  addMessage(
    "assistant",
    "Oi, eu sou o assistente do Nutri Ai. Se a chave OpenAI estiver configurada no servidor, eu respondo com IA; se nao, uso o backup local de nutricao."
  );
}

init();
