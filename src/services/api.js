/**
 * Bytez API Client
 * Bearer Token: 1d095ff43b5451815def4c48ac9d0392
 */

const API_KEY = '1d095ff43b5451815def4c48ac9d0392';
const BASE_URL = 'https://api.bytez.ai/v1';
const SEED = 778822;
const IMAGE_MASTER_PROMPT = 'portrait of a 20yo Pakistani woman, oval face, large brown eyes, thick brows, small nose, full lips, wavy black hair, hourglass figure, soft lighting, realistic texture, 8k, shot on phone, flash on, grainy, candid';

/**
 * Call Bytez API with proper authentication
 */
export async function callBytezAPI(type, payload) {
  const headers = {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json'
  };

  try {
    let endpoint = '';
    let body = {};

    if (type === 'text') {
      endpoint = `${BASE_URL}/text/completions`;
      body = {
        model: payload.model || 'NousResearch/Hermes-2-Pro-Llama-3-8B',
        messages: payload.messages,
        max_tokens: 256,
        temperature: 0.7
      };
    } else if (type === 'image') {
      endpoint = `${BASE_URL}/image/generation`;
      const fullPrompt = `${payload.prompt}... ${IMAGE_MASTER_PROMPT}`;
      body = {
        model: payload.model || 'runwayml/stable-diffusion-v1-5',
        prompt: fullPrompt,
        seed: SEED,
        steps: 30,
        guidance_scale: 7.5,
        width: 512,
        height: 512
      };
    } else if (type === 'audio') {
      endpoint = `${BASE_URL}/audio/generation`;
      body = {
        model: payload.model || 'suno/bark-small',
        text: payload.text,
        language: 'en'
      };
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Bytez API Error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}

/**
 * Generate image with fixed seed
 */
export async function generateImage(prompt) {
  return callBytezAPI('image', { prompt });
}

/**
 * Generate text response
 */
export async function generateText(messages) {
  return callBytezAPI('text', { messages });
}

/**
 * Generate audio
 */
export async function generateAudio(text) {
  return callBytezAPI('audio', { text });
}
