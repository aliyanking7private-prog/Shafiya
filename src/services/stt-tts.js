/**
 * Speech-to-Text and Text-to-Speech
 * Using Web Speech API
 */

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const speechRecognizer = new SpeechRecognition();
speechRecognizer.continuous = false;
speechRecognizer.interimResults = true;
speechRecognizer.lang = 'en-US';

/**
 * Start Speech-to-Text
 */
export function startSTT() {
  return new Promise((resolve, reject) => {
    let finalTranscript = '';

    speechRecognizer.onstart = () => {
      console.log('STT started...');
    };

    speechRecognizer.onresult = (event) => {
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      console.log('STT interim:', interimTranscript);
      console.log('STT final:', finalTranscript);
    };

    speechRecognizer.onerror = (event) => {
      console.error('STT error:', event.error);
      reject(new Error(`Speech recognition error: ${event.error}`));
    };

    speechRecognizer.onend = () => {
      console.log('STT ended');
      if (finalTranscript.trim()) {
        resolve(finalTranscript.trim());
      } else {
        reject(new Error('No speech detected'));
      }
    };

    speechRecognizer.start();
  });
}

/**
 * Text-to-Speech
 */
export function speakTTS(text) {
  return new Promise((resolve, reject) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.2; // Slightly higher for feminine voice
    utterance.volume = 1.0;
    utterance.lang = 'en-US';

    utterance.onend = () => {
      console.log('TTS completed');
      resolve();
    };

    utterance.onerror = (event) => {
      console.error('TTS error:', event.error);
      reject(new Error(`Speech synthesis error: ${event.error}`));
    };

    window.speechSynthesis.speak(utterance);
  });
}

/**
 * Stop current speech
 */
export function stopSpeech() {
  window.speechSynthesis.cancel();
  if (speechRecognizer) {
    speechRecognizer.abort();
  }
}
