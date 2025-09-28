import { useCallback } from 'react';

interface UseCelebrationSoundProps {
  soundPath?: string;
  volume?: number;
}

export const useCelebrationSound = ({ 
  soundPath = '/sfx/briefcase-open.mp3', // Using existing sound as fallback
  volume = 0.7 
}: UseCelebrationSoundProps = {}) => {
  const playCelebrationSound = useCallback(() => {
    try {
      // Try to play the specified sound file first
      const audio = new Audio(soundPath);
      audio.volume = volume;
      audio.play().catch((error) => {
        console.warn('Could not play celebration sound file:', error);
        // Fallback to generated celebration sound
        playGeneratedCelebrationSound();
      });
    } catch (error) {
      console.warn('Could not create audio element:', error);
      // Fallback to generated celebration sound
      playGeneratedCelebrationSound();
    }
  }, [soundPath, volume]);

  const playGeneratedCelebrationSound = useCallback(() => {
    try {
      // Create a simple celebration sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create a celebratory chord (C major chord)
      const frequencies = [261.63, 329.63, 392.00]; // C4, E4, G4
      
      frequencies.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume * 0.3, audioContext.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 1.5);
        
        oscillator.start(audioContext.currentTime + index * 0.1);
        oscillator.stop(audioContext.currentTime + 1.5);
      });
    } catch (error) {
      console.warn('Could not generate celebration sound:', error);
      // Silently fail - don't interrupt the celebration if sound fails
    }
  }, [volume]);

  return { playCelebrationSound };
};
