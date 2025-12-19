/**
 * Speech Recognition and Synthesis Manager
 * Handles STT and TTS for the call functionality
 */

class SpeechManager {
    constructor() {
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.isListening = false;
        this.isSpeaking = false;
        this.currentUtterance = null;
        
        // Initialize speech recognition
        this.initSpeechRecognition();
        
        // Initialize speech synthesis
        this.initSpeechSynthesis();
    }

    /**
     * Initialize Speech Recognition (STT)
     */
    initSpeechRecognition() {
        // Check for browser support
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            console.error('Speech Recognition not supported in this browser');
            this.isRecognitionSupported = false;
            return;
        }

        this.recognition = new SpeechRecognition();
        
        // Configure recognition settings
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US'; // Support Hinglish
        
        // Adjust settings for mobile (Android 9)
        this.recognition.maxAlternatives = 1;
        
        // Event handlers
        this.recognition.onstart = () => {
            this.isListening = true;
            console.log('Speech recognition started');
        };

        this.recognition.onend = () => {
            this.isListening = false;
            console.log('Speech recognition ended');
        };

        this.recognition.onerror = (event) => {
            this.isListening = false;
            console.error('Speech recognition error:', event.error);
            
            if (event.error === 'not-allowed') {
                throw new Error('Microphone access denied. Please allow microphone access.');
            }
        };

        this.recognition.onresult = (event) => {
            const result = event.results[0];
            if (result.isFinal) {
                const transcript = result[0].transcript;
                console.log('Speech recognized:', transcript);
                
                // Trigger callback if set
                if (this.onResult) {
                    this.onResult(transcript);
                }
            }
        };

        this.isRecognitionSupported = true;
    }

    /**
     * Initialize Speech Synthesis (TTS)
     */
    initSpeechSynthesis() {
        if (!this.synthesis) {
            console.error('Speech Synthesis not supported in this browser');
            this.isSynthesisSupported = false;
            return;
        }

        this.isSynthesisSupported = true;
        
        // Wait for voices to load
        this.loadVoices();
    }

    /**
     * Load available voices
     */
    loadVoices() {
        const loadVoicesOnce = () => {
            this.voices = this.synthesis.getVoices();
            
            // Try to find a good voice for Shafiya
            this.preferredVoice = this.voices.find(voice => 
                voice.lang.startsWith('en') && voice.name.includes('Female')
            ) || this.voices.find(voice => 
                voice.lang.startsWith('en')
            ) || this.voices[0];
            
            console.log('Available voices:', this.voices.length);
        };

        // Load voices immediately if available
        loadVoicesOnce();
        
        // Also listen for voices changed event
        if (this.synthesis.onvoiceschanged !== undefined) {
            this.synthesis.onvoiceschanged = loadVoicesOnce;
        }
    }

    /**
     * Start speech recognition
     */
    startListening() {
        if (!this.isRecognitionSupported) {
            throw new Error('Speech recognition not supported');
        }

        if (this.isListening) {
            console.log('Already listening');
            return;
        }

        try {
            this.recognition.start();
        } catch (error) {
            console.error('Failed to start recognition:', error);
            throw error;
        }
    }

    /**
     * Stop speech recognition
     */
    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
    }

    /**
     * Speak text using TTS
     */
    speak(text, options = {}) {
        return new Promise((resolve, reject) => {
            if (!this.isSynthesisSupported) {
                reject(new Error('Speech synthesis not supported'));
                return;
            }

            // Stop any current speech
            this.stopSpeaking();

            const utterance = new SpeechSynthesisUtterance(text);
            
            // Configure utterance
            utterance.voice = this.preferredVoice;
            utterance.rate = options.rate || 0.9; // Slightly slower for clarity
            utterance.pitch = options.pitch || 1.1; // Slightly higher pitch for feminine voice
            utterance.volume = options.volume || 0.8;
            
            // Event handlers
            utterance.onstart = () => {
                this.isSpeaking = true;
                console.log('TTS started:', text.substring(0, 50) + '...');
            };

            utterance.onend = () => {
                this.isSpeaking = false;
                console.log('TTS ended');
                resolve();
            };

            utterance.onerror = (event) => {
                this.isSpeaking = false;
                console.error('TTS error:', event.error);
                reject(new Error(`TTS error: ${event.error}`));
            };

            this.currentUtterance = utterance;
            this.synthesis.speak(utterance);
        });
    }

    /**
     * Stop current speech
     */
    stopSpeaking() {
        if (this.synthesis && this.isSpeaking) {
            this.synthesis.cancel();
            this.isSpeaking = false;
        }
    }

    /**
     * Check if currently speaking
     */
    isCurrentlySpeaking() {
        return this.isSpeaking;
    }

    /**
     * Check if currently listening
     */
    isCurrentlyListening() {
        return this.isListening;
    }

    /**
     * Set callback for speech recognition results
     */
    setResultCallback(callback) {
        this.onResult = callback;
    }

    /**
     * Test microphone permissions
     */
    async testMicrophone() {
        try {
            // Request permission first
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // Stop the test stream
            stream.getTracks().forEach(track => track.stop());
            
            return true;
        } catch (error) {
            console.error('Microphone test failed:', error);
            return false;
        }
    }

    /**
     * Check speech synthesis support
     */
    isTTSSupported() {
        return this.isSynthesisSupported;
    }

    /**
     * Check speech recognition support
     */
    isSTTSupported() {
        return this.isRecognitionSupported;
    }

    /**
     * Get available voices
     */
    getAvailableVoices() {
        return this.voices || [];
    }

    /**
     * Set preferred voice
     */
    setPreferredVoice(voiceIndex) {
        if (this.voices && this.voices[voiceIndex]) {
            this.preferredVoice = this.voices[voiceIndex];
            console.log('Preferred voice set to:', this.preferredVoice.name);
        }
    }

    /**
     * Preload and cache common phrases
     */
    preloadPhrases(phrases) {
        phrases.forEach(phrase => {
            const utterance = new SpeechSynthesisUtterance(phrase);
            utterance.voice = this.preferredVoice;
            utterance.rate = 0.9;
            utterance.pitch = 1.1;
            utterance.volume = 0;
            this.synthesis.speak(utterance);
        });
    }

    /**
     * Cleanup resources
     */
    destroy() {
        this.stopListening();
        this.stopSpeaking();
        
        if (this.recognition) {
            this.recognition.onstart = null;
            this.recognition.onend = null;
            this.recognition.onerror = null;
            this.recognition.onresult = null;
        }
        
        this.synthesis = null;
        this.recognition = null;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SpeechManager;
} else {
    window.SpeechManager = SpeechManager;
}