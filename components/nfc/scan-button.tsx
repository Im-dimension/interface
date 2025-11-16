"use client";

import { useCallback, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useUnlockNFT } from "@/app/hooks/useUnlockNFT";

type NDEFRecordLite = {
  recordType: string;
  mediaType?: string;
  id?: string;
  data?: DataView;
};

type NDEFReadingEventLite = Event & {
  serialNumber?: string;
  message: {
    records: NDEFRecordLite[];
  };
};

interface NDEFReaderLite {
  scan: (options?: unknown) => Promise<void>;
  addEventListener: (
    type: "reading" | "readingerror",
    listener: (ev: NDEFReadingEventLite) => void
  ) => void;
}

function webNfcSupported(): boolean {
  return typeof window !== "undefined" && "NDEFReader" in window;
}

function decodeRecordText(data?: DataView): string | null {
  if (!data) return null;
  try {
    const payload = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
    if (payload.length === 0) return "";

    // Attempt to strip status byte + language code for "text" records
    const statusByte = payload[0];
    const langLength = statusByte & 0x3f;
    const textBytes =
      payload.length > 1 + langLength ? payload.subarray(1 + langLength) : payload;
    return new TextDecoder().decode(textBytes);
  } catch {
    try {
      return new TextDecoder().decode(new Uint8Array(data.buffer));
    } catch {
      return null;
    }
  }
}

