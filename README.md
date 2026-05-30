# Nutri Ai

Site informativo para pesquisar alimentos por nome, codigo de barras ou camera, cruzar ingredientes com alergias do usuario e conversar com um assistente de nutricao.

## Como rodar

Abra a pasta do projeto e inicie um servidor local:

```powershell
npm start
```

Depois acesse:

```text
http://localhost:5173
```

O servidor local e importante para permitir camera no navegador. A busca usa a base mundial publica Open Food Facts, cria cache local em `data/food-cache.json` e usa produtos de backup se a internet cair.

## O que ja funciona

- Perfil de alergias salvo no navegador
- Busca manual por nome ou codigo de barras
- Banco mundial via Open Food Facts, com cache local automatico
- Consulta por codigo de barras ou nome com backup local
- Scanner por camera usando `BarcodeDetector` e fallback ZXing quando disponivel
- Tabela nutricional completa por 100 g/ml
- Alertas de alergia, sodio, acucar, gordura saturada e nivel NOVA
- Assistente de nutricao com OpenAI pelo servidor, quando `OPENAI_API_KEY` existe
- Backup local de nutricao quando a chave OpenAI nao estiver configurada

## Configurar OpenAI

Nunca coloque a chave OpenAI no HTML ou JavaScript do navegador. Configure a chave no ambiente do servidor:

```powershell
$env:OPENAI_API_KEY="sua-chave-aqui"
$env:OPENAI_MODEL="gpt-4.1-mini"
node server.js
```

Se `OPENAI_API_KEY` nao estiver definida, o chat continua funcionando com o backup local.

## Publicacao

O projeto esta pronto para hospedagem Node com `npm start`. Em provedores como Render, Railway ou Replit, configure:

- Build command: `npm install --omit=dev`
- Start command: `npm start`
- Health check: `/api/status`
- Variaveis de ambiente: `OPENAI_API_KEY` e `OPENAI_MODEL`

Nunca publique o arquivo `.env`.

Tambem existe um workflow de GitHub Pages em `.github/workflows/pages.yml`. Essa versao publica estatica usa o Open Food Facts direto no navegador e cai no backup local para o chat quando nao houver backend Node.
