/**
 * API Client for Bytez Integration
 * Handles text, image, and audio generation with single request queue
 */

class BytezAPIClient {
    constructor() {
        this.apiKey = '1d095ff43b5451815def4c48ac9d0392';
        this.baseURL = 'https://api.bytez.ai/v1';
        this.queue = new PromiseQueue();
        
        // Model configurations
        this.models = {
            text: 'NousResearch/Hermes-2-Pro-Llama-3-8B',
            image: 'runwayml/stable-diffusion-v1-5',
            audio: 'suno/bark-small'
        };
        
        // Request configurations
        this.configs = {
            text: {
                temperature: 0.8,
                max_tokens: 150,
                top_p: 0.9,
                frequency_penalty: 0.1,
                presence_penalty: 0.1
            },
            image: {
                steps: 20,
                guidance_scale: 7.5,
                width: 512,
                height: 512
            },
            audio: {
                sample_rate: 22050,
                format: 'wav'
            }
        };
    }

    /**
     * Generate text response using Hermes-2-Pro-Llama-3-8B
     */
    async generateText(prompt, systemPrompt, conversationHistory = []) {
        return this.queue.add(async () => {
            try {
                const fullPrompt = this.buildTextPrompt(prompt, systemPrompt, conversationHistory);
                
                const response = await fetch(`${this.baseURL}/chat/completions`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.apiKey}`,
                        'User-Agent': 'Shafiya-PWA/1.0'
                    },
                    body: JSON.stringify({
                        model: this.models.text,
                        messages: [
                            {
                                role: 'system',
                                content: systemPrompt
                            },
                            ...conversationHistory,
                            {
                                role: 'user',
                                content: fullPrompt
                            }
                        ],
                        ...this.configs.text
                    })
                });

                if (!response.ok) {
                    const errorData = await response.text();
                    console.error('Text API Error:', errorData);
                    throw new Error(`Text API Error: ${response.status} - ${errorData}`);
                }

                const data = await response.json();
                
                if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                    throw new Error('Invalid response format from text API');
                }

                return {
                    text: data.choices[0].message.content.trim(),
                    usage: data.usage || null
                };
            } catch (error) {
                console.error('Text generation failed:', error);
                throw new Error(`Failed to generate text: ${error.message}`);
            }
        });
    }

    /**
     * Generate image using Stable Diffusion
     */
    async generateImage(prompt, seed = 778822) {
        return this.queue.add(async () => {
            try {
                const fullPrompt = this.buildImagePrompt(prompt);
                
                const response = await fetch(`${this.baseURL}/images/generations`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.apiKey}`,
                        'User-Agent': 'Shafiya-PWA/1.0'
                    },
                    body: JSON.stringify({
                        model: this.models.image,
                        prompt: fullPrompt,
                        n: 1,
                        size: `${this.configs.image.width}x${this.configs.image.height}`,
                        quality: 'standard',
                        response_format: 'url',
                        seed: seed,
                        ...this.configs.image
                    })
                });

                if (!response.ok) {
                    const errorData = await response.text();
                    console.error('Image API Error:', errorData);
                    throw new Error(`Image API Error: ${response.status} - ${errorData}`);
                }

                const data = await response.json();
                
                if (!data.data || !data.data[0] || !data.data[0].url) {
                    throw new Error('Invalid response format from image API');
                }

                return {
                    imageUrl: data.data[0].url,
                    seed: seed
                };
            } catch (error) {
                console.error('Image generation failed:', error);
                throw new Error(`Failed to generate image: ${error.message}`);
            }
        });
    }

    /**
     * Generate audio using Bark
     */
    async generateAudio(text, voice = 'default') {
        return this.queue.add(async () => {
            try {
                const response = await fetch(`${this.baseURL}/audio/speech`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.apiKey}`,
                        'User-Agent': 'Shafiya-PWA/1.0'
                    },
                    body: JSON.stringify({
                        model: this.models.audio,
                        input: text,
                        voice: voice,
                        response_format: 'mp3',
                        speed: 1.0,
                        ...this.configs.audio
                    })
                });

                if (!response.ok) {
                    const errorData = await response.text();
                    console.error('Audio API Error:', errorData);
                    throw new Error(`Audio API Error: ${response.status} - ${errorData}`);
                }

                const audioBlob = await response.blob();
                
                return {
                    audioBlob: audioBlob,
                    audioUrl: URL.createObjectURL(audioBlob)
                };
            } catch (error) {
                console.error('Audio generation failed:', error);
                throw new Error(`Failed to generate audio: ${error.message}`);
            }
        });
    }

    /**
     * Build text prompt with persona context
     */
    buildTextPrompt(userPrompt, systemPrompt, conversationHistory) {
        // Add personality-specific context
        const personalityContext = `
User is chatting with you. Respond as Shafiya with:
- Hinglish (Urdu/Hindi + English) 
- Casual slang: yaar, uff, acha, pagal
- Emotional and possessive tone
- Occasional typos and lowercase
- Call user 'Jaan' if happy, 'Tum' if angry
- If mood is low (< 30), be angry/moody
        `;

        return `${userPrompt}\n\n${personalityContext}`;
    }

    /**
     * Build image prompt with consistent character description
     */
    buildImagePrompt(userPrompt) {
        const masterPrompt = "portrait of a 20yo Pakistani woman, oval face, large brown eyes, thick brows, small nose, full lips, wavy black hair, hourglass figure, soft lighting, realistic texture, 8k, shot on phone, flash on, grainy, candid";
        
        return `${userPrompt}, ${masterPrompt}`;
    }

    /**
     * Check API status
     */
    async checkStatus() {
        return this.queue.add(async () => {
            try {
                const response = await fetch(`${this.baseURL}/models`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'User-Agent': 'Shafiya-PWA/1.0'
                    }
                });

                return response.ok;
            } catch (error) {
                console.error('API status check failed:', error);
                return false;
            }
        });
    }

    /**
     * Get queue status
     */
    getQueueStatus() {
        return this.queue.getStatus();
    }

    /**
     * Clear all pending requests
     */
    clearQueue() {
        this.queue.clear();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BytezAPIClient;
} else {
    window.BytezAPIClient = BytezAPIClient;
}