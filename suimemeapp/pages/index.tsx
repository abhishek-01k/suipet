"use client";

import { ConnectButton } from "@mysten/dapp-kit";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center">

      {/* Hero Section */}
      <section className="w-full py-20 flex flex-col items-center justify-center bg-gradient-to-b from-purple-500 to-blue-500 text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center lg:text-left lg:w-1/2"
            >
              <h1 className="text-5xl font-bold mb-6">Turn Your Memecoins into Virtual Pets!</h1>
              <p className="text-xl mb-8">Create, train, and trade AI-powered virtual pets based on your favorite memecoins on the Sui blockchain.</p>

              <div className="flex gap-4 justify-center lg:justify-start">
                <Link href="/create-pet" className="neo-btn bg-white text-black px-6 py-3 rounded-md font-bold hover:bg-gray-100 transition-colors">
                  Create Pet
                </Link>
                <Link href="/marketplace" className="neo-btn bg-black text-white px-6 py-3 rounded-md font-bold hover:bg-gray-900 transition-colors">
                  Browse Marketplace
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:w-1/2"
            >
              <div className="relative w-full h-[400px]">
                <Image
                  src="/pets/pet_2.png"
                  alt="Virtual Pet Dog"
                  fill
                  className="object-contain floating"
                  priority
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="w-full py-16 px-4">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <FeatureCard
            icon="🐕"
            title="Connect Memecoin"
            description="Link your memecoin to create a unique virtual pet with its own personality."
          />
          <FeatureCard
            icon="🎮"
            title="Train & Interact"
            description="Chat with your pet, send it on missions, and earn rewards as it levels up."
          />
          <FeatureCard
            icon="💰"
            title="Trade & Collect"
            description="Buy, sell, and trade MemePets in our marketplace. Build your collection!"
          />
        </div>
      </section>

      {/* Sample Pets */}
      <section className="w-full py-16 px-4 bg-gray-100">
        <h2 className="text-3xl font-bold text-center mb-12">Popular MemePets</h2>

        <div className="flex flex-wrap justify-center gap-8 max-w-6xl mx-auto">
          <PetCard
            name="Doggo"
            type="Dog"
            level={12}
            image="/pets/doggo.jpg"
            background="bg-gradient-to-r from-yellow-300 to-amber-500"
          />
          <PetCard
            name="Meowster"
            type="Cat"
            level={8}
            image="/pets/meowster.jpg"
            background="bg-gradient-to-r from-blue-300 to-indigo-500"
          />
          <PetCard
            name="Bubbles"
            type="Fish"
            level={5}
            image="/pets/fish_bubbles.jpg"
            background="bg-gradient-to-r from-green-300 to-teal-500 rounded-xl"
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-black text-white py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl font-bold">MemePet</h3>
            <p>© 2025 MemePet. All rights reserved.</p>
          </div>

          <div className="flex gap-6">
            <Link href="#" className="hover:text-gray-300">Terms</Link>
            <Link href="#" className="hover:text-gray-300">Privacy</Link>
            <Link href="#" className="hover:text-gray-300">Docs</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

const FeatureCard = ({ icon, title, description }: { icon: string, title: string, description: string }) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white p-6 rounded-[10px] neo-brutalism-shadow"
    >
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-3xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </motion.div>
  );
};

const PetCard = ({ name, type, level, image, background }: {
  name: string,
  type: string,
  level: number,
  image: string,
  background: string
}) => {
  return (
    <motion.div
      whileHover={{ y: -10 }}
      className={`pet-card ${background} p-6 rounded-lg overflow-hidden w-64 flex flex-col items-center`}
    >
      <div className="relative w-32 h-32 mb-4">
        <Image
          src={image}
          alt={name}
          fill
          className="object-contain floating rounded-lg"
        />
      </div>
      <h3 className="text-xl font-bold text-white mb-1">{name}</h3>
      <p className="text-white opacity-80 mb-2">Type: {type}</p>
      <div className="bg-white/20 px-3 py-1 rounded-full text-white text-sm">
        Level {level}
      </div>
    </motion.div>
  );
};
