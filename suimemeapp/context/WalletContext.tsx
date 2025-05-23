import React, { useEffect } from "react";
import {
  SuiClientProvider,
  WalletProvider,
  lightTheme,
} from "@mysten/dapp-kit";
import { type StateStorage } from "zustand/middleware";
import { useUserStore } from "@/stores/useUserStore";

type Props = {
  children: React.ReactNode;
};

const SuiWalletProvider = ({ children }: Props) => {
  const { rpcUrl, network } = useUserStore();

  // Configure networks with proper chain identifiers
  const networks = {
    testnet: { 
      url: "https://fullnode.testnet.sui.io/",
      name: "testnet"
    },
    mainnet: { 
      url: "https://fullnode.mainnet.sui.io/",
      name: "mainnet"
    },
    custom: { 
      url: rpcUrl,
      name: network === "testnet" ? "testnet" : network === "mainnet" ? "mainnet" : "testnet"
    },
  };

  // Use testnet by default, or custom if user has configured a different RPC
  const defaultNetwork = rpcUrl === "https://fullnode.testnet.sui.io/" ? "testnet" : "custom";

  if (typeof window === "undefined") return <></>;
  return (
    <>
      <SuiClientProvider networks={networks} defaultNetwork={defaultNetwork}>
        <WalletProvider
          theme={lightTheme}
          autoConnect={true}
          storage={localStorage as StateStorage}
          storageKey="sui-wallet"
          preferredWallets={["Sui Wallet"]}
        >
          {children}
        </WalletProvider>
      </SuiClientProvider>
    </>
  );
};

export default SuiWalletProvider;
