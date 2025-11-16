"use client";

interface ClaimModalProps {
  isOpen: boolean;
  tokenId: string;
  status: "detecting" | "processing" | "success" | "error";
  errorMessage?: string;
  onClose: () => void;
}

export function ClaimModal({ isOpen, tokenId, status, errorMessage, onClose }: ClaimModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={status === "success" || status === "error" ? onClose : undefined}
      />
      
      {/* Modal */}
      <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 border-2 rounded-2xl p-8 max-w-md w-full shadow-2xl">
        {status === "detecting" && (
          <div className="text-center">
            <div className="text-6xl mb-4 animate-bounce">📱</div>
            <h2 className="text-2xl font-bold text-white mb-2">NFC Detected!</h2>
            <p className="text-gray-300 mb-4">Token ID: <span className="text-cyan-400 font-mono">{tokenId}</span></p>
            <p className="text-gray-400 text-sm">Processing claim...</p>
          </div>
        )}

        {status === "processing" && (
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 border-4 border-cyan-500/30 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-cyan-500 rounded-full border-t-transparent animate-spin"></div>
              <div className="absolute inset-2 bg-cyan-500/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">🔓</span>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Unlocking NFT</h2>
            <p className="text-gray-300 mb-2">Token ID: <span className="text-cyan-400 font-mono">{tokenId}</span></p>
            <p className="text-gray-400 text-sm">Calling smart contract...</p>
            <div className="mt-4 flex justify-center gap-1">
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse delay-100"></div>
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse delay-200"></div>
            </div>
          </div>
        )}

        {status === "success" && (
          <div className="text-center">
            <div className="text-6xl mb-4 animate-bounce">✅</div>
            <h2 className="text-3xl font-bold text-green-400 mb-3">Success!</h2>
            <p className="text-white text-lg mb-2">NFT #{tokenId}</p>
            <p className="text-gray-300 mb-6">Has been unlocked and claimed to your wallet!</p>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors w-full"
            >
              Awesome!
            </button>
          </div>
        )}

        {status === "error" && (
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-3xl font-bold text-red-400 mb-3">Claim Failed</h2>
            <p className="text-white text-lg mb-2">NFT #{tokenId}</p>
            <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 mb-6">
              <p className="text-red-200 text-sm">{errorMessage || "Unknown error occurred"}</p>
            </div>
            <p className="text-gray-400 text-sm mb-6">Please make sure your wallet is connected and try again.</p>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors w-full"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
