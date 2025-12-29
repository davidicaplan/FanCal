import { useState, useEffect } from "react";
import { X, Download, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "pwa-banner-dismissed";
const DISMISS_DURATION_DAYS = 7;

function isDismissed(): boolean {
  const dismissedAt = localStorage.getItem(DISMISS_KEY);
  if (!dismissedAt) return false;
  
  const dismissedDate = new Date(parseInt(dismissedAt, 10));
  const now = new Date();
  const daysSinceDismiss = (now.getTime() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
  
  return daysSinceDismiss < DISMISS_DURATION_DAYS;
}

function setDismissed(): void {
  localStorage.setItem(DISMISS_KEY, Date.now().toString());
}

function isIOS(): boolean {
  const ua = window.navigator.userAgent;
  return /iPhone|iPad|iPod/i.test(ua);
}

function isStandalone(): boolean {
  return (
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true ||
    window.matchMedia("(display-mode: standalone)").matches
  );
}

export function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOSDevice, setIsIOSDevice] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isStandalone() || isDismissed()) {
      return;
    }

    if (isIOS()) {
      setIsIOSDevice(true);
      setShowBanner(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsVisible(true));
      });
      return;
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsVisible(true));
      });
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      setIsVisible(false);
      setTimeout(() => setShowBanner(false), 300);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setDismissed();
    setIsVisible(false);
    setTimeout(() => setShowBanner(false), 300);
  };

  if (!showBanner) return null;

  return (
    <div
      data-testid="container-pwa-install-banner"
      className={`fixed bottom-0 left-0 right-0 z-50 p-3 pb-safe transition-all duration-300 ease-out ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
      }`}
    >
      <Card data-testid="card-pwa-install" className="mx-auto max-w-md border-border/50 bg-card/95 backdrop-blur-sm">
        <div className="flex items-start gap-3 p-4">
          <div className="flex-shrink-0 rounded-lg bg-primary/10 p-2">
            {isIOSDevice ? (
              <Share className="h-6 w-6 text-primary" data-testid="icon-share" />
            ) : (
              <Download className="h-6 w-6 text-primary" data-testid="icon-download" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm" data-testid="text-pwa-title">Install FanCal</h3>
            {isIOSDevice ? (
              <p className="text-xs text-muted-foreground mt-1" data-testid="text-pwa-ios-instructions">
                Tap Share, then "Add to Home Screen"
              </p>
            ) : (
              <p className="text-xs text-muted-foreground mt-1" data-testid="text-pwa-instructions">
                Add to your home screen for quick access
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {!isIOSDevice && deferredPrompt && (
              <Button
                size="sm"
                onClick={handleInstall}
                data-testid="button-install-pwa"
              >
                Install
              </Button>
            )}
            <Button
              size="icon"
              variant="ghost"
              onClick={handleDismiss}
              data-testid="button-dismiss-pwa-banner"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
