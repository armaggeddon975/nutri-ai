const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

require("dotenv").config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const foods =
require("./database/foods.json");

const app = express();

app.use(cors());
app.use(express.json());

let alergiasUsuario = [];

let perguntasFrequentes = {};

const respostas = {

  "lactose":
    "A lactose é um açúcar presente no leite e derivados.",

  "gluten":
    "O glúten é uma proteína encontrada no trigo, cevada e centeio.",

  "banana":
    "A banana é rica em potássio, fibras e vitaminas.",

  "diabetes":
    "Pessoas com diabetes devem controlar o consumo de açúcar.",

  "amendoim":
    "O amendoim pode causar alergias graves."
};

const alimentosPerigosos = {

  lactose: [
    "leite",
    "queijo",
    "iogurte",
    "manteiga",
    "pizza"
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

app.post("/chat", async (req, res) => {

  const userMessage =
  req.body.message.toLowerCase();

  perguntasFrequentes[userMessage] =
  (perguntasFrequentes[userMessage] || 0) + 1;

  let resposta = "";

  // SALVAR ALERGIAS

  if (
    userMessage.includes("alergia") ||
    userMessage.includes("alérgico")
  ) {

    if (userMessage.includes("lactose")) {

      alergiasUsuario.push("lactose");

      resposta =
      "Entendi. Vou alertar você sobre alimentos com lactose.";

    }

    else if (userMessage.includes("gluten")) {

      alergiasUsuario.push("gluten");

      resposta =
      "Entendi. Vou alertar você sobre alimentos com glúten.";

    }

    else if (userMessage.includes("amendoim")) {

      alergiasUsuario.push("amendoim");

      resposta =
      "Entendi. Vou alertar você sobre alimentos com amendoim.";
    }

  }

  // VERIFICAR ALIMENTOS PERIGOSOS

  else {

    for (const alergia of alergiasUsuario) {

      const alimentos =
      alimentosPerigosos[alergia];

      for (const alimento of alimentos) {

        if (userMessage.includes(alimento)) {

          resposta =
          `⚠️ Atenção: ${alimento} pode conter ${alergia}.`;

          return res.json({
            reply: resposta
          });

        }

      }

    }

    // FAQ LOCAL

    for (const palavra in respostas) {

      if (userMessage.includes(palavra)) {

        resposta = respostas[palavra];

        break;

      }

    }

    // BUSCA NUTRICIONAL

    for (const food of foods) {

      if (userMessage.includes(food.nome)) {

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

  }

  // OPENAI

  if(resposta === ""){

    try{

      const completion =
      await openai.chat.completions.create({

        model:"gpt-4.1-mini",

        messages:[

          {
            role:"system",

            content:`
Você é a NutriAI.

Uma inteligência artificial especialista em:

- nutrição
- alimentação saudável
- alergias alimentares
- qualidade de vida
- vitaminas
- dietas
- saúde

Responda sempre:
- de forma clara
- amigável
- moderna
- profissional
- objetiva
`
          },

          {
            role:"user",
            content:userMessage
          }

        ]

      });

      resposta =
      completion.choices[0]
      .message.content;

    }catch(error){

      console.error(error);

      resposta =
      "Erro ao conectar com a IA.";

    }

  }

  res.json({
    reply: resposta
  });

});

app.get("/stats", (req, res) => {

  res.json({
    perguntasFrequentes,
    alergiasUsuario
  });

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log(
    `Servidor rodando na porta ${PORT}`
  );

});