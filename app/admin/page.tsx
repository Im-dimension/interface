"use client";

import { useState } from "react";
import { useMintEncryptedNFT, NFTMetadata } from "@/app/hooks/useMintEncryptedNFT";
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
    rarity: "common" as typeof RARITY_OPTIONS[number],
    category: "upper_body" as typeof CATEGORY_OPTIONS[number],
    tags: "",
    price: "0",
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: keyof typeof files) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (100MB limit)
      const maxSize = 100 * 1024 * 1024; // 100MB
      if (file.size > maxSize) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
        alert(`File is too large (${sizeMB} MB). Maximum size is 100 MB. Please compress or reduce the file size.`);
        e.target.value = ''; // Reset the input
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
          tags: formData.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
          representations: [], // Will be filled during upload
        },
      };

      await mintEncryptedNFT(
        metadata,
        files.thumbnail,
        files.image,
        files.mainFile,
        formData.price
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
    <div className="min-h-screen bg-black text-white p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto pb-12">
        <h1 className="text-4xl font-bold mb-8">Admin: Mint Encrypted NFT</h1>

        {success && secret && tokenId && (
          <div className="space-y-6 mb-8">
            <div className="bg-green-900 border border-green-500 rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4">NFT Minted Successfully! 🎉</h2>
              <div className="space-y-2">
                <p>
                  <strong>Token ID:</strong> {tokenId}
                </p>
                <div className="bg-black p-4 rounded mt-4">
                  <p className="text-sm text-yellow-400 mb-2">
                    <strong>⚠️ SAVE THIS SECRET - It cannot be recovered!</strong>
                  </p>
                  <p className="font-mono text-xs break-all">{secret}</p>
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
                  className="text-sm text-gray-400 hover:text-gray-200 underline"
                >
                  Skip NFC Writing and Mint Another NFT
                </button>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="bg-red-900 border border-red-500 rounded-lg p-4 mb-8">
            <p className="font-bold">Error:</p>
            <p>{error}</p>
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Item Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter item name"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter item description"
              />
            </div>

            {/* Rarity and Category */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Rarity <span className="text-red-500">*</span>
                </label>
                <select
                  name="rarity"
                  value={formData.rarity}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {RARITY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option.replace("_", " ").charAt(0).toUpperCase() + option.slice(1).replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., rare, collectible, limited"
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Price (in Wei, 0 for free)
              </label>
              <input
                type="text"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>

            {/* File Uploads */}
            <div className="space-y-4 border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">File Uploads</h3>

              {/* Thumbnail */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Thumbnail (PNG/JPG) <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "thumbnail")}
                  required
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                />
                {files.thumbnail && (
                  <p className="text-sm text-gray-400 mt-1">{files.thumbnail.name}</p>
                )}
              </div>

              {/* Image */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Main Image (PNG/JPG) <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "image")}
                  required
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                />
                {files.image && (
                  <p className="text-sm text-gray-400 mt-1">{files.image.name}</p>
                )}
              </div>

              {/* Main File */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Main File (GLB/Video/etc) <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-500 ml-2">(Max 100 MB)</span>
                </label>
                <input
                  type="file"
                  onChange={(e) => handleFileChange(e, "mainFile")}
                  required
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                />
                {files.mainFile && (
                  <p className="text-sm text-gray-400 mt-1">
                    {files.mainFile.name} ({(files.mainFile.size / (1024 * 1024)).toFixed(2)} MB)
                  </p>
                )}
              </div>
            </div>

            {/* Progress */}
            {(isUploading || isMinting) && (
              <div className="bg-blue-900 border border-blue-500 rounded-lg p-4">
                <p className="font-medium">{uploadProgress}</p>
                <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{ width: "100%" }}></div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isUploading || isMinting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed py-3 text-lg font-semibold rounded-lg transition-colors"
            >
              {isUploading || isMinting ? "Processing..." : "Mint Encrypted NFT"}
            </button>
          </form>
        )}

        {/* Instructions */}
        <div className="mt-12 border border-gray-700 rounded-lg p-6 bg-gray-900">
          <h2 className="text-xl font-bold mb-4">Instructions</h2>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>• Connect your wallet before minting</li>
            <li>• Fill in all required fields marked with *</li>
            <li>• Upload thumbnail, main image, and the main 3D/video file</li>
            <li>• The metadata will be encrypted before storing on-chain</li>
            <li>• <strong className="text-yellow-400">Save the secret key</strong> - it&apos;s needed to unlock the NFT</li>
            <li>• The secret is only shown once and cannot be recovered</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
