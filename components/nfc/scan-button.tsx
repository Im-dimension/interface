"use client";

import { useCallback, useState } from "react";
import { ActionButton } from "@/components/action-button";

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

      reader.addEventListener("reading", (event: NDEFReadingEventLite) => {
        const serial = event.serialNumber ?? "unknown";
        const texts: string[] = [];
        for (const rec of event.message.records) {
          const text = decodeRecordText(rec.data);
          if (text !== null) texts.push(text);
        }

        console.log("[WebNFC] reading", { serial, texts, event });
        alert(
          `NFC tag read.\nSerial: ${serial}\n${
            texts.length ? `Data:\n- ${texts.join("\n- ")}` : "No text records found."
          }`
        );
        setIsScanning(false);
      });

      reader.addEventListener("readingerror", () => {
        console.error("[WebNFC] readingerror");
        alert("NFC reading error. Please try again.");
        setIsScanning(false);
      });

      await reader.scan();
      console.log("[WebNFC] Scan started");
    } catch (err) {
      console.error("[WebNFC] scan error", err);
      const message = err instanceof Error ? err.message : String(err);
      alert(`Failed to start NFC scan:\n${message}`);
      setIsScanning(false);
    }
  }, []);

  return (
    <ActionButton
      label={isScanning ? "SCANNING…" : "SCAN"}
      onClick={isScanning ? undefined : handleScan}
    />
  );
}


