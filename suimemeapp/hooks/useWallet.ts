import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import { useCallback, useState } from "react";
import { SuiTransactionBlockResponse } from "@mysten/sui.js/client";
import { TransactionBlock } from "@mysten/sui.js/transactions";

export function useWallet() {
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const [isTransacting, setIsTransacting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeTransaction = useCallback(
    async (txb: TransactionBlock): Promise<SuiTransactionBlockResponse | null> => {
      if (!currentAccount) {
        setError("Wallet not connected");
        return null;
      }

      setIsTransacting(true);
      setError(null);

      try {
        // Execute the transaction using the connected wallet
        const result = await suiClient.executeTransactionBlock({
          transactionBlock: txb,
          requestType: "WaitForLocalExecution",
          options: {
            showEffects: true,
            showEvents: true,
          },
        });

        // Check if transaction was successful
        const success = result.effects?.status?.status === "success";
        
        if (!success) {
          const errorMessage = result.effects?.status?.error || "Transaction failed";
          throw new Error(errorMessage);
        }

        console.log("Transaction successful:", result);
        return result;
      } catch (err) {
        console.error("Transaction error:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
        return null;
      } finally {
        setIsTransacting(false);
      }
    },
    [currentAccount, suiClient]
  );

  return {
    connected: !!currentAccount,
    address: currentAccount?.address,
    isTransacting,
    error,
    executeTransaction,
  };
} 