"use client";

import { useState } from "react";
import {
  useMintEncryptedNFT,
  NFTMetadata,
} from "@/app/hooks/useMintEncryptedNFT";
import { Button } from "@/components/ui/button";
import { NFCWriter } from "@/components/nfc/nfc-writer";

const RARITY_OPTIONS = [
  "common",
  "uncommon",
  "rare",
  "epic",
  "legendary",
  "mythic",
  "unique",
] as const;

const CATEGORY_OPTIONS = [
  "upper_body",
  "lower_body",
  "feet",
  "accessories",
  "hair",
  "other",
] as const;

export default function AdminPage() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    rarity: "common" as (typeof RARITY_OPTIONS)[number],
    category: "upper_body" as (typeof CATEGORY_OPTIONS)[number],
    tags: "",
    price: "0",
    validityDays: "30", // Default to 30 days
  });

  const [files, setFiles] = useState<{
    thumbnail: File | null;
    image: File | null;
    mainFile: File | null;
  }>({
    thumbnail: null,
    image: null,
    mainFile: null,
  });

  const [nfcWriteComplete, setNfcWriteComplete] = useState(false);

  const {
    isUploading,
    isMinting,
    uploadProgress,
    error,
    success,
    tokenId,
    secret,
    mintEncryptedNFT,
    reset,
  } = useMintEncryptedNFT();

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fileType: keyof typeof files
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (500MB limit)
      const maxSize = 500 * 1024 * 1024; // 500MB
      if (file.size > maxSize) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
        alert(
          `File is too large (${sizeMB} MB). Maximum size is 500 MB. Please compress or reduce the file size.`
        );
        e.target.value = ""; // Reset the input
        return;
      }
      setFiles((prev) => ({ ...prev, [fileType]: file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!files.thumbnail || !files.image || !files.mainFile) {
      alert("Please select all required files");
      return;
    }

    try {
      const metadata: NFTMetadata = {
        name: formData.name,
        description: formData.description,
        rarity: formData.rarity,
        category: formData.category,
        thumbnail: "", // Will be filled during upload
        image: "", // Will be filled during upload
        data: {
          tags: formData.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
          representations: [], // Will be filled during upload
        },
      };

      await mintEncryptedNFT(
        metadata,
        files.thumbnail,
        files.image,
        files.mainFile,
        formData.price,
        parseInt(formData.validityDays) || 30 // Parse validity days, default to 30
      );
    } catch (error) {
      console.error("Mint error:", error);
    }
  };

  const handleReset = () => {
    setFormData({
      name: "",
      description: "",
      rarity: "common",
      category: "upper_body",
      tags: "",
      price: "0",
      validityDays: "30",
    });
    setFiles({
      thumbnail: null,
      image: null,
      mainFile: null,
    });
    setNfcWriteComplete(false);
    reset();
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <h1 className="text-4xl font-bold mb-8 text-[#4a2a1f]">Admin: Mint Encrypted NFT</h1>

      {success && secret && tokenId && (
        <div className="space-y-6 mb-8">
          <div className="bg-[#f4d4a0] border-4 border-dashed border-[#d4a520]/40 rounded-2xl p-4 shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-[#4a2a75]">
              NFT Minted Successfully! 🎉
            </h2>
            <div className="space-y-2">
              <p className="text-[#4a2a1f]">
                <strong>Token ID:</strong> {tokenId}
              </p>
              <div className="bg-[#4a2a75] text-white p-4 rounded-xl mt-4">
                <p className="text-sm text-[#f4d03f] mb-2">
                  <strong>⚠️ SAVE THIS SECRET - It cannot be recovered!</strong>
                </p>
                <p className="font-mono text-xs break-all mb-3">{secret}</p>
                <div className="pt-3 border-t border-white/20">
                  <p className="text-xs text-white/80 mb-2">
                    Copy JSON format:
                  </p>
                  <div className="flex items-start gap-2">
                    <code className="text-xs text-white/90 flex-1 break-all">
                      {JSON.stringify({ tokenId, secret })}
                    </code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(
                          JSON.stringify({ tokenId, secret })
                        );
                      }}
                      className="px-3 py-1.5 text-xs bg-[#f3a8c7] hover:bg-[#e89abc] text-[#4a2a1f] rounded-full transition-colors shrink-0 border-2 border-purple-600/20"
                      title="Copy to clipboard"
                    >
                      📋 Copy JSON
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* NFC Writer - Auto-starts after successful mint */}
          {!nfcWriteComplete && (
            <NFCWriter
              data={secret}
              tokenId={tokenId}
              autoStart={true}
              onSuccess={() => {
                setNfcWriteComplete(true);
              }}
              onError={(error) => {
                console.error("NFC write error:", error);
                // Still allow user to continue even if NFC write fails
              }}
            />
          )}

          {nfcWriteComplete && (
            <div className="text-center">
              <Button label="Mint Another NFT" onClick={handleReset} />
            </div>
          )}

          {/* Allow skip if NFC write is taking too long or failing */}
          {!nfcWriteComplete && (
            <div className="text-center">
              <button
                onClick={handleReset}
                className="text-sm text-[#4a2a1f]/70 hover:text-[#4a2a1f] underline"
              >
                Skip NFC Writing and Mint Another NFT
              </button>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="bg-[#f4d4a0] border-4 border-dashed border-[#d4a520]/40 rounded-2xl p-4 mb-8 shadow-lg">
          <p className="font-bold text-[#4a2a75]">Error:</p>
          <p className="text-[#4a2a1f]">{error}</p>
        </div>
      )}

      {!success && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-2 text-[#4a2a1f]">
              Item Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full bg-white/80 border border-purple-600/20 text-[#4a2a1f] placeholder:text-[#4a2a1f]/50 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#d4a520]/40"
              placeholder="Enter item name"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2 text-[#4a2a1f]">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={4}
              className="w-full bg-white/80 border border-purple-600/20 text-[#4a2a1f] placeholder:text-[#4a2a1f]/50 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#d4a520]/40"
              placeholder="Enter item description"
            />
          </div>

          {/* Rarity and Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-[#4a2a1f]">
                Rarity <span className="text-red-500">*</span>
              </label>
              <select
                name="rarity"
                value={formData.rarity}
                onChange={handleInputChange}
                required
                className="w-full bg-white/80 border border-purple-600/20 text-[#4a2a1f] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#d4a520]/40"
              >
                {RARITY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-[#4a2a1f]">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="w-full bg-white/80 border border-purple-600/20 text-[#4a2a1f] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#d4a520]/40"
              >
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option.replace("_", " ").charAt(0).toUpperCase() +
                      option.slice(1).replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-2 text-[#4a2a1f]">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              className="w-full bg-white/80 border border-purple-600/20 text-[#4a2a1f] placeholder:text-[#4a2a1f]/50 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#d4a520]/40"
              placeholder="e.g., rare, collectible, limited"
            />
          </div>

          {/* Price and Validity Days */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-[#4a2a1f]">
                Price (in Wei, 0 for free)
              </label>
              <input
                type="text"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="w-full bg-white/80 border border-purple-600/20 text-[#4a2a1f] placeholder:text-[#4a2a1f]/50 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#d4a520]/40"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-[#4a2a1f]">
                Validity Days <span className="text-red-500">*</span>
                <span className="text-xs text-[#4a2a1f]/60 ml-2">(Data retention on Arkiv)</span>
              </label>
              <input
                type="number"
                name="validityDays"
                value={formData.validityDays}
                onChange={handleInputChange}
                min="1"
                max="365"
                required
                className="w-full bg-white/80 border border-purple-600/20 text-[#4a2a1f] placeholder:text-[#4a2a1f]/50 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#d4a520]/40"
                placeholder="30"
              />
            </div>
          </div>

          {/* File Uploads */}
          <div className="space-y-4 border-4 border-dashed border-[#d4a520]/40 rounded-2xl p-4 bg-[#f4d4a0]">
            <h3 className="text-lg font-semibold mb-4 text-[#4a2a75]">File Uploads</h3>

            {/* Thumbnail */}
            <div>
              <label className="block text-sm font-medium mb-2 text-[#4a2a1f]">
                Thumbnail (PNG/JPG) <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "thumbnail")}
                required
                className="w-full bg-white/80 border border-purple-600/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#d4a520]/40 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-2 file:border-purple-600/20 file:bg-[#f3a8c7] file:text-[#4a2a1f] hover:file:bg-[#e89abc]"
              />
              {files.thumbnail && (
                <p className="text-sm text-[#4a2a1f]/70 mt-1">
                  {files.thumbnail.name}
                </p>
              )}
            </div>

            {/* Image */}
            <div>
              <label className="block text-sm font-medium mb-2 text-[#4a2a1f]">
                Main Image (PNG/JPG) <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "image")}
                required
                className="w-full bg-white/80 border border-purple-600/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#d4a520]/40 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-2 file:border-purple-600/20 file:bg-[#f3a8c7] file:text-[#4a2a1f] hover:file:bg-[#e89abc]"
              />
              {files.image && (
                <p className="text-sm text-[#4a2a1f]/70 mt-1">{files.image.name}</p>
              )}
            </div>

            {/* Main File */}
            <div>
              <label className="block text-sm font-medium mb-2 text-[#4a2a1f]">
                Main File (GLB/Video/etc){" "}
                <span className="text-red-500">*</span>
                <span className="text-xs text-[#4a2a1f]/60 ml-2">(Max 500 MB)</span>
              </label>
              <input
                type="file"
                onChange={(e) => handleFileChange(e, "mainFile")}
                required
                className="w-full bg-white/80 border border-purple-600/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#d4a520]/40 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-2 file:border-purple-600/20 file:bg-[#f3a8c7] file:text-[#4a2a1f] hover:file:bg-[#e89abc]"
              />
              {files.mainFile && (
                <p className="text-sm text-[#4a2a1f]/70 mt-1">
                  {files.mainFile.name} (
                  {(files.mainFile.size / (1024 * 1024)).toFixed(2)} MB)
                </p>
              )}
            </div>
          </div>

          {/* Progress */}
          {(isUploading || isMinting) && (
            <div className="bg-[#f4d4a0] border-4 border-dashed border-[#d4a520]/40 rounded-2xl p-4 shadow-lg">
              <p className="font-medium text-[#4a2a75]">{uploadProgress}</p>
              <div className="mt-2 w-full bg-[#f3a8c7]/40 rounded-full h-2">
                <div
                  className="bg-[#f3a8c7] h-2 rounded-full animate-pulse"
                  style={{ width: "100%" }}
                ></div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isUploading || isMinting}
            className="w-full bg-[#f4d03f] hover:bg-[#e5c230] disabled:bg-[#e5c230]/50 disabled:cursor-not-allowed py-3 text-lg font-bold rounded-full transition-colors text-[#4a2a1f] border-4 border-[#d4a520]/30"
          >
            {isUploading || isMinting ? "Processing..." : "Mint Encrypted NFT"}
          </button>
        </form>
      )}

      {/* Instructions */}
      <div className="mt-12 border-4 border-dashed border-[#d4a520]/40 rounded-2xl p-6 bg-[#f4d4a0] shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-[#4a2a75]">Instructions</h2>
        <ul className="space-y-2 text-sm text-[#4a2a1f]">
          <li>• Connect your wallet before minting</li>
          <li>• Fill in all required fields marked with *</li>
          <li>• Upload thumbnail, main image, and the main 3D/video file</li>
          <li>• The metadata will be encrypted before storing on-chain</li>
          <li>
            • <strong className="text-[#4a2a75]">Save the secret key</strong> - it&apos;s needed to unlock the NFT
          </li>
          <li>• The secret is only shown once and cannot be recovered</li>
        </ul>
      </div>
    </div>
  );
}
