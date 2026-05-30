const fs = require("fs");
const http = require("http");
const path = require("path");

const root = __dirname;

loadEnvFile(path.join(root, ".env"));

const port = Number(process.env.PORT || 5173);
const host = process.env.HOST || "0.0.0.0";
const openaiModel = process.env.OPENAI_MODEL || "gpt-4.1-mini";
const dataDir = path.join(root, "data");
const cachePath = path.join(dataDir, "food-cache.json");

const openFoodFields = [
  "code",
  "product_name",
  "brands",
  "quantity",
  "image_front_url",
  "nutriments",
  "ingredients_text",
  "ingredients_text_pt",
  "allergens_tags",
  "nutriscore_grade",
  "nova_group",
].join(",");

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

function loadEnvFile(envPath) {
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;

    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();
    if (!key || process.env[key]) continue;

    if (
      (value.startsWith("\"") && value.endsWith("\"")) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}

const allergyMap = [
  { id: "milk", tags: ["en:milk", "en:lactose"], words: ["leite", "lactose", "caseina", "soro de leite"] },
  { id: "gluten", tags: ["en:gluten"], words: ["gluten", "trigo", "cevada", "centeio", "malte"] },
  { id: "peanut", tags: ["en:peanuts"], words: ["amendoim"] },
  { id: "nuts", tags: ["en:nuts", "en:tree-nuts"], words: ["castanha", "amendoa", "noz", "avela", "pistache"] },
  { id: "soy", tags: ["en:soybeans", "en:soy"], words: ["soja", "lecitina de soja"] },
  { id: "egg", tags: ["en:eggs"], words: ["ovo", "clara", "gema", "albumina"] },
  { id: "fish", tags: ["en:fish"], words: ["peixe", "atum", "sardinha"] },
  { id: "sesame", tags: ["en:sesame-seeds"], words: ["gergelim", "tahine"] },
];

const backupProducts = [
  {
    code: "7891000100103",
    name: "Iogurte natural integral",
    brand: "Demo Mercado",
    quantity: "170 g",
    source: "Backup local",
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
    source: "Backup local",
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
    source: "Backup local",
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
    source: "Backup local",
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
    source: "Backup local",
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

function ensureCache() {
  fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(cachePath)) {
    fs.writeFileSync(cachePath, JSON.stringify({ products: {}, queries: {} }, null, 2));
  }
}

function readCache() {
  ensureCache();
  try {
    return JSON.parse(fs.readFileSync(cachePath, "utf8"));
  } catch (error) {
    return { products: {}, queries: {} };
  }
}

function writeCache(cache) {
  ensureCache();
  fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2));
}

function send(res, status, body, type = "text/plain; charset=utf-8") {
  res.writeHead(status, { "Content-Type": type });
  res.end(body);
}

function sendJSON(res, status, data) {
  send(res, status, JSON.stringify(data), "application/json; charset=utf-8");
}

