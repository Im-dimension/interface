"use client";

import { useMemo, useState } from "react";
import { useActiveAccount, useReadContract, useSendTransaction } from "thirdweb/react";
import { getContract, prepareContractCall } from "thirdweb";
import { polkadotHubTestnet, thirdwebClient } from "@/lib/thirdweb";

const STORAGE_ABI = [
  {
    inputs: [{ internalType: "uint256", name: "num", type: "uint256" }],
    name: "store",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "retrieve",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const; 

type Props = {
  address: string;
};

export function StorageWidget({ address }: Props) {
  const account = useActiveAccount();
  const { mutate: sendTx, isPending } = useSendTransaction();
  const [inputValue, setInputValue] = useState<string>("");

  const contract = useMemo(() => {
    return getContract({
      client: thirdwebClient,
      chain: polkadotHubTestnet,
      address,
      abi: STORAGE_ABI,
    });
  }, [address]);

  const { data: currentValue, refetch, isLoading: isReading } = useReadContract({
    contract,
    method: "retrieve",
    params: [],
    queryOptions: {
      enabled: !!address,
      refetchInterval: 10_000,
    },
  });

  async function handleStore() {
    if (!account || !inputValue) return;
    const value = BigInt(inputValue);
    const tx = prepareContractCall({
      contract,
      method: "store",
      params: [value],
    });
    sendTx(tx, {
      onSuccess: () => {
        refetch();
        setInputValue("");
      },
    });
  }

  return (
    <div className="mt-8 max-w-2xl mx-auto rounded-xl border border-white/10 bg-white/5 p-4">
      <h3 className="text-white font-semibold mb-3">Storage Contract</h3>
      <div className="text-white/80 text-sm mb-2">
        Current value: {isReading ? "Loading…" : String(currentValue ?? "—")}
      </div>
      <div className="flex items-center gap-3">
        <input
          type="number"
          className="flex-1 rounded-lg px-3 py-2 bg-black/30 text-white border border-white/10 outline-none"
          placeholder="Enter number"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button
          onClick={handleStore}
          disabled={!account || isPending || !inputValue}
          className="rounded-lg px-4 py-2 bg-purple-600 text-white font-medium disabled:opacity-50"
        >
          {isPending ? "Submitting…" : "Store"}
        </button>
      </div>
      <p className="text-white/70 text-xs mt-2 break-all">Address: {address}</p>
    </div>
  );
}


