import { Share, Smartphone } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePwaInstall } from "@/hooks/use-pwa-install";
import { useLocale } from "@/lib/contexts/LocaleContext";
import { cn } from "@/lib/utils";

type PwaInstallButtonProps = {
  className?: string;
  variant?: "brand" | "outline-light" | "outline-dark";
  label?: string;
  hideWhenInstalled?: boolean;
};

export function PwaInstallButton({
  className,
  variant = "outline-light",
  label,
  hideWhenInstalled = true,
}: PwaInstallButtonProps) {
  const { t } = useLocale();
  const { canInstall, isStandalone, isIos, install, showInstallOption } =
    usePwaInstall();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [installing, setInstalling] = useState(false);

  if (hideWhenInstalled && isStandalone) return null;
  if (!showInstallOption) return null;

  const text = label ?? t("footer.addToHome");

  async function handleClick() {
    if (canInstall) {
      setInstalling(true);
      const outcome = await install();
      setInstalling(false);
      if (outcome === "unavailable") setDialogOpen(true);
      return;
    }
    setDialogOpen(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => void handleClick()}
        disabled={installing}
        className={cn(
          "inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-semibold transition-colors disabled:opacity-60",
          variant === "brand" &&
            "bg-gold text-ink hover:bg-gold-dark px-6 py-3",
          variant === "outline-light" &&
            "border border-white/30 text-white hover:bg-white/10",
          variant === "outline-dark" &&
            "border border-white/25 text-white hover:bg-white/10",
          className,
        )}
      >
        <Smartphone className="w-4 h-4 shrink-0" aria-hidden />
        {installing ? t("pwa.installing") : text}
      </button>

      <PwaInstallDialog open={dialogOpen} onOpenChange={setDialogOpen} isIos={isIos} />
    </>
  );
}

export function PwaInstallDialog({
  open,
  onOpenChange,
  isIos,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isIos: boolean;
}) {
  const { t } = useLocale();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif">{t("pwa.dialogTitle")}</DialogTitle>
          <DialogDescription>{t("pwa.dialogSubtitle")}</DialogDescription>
        </DialogHeader>

        {isIos ? (
          <ol className="space-y-3 text-sm text-ink/80">
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand text-xs font-bold">
                1
              </span>
              <span>
                {t("pwa.iosStep1")}{" "}
                <Share className="inline w-4 h-4 align-text-bottom text-brand" aria-hidden />
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand text-xs font-bold">
                2
              </span>
              <span>{t("pwa.iosStep2")}</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand text-xs font-bold">
                3
              </span>
              <span>{t("pwa.iosStep3")}</span>
            </li>
          </ol>
        ) : (
          <ol className="space-y-3 text-sm text-ink/80">
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand text-xs font-bold">
                1
              </span>
              <span>{t("pwa.androidStep1")}</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand text-xs font-bold">
                2
              </span>
              <span>{t("pwa.androidStep2")}</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand text-xs font-bold">
                3
              </span>
              <span>{t("pwa.androidStep3")}</span>
            </li>
          </ol>
        )}

        <p className="text-xs text-muted-foreground border-t border-border pt-3">
          {t("pwa.offlineNote")}
        </p>
      </DialogContent>
    </Dialog>
  );
}