export function ScanButton() {
  const [isScanning, setIsScanning] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualTokenId, setManualTokenId] = useState("");
  const [manualSecret, setManualSecret] = useState("");
  const { unlockAndClaim, isUnlocking, error, success } = useUnlockNFT();

  const isIOS = typeof window !== "undefined" && /iPhone|iPad|iPod/i.test(navigator.userAgent);

  // For iOS: Listen to page visibility and URL changes for NFC data
  useEffect(() => {
    const handleURLChange = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const nfcData = urlParams.get('nfc');
      
      if (nfcData) {
        try {
          const parsed = JSON.parse(decodeURIComponent(nfcData));
          if (parsed.tokenId && parsed.secret) {
            // Clean URL first
            window.history.replaceState({}, '', window.location.pathname);
            
            // Automatically claim NFT
            await handleNFCDataAutomatically(parsed.tokenId, parsed.secret);
          }
        } catch (e) {
          console.error("Failed to parse NFC data from URL:", e);
          alert("Invalid NFT data in URL");
        }
      }
    };

    handleURLChange();
    window.addEventListener('popstate', handleURLChange);
    
    return () => window.removeEventListener('popstate', handleURLChange);
  }, []);

  const handleNFCDataAutomatically = async (tokenId: string, secret: string) => {
    try {
      console.log("Auto-claiming NFT from NFC redirect:", { tokenId, secret });
      
      // Show loading state
      alert(`📱 NFC Detected!\n\nToken ID: ${tokenId}\n\nProcessing claim...`);
      
      // Automatically call unlockAndClaim
      await unlockAndClaim(tokenId, secret);
      
      alert(`✅ Success!\n\nNFT #${tokenId} has been unlocked and claimed to your wallet!`);
    } catch (unlockError) {
      console.error("Auto-claim error:", unlockError);
      alert(`❌ Failed to claim NFT #${tokenId}\n\nError: ${unlockError instanceof Error ? unlockError.message : String(unlockError)}\n\nPlease make sure your wallet is connected.`);
    }
  };

  const handleManualUnlock = async () => {
    if (!manualTokenId || !manualSecret) {
      alert("Please enter both Token ID and Secret");
      return;
    }

    try {
      await unlockAndClaim(manualTokenId, manualSecret);
      alert(`Successfully unlocked NFT #${manualTokenId}!`);
      setManualTokenId("");
      setManualSecret("");
      setShowManualInput(false);
    } catch (error) {
      console.error("Unlock error:", error);
      alert(`Failed to unlock NFT: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleScan = useCallback(async () => {
    if (isIOS) {
      // For iOS: Instruct user to use native NFC reader
      alert(
        "📱 iPhone NFC Instructions:\n\n" +
        "1. Hold the top of your iPhone near the NFC tag\n" +
        "2. A notification will appear\n" +
        "3. Tap the notification to open\n" +
        "4. The NFT will be automatically claimed!\n\n" +
        "Note: Make sure your wallet is connected before scanning.\n\n" +
        "Alternative: Use a QR code instead of NFC tags for easier iPhone support."
      );
      return;
    }

    if (!webNfcSupported()) {
      alert("Web NFC is not supported on this device/browser. Try Chrome on Android.");
      return;
    }

    setIsScanning(true);
    try {
      const ctor = (window as unknown as { NDEFReader?: new () => NDEFReaderLite })
        .NDEFReader;
      if (!ctor) throw new Error("NDEFReader not available");

      const reader: NDEFReaderLite = new ctor();

      reader.addEventListener("reading", async (event: NDEFReadingEventLite) => {
        const serial = event.serialNumber ?? "unknown";
        const texts: string[] = [];
        for (const rec of event.message.records) {
          const text = decodeRecordText(rec.data);
          if (text !== null) texts.push(text);
        }

        console.log("[WebNFC] reading", { serial, texts, event });

        // Try to parse the JSON data
        if (texts.length > 0) {
          try {
            const nfcData = JSON.parse(texts[0]);
            
            // Validate the data structure
            if (nfcData.tokenId && nfcData.secret) {
              console.log("Parsed NFC data:", nfcData);
              
              // Show confirmation dialog
              const confirmed = confirm(
                `Found NFT data:\n\nToken ID: ${nfcData.tokenId}\nSecret: ${nfcData.secret}\n\nDo you want to unlock and claim this NFT?`
              );
              
              if (confirmed) {
                try {
                  // Call unlockAndClaim with the parsed data
                  await unlockAndClaim(nfcData.tokenId, nfcData.secret);
                  alert(`Successfully unlocked NFT #${nfcData.tokenId}!`);
                } catch (unlockError) {
                  console.error("Unlock error:", unlockError);
                  alert(`Failed to unlock NFT: ${unlockError instanceof Error ? unlockError.message : String(unlockError)}`);
                }
              }
            } else {
              alert(`Invalid NFC data format. Expected: {"tokenId":"...", "secret":"..."}\nGot: ${texts[0]}`);
            }
          } catch (parseError) {
            console.error("Failed to parse NFC data:", parseError);
            alert(
              `NFC tag read, but data is not in expected JSON format.\n\nSerial: ${serial}\nData: ${texts.join(", ")}`
            );
          }
        } else {
          alert(`NFC tag read but no data found.\nSerial: ${serial}`);
        }
        
        setIsScanning(false);
      });

      reader.addEventListener("readingerror", () => {
        console.error("[WebNFC] readingerror");
        alert("NFC reading error. Please try again.");
        setIsScanning(false);
      });

      await reader.scan();
      console.log("[WebNFC] Scan started - Hold your device near the NFC tag");
    } catch (err) {
      console.error("[WebNFC] scan error", err);
      const message = err instanceof Error ? err.message : String(err);
      alert(`Failed to start NFC scan:\n${message}`);
      setIsScanning(false);
    }
  }, [unlockAndClaim]);

  return (
    <div className="space-y-4">
      {!showManualInput ? (
        <Button
          label={isScanning ? "SCANNING…" : isUnlocking ? "UNLOCKING…" : "SCAN"}
          onClick={isScanning || isUnlocking ? undefined : handleScan}
        />
      ) : (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-white">Manual Unlock</h3>
            <button
              onClick={() => setShowManualInput(false)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <p className="text-sm text-gray-300 mb-4">
            Enter the Token ID and Secret from your NFC tag
          </p>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Token ID</label>
            <input
              type="text"
              value={manualTokenId}
              onChange={(e) => setManualTokenId(e.target.value)}
              placeholder="e.g., 15"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Secret</label>
            <input
              type="text"
              value={manualSecret}
              onChange={(e) => setManualSecret(e.target.value)}
              placeholder="e.g., wjqxiwye"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400"
            />
          </div>
          <button
            onClick={handleManualUnlock}
            disabled={isUnlocking}
            className="w-full px-4 py-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 text-black font-bold rounded transition-colors"
          >
            {isUnlocking ? "UNLOCKING…" : "UNLOCK NFT"}
          </button>
        </div>
      )}
      
      {error && (
        <div className="bg-red-900 border border-red-500 rounded-lg p-4">
          <p className="text-sm text-red-200">
            <strong>Error:</strong> {error}
          </p>
        </div>
      )}
      
      {success && (
        <div className="bg-green-900 border border-green-500 rounded-lg p-4">
          <p className="text-sm text-green-200">
            <strong>Success!</strong> NFT unlocked and claimed successfully!
          </p>
        </div>
      )}
    </div>
  );
}


