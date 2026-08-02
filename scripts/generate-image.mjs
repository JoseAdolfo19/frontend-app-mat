import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const readEnv = () => {
  const envPath = path.join(rootDir, '.env');
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  for (const line of content.split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/i);
    if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, '');
  }
  return env;
};

const args = process.argv.slice(2);
const promptIndex = args.indexOf('--prompt');
const outputIndex = args.indexOf('--output');
const modelIndex = args.indexOf('--model');

const prompt = promptIndex >= 0 ? args[promptIndex + 1] : args[0];
const outputName = outputIndex >= 0 ? args[outputIndex + 1] : 'generated';
const model = modelIndex >= 0 ? args[modelIndex + 1] : 'black-forest-labs/flux.1-dev';

if (!prompt) {
  console.error('Uso: node scripts/generate-image.mjs "prompt" [--output nombre] [--model modelo]');
  process.exit(1);
}

const apiKey = readEnv().NVIDIA_API_KEY;
if (!apiKey) {
  console.error('Falta NVIDIA_API_KEY en .env');
  process.exit(1);
}

const steps = model.includes('schnell') ? 4 : 30;
const payload = { prompt, steps, seed: 0 };

const url = `https://ai.api.nvidia.com/v1/genai/${model}`;

console.log(`Generando imagen con ${model}...`);

const generate = async () => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errText}`);
  }

  return response.json();
};

try {
  const data = await generate();
  const artifact = data.artifacts?.[0];
  if (!artifact) {
    throw new Error('Respuesta sin artefactos: ' + JSON.stringify(data));
  }
  if (artifact.finishReason === 'CONTENT_FILTERED') {
    console.error('La generación fue bloqueada por el filtro de contenido de NVIDIA.');
    console.error('Reformula el prompt evitando personas menores, violencia o términos sensibles.');
    process.exit(1);
  }

  const buffer = Buffer.from(artifact.base64, 'base64');
  const file = path.resolve(rootDir, 'public', `${outputName}.jpg`);
  fs.writeFileSync(file, buffer);
  console.log(`Imagen guardada en public/${outputName}.jpg (${(buffer.length / 1024).toFixed(1)} KB)`);
} catch (err) {
  console.error('Error:', err.message);
  process.exit(1);
}
