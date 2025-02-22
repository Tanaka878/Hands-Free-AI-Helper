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
    mozSpeechRecognition: new () => SpeechRecognition;
    msSpeechRecognition: new () => SpeechRecognition;
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
  const [browserSupported, setBrowserSupported] = useState(true);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryAttemptsRef = useRef(0);
  const MAX_RETRY_ATTEMPTS = 3;
  const RETRY_DELAY = 2000; // 2 seconds between retries
  const language = 'en-US';

  useEffect(() => {
    checkBrowserSupport();
    
    return () => {
      cleanup();
    };
  }, []);

  const cleanup = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
    setIsReconnecting(false);
    setIsActive(false);
  };

  const checkBrowserSupport = () => {
    const supported = !!(
      window.SpeechRecognition ||
      window.webkitSpeechRecognition ||
      window.mozSpeechRecognition ||
      window.msSpeechRecognition
    );
    setBrowserSupported(supported);
    if (!supported) {
      setErrorMessage('Speech recognition is not supported in your browser. Please try Chrome, Edge, or Safari.');
      setIsError(true);
    }
  };

  const initializeSpeechRecognition = (): SpeechRecognition | null => {
    try {
      const SpeechRecognition = 
        window.SpeechRecognition ||
        window.webkitSpeechRecognition ||
        window.mozSpeechRecognition ||
        window.msSpeechRecognition;

      if (!SpeechRecognition) {
        throw new Error('Speech recognition is not supported in this browser.');
      }

      const recognition = new SpeechRecognition();
      
      recognition.lang = language;
      recognition.continuous = false; // Changed to false to better handle reconnections
      recognition.maxAlternatives = 1;
      recognition.interimResults = true;

      recognition.onstart = () => {
        console.log('Speech recognition started');
        setIsActive(true);
        setIsError(false);
        setErrorMessage('');
        setIsReconnecting(false);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const lastResult = event.results[event.results.length - 1];
        const transcript = lastResult[0].transcript;
        setInputText(prev => prev + ' ' + transcript.trim());
        
        if (lastResult.isFinal) {
          // Don't stop on final result, let it continue listening
          restartRecognition(recognition);
        }
      };

      recognition.onerror = (event: SpeechRecognitionError) => {
        console.error('Speech Recognition Error:', event.error);
        
        if (event.error === 'network') {
          handleNetworkError(recognition);
        } else {
          handleRecognitionError(event.error);
        }
      };

      recognition.onend = () => {
        console.log('Speech recognition ended');
        if (!isReconnecting) {
          setIsActive(false);
        }
      };

      return recognition;
    } catch (error) {
      console.error('Error initializing speech recognition:', error);
      return null;
    }
  };

  const handleNetworkError = (recognition: SpeechRecognition) => {
    retryAttemptsRef.current += 1;
    
    if (retryAttemptsRef.current < MAX_RETRY_ATTEMPTS) {
      setIsReconnecting(true);
      setErrorMessage(`Network issue. Retrying... Attempt ${retryAttemptsRef.current}`);
      
      // Clear any existing timeout
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      
      // Set new timeout for retry
      retryTimeoutRef.current = setTimeout(() => {
        if (isActive) {
          restartRecognition(recognition);
        }
      }, RETRY_DELAY);
    } else {
      cleanup();
      setIsError(true);
      setErrorMessage('Network issues persist. Please check your internet connection and try again.');
    }
  };

  const restartRecognition = (recognition: SpeechRecognition) => {
    try {
      recognition.stop();
      setTimeout(() => {
        if (isActive) {
          recognition.start();
        }
      }, 100);
    } catch (error) {
      console.error('Error restarting recognition:', error);
      handleRecognitionError('restart-failed');
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
      case 'network':
        setErrorMessage('Network connection issue. Please check your internet connection.');
        break;
      case 'restart-failed':
        setErrorMessage('Failed to restart speech recognition. Please try again.');
        break;
      case 'aborted':
        // Don't show error message for manual stops
        break;
      default:
        setErrorMessage(`Error: ${error}. Please try again.`);
    }
    cleanup();
  };

  const handleOnRecord = async (): Promise<void> => {
    if (!browserSupported) {
      setErrorMessage('Speech recognition is not supported in your browser. Please try Chrome, Edge, or Safari.');
      setIsError(true);
      return;
    }

    try {
      if (isActive) {
        cleanup();
        return;
      }

      retryAttemptsRef.current = 0;
      await navigator.mediaDevices.getUserMedia({ audio: true });

      recognitionRef.current = initializeSpeechRecognition();
      
      if (recognitionRef.current) {
        setIsError(false);
        setErrorMessage('');
        await recognitionRef.current.start();
        console.log('Started recording');
      }
    } catch (error) {
      console.error('Error in handleOnRecord:', error);
      cleanup();
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
          {isError && (
            <div className="absolute -top-8 left-0 right-0 text-center text-red-500 text-sm">
              {errorMessage}
            </div>
          )}

          <input
            className="h-10 w-full rounded-full text-black bg-gray-200 p-2 pl-12 pr-12 shadow-lg outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type something here..."
            value={inputText}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
          />
          
          <button
            onClick={() => handleOnRecord()}
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-full ${
              isActive ? 'bg-red-600 animate-pulse' : 'bg-red-500'
            } text-white flex items-center justify-center shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 ${
              !browserSupported ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            aria-label={isActive ? 'Stop Recording' : 'Start Recording'}
            type="button"
            disabled={!browserSupported}
          >
            🎙️
          </button>

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