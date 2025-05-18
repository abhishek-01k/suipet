import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useContext, useState, useEffect } from "react";
import { COIN } from "bucket-protocol-sdk";
import { ConnectModal } from "@mysten/dapp-kit";
import ConnectMenu from "./ui/connectMenu";
import "@mysten/dapp-kit/dist/index.css";
import { AppContext } from "@/context/AppContext";
import { Link as LinkIcon } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "./ui/button";

// import SlideInMenu from "./slideInMenu";
// import RpcSetting from "./rpcSetting";

const Header = () => {
  const { walletAddress, suiName } = useContext(AppContext);

  return (
    <div
      className="fixed top-0 left-0 w-full backdrop-blur-md z-[100]"
      style={{
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <header className="w-full max-w-360 mx-auto h-20 flex items-center justify-between pt-5 pb-3 px-4">
        {/* Logo Link */}
        <div className="flex items-center gap-2">
          <Link href="/">
            <Image
              src="/pets/pet_logo.webp"
              alt="MemePet Logo"
              width={50}
              height={50}
              className="rounded-full"
            />
          </Link>
          <h1 className="text-2xl font-bold ">MemePet</h1>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/pets" className="text-sm hover:underline">My Pets</Link>
          <Link href="/marketplace" className="text-sm hover:underline">Marketplace</Link>
          {walletAddress ? (
            <ConnectMenu walletAddress={walletAddress} suiName={suiName} />
          ) : (
            <ConnectModal
              trigger={
                <Button
                  className="h-full rounded-xl outline-none ring-0 xl:button-animate-105 overflow-hidden px-6 py-4 "
                  disabled={!!walletAddress}
                  variant='secondary'
                >
                  <span className="text-sm">
                    {walletAddress ? "Connected" : "Connect Wallet"}
                  </span>
                  <LinkIcon size={17} className="" />
                </Button>
              }
            />
          )}
          <ThemeToggle />
        </div>

      </header>
    </div>
  );
};

export default Header;
