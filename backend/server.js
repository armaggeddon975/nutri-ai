const express = require("express");
const cors = require("cors");
require("dotenv").config();

const foods = require("./database/foods.json");

const inteligencia =
require(
  "./database/inteligencia_nutricional.json"
);

const app = express();

app.use(cors());
app.use(express.json());

/* =========================
   MEMÓRIA DO USUÁRIO
========================= */

let memoriaUsuario = {
  objetivo: "",
  alergias: [],
  dieta: ""
};

/* =========================
   ANALYTICS
========================= */

let perguntasFrequentes = {};

/* =========================
   FAQ LOCAL
========================= */

const respostas = {

  lactose:
    "A lactose é um açúcar presente no leite e derivados.",

  gluten:
    "O glúten é uma proteína encontrada no trigo, cevada e centeio.",

  banana:
    "A banana é rica em potássio, fibras e vitaminas.",

  diabetes:
    "Pessoas com diabetes devem controlar o consumo de açúcar.",

  amendoim:
    "O amendoim pode causar alergias graves."
};

/* =========================
   ALIMENTOS PERIGOSOS
========================= */

const alimentosPerigosos = {

  lactose: [
    "leite",
    "queijo",
    "iogurte",
    "pizza",
    "manteiga"
  ],

  gluten: [
    "pão",
    "macarrão",
    "bolo",
    "biscoito"
  ],

  amendoim: [
    "paçoca",
    "amendoim"
  ]
};

/* =========================
   CHAT
========================= */

