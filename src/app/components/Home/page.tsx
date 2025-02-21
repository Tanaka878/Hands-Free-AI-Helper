'use client'
import React, { useState, useRef, useEffect } from 'react'

// Define necessary types for Speech Recognition
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionError extends Event {
  error: string;
  message: string;
}

declare global {
  interface Window {
    webkitSpeechRecognition: new () => SpeechRecognition;
    SpeechRecognition: new () => SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionError) => void) | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

const HomePage: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const retryAttemptsRef = useRef(0);
  const MAX_RETRY_ATTEMPTS = 3;
  const language = 'en-US';

  useEffect(() => {
    // Cleanup function
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const initializeSpeechRecognition = (): SpeechRecognition | null => {
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        throw new Error('Speech recognition is not supported in this browser. Please try Chrome.');
      }

      const recognition = new SpeechRecognition();
      
      // Configure recognition with more forgiving settings
      recognition.lang = language;
      recognition.continuous = true; // Changed to true to maintain connection
      recognition.maxAlternatives = 1;
      recognition.interimResults = true;

      recognition.onstart = () => {
        console.log('Speech recognition started');
        setIsActive(true);
        setIsError(false);
        setErrorMessage('');
        retryAttemptsRef.current = 0; // Reset retry attempts on successful start
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const lastResult = event.results[event.results.length - 1];
        const transcript = lastResult[0].transcript;
        setInputText(transcript);
        
        if (lastResult.isFinal) {
          recognition.stop();
        }
      };

      recognition.onerror = (event: SpeechRecognitionError) => {
        console.error('Speech Recognition Error:', event.error);
        
        if (event.error === 'network') {
          retryAttemptsRef.current += 1;
          
          if (retryAttemptsRef.current < MAX_RETRY_ATTEMPTS) {
            console.log(`Retrying... Attempt ${retryAttemptsRef.current}`);
            setErrorMessage(`Network issue. Retrying... Attempt ${retryAttemptsRef.current}`);
            
            // Stop the current instance
            recognition.stop();
            
            // Wait briefly before retrying
            setTimeout(() => {
              try {
                recognition.start();
              } catch (error) {
                console.error('Retry failed:', error);
              }
            }, 1000);
          } else {
            setIsError(true);
            setErrorMessage('Network issues persist. Please try again later.');
            setIsActive(false);
          }
        } else {
          handleRecognitionError(event.error);
        }
      };

      recognition.onend = () => {
        console.log('Speech recognition ended');
        // Only set isActive to false if we're not in the middle of a retry
        if (retryAttemptsRef.current >= MAX_RETRY_ATTEMPTS) {
          setIsActive(false);
        }
      };

      return recognition;
    } catch (error) {
      console.error('Error initializing speech recognition:', error);
      return null;
    }
  };

  const handleRecognitionError = (error: string): void => {
    setIsError(true);
    switch (error) {
      case 'not-allowed':
        setErrorMessage('Microphone access denied. Please allow microphone access and try again.');
        break;
      case 'no-speech':
        setErrorMessage('No speech detected. Please try again.');
        break;
      case 'audio-capture':
        setErrorMessage('No microphone detected. Please check your device settings.');
        break;
      case 'aborted':
        setErrorMessage('Recording was aborted. Please try again.');
        break;
      default:
        setErrorMessage(`Error: ${error}. Please try again.`);
    }
    setIsActive(false);
  };

  const handleOnRecord = async (): Promise<void> => {
    try {
      // Stop recording if active
      if (isActive && recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null; // Clear the reference
        setIsActive(false);
        return;
      }
  
      // Reset retry attempts
      retryAttemptsRef.current = 0;
  
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
  
      // Initialize new recognition instance
      if (!recognitionRef.current) {
        recognitionRef.current = initializeSpeechRecognition();
      }
  
      if (recognitionRef.current) {
        // Clear any previous error states
        setIsError(false);
        setErrorMessage('');
  
        // Start recognition
        await recognitionRef.current.start();
        console.log('Started recording');
      }
    } catch (error) {
      console.error('Error in handleOnRecord:', error);
      setIsActive(false);
      setIsError(true);
      if (error instanceof Error) {
        setErrorMessage(`Error: ${error.message}`);
      } else {
        setErrorMessage('Please allow microphone access to use speech recognition.');
      }
    }
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setInputText(e.target.value);
  };

  const handleSendClick = (): void => {
    if (inputText.trim()) {
      console.log('Sending text:', inputText);
      // Add your send logic here
      setInputText('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter' && inputText.trim()) {
      handleSendClick();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center w-full px-4 py-4">
        <h1 className="text-slate-950 md:text-3xl sm:text-xl flex justify-center">
          Hands-Free AI
        </h1>
        <nav className="flex justify-end">
          <h1 className="rounded-full bg-black text-white w-10 h-10 flex items-center justify-center">
            T
          </h1>
        </nav>
      </div>

      <nav className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-full flex justify-center items-center">
        <div className="relative w-[90%] md:w-[50%] max-w-[600px]">
          {/* Error Message */}
          {isError && (
            <div className="absolute -top-8 left-0 right-0 text-center text-red-500 text-sm">
              {errorMessage}
            </div>
          )}

          {/* Input Field */}
          <input
            className="h-10 w-full rounded-full text-black bg-gray-200 p-2 pl-12 pr-12 shadow-lg outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type something here..."
            value={inputText}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
          />
          
          {/* Record Button */}
          <button
            onClick={() => handleOnRecord()}
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-full ${
              isActive ? 'bg-red-600 animate-pulse' : 'bg-red-500'
            } text-white flex items-center justify-center shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400`}
            aria-label={isActive ? 'Stop Recording' : 'Start Recording'}
            type="button"
          >
            🎙️
          </button>

          {/* Send Button */}
          <button
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-full ${
              inputText.trim() ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-400 cursor-not-allowed'
            } text-white flex items-center justify-center shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400`}
            aria-label="Send"
            onClick={handleSendClick}
            disabled={!inputText.trim()}
            type="button"
          >
            ➤
          </button>
        </div>
      </nav>
    </div>
  );
};

export default HomePage;