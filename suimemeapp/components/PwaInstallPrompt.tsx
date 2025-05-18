import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/8bit/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PwaInstallPrompt = () => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if on iOS
    const isIos = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      return /iphone|ipad|ipod/.test(userAgent);
    };
    
    // Check if in standalone mode (already installed)
    const isInStandaloneMode = () => 
      ('standalone' in window.navigator) && 
      ((window.navigator as any).standalone || window.matchMedia('(display-mode: standalone)').matches);

    setIsIOS(isIos());
    setIsInstalled(isInStandaloneMode());

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Save the event so it can be triggered later
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    
    // Show the install prompt
    installPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await installPrompt.userChoice;
    
    // Clear the saved prompt since it can only be used once
    setInstallPrompt(null);
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
  };

  // Don't show anything if already installed or no install prompt available and not on iOS
  if (isInstalled || (!installPrompt && !isIOS)) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {installPrompt ? (
        <Button 
          onClick={handleInstallClick} 
          className="shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
        >
          Install App
        </Button>
      ) : isIOS ? (
        <div className="p-4 bg-white/80 backdrop-blur-md rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-w-[260px] border-2 border-black">
          <p className="text-sm mb-2">To install: tap <span className="inline-block">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4V12M12 12L15 9M12 12L9 9M5 13L5 17C5 18.1046 5.89543 19 7 19L17 19C18.1046 19 19 18.1046 19 17L19 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span> then "Add to Home Screen"</p>
          <Button 
            onClick={() => setIsIOS(false)} 
            variant="outline" 
            className="text-xs w-full border-black border"
          >
            Dismiss
          </Button>
        </div>
      ) : null}
    </div>
  );
};

export default PwaInstallPrompt; 