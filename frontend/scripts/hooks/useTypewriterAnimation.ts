import { useState, useEffect, useRef, useCallback } from 'react';

interface UseTypewriterAnimationOptions {
  texts: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseBeforeDelete?: number;
  pauseBeforeNext?: number;
  enabled?: boolean;
}

interface UseTypewriterAnimationResult {
  displayText: string;
  isTyping: boolean;
  stop: () => void;
  restart: () => void;
}

const useTypewriterAnimation = ({
  texts,
  typingSpeed = 80,
  deletingSpeed = 40,
  pauseBeforeDelete = 1500,
  pauseBeforeNext = 300,
  enabled = true,
}: UseTypewriterAnimationOptions): UseTypewriterAnimationResult => {
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  
  const currentIndexRef = useRef(0);
  const currentCharIndexRef = useRef(0);
  const isDeleteModeRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isRunningRef = useRef(enabled);

  const clearCurrentTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    isRunningRef.current = false;
    clearCurrentTimeout();
    setIsPaused(true);
  }, [clearCurrentTimeout]);

  const restart = useCallback(() => {
    isRunningRef.current = true;
    setIsPaused(false);
  }, []);

  useEffect(() => {
    if (!enabled || texts.length === 0) {
      setDisplayText('');
      return;
    }

    isRunningRef.current = true;
    currentIndexRef.current = 0;
    currentCharIndexRef.current = 0;
    isDeleteModeRef.current = false;
    setDisplayText('');
    setIsTyping(true);
    setIsPaused(false);

    return () => {
      clearCurrentTimeout();
    };
  }, [enabled, texts, clearCurrentTimeout]);

  useEffect(() => {
    if (!enabled || texts.length === 0 || isPaused) {
      return;
    }

    const tick = () => {
      if (!isRunningRef.current) return;

      const currentText = texts[currentIndexRef.current];
      
      if (!isDeleteModeRef.current) {
        if (currentCharIndexRef.current < currentText.length) {
          currentCharIndexRef.current++;
          setDisplayText(currentText.slice(0, currentCharIndexRef.current));
          setIsTyping(true);
          timeoutRef.current = setTimeout(tick, typingSpeed);
        } else {
          setIsTyping(false);
          timeoutRef.current = setTimeout(() => {
            isDeleteModeRef.current = true;
            tick();
          }, pauseBeforeDelete);
        }
      } else {
        if (currentCharIndexRef.current > 0) {
          currentCharIndexRef.current--;
          setDisplayText(currentText.slice(0, currentCharIndexRef.current));
          setIsTyping(true);
          timeoutRef.current = setTimeout(tick, deletingSpeed);
        } else {
          setIsTyping(false);
          isDeleteModeRef.current = false;
          currentIndexRef.current = (currentIndexRef.current + 1) % texts.length;
          timeoutRef.current = setTimeout(tick, pauseBeforeNext);
        }
      }
    };

    timeoutRef.current = setTimeout(tick, pauseBeforeNext);

    return () => {
      clearCurrentTimeout();
    };
  }, [enabled, texts, typingSpeed, deletingSpeed, pauseBeforeDelete, pauseBeforeNext, isPaused, clearCurrentTimeout]);

  return {
    displayText,
    isTyping,
    stop,
    restart,
  };
};

export default useTypewriterAnimation;
