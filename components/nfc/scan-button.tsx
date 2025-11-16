"use client";

import { useCallback, useState } from "react";
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
  const { unlockAndClaim, isUnlocking, error, success } = useUnlockNFT();

  const handleScan = useCallback(async () => {
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
      <Button
        label={isScanning ? "SCANNING…" : isUnlocking ? "UNLOCKING…" : "SCAN"}
        onClick={isScanning || isUnlocking ? undefined : handleScan}
      />
      
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


