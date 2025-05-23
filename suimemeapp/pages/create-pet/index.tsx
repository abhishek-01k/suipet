"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

// Import real memecoins and contract interactions
import { SUPPORTED_MEMECOINS, Memecoin } from "@/constants/memecoins";
import { createPetTransaction } from "@/lib/contractInteraction";
import { useWallet } from "@/hooks/useWallet";
import { logTransaction, logError, logSuccess } from "@/lib/debug";
import { testCreatePetTransaction, logTransactionStructure } from "@/lib/testContract";

// Pet types
const PET_TYPES = [
  { value: 0, label: "Dog", emoji: "🐕" },
  { value: 1, label: "Cat", emoji: "🐈" },
  { value: 2, label: "Fish", emoji: "🐠" },
  { value: 3, label: "Custom", emoji: "🦄" },
];

export default function CreatePet() {
  const [step, setStep] = useState(1);
  const [selectedMemecoin, setSelectedMemecoin] = useState<Memecoin | null>(null);
  const [petName, setPetName] = useState("");
  const [petType, setPetType] = useState(0);
  const [isCreating, setIsCreating] = useState(false);

  const account = useCurrentAccount();
  const { executeTransaction, isTransacting, error } = useWallet();

  // Check environment on mount
  useEffect(() => {
    import('@/lib/environmentCheck').then(({ checkEnvironment }) => {
      checkEnvironment();
    });
  }, []);

  const handleSelectMemecoin = (memecoin: Memecoin) => {
    setSelectedMemecoin(memecoin);
    setPetType(memecoin.petType); // Set default pet type based on memecoin
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!account || !selectedMemecoin) {
      toast.error("Please connect wallet and select a memecoin");
      return;
    }

    if (!petName.trim()) {
      toast.error("Please enter a pet name");
      return;
    }

    setIsCreating(true);

    try {
      // Test transaction creation first
      console.log("🧪 Testing transaction creation...");
      const testResult = testCreatePetTransaction();
      if (!testResult) {
        throw new Error("Transaction test failed - check console for details");
      }

      // Create pet transaction using the real contract interaction
      const tx = createPetTransaction({
        name: petName.trim(),
        petType: petType,
        memecoinAddress: selectedMemecoin.address,
        imageUrl: selectedMemecoin.image,
        paymentAmount: 0.1 // 0.1 SUI fee
      });

      logTransaction("Creating pet transaction", tx);
      logTransactionStructure(tx);

      // Execute the transaction using our custom hook
      const result = await executeTransaction(tx);

      if (result) {
        logSuccess("Pet creation", result);
        toast.success("Pet created successfully!");
        setStep(3);
      } else {
        // If executeTransaction returned null, there was an error
        logError("Pet creation", { message: error || "Unknown error" });
        toast.error(error || "Failed to create pet. Please try again.");
      }
    } catch (error) {
      logError("Pet creation exception", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to create pet: ${errorMessage}`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <main className="flex h-full flex-col items-center">

      {/* Content */}
      <div className="w-full max-w-4xl mx-auto mt-24 px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">Create Your MemePet</h1>

        {/* Progress Steps */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}>1</div>
            <div className={`w-16 h-1 ${step >= 2 ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}>2</div>
            <div className={`w-16 h-1 ${step >= 3 ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}>3</div>
          </div>
        </div>

        {!account ? (
          <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-xl mb-4">Connect your wallet to create a MemePet</p>
            <ConnectButton className="neo-btn bg-purple-500 px-6 py-3 rounded-md font-bold" />
          </div>
        ) : (
          <>
            {/* Step 1: Select Memecoin */}
            {step === 1 && (
              <div className=" p-8 rounded-lg neo-brutalism-shadow">
                <h2 className="text-2xl font-bold mb-6">Select a Memecoin</h2>
                <p className="mb-6 text-gray-600">Choose a memecoin to transform into a virtual pet. Your pet will inherit characteristics from this coin!</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {SUPPORTED_MEMECOINS.map((coin) => (
                    <motion.div
                      key={coin.symbol}
                      whileHover={{ scale: 1.03 }}
                      className="border-2 p-4 rounded-lg cursor-pointer flex items-center gap-4"
                      onClick={() => handleSelectMemecoin(coin)}
                    >
                      <div className="relative w-12 h-12">
                        <Image
                          src={coin.image}
                          alt={coin.name}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <div>
                        <h3 className="font-bold">{coin.name}</h3>
                        <p className="text-sm text-gray-600">{coin.symbol}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Configure Pet */}
            {step === 2 && (
              <div className=" p-8 rounded-lg neo-brutalism-shadow">
                <h2 className="text-2xl font-bold mb-6">Design Your Pet</h2>

                <div className="flex flex-col md:flex-row gap-8">
                  <div className="w-full md:w-1/3 flex flex-col items-center">
                    <div className="relative w-32 h-32 mb-4">
                      <Image
                        src={selectedMemecoin?.image || ""}
                        alt={selectedMemecoin?.name || ""}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <h3 className="font-bold">{selectedMemecoin?.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{selectedMemecoin?.symbol}</p>
                    <p className="text-xs text-gray-500 text-justify mb-4">{selectedMemecoin?.description}</p>

                    <button
                      onClick={() => setStep(1)}
                      className="text-xs text-purple-600 hover:underline"
                    >
                      ← Change memecoin
                    </button>
                  </div>

                  <div className="w-full md:w-2/3">
                    <form onSubmit={handleSubmit}>
                      <div className="mb-6">
                        <label className="block mb-2 font-medium">Pet Name</label>
                        <input
                          type="text"
                          value={petName}
                          onChange={(e) => setPetName(e.target.value)}
                          required
                          className="w-full p-3 border-2 border-black rounded-md"
                          placeholder="Give your pet a name"
                        />
                      </div>

                      <div className="mb-6">
                        <label className="block mb-2 font-medium">Pet Type</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {PET_TYPES.map((type) => (
                            <button
                              key={type.value}
                              type="button"
                              onClick={() => setPetType(type.value)}
                              className={`p-3 border-2 ${petType === type.value ? 'border-purple-500 bg-purple-50 dark:text-black' : 'border-gray-300'} rounded-md flex flex-col items-center`}
                            >
                              <span className="text-2xl mb-1">{type.emoji}</span>
                              <span>{type.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="mt-8">
                        <p className="text-sm text-gray-600 mb-4">
                          Creating a pet costs 0.1 SUI. You'll need to approve this transaction in your wallet.
                        </p>
                        <button
                          type="submit"
                          disabled={isCreating || !petName}
                          className="neo-btn bg-purple-500 text-white px-6 py-3 rounded-md font-bold w-full"
                        >
                          {isCreating ? "Creating..." : "Create My Pet"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Success */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-8 rounded-lg neo-brutalism-shadow text-center"
              >
                <div className="text-5xl mb-4">🎉</div>
                <h2 className="text-2xl font-bold mb-4">Your Pet is Ready!</h2>
                <p className="mb-6 text-gray-600">
                  Your new MemePet has been created! You can now find it in your collection and start interacting with it.
                </p>

                <div className="flex flex-col items-center gap-4">
                  <Link href="/pets" className="neo-btn bg-purple-500 text-white px-6 py-3 rounded-md font-bold">
                    View My Pets
                  </Link>
                  <button
                    onClick={() => {
                      setStep(1);
                      setSelectedMemecoin(null);
                      setPetName("");
                    }}
                    className="text-purple-600 hover:underline"
                  >
                    Create Another Pet
                  </button>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </main>
  );
} 