import { Smartphone, X, Copy, Check } from 'lucide-react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  expoTunnelUrl: string;
  setExpoTunnelUrl: (url: string) => void;
  copied: boolean;
  handleCopyLink: () => void;
};

export default function MobileTestPortal({
  isOpen,
  onClose,
  expoTunnelUrl,
  setExpoTunnelUrl,
  copied,
  handleCopyLink,
}: Props) {
  if (!isOpen) return null;

  return (
    <>
      {/* Paste EVERYTHING that was inside
          {isMobilePortalOpen && ( ... )}
          from App.tsx here.

          Inside that pasted code, replace:

          onClick={() => setIsMobilePortalOpen(false)}

          with

          onClick={onClose}

          in every location.
      */}
    </>
  );
}