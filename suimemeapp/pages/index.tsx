"use client";

import { ConnectButton } from "@mysten/dapp-kit";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/8bit/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center">

      {/* Hero Section */}
      <section className="w-full py-28 flex flex-col items-center justify-center bg-gradient-to-b from-primary/20 via-primary/10 to-transparent dark:from-primary/10 dark:via-primary/5 dark:to-transparent text-foreground relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent dark:from-primary/10 dark:via-transparent dark:to-transparent"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center lg:text-left lg:w-1/2"
            >

              <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6 leading-tight">
                <span className="inline-block transform -rotate-2 bg-black text-white dark:text-black dark:bg-white px-4 py-2 mb-2">MemePet</span>
                <br />
                <span className="text-black dark:text-white">Virtual Pets on</span>
                <br />
                <span className="inline-block transform rotate-1 bg-[#29a9ff] text-black px-4 py-2">SUI</span>
              </h1>

              <p className="text-xl text-white mb-8 border-l-4 border-black pl-4 bg-black/20 p-4 rounded-tr-lg">
                Create, train, and trade AI-powered virtual pets based on your favorite memecoins on the Sui blockchain              </p>

              <div className="flex gap-8 justify-center lg:justify-start">
                <Link href="/create-pet" >
                  <Button>Create Pet</Button>
                </Link>
                <Link href="/marketplace">
                  <Button>Browse Marketplace</Button>
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
        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden pointer-events-none">
          <div className="wave-container">
            <div className="wave wave1 bg-green-600/30 dark:bg-green-700/20"></div>
            <div className="wave wave2 bg-green-500/20 dark:bg-green-600/10"></div>
            <div className="wave wave3 bg-green-400/10 dark:bg-green-500/5"></div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="w-full py-16 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/5 to-background dark:from-background dark:via-secondary/10 dark:to-background"></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
        <div className="relative z-10">
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
        </div>
        {/* Section Divider */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500/50 to-transparent dark:via-green-600/50"></div>
      </section>

      {/* Sample Pets */}
      <section className="w-full py-16 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/50 via-accent/5 to-muted/50 dark:from-muted/30 dark:via-accent/10 dark:to-muted/30"></div>
        <div className="absolute inset-0 bg-dots-pattern opacity-5 pointer-events-none"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-center mb-12">Popular MemePets</h2>

          <div className="flex flex-wrap justify-center gap-8 max-w-6xl mx-auto">
            <PetCard
              name="Doggo"
              type="Dog"
              level={12}
              image="/pets/doggo.jpg"
              background="bg-gradient-purple"
            />
            <PetCard
              name="Meowster"
              type="Cat"
              level={8}
              image="/pets/meowster.jpg"
              background="bg-gradient-blue"
            />
            <PetCard
              name="Bubbles"
              type="Fish"
              level={5}
              image="/pets/fish_bubbles.jpg"
              background="bg-gradient-green"
            />
          </div>
        </div>
      </section>

    </main>
  );
}

const FeatureCard = ({ icon, title, description }: { icon: string, title: string, description: string }) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-card text-card-foreground p-6 rounded-[10px] neo-brutalism-shadow"
    >
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-3xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
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
      <h3 className="text-xl font-bold text-primary-foreground mb-1">{name}</h3>
      <p className="text-primary-foreground/80 mb-2">Type: {type}</p>
      <div className="bg-primary-foreground/20 px-3 py-1 rounded-full text-primary-foreground text-sm">
        Level {level}
      </div>
    </motion.div>
  );
};
