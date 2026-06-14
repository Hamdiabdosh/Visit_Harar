import { useEffect, useState } from "react";
import {
  captureInstallPrompt,
  clearInstallPrompt,
  getDeferredInstallPrompt,
  isIosSafari,
  isStandaloneDisplayMode,
  subscribeInstallPrompt,
  triggerInstallPrompt,
} from "@/lib/pwa-install";

export function usePwaInstall() {
  const [canInstall, setCanInstall] = useState(() => !!getDeferredInstallPrompt());
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    setIsStandalone(isStandaloneDisplayMode());
    setIsIos(isIosSafari());
    setCanInstall(!!getDeferredInstallPrompt());

    const onBeforeInstall = (event: Event) => captureInstallPrompt(event);
    const onAppInstalled = () => {
      clearInstallPrompt();
      setCanInstall(false);
      setIsStandalone(true);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onAppInstalled);
    const unsub = subscribeInstallPrompt(() => {
      setCanInstall(!!getDeferredInstallPrompt());
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onAppInstalled);
      unsub();
    };
  }, []);

  const showInstallOption = !isStandalone && (canInstall || isIos || true);

  return {
    canInstall,
    isStandalone,
    isIos,
    showInstallOption,
    install: triggerInstallPrompt,
  };
}
