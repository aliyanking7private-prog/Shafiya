/**
 * Main Application Controller for Shafiya PWA
 * Coordinates all modules and handles user interactions
 */

class ShafiyaApp {
    constructor() {
        // Initialize managers
        this.apiClient = new BytezAPIClient();
        this.database = new DatabaseManager();
        this.speech = new SpeechManager();
        this.persona = new AIPersona();
        
        // App state
        this.isInitialized = false;
        this.currentPage = 'chat';
        this.isProcessing = false;
        this.showThoughts = false;
        
        // DOM elements
        this.elements = {};
        
        // Bind methods
        this.init = this.init.bind(this);
        this.handleMessageSend = this.handleMessageSend.bind(this);
        this.handleImageGeneration = this.handleImageGeneration.bind(this);
        this.handleCall = this.handleCall.bind(this);
        this.handleNavigation = this.handleNavigation.bind(this);
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            this.showLoading('Initializing Shafiya...');
            
            // Initialize database
            await this.database.init();
            
            // Load saved state
            await this.loadAppState();
            
            // Setup DOM elements
            this.setupDOMElements();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Setup speech recognition callbacks
            this.setupSpeechCallbacks();
            
            // Load chat history
            await this.loadChatHistory();
            
            // Update UI with current state
            this.updateUI();
            
            // Setup PWA features
            this.setupPWA();
            
            // Initialize app ready
            this.isInitialized = true;
            this.hideLoading();
            
            // Show welcome message
            this.showWelcomeMessage();
            
            console.log('Shafiya app initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showError('Failed to initialize app. Please refresh the page.');
        }
    }

