import { useCurrentAccount, useSuiClient, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { useCallback, useState } from "react";
import { SuiTransactionBlockResponse } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";

export function useWallet() {
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const [isTransacting, setIsTransacting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  const executeTransaction = useCallback(
    async (txb: Transaction): Promise<SuiTransactionBlockResponse | null> => {
      if (!currentAccount) {
        setError("Wallet not connected");
        return null;
      }

      setIsTransacting(true);
      setError(null);

      return new Promise((resolve) => {
        signAndExecuteTransaction(
          {
            transaction: txb,
          },
          {
            onSuccess: async (result) => {
              try {
                // Wait for the transaction to be processed
                const finalResult = await suiClient.waitForTransaction({
                  digest: result.digest,
                  options: {
                    showEffects: true,
                    showEvents: true,
                    showInput: true,
                    showObjectChanges: true,
                  },
                });

                console.log("Transaction successful:", finalResult);
                setIsTransacting(false);
                resolve(finalResult);
              } catch (err) {
                console.error("Error waiting for transaction:", err);
                setError(err instanceof Error ? err.message : "Unknown error");
                setIsTransacting(false);
                resolve(null);
              }
            },
            onError: (err) => {
              console.error("Transaction error:", err);
              setError(err.message || "Transaction failed");
              setIsTransacting(false);
              resolve(null);
            },
          }
        );
      });
    },
    [currentAccount, suiClient, signAndExecuteTransaction]
  );

  return {
    connected: !!currentAccount,
    address: currentAccount?.address,
    isTransacting,
    error,
    executeTransaction,
  };
} 