function normalizeText(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function readNumber(nutriments, keys, multiplier = 1) {
  for (const key of keys) {
    const value = Number(nutriments?.[key]);
    if (Number.isFinite(value)) return value * multiplier;
  }
  return null;
}

function mapOpenFoodProduct(raw, source = "Open Food Facts") {
  const tags = raw.allergens_tags || [];
  const ingredients = raw.ingredients_text_pt || raw.ingredients_text || "Ingredientes nao informados pela base consultada.";
  const normalizedIngredients = normalizeText(ingredients);
  const allergens = allergyMap
    .filter((allergy) => {
      const tagMatch = allergy.tags.some((tag) => tags.includes(tag));
      const wordMatch = allergy.words.some((word) => normalizedIngredients.includes(normalizeText(word)));
      return tagMatch || wordMatch;
    })
    .map((allergy) => allergy.id);

  return {
    code: raw.code || "",
    name: raw.product_name || "Produto sem nome",
    brand: raw.brands || "Marca nao informada",
    quantity: raw.quantity || "Por 100 g/ml",
    image: raw.image_front_url || "",
    source,
    nutriScore: raw.nutriscore_grade ? String(raw.nutriscore_grade).toUpperCase() : "N/A",
    novaGroup: raw.nova_group || null,
    ingredients,
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

function findBackupProduct(query) {
  const normalized = normalizeText(query);
  const digits = String(query).replace(/\D/g, "");

  return backupProducts.find((product) => {
    const haystack = normalizeText(`${product.name} ${product.brand} ${product.code}`);
    return product.code === digits || haystack.includes(normalized);
  });
}

async function fetchOpenFoodByBarcode(code) {
  const url = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json?fields=${openFoodFields}`;
  const response = await fetch(url, { headers: { Accept: "application/json", "User-Agent": "NutriAi/1.0" } });
  if (!response.ok) throw new Error(`Open Food Facts HTTP ${response.status}`);
  const data = await response.json();
  if (data.status !== 1 || !data.product) return null;
  return mapOpenFoodProduct(data.product);
}

async function fetchOpenFoodByName(query) {
  const params = new URLSearchParams({
    search_terms: query,
    search_simple: "1",
    action: "process",
    json: "1",
    page_size: "1",
    fields: openFoodFields,
  });
  const response = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?${params.toString()}`, {
    headers: { Accept: "application/json", "User-Agent": "NutriAi/1.0" },
  });
  if (!response.ok) throw new Error(`Open Food Facts HTTP ${response.status}`);
  const data = await response.json();
  const product = data.products?.[0];
  return product ? mapOpenFoodProduct(product) : null;
}

function cacheProduct(cache, product) {
  if (!product?.code) return;
  cache.products[product.code] = {
    ...product,
    source: product.source.includes("cache") ? product.source : `${product.source} + cache local`,
    cachedAt: new Date().toISOString(),
  };
}

async function getProductByBarcode(code) {
  const cache = readCache();
  if (cache.products[code]) {
    return { ...cache.products[code], source: "Cache local" };
  }

  const backup = findBackupProduct(code);
  if (backup) return backup;

  const product = await fetchOpenFoodByBarcode(code);
  if (product) {
    cacheProduct(cache, product);
    writeCache(cache);
  }
  return product;
}

async function searchProduct(query) {
  const cache = readCache();
  const normalized = normalizeText(query);
  const cachedCode = cache.queries[normalized];
  if (cachedCode && cache.products[cachedCode]) {
    return { ...cache.products[cachedCode], source: "Cache local" };
  }

  const backup = findBackupProduct(query);
  if (backup) return backup;

  const product = await fetchOpenFoodByName(query);
  if (product) {
    cacheProduct(cache, product);
    cache.queries[normalized] = product.code;
    writeCache(cache);
  }
  return product;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 100000) {
        req.destroy();
        reject(new Error("Payload muito grande"));
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function localNutritionAnswer(question, product, allergyIds) {
  const normalized = normalizeText(question);
  const lines = [];
  const nutrition = product?.nutrition || {};
  const selected = new Set(allergyIds || []);
  const conflicts = (product?.allergens || []).filter((id) => selected.has(id));

  if (conflicts.length) {
    lines.push("Existe alerta de alergia para o perfil selecionado. Confira o rotulo fisico antes de consumir.");
  }

  if (normalized.includes("alerg")) {
    lines.push(conflicts.length ? "Evite esse produto se a alergia for confirmada ou grave." : "Nao encontrei conflito direto com as alergias selecionadas.");
  }

  if (normalized.includes("tabela") || normalized.includes("nutric") || normalized.includes("equilibr")) {
    if (product) {
      const notes = [];
      if (nutrition.protein >= 10) notes.push("boa presenca de proteina");
      if (nutrition.fiber >= 5) notes.push("boa fonte de fibras");
      if (nutrition.sugars > 20) notes.push("alto teor de acucar");
      if (nutrition.sodiumMg > 400) notes.push("sodio elevado");
      lines.push(`${product.name}: ${notes.length ? notes.join(", ") : "perfil simples; observe porcao e ingredientes"}.`);
    } else {
      lines.push("Selecione um produto para eu interpretar a tabela nutricional.");
    }
  }

  if (normalized.includes("sodio") || normalized.includes("sal") || normalized.includes("pressao")) {
    lines.push("Para sodio, acima de 400 mg por 100 g/ml ja merece atencao, especialmente para hipertensao.");
  }

  if (normalized.includes("acucar") || normalized.includes("diabet") || normalized.includes("glicem")) {
    lines.push("Compare carboidratos totais, acucares e fibras; mais fibras e menos acucar costuma ser melhor para controle glicemico.");
  }

  if (!lines.length) {
    lines.push("Posso interpretar alergicos, ingredientes, sodio, acucar, fibras, proteinas e nivel de processamento do produto selecionado.");
  }

  lines.push("Essa orientacao e geral e nao substitui medico ou nutricionista.");
  return lines.join("\n\n");
}

function extractOpenAIText(data) {
  if (data.output_text) return data.output_text;
  const parts = [];
  for (const output of data.output || []) {
    for (const content of output.content || []) {
      if (content.type === "output_text" && content.text) parts.push(content.text);
      if (content.text && typeof content.text === "string") parts.push(content.text);
    }
  }
  return parts.join("\n").trim();
}

async function askOpenAI(question, product, allergies) {
  if (!process.env.OPENAI_API_KEY) return null;

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: openaiModel,
      instructions:
        "Voce e um assistente de nutricao em portugues do Brasil. Responda com orientacao geral, clara e curta. Nao diagnostique, nao prescreva dieta clinica e recomende medico ou nutricionista para alergias graves, doencas, gestacao, criancas ou sintomas.",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: JSON.stringify({
                pergunta: question,
                produtoAtual: product || null,
                alergiasSelecionadas: allergies || [],
              }),
            },
          ],
        },
      ],
      max_output_tokens: 450,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI HTTP ${response.status}`);
  }

  const data = await response.json();
  return extractOpenAIText(data);
}

async function handleAPI(req, res, requestUrl) {
  if (req.method === "GET" && requestUrl.pathname === "/api/status") {
    sendJSON(res, 200, {
      foodDatabase: "Open Food Facts + cache local",
      openaiConfigured: Boolean(process.env.OPENAI_API_KEY),
      model: process.env.OPENAI_API_KEY ? openaiModel : null,
    });
    return true;
  }

  if (req.method === "GET" && requestUrl.pathname.startsWith("/api/products/barcode/")) {
    const code = decodeURIComponent(requestUrl.pathname.replace("/api/products/barcode/", "")).replace(/\D/g, "");
    if (!code) {
      sendJSON(res, 400, { error: "Codigo de barras invalido" });
      return true;
    }

    try {
      sendJSON(res, 200, { product: await getProductByBarcode(code) });
    } catch (error) {
      const backup = findBackupProduct(code);
      sendJSON(res, backup ? 200 : 503, { product: backup || null, error: error.message });
    }
    return true;
  }

  if (req.method === "GET" && requestUrl.pathname === "/api/products/search") {
    const query = requestUrl.searchParams.get("q") || "";
    if (!query.trim()) {
      sendJSON(res, 400, { error: "Busca vazia" });
      return true;
    }

    try {
      sendJSON(res, 200, { product: await searchProduct(query) });
    } catch (error) {
      const backup = findBackupProduct(query);
      sendJSON(res, backup ? 200 : 503, { product: backup || null, error: error.message });
    }
    return true;
  }

  if (req.method === "POST" && requestUrl.pathname === "/api/chat") {
    try {
      const body = JSON.parse(await readBody(req) || "{}");
      const question = String(body.question || "").trim();
      if (!question) {
        sendJSON(res, 400, { error: "Pergunta vazia" });
        return true;
      }

      const openaiAnswer = await askOpenAI(question, body.product, body.allergies);
      if (openaiAnswer) {
        sendJSON(res, 200, { answer: openaiAnswer, source: "openai" });
      } else {
        sendJSON(res, 200, {
          answer: localNutritionAnswer(question, body.product, body.allergies),
          source: "local",
        });
      }
    } catch (error) {
      sendJSON(res, 200, {
        answer: localNutritionAnswer("fallback", null, []),
        source: "local",
        error: error.message,
      });
    }
    return true;
  }

  return false;
}

function serveStatic(req, res, requestUrl) {
  const pathname = requestUrl.pathname === "/" ? "/index.html" : requestUrl.pathname;
  const requestedPath = path.normalize(path.join(root, decodeURIComponent(pathname)));
  const relativePath = path.relative(root, requestedPath);

  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    send(res, 403, "Acesso negado");
    return;
  }

  fs.stat(requestedPath, (statError, stats) => {
    if (statError || !stats.isFile()) {
      send(res, 404, "Arquivo nao encontrado");
      return;
    }

    const type = mimeTypes[path.extname(requestedPath).toLowerCase()] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": type });
    fs.createReadStream(requestedPath).pipe(res);
  });
}

const server = http.createServer(async (req, res) => {
  const requestUrl = new URL(req.url, `http://${req.headers.host}`);
  if (await handleAPI(req, res, requestUrl)) return;
  serveStatic(req, res, requestUrl);
});

ensureCache();
server.listen(port, host, () => {
  console.log(`Nutri Ai rodando em http://${host}:${port}`);
});
