"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface NDEFMessageLite {
  records: Array<{
    recordType: string;
    data: string;
  }>;
}

interface NDEFReaderLite {
  write: (message: NDEFMessageLite, options?: unknown) => Promise<void>;
  scan: (options?: unknown) => Promise<void>;
}

interface NFCWriterProps {
  data: string;
  tokenId: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  autoStart?: boolean;
}

function webNfcSupported(): boolean {
  if (typeof window === "undefined") return false;
  return "NDEFReader" in window;
}

function isIOS(): boolean {
  if (typeof window === "undefined") return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export function NFCWriter({ data, tokenId, onSuccess, onError, autoStart = false }: NFCWriterProps) {
  const [isWriting, setIsWriting] = useState(false);
  const [writeStatus, setWriteStatus] = useState<"idle" | "writing" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const nfcDataObject = {
    tokenId: tokenId,
    secret: data,
  };

  const nfcDataString = JSON.stringify(nfcDataObject);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(nfcDataString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleWrite = async () => {
    // Check for Web NFC support
    if (!webNfcSupported()) {
      const error = isIOS() 
        ? "NFC writing requires iOS 13+ and Safari. Please ensure NFC is enabled in Settings > Control Center."
        : "Web NFC is not supported on this device/browser. Try Chrome on Android or Safari on iOS 13+.";
      setErrorMessage(error);
      setWriteStatus("error");
      onError?.(error);
      return;
    }

    setIsWriting(true);
    setWriteStatus("writing");
    setErrorMessage("");

    try {
      const ctor = (window as any).NDEFReader;
      if (!ctor) throw new Error("NDEFReader not available");

      const reader: NDEFReaderLite = new ctor();

      // Prepare the NFC message with both token ID and secret in JSON format
      const message: NDEFMessageLite = {
        records: [
          {
            recordType: "text",
            data: nfcDataString,
          },
        ],
      };

      // Write to NFC tag
      await reader.write(message);

      console.log("[WebNFC] Successfully wrote to NFC tag:", nfcDataString);
      setWriteStatus("success");
      setIsWriting(false);
      onSuccess?.();
    } catch (err) {
      console.error("[WebNFC] write error", err);
      const message = err instanceof Error ? err.message : String(err);
      
      let userMessage = message;
      if (message.includes("NotAllowedError") || message.includes("not allowed")) {
        userMessage = "NFC permission denied. Please enable NFC in your device settings and try again.";
      } else if (message.includes("NotSupportedError")) {
        userMessage = "NFC writing is not supported on this device.";
      } else if (message.includes("AbortError")) {
        userMessage = "NFC write operation was cancelled. Please try again.";
      } else if (message.includes("NetworkError")) {
        userMessage = "No NFC tag detected. Please hold your device near the NFC tag and try again.";
      }

      setErrorMessage(userMessage);
      setWriteStatus("error");
      setIsWriting(false);
      onError?.(userMessage);
    }
  };

  // Auto-start writing if autoStart is true
  useEffect(() => {
    if (autoStart && writeStatus === "idle") {
      // Small delay to ensure UI is ready
      const timer = setTimeout(() => {
        handleWrite();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [autoStart]);

  return (
    <div className="space-y-4">
      {writeStatus === "idle" && (
        <div className="bg-blue-900 border border-blue-500 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-2">📱 Write to NFC Tag</h3>
          <p className="text-sm text-gray-300 mb-4">
            Write the token ID and secret key to an NFC tag for secure storage and easy access.
          </p>
          <div className="bg-black p-3 rounded mb-4">
            <p className="text-xs text-gray-400 mb-2">Data to write:</p>
            <p className="text-xs text-gray-400 mb-1">Token ID: <span className="font-mono text-cyan-400">{tokenId}</span></p>
            <p className="text-xs text-gray-400 mb-2">Secret: <span className="font-mono text-yellow-400">{data}</span></p>
            <div className="mt-3 pt-2 border-t border-gray-700">
              <p className="text-xs text-gray-500 mb-2">JSON Format:</p>
              <div className="flex items-start gap-2">
                <code className="text-xs text-gray-300 flex-1 break-all">{nfcDataString}</code>
                <button
                  onClick={handleCopy}
                  className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded transition-colors flex-shrink-0"
                  title="Copy to clipboard"
                >
                  {copied ? "✓ Copied!" : "📋 Copy"}
                </button>
              </div>
            </div>
          </div>
          <Button
            label="Write to NFC Tag"
            onClick={handleWrite}
          />
        </div>
      )}

      {writeStatus === "writing" && (
        <div className="bg-yellow-900 border border-yellow-500 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
            <div>
              <h3 className="text-xl font-bold">Writing to NFC Tag...</h3>
              <p className="text-sm text-gray-300 mt-1">
                Hold your device near the NFC tag
              </p>
            </div>
          </div>
          <div className="mt-4 bg-black p-3 rounded">
            <p className="text-xs text-gray-400">
              📱 Keep your iPhone steady near the NFC tag until writing is complete
            </p>
          </div>
        </div>
      )}

      {writeStatus === "success" && (
        <div className="bg-green-900 border border-green-500 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <div className="text-3xl">✅</div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">Successfully Written to NFC Tag!</h3>
              <p className="text-sm text-gray-300 mb-3">
                Your NFT data has been written to the NFC tag. You can now use this tag to unlock NFT #{tokenId}.
              </p>
              <div className="bg-black p-3 rounded mb-3">
                <p className="text-xs text-yellow-400 font-semibold mb-2">⚠️ Important:</p>
                <ul className="text-xs text-gray-300 space-y-1 mb-3">
                  <li>• Keep the NFC tag in a safe place</li>
                  <li>• Do not expose it to strong magnetic fields</li>
                  <li>• Token ID: <span className="font-mono text-cyan-400">{tokenId}</span></li>
                  <li>• Secret: <span className="font-mono text-yellow-400">{data}</span></li>
                </ul>
                <div className="pt-2 border-t border-gray-700">
                  <p className="text-xs text-gray-400 mb-2">Data written to NFC:</p>
                  <div className="flex items-start gap-2">
                    <code className="text-xs text-gray-300 flex-1 break-all">{nfcDataString}</code>
                    <button
                      onClick={handleCopy}
                      className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded transition-colors flex-shrink-0"
                      title="Copy to clipboard"
                    >
                      {copied ? "✓ Copied!" : "📋 Copy"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {writeStatus === "error" && (
        <div className="bg-red-900 border border-red-500 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <div className="text-3xl">❌</div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">NFC Write Failed</h3>
              <p className="text-sm text-gray-300 mb-3">{errorMessage}</p>
              
              <div className="bg-black p-3 rounded mb-3">
                <p className="text-xs text-gray-400 mb-2">You can still copy the data:</p>
                <p className="text-xs text-gray-400 mb-1">Token ID: <span className="font-mono text-cyan-400">{tokenId}</span></p>
                <p className="text-xs text-gray-400 mb-3">Secret: <span className="font-mono text-yellow-400">{data}</span></p>
                <div className="pt-2 border-t border-gray-700">
                  <p className="text-xs text-gray-500 mb-2">JSON Format:</p>
                  <div className="flex items-start gap-2">
                    <code className="text-xs text-gray-300 flex-1 break-all">{nfcDataString}</code>
                    <button
                      onClick={handleCopy}
                      className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded transition-colors flex-shrink-0"
                      title="Copy to clipboard"
                    >
                      {copied ? "✓ Copied!" : "📋 Copy"}
                    </button>
                  </div>
                </div>
              </div>
              
              {isIOS() && (
                <div className="bg-black p-3 rounded mb-3">
                  <p className="text-xs text-yellow-400 font-semibold mb-2">iPhone Users:</p>
                  <ul className="text-xs text-gray-300 space-y-1">
                    <li>• Make sure you're using Safari browser</li>
                    <li>• iOS 13 or later is required</li>
                    <li>• Go to Settings → Control Center → Add NFC Tag Reader</li>
                    <li>• Hold the top of your iPhone near the NFC tag</li>
                  </ul>
                </div>
              )}

              <Button
                label="Try Again"
                onClick={handleWrite}
              />
            </div>
          </div>
        </div>
      )}

      {!autoStart && writeStatus === "idle" && (
        <div className="text-center">
          <button
            onClick={handleWrite}
            className="text-sm text-gray-400 hover:text-gray-200 underline"
          >
            Skip NFC Writing
          </button>
        </div>
      )}
    </div>
  );
}
