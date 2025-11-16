"use client";

import { useEffect, useCallback, useState } from "react";
import { useUnlockNFT } from "@/app/hooks/useUnlockNFT";
import { ClaimModal } from "./claim-modal";

export function NFCAutoUnlock() {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    tokenId: string;
    status: "detecting" | "processing" | "success" | "error";
    errorMessage?: string;
  }>({
    isOpen: false,
    tokenId: "",
    status: "detecting",
  });
  const { unlockAndClaim } = useUnlockNFT();

  const handleNFCDataAutomatically = useCallback(async (tokenId: string, secret: string) => {
    try {
      console.log("[NFC Auto-Unlock] Auto-claiming NFT:", { tokenId, secret });
      
      // Show detecting modal
      setModalState({
        isOpen: true,
        tokenId,
        status: "detecting",
      });

      // Wait a moment for the modal to show
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Show processing modal
      setModalState({
        isOpen: true,
        tokenId,
        status: "processing",
      });
      
      // Call unlockAndClaim
      await unlockAndClaim(tokenId, secret);
      
      // Show success modal
      setModalState({
        isOpen: true,
        tokenId,
        status: "success",
      });
    } catch (unlockError) {
      console.error("[NFC Auto-Unlock] Auto-claim error:", unlockError);
      
      // Show error modal
      setModalState({
        isOpen: true,
        tokenId,
        status: "error",
        errorMessage: unlockError instanceof Error ? unlockError.message : String(unlockError),
      });
    }
  }, [unlockAndClaim]);

  // Listen for NFC data in URL
  useEffect(() => {
    console.log("[NFC Auto-Unlock] Component mounted, checking for NFC data");
    
    const handleURLChange = async () => {
      console.log("[NFC Auto-Unlock] Checking URL for NFC data");
      const urlParams = new URLSearchParams(window.location.search);
      const nfcData = urlParams.get('nfc');
      
      console.log("[NFC Auto-Unlock] Current URL:", window.location.href);
      console.log("[NFC Auto-Unlock] URL params:", window.location.search);
      console.log("[NFC Auto-Unlock] NFC data:", nfcData);
      
      if (nfcData) {
        try {
          console.log("[NFC Auto-Unlock] Parsing NFC data...");
          const parsed = JSON.parse(decodeURIComponent(nfcData));
          console.log("[NFC Auto-Unlock] Parsed data:", parsed);
          
          if (parsed.tokenId && parsed.secret) {
            console.log("[NFC Auto-Unlock] Valid data found, cleaning URL and starting auto-claim");
            // Clean URL first
            window.history.replaceState({}, '', window.location.pathname);
            
            // Automatically claim NFT
            await handleNFCDataAutomatically(parsed.tokenId, parsed.secret);
          } else {
            console.error("[NFC Auto-Unlock] Missing tokenId or secret in parsed data");
          }
        } catch (e) {
          console.error("[NFC Auto-Unlock] Failed to parse NFC data from URL:", e);
          alert("Invalid NFT data in URL");
        }
      } else {
        console.log("[NFC Auto-Unlock] No NFC data in URL");
      }
    };

    handleURLChange();
    
    // Also listen for navigation changes
    window.addEventListener('popstate', handleURLChange);
    
    return () => {
      console.log("[NFC Auto-Unlock] Component unmounting, cleaning up");
      window.removeEventListener('popstate', handleURLChange);
    };
  }, [handleNFCDataAutomatically]);

  const closeModal = () => {
    setModalState({
      isOpen: false,
      tokenId: "",
      status: "detecting",
    });
  };

  return (
    <ClaimModal
      isOpen={modalState.isOpen}
      tokenId={modalState.tokenId}
      status={modalState.status}
      errorMessage={modalState.errorMessage}
      onClose={closeModal}
    />
  );
}