app.post("/chat", (req, res) => {

  const userMessage =
  req.body.message.toLowerCase();

  let resposta = "";

  /* =========================
     REGEX IMC
  ========================= */

  const pesoMatch =
  userMessage.match(/peso\s(\d+)/);

  const alturaMatch =
  userMessage.match(/altura\s([\d.]+)/);

  /* =========================
     ANALYTICS
  ========================= */

  perguntasFrequentes[userMessage] =
  (perguntasFrequentes[userMessage] || 0) + 1;

  /* =========================
     OBJETIVOS
  ========================= */

  if (
    userMessage.includes("ganhar massa") ||
    userMessage.includes("hipertrofia")
  ) {

    memoriaUsuario.objetivo =
    "hipertrofia";

    resposta =
    "💪 Entendi! Agora vou focar em alimentação para hipertrofia.";

  }

  else if (
    userMessage.includes("emagrecer")
  ) {

    memoriaUsuario.objetivo =
    "emagrecimento";

    resposta =
    "🥗 Entendi! Agora vou focar em alimentação para emagrecimento.";

  }

  else if (
    userMessage.includes("alimentação saudável")
  ) {

    memoriaUsuario.objetivo =
    "alimentação saudável";

    resposta =
    "🥦 Perfeito! Vou focar em hábitos saudáveis.";
  }

  /* =========================
     ALERGIAS
  ========================= */

  if (
    userMessage.includes("alergia") ||
    userMessage.includes("alérgico")
  ) {

    if (userMessage.includes("lactose")) {

      memoriaUsuario.alergias.push(
        "lactose"
      );

      resposta =
      "⚠️ Entendi! Vou alertar você sobre lactose.";

    }

    else if (
      userMessage.includes("gluten")
    ) {

      memoriaUsuario.alergias.push(
        "gluten"
      );

      resposta =
      "⚠️ Entendi! Vou alertar você sobre glúten.";

    }

    else if (
      userMessage.includes("amendoim")
    ) {

      memoriaUsuario.alergias.push(
        "amendoim"
      );

      resposta =
      "⚠️ Entendi! Vou alertar você sobre amendoim.";
    }

  }

  /* =========================
     ALERTA DE ALIMENTOS
  ========================= */

  for (const alergia of memoriaUsuario.alergias) {

    const alimentos =
    alimentosPerigosos[alergia];

    for (const alimento of alimentos) {

      if (
        userMessage.includes(alimento)
      ) {

        resposta =
        `⚠️ Atenção: ${alimento} pode conter ${alergia}.`;

      }

    }

  }

  /* =========================
     BUSCA NUTRICIONAL
  ========================= */

  for (const food of foods) {

    if (
      userMessage.includes(food.nome)
    ) {

      resposta = `
🍎 Alimento: ${food.nome}

🔥 Calorias: ${food.calorias}

💪 Proteínas: ${food.proteinas}g

🍞 Carboidratos: ${food.carboidratos}g

🌾 Fibras: ${food.fibras}g

🧬 Vitaminas: ${food.vitaminas}
`;

    }

  }

  /* =========================
     FAQ LOCAL
  ========================= */

  for (const palavra in respostas) {

    if (
      userMessage.includes(palavra)
    ) {

      resposta =
      respostas[palavra];

    }

  }

  /* =========================
     GERADOR DE DIETA
  ========================= */

  if (
    userMessage.includes("dieta")
  ) {

    // HIPERTROFIA

    if (
      memoriaUsuario.objetivo ===
      "hipertrofia"
    ) {

      resposta = `
💪 Dieta para Hipertrofia

☀️ Café da manhã:
- ovos
- banana
- aveia
- whey protein

🍛 Almoço:
- arroz
- feijão
- frango
- legumes

🥤 Lanche:
- iogurte
- castanhas

🌙 Janta:
- carne magra
- arroz integral
- ovos

💧 Beba bastante água.
`;

    }

    // EMAGRECIMENTO

    else if (
      memoriaUsuario.objetivo ===
      "emagrecimento"
    ) {

      resposta = `
🥗 Dieta para Emagrecimento

☀️ Café da manhã:
- frutas
- chia
- ovos

🍛 Almoço:
- salada
- frango grelhado
- arroz integral

🥤 Lanche:
- iogurte natural
- frutas

🌙 Janta:
- legumes
- proteína magra

🚶 Inclua atividade física.
`;

    }

    // SAUDÁVEL

    else {

      resposta = `
🥦 Dieta Saudável

☀️ Café da manhã:
- frutas
- aveia
- ovos

🍛 Almoço:
- arroz
- feijão
- legumes
- proteína

🥤 Lanche:
- castanhas
- frutas

🌙 Janta:
- sopa
- legumes
- proteína magra

💧 Mantenha boa hidratação.
`;

    }

  }

/* =========================
   INTELIGÊNCIA AVANÇADA
========================= */

for(
  const pergunta of
  inteligencia.duvidas_nutricionais
){

  if(
    userMessage.includes(
      pergunta.split(" ")[0]
    )
  ){

    resposta = `
🤖 Informação nutricional inteligente:

${pergunta}

Uma alimentação equilibrada é fundamental para saúde e qualidade de vida.
`;

  }

}

  /* =========================
     IA CONTEXTUAL
  ========================= */

  if (resposta === "") {

    /* =========================
       HIPERTROFIA
    ========================= */

    if (
      memoriaUsuario.objetivo ===
      "hipertrofia"
    ) {

      if (
        userMessage.includes("café")
      ) {

        resposta = `
☀️ Café da manhã para hipertrofia:

- ovos
- banana
- aveia
- pão integral
- whey protein

Esses alimentos ajudam no ganho de massa muscular.
`;

      }

      else if (
        userMessage.includes("almoço")
      ) {

        resposta = `
🍛 Almoço para hipertrofia:

- arroz
- feijão
- frango
- batata doce
- legumes

Uma refeição rica em proteínas e carboidratos complexos.
`;

      }

      else if (
        userMessage.includes("janta")
      ) {

        resposta = `
🌙 Janta para hipertrofia:

- carne magra
- arroz integral
- legumes
- ovos

Ideal para recuperação muscular.
`;

      }

    }

    /* =========================
       EMAGRECIMENTO
    ========================= */

    if (
      memoriaUsuario.objetivo ===
      "emagrecimento"
    ) {

      if (
        userMessage.includes("café")
      ) {

        resposta = `
🥗 Café da manhã para emagrecimento:

- frutas
- aveia
- ovos
- chia
- iogurte natural

Alimentos leves e nutritivos ajudam no déficit calórico.
`;

      }

      else if (
        userMessage.includes("almoço")
      ) {

        resposta = `
🥙 Almoço para emagrecimento:

- frango grelhado
- salada
- arroz integral
- legumes

Poucas calorias e alta saciedade.
`;

      }

    }

    /* =========================
       ALIMENTAÇÃO SAUDÁVEL
    ========================= */

    if (
      memoriaUsuario.objetivo ===
      "alimentação saudável"
    ) {

      resposta = `
🥦 Alimentação saudável inclui:

- frutas
- verduras
- proteínas magras
- hidratação
- fibras
- alimentos naturais

Evite excesso de açúcar e ultraprocessados.
`;

    }

  }

  /* =========================
     IMC
  ========================= */

  if (
    pesoMatch &&
    alturaMatch
  ) {

    const peso =
    parseFloat(
      pesoMatch[1]
    );

    const altura =
    parseFloat(
      alturaMatch[1]
    );

    const imc =
    (
      peso /
      (altura * altura)
    ).toFixed(1);

    let classificacao = "";

    if (imc < 18.5) {

      classificacao =
      "Abaixo do peso";

    }

    else if (imc < 25) {

      classificacao =
      "Peso normal";

    }

    else if (imc < 30) {

      classificacao =
      "Sobrepeso";

    }

    else {

      classificacao =
      "Obesidade";

    }

    resposta = `
📊 Resultado do IMC

⚖️ Peso:
${peso}kg

📏 Altura:
${altura}m

🧮 IMC:
${imc}

📌 Classificação:
${classificacao}
`;

  }

  /* =========================
     RESPOSTA PADRÃO
  ========================= */

  if (resposta === "") {

const respostasHumanas = [

  "🥗 Posso ajudar você com alimentação saudável.",

  "💪 Posso ajudar em hipertrofia e ganho de massa.",

  "🍎 Tenho informações sobre vitaminas e nutrição.",

  "⚕️ Posso auxiliar sobre alergias alimentares.",

  "📊 Também consigo calcular IMC e gerar dietas.",

  "🥦 Posso recomendar refeições saudáveis."
];

resposta =
respostasHumanas[
  Math.floor(
    Math.random() *
    respostasHumanas.length
  )
];

  }

  res.json({
    reply: resposta
  });

});

/* =========================
   DASHBOARD
========================= */

app.get("/stats", (req, res) => {

  res.json({

    perguntasFrequentes,

    memoriaUsuario

  });

});

/* =========================
   SERVER
========================= */

const PORT =
process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log(
    `Servidor rodando na porta ${PORT}`
  );

});