    /**
     * Setup DOM element references
     */
    setupDOMElements() {
        // Navigation
        this.elements.navButtons = document.querySelectorAll('.nav-btn');
        this.elements.pages = document.querySelectorAll('.page');
        
        // Header elements
        this.elements.statusText = document.getElementById('status-text');
        this.elements.moodLevel = document.getElementById('mood-level');
        this.elements.moodFill = document.getElementById('mood-fill');
        
        // Chat elements
        this.elements.messagesContainer = document.getElementById('messages');
        this.elements.messageInput = document.getElementById('message-input');
        this.elements.sendBtn = document.getElementById('send-btn');
        this.elements.micBtn = document.getElementById('mic-btn');
        this.elements.imageBtn = document.getElementById('image-btn');
        this.elements.showThoughtsToggle = document.getElementById('show-thoughts');
        this.elements.clearChatBtn = document.getElementById('clear-chat-btn');
        
        // Call elements
        this.elements.callPage = document.getElementById('call-page');
        this.elements.startCallBtn = document.getElementById('start-call-btn');
        this.elements.endCallBtn = document.getElementById('end-call-btn');
        this.elements.playResponseBtn = document.getElementById('play-response-btn');
        this.elements.callStatusText = document.getElementById('call-status-text');
        this.elements.callInstruction = document.getElementById('call-instruction');
        this.elements.callTranscript = document.getElementById('call-transcript');
        
        // Gallery elements
        this.elements.galleryBtn = document.getElementById('gallery-btn');
        this.elements.galleryModal = document.getElementById('gallery-modal');
        this.elements.closeGalleryBtn = document.getElementById('close-gallery-btn');
        this.elements.galleryGrid = document.getElementById('gallery-grid');
        
        // Memory elements
        this.elements.memoryPage = document.getElementById('memory-page');
        this.elements.memoryList = document.getElementById('memory-list');
        this.elements.hardResetBtn = document.getElementById('hard-reset-btn');
        
        // Loading elements
        this.elements.loadingOverlay = document.getElementById('loading-overlay');
        this.elements.loadingText = document.getElementById('loading-text');
        
        // Settings elements
        this.elements.settingsBtn = document.getElementById('settings-btn');
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Navigation
        this.elements.navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleNavigation(e.target.dataset.page);
            });
        });

        // Chat input
        this.elements.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleMessageSend();
            }
        });

        this.elements.messageInput.addEventListener('input', this.autoResizeTextarea.bind(this));
        this.elements.sendBtn.addEventListener('click', this.handleMessageSend);
        
        // Control buttons
        this.elements.micBtn.addEventListener('click', () => this.toggleMicInput());
        this.elements.imageBtn.addEventListener('click', () => this.handleImageGeneration());
        this.elements.clearChatBtn.addEventListener('click', () => this.clearChat());
        
        // Show thoughts toggle
        this.elements.showThoughtsToggle.addEventListener('change', (e) => {
            this.showThoughts = e.target.checked;
        });

        // Call functionality
        this.elements.startCallBtn.addEventListener('click', () => this.handleCall('start'));
        this.elements.endCallBtn.addEventListener('click', () => this.handleCall('end'));
        this.elements.playResponseBtn.addEventListener('click', () => this.playLastResponse());

        // Gallery
        this.elements.galleryBtn.addEventListener('click', () => this.openGallery());
        this.elements.closeGalleryBtn.addEventListener('click', () => this.closeGallery());
        
        // Memory management
        this.elements.hardResetBtn.addEventListener('click', () => this.hardReset());
        
        // Settings (placeholder)
        this.elements.settingsBtn.addEventListener('click', () => this.showSettings());
        
        // Prevent zoom on double tap (iOS/Android)
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (event) => {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
    }

    /**
     * Setup speech recognition callbacks
     */
    setupSpeechCallbacks() {
        this.speech.setResultCallback((transcript) => {
            this.elements.messageInput.value = transcript;
            this.elements.messageInput.focus();
            this.elements.micBtn.classList.remove('active');
        });
    }

    /**
     * Handle message sending
     */
    async handleMessageSend() {
        const message = this.elements.messageInput.value.trim();
        if (!message || this.isProcessing) return;

        try {
            this.isProcessing = true;
            this.elements.sendBtn.disabled = true;
            
            // Clear input
            this.elements.messageInput.value = '';
            this.autoResizeTextarea();
            
            // Add user message to chat
            const userMessage = {
                type: 'user',
                content: message,
                timestamp: Date.now()
            };
            
            await this.addMessageToChat(userMessage);
            
            // Show typing indicator
            this.showTypingIndicator();
            
            // Generate AI response
            const response = await this.generateAIResponse(message);
            
            // Hide typing indicator
            this.hideTypingIndicator();
            
            // Add AI response to chat
            const aiMessage = {
                type: 'ai',
                content: response.text,
                timestamp: Date.now(),
                thoughts: response.thoughts || null
            };
            
            await this.addMessageToChat(aiMessage);
            
            // Update mood and database
            await this.updateMoodFromChat(message);
            await this.database.createMemoryFromChat(message);
            
        } catch (error) {
            console.error('Failed to send message:', error);
            this.showError('Failed to send message. Please try again.');
        } finally {
            this.isProcessing = false;
            this.elements.sendBtn.disabled = false;
        }
    }

    /**
     * Generate AI response
     */
    async generateAIResponse(userInput) {
        try {
            // Get conversation history
            const history = await this.database.getChatMessages(10);
            
            // Generate persona-enhanced response
            const personaResponse = await this.persona.generateResponse(
                userInput, 
                history, 
                this.showThoughts
            );
            
            // Call API
            const apiResponse = await this.apiClient.generateText(
                personaResponse.prompt,
                personaResponse.systemPrompt,
                personaResponse.conversationHistory
            );
            
            // Process response with persona
            const processedText = this.persona.processAIResponse(apiResponse.text);
            
            // Handle thoughts if enabled
            let thoughts = null;
            if (this.showThoughts) {
                const thoughtMatch = processedText.match(/\(\((.*?)\)\)/);
                if (thoughtMatch) {
                    thoughts = thoughtMatch[1];
                }
            }
            
            return {
                text: processedText,
                thoughts: thoughts
            };
            
        } catch (error) {
            console.error('AI response generation failed:', error);
            throw new Error('Failed to generate response');
        }
    }

    /**
     * Handle image generation
     */
    async handleImageGeneration() {
        const prompt = prompt('What would you like Shafiya to create?');
        if (!prompt) return;

        try {
            this.isProcessing = true;
            this.elements.imageBtn.disabled = true;
            
            this.showLoading('Creating image...');
            
            // Generate image with fixed seed
            const imageResponse = await this.apiClient.generateImage(prompt, 778822);
            
            // Add image to gallery
            await this.database.addGalleryImage({
                type: 'generated',
                prompt: prompt,
                imageUrl: imageResponse.imageUrl,
                seed: imageResponse.seed
            });
            
            // Add image message to chat
            const imageMessage = {
                type: 'image',
                content: prompt,
                imageUrl: imageResponse.imageUrl,
                timestamp: Date.now()
            };
            
            await this.addMessageToChat(imageMessage);
            
            this.hideLoading();
            
        } catch (error) {
            console.error('Image generation failed:', error);
            this.showError('Failed to generate image. Please try again.');
            this.hideLoading();
        } finally {
            this.isProcessing = false;
            this.elements.imageBtn.disabled = false;
        }
    }

    /**
     * Handle call functionality
     */
    async handleCall(action) {
        switch (action) {
            case 'start':
                await this.startCall();
                break;
            case 'end':
                await this.endCall();
                break;
        }
    }

    /**
     * Start voice call
     */
    async startCall() {
        try {
            this.elements.startCallBtn.style.display = 'none';
            this.elements.endCallBtn.style.display = 'inline-flex';
            this.elements.callStatusText.textContent = 'Listening...';
            this.elements.callInstruction.textContent = 'Speak now, Shafiya is listening';
            this.elements.callTranscript.innerHTML = '';
            
            // Start speech recognition
            this.speech.startListening();
            
        } catch (error) {
            console.error('Failed to start call:', error);
            this.showError('Failed to start call. Please check microphone permissions.');
            this.resetCallUI();
        }
    }

    /**
     * End voice call
     */
    async endCall() {
        this.speech.stopListening();
        this.resetCallUI();
    }

    /**
     * Reset call UI
     */
    resetCallUI() {
        this.elements.startCallBtn.style.display = 'inline-flex';
        this.elements.endCallBtn.style.display = 'none';
        this.elements.playResponseBtn.style.display = 'none';
        this.elements.callStatusText.textContent = 'Ready to call';
        this.elements.callInstruction.textContent = 'Tap the button below and start speaking';
        this.elements.callTranscript.innerHTML = '';
    }

    /**
     * Add message to chat
     */
    async addMessageToChat(message) {
        // Save to database
        await this.database.addChatMessage(message);
        
        // Create message element
        const messageElement = this.createMessageElement(message);
        
        // Add to chat
        this.elements.messagesContainer.appendChild(messageElement);
        
        // Scroll to bottom
        this.scrollToBottom();
    }

    /**
     * Create message element
     */
    createMessageElement(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.type}`;
        
        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        
        if (message.type === 'image' && message.imageUrl) {
            bubble.innerHTML = `
                <img src="${message.imageUrl}" alt="Generated image" class="message-image" onclick="window.open('${message.imageUrl}', '_blank')">
                <p>${message.content}</p>
            `;
        } else {
            bubble.textContent = message.content;
        }
        
        // Add thoughts if enabled
        if (message.thoughts) {
            const thoughtDiv = document.createElement('div');
            thoughtDiv.className = 'message thought';
            thoughtDiv.textContent = message.thoughts;
            messageDiv.appendChild(thoughtDiv);
        }
        
        messageDiv.appendChild(bubble);
        return messageDiv;
    }

    /**
     * Show typing indicator
     */
    showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message ai typing';
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="message-bubble">
                <div class="typing-animation">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        
        this.elements.messagesContainer.appendChild(typingDiv);
        this.scrollToBottom();
    }

    /**
     * Hide typing indicator
     */
    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    /**
     * Handle navigation between pages
     */
    handleNavigation(page) {
        // Update navigation buttons
        this.elements.navButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.page === page);
        });
        
        // Update pages
        this.elements.pages.forEach(p => {
            p.classList.toggle('active', p.id === `${page}-page`);
        });
        
        this.currentPage = page;
        
        // Page-specific setup
        if (page === 'memory') {
            this.loadMemories();
        }
    }

    /**
     * Load chat history
     */
    async loadChatHistory() {
        try {
            const messages = await this.database.getChatMessages(50);
            
            // Clear existing messages
            this.elements.messagesContainer.innerHTML = '';
            
            // Add messages to chat
            for (const message of messages.reverse()) {
                const messageElement = this.createMessageElement(message);
                this.elements.messagesContainer.appendChild(messageElement);
            }
            
            this.scrollToBottom();
        } catch (error) {
            console.error('Failed to load chat history:', error);
        }
    }

    /**
     * Load memories
     */
    async loadMemories() {
        try {
            const memories = await this.database.getMemories();
            
            this.elements.memoryList.innerHTML = '';
            
            if (memories.length === 0) {
                this.elements.memoryList.innerHTML = '<p style="text-align: center; color: #888;">No memories yet</p>';
                return;
            }
            
            memories.forEach(memory => {
                const memoryDiv = document.createElement('div');
                memoryDiv.className = 'memory-item';
                memoryDiv.innerHTML = `
                    <div class="memory-date">${new Date(memory.timestamp).toLocaleDateString()}</div>
                    <div class="memory-content">${memory.content}</div>
                `;
                this.elements.memoryList.appendChild(memoryDiv);
            });
            
        } catch (error) {
            console.error('Failed to load memories:', error);
        }
    }

    /**
     * Open gallery
     */
    async openGallery() {
        try {
            const images = await this.database.getGalleryImages();
            
            this.elements.galleryGrid.innerHTML = '';
            
            if (images.length === 0) {
                this.elements.galleryGrid.innerHTML = '<p style="text-align: center; color: #888;">No images yet</p>';
            } else {
                images.forEach(image => {
                    const imageDiv = document.createElement('div');
                    imageDiv.className = 'gallery-item';
                    imageDiv.innerHTML = `<img src="${image.imageUrl}" alt="Generated image">`;
                    this.elements.galleryGrid.appendChild(imageDiv);
                });
            }
            
            this.elements.galleryModal.classList.add('show');
            
        } catch (error) {
            console.error('Failed to open gallery:', error);
            this.showError('Failed to load gallery');
        }
    }

    /**
     * Close gallery
     */
    closeGallery() {
        this.elements.galleryModal.classList.remove('show');
    }

    /**
     * Clear chat
     */
    async clearChat() {
        if (confirm('Are you sure you want to clear all messages?')) {
            try {
                await this.database.clearChatMessages();
                this.elements.messagesContainer.innerHTML = '';
                this.persona.reset();
                this.updateUI();
            } catch (error) {
                console.error('Failed to clear chat:', error);
                this.showError('Failed to clear chat');
            }
        }
    }

    /**
     * Hard reset
     */
    async hardReset() {
        if (confirm('Are you sure? This will delete ALL data including chat history, memories, and gallery.')) {
            try {
                await this.database.hardReset();
                
                // Reset UI
                this.elements.messagesContainer.innerHTML = '';
                this.elements.memoryList.innerHTML = '';
                this.elements.galleryGrid.innerHTML = '';
                
                // Reset persona
                this.persona.reset();
                
                // Update UI
                this.updateUI();
                
                this.showSuccess('App reset successfully');
                
            } catch (error) {
                console.error('Failed to hard reset:', error);
                this.showError('Failed to reset app');
            }
        }
    }

    /**
     * Update mood from chat
     */
    async updateMoodFromChat(lastMessage) {
        const recentMessages = await this.database.getChatMessages(5);
        const mood = await this.database.updateMoodFromMessages([...recentMessages, lastMessage]);
        
        // Update persona mood
        this.persona.setMood(mood);
        
        // Update UI
        this.updateMoodDisplay();
    }

    /**
     * Update mood display
     */
    updateMoodDisplay() {
        const mood = this.persona.getMood();
        this.elements.moodLevel.textContent = `Mood: ${mood}`;
        this.elements.moodFill.style.width = `${mood}%`;
        
        // Update status text
        this.elements.statusText.textContent = this.persona.getStatusMessage();
    }

    /**
     * Update UI with current state
     */
    async updateUI() {
        this.updateMoodDisplay();
        
        // Update show thoughts toggle
        this.elements.showThoughtsToggle.checked = this.showThoughts;
    }

    /**
     * Load saved app state
     */
    async loadAppState() {
        try {
            this.showThoughts = await this.database.getAppState('showThoughts') || false;
        } catch (error) {
            console.error('Failed to load app state:', error);
        }
    }

    /**
     * Save app state
     */
    async saveAppState() {
        try {
            await this.database.setAppState('showThoughts', this.showThoughts);
        } catch (error) {
            console.error('Failed to save app state:', error);
        }
    }

    /**
     * Toggle microphone input
     */
    toggleMicInput() {
        if (this.isProcessing) return;
        
        const isActive = this.elements.micBtn.classList.contains('active');
        
        if (!isActive) {
            try {
                this.speech.startListening();
                this.elements.micBtn.classList.add('active');
                this.elements.messageInput.placeholder = 'Listening...';
            } catch (error) {
                console.error('Microphone access failed:', error);
                this.showError('Microphone access denied. Please allow microphone access.');
            }
        } else {
            this.speech.stopListening();
            this.elements.micBtn.classList.remove('active');
            this.elements.messageInput.placeholder = 'Type a message...';
        }
    }

    /**
     * Auto-resize textarea
     */
    autoResizeTextarea() {
        const textarea = this.elements.messageInput;
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 100) + 'px';
    }

    /**
     * Scroll chat to bottom
     */
    scrollToBottom() {
        this.elements.messagesContainer.scrollTop = this.elements.messagesContainer.scrollHeight;
    }

    /**
     * Show welcome message
     */
    showWelcomeMessage() {
        const welcomeMessage = {
            type: 'ai',
            content: this.persona.getGreeting(),
            timestamp: Date.now()
        };
        
        this.addMessageToChat(welcomeMessage);
    }

    /**
     * Show loading overlay
     */
    showLoading(text = 'Loading...') {
        this.elements.loadingText.textContent = text;
        this.elements.loadingOverlay.classList.remove('hidden');
    }

    /**
     * Hide loading overlay
     */
    hideLoading() {
        this.elements.loadingOverlay.classList.add('hidden');
    }

    /**
     * Show error message
     */
    showError(message) {
        // Simple error display - could be enhanced with toast notifications
        alert('Error: ' + message);
    }

    /**
     * Show success message
     */
    showSuccess(message) {
        // Simple success display - could be enhanced with toast notifications
        console.log('Success:', message);
    }

    /**
     * Show settings (placeholder)
     */
    showSettings() {
        alert('Settings panel coming soon!');
    }

    /**
     * Setup PWA features
     */
    setupPWA() {
        // Register service worker if available
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').catch(err => {
                console.log('Service worker registration failed:', err);
            });
        }
        
        // Add to home screen prompt
        let deferredPrompt;
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            
            // Show install banner after a delay
            setTimeout(() => {
                if (confirm('Install Shafiya as an app?')) {
                    deferredPrompt.prompt();
                    deferredPrompt.userChoice.then((choiceResult) => {
                        deferredPrompt = null;
                    });
                }
            }, 5000);
        });
    }

    /**
     * Play last AI response (for call functionality)
     */
    async playLastResponse() {
        try {
            const messages = await this.database.getChatMessages(1);
            const lastMessage = messages[0];
            
            if (lastMessage && lastMessage.type === 'ai') {
                this.elements.playResponseBtn.disabled = true;
                await this.speech.speak(lastMessage.content);
                this.elements.playResponseBtn.disabled = false;
            }
        } catch (error) {
            console.error('Failed to play response:', error);
        }
    }

    /**
     * Destroy app and cleanup
     */
    destroy() {
        this.speech.destroy();
        this.database = null;
        this.apiClient = null;
        this.persona = null;
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.shafiyaApp = new ShafiyaApp();
    window.shafiyaApp.init();
});

// Handle app lifecycle
window.addEventListener('beforeunload', () => {
    if (window.shafiyaApp) {
        window.shafiyaApp.saveAppState();
    }
});