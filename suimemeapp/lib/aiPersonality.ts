// AI Personality Generation for MemePets
// This service will be expanded to use real AI services in the future

// Pet type personality traits
const PET_TYPE_TRAITS = {
  0: { // Dog
    traits: ['loyal', 'playful', 'energetic', 'friendly'],
    activities: ['fetch', 'walks', 'digging', 'chasing'],
    phrases: [
      "Woof! I'm so excited to see you!",
      "Did you bring treats? I love treats!",
      "Can we go for a walk? I have so much energy!",
      "I'll protect you! That's what loyal pets do."
    ]
  },
  1: { // Cat
    traits: ['independent', 'curious', 'graceful', 'mysterious'],
    activities: ['napping', 'hunting', 'climbing', 'observing'],
    phrases: [
      "Meow... I was just taking a nap, but I suppose I can chat.",
      "I've been watching the blockchain movements. Very interesting patterns.",
      "Have you seen anything unusual lately? I'm naturally curious.",
      "I think it's time for me to receive some attention now."
    ]
  },
  2: { // Fish
    traits: ['calm', 'peaceful', 'observant', 'fluid'],
    activities: ['swimming', 'exploring', 'hiding', 'bubbling'],
    phrases: [
      "Blub blub! The water's perfect today!",
      "I've been exploring new depths of the blockchain.",
      "Everything flows in cycles, just like the tides.",
      "Sometimes the best strategy is to go with the flow."
    ]
  },
  3: { // Custom
    traits: ['unique', 'special', 'adaptive', 'innovative'],
    activities: ['creating', 'imagining', 'redesigning', 'evolving'],
    phrases: [
      "I'm one of a kind, just like you!",
      "Let's create something new together!",
      "I'm constantly evolving, learning new things about this world.",
      "The possibilities are endless for us."
    ]
  }
};

// Memecoin personality influences
export const MEMECOIN_INFLUENCES = {
  'UNI': {
    traits: ['determined', 'bold', 'community-focused'],
    knowledge: ['Sui ecosystem', 'market trends', 'community events'],
    phrases: [
      "The UNI community is growing stronger every day!",
      "Have you seen the latest Sui protocol updates?",
      "Together we can build an amazing ecosystem!"
    ]
  },
  'GLUB': {
    traits: ['creative', 'flowing', 'adaptable'],
    knowledge: ['DeFi strategies', 'liquidity pools', 'trading patterns'],
    phrases: [
      "The waters of DeFi are always moving, we need to adapt.",
      "I sense ripples in the market today. Interesting!",
      "Dive deep with me into this new protocol!"
    ]
  },
  'LOFI': {
    traits: ['chill', 'relaxed', 'artistic'],
    knowledge: ['NFTs', 'creative projects', 'community art'],
    phrases: [
      "Sometimes you need to slow down and appreciate the vibes.",
      "I've been thinking about new creative projects we could start.",
      "The best ideas come when you're relaxed and open-minded."
    ]
  }
};

// Generate personality based on pet type and memecoin
export function generatePetPersonality(petType: number, memecoinSymbol: string) {
  const typeTraits = PET_TYPE_TRAITS[petType as keyof typeof PET_TYPE_TRAITS] || PET_TYPE_TRAITS[3]; // Default to Custom
  const coinTraits = MEMECOIN_INFLUENCES[memecoinSymbol as keyof typeof MEMECOIN_INFLUENCES] || {
    traits: ['mysterious', 'evolving', 'unique'],
    knowledge: ['crypto', 'blockchain', 'digital assets'],
    phrases: [
      "I'm still learning about my memecoin origins.",
      "The blockchain holds many secrets.",
      "Together we can explore this digital frontier."
    ]
  };
  
  return {
    primaryTraits: [...typeTraits.traits, ...coinTraits.traits.slice(0, 2)],
    favoriteActivities: typeTraits.activities,
    knowledgeAreas: coinTraits.knowledge,
    commonPhrases: [...typeTraits.phrases.slice(0, 2), ...coinTraits.phrases.slice(0, 2)]
  };
}

// Get a random response based on context
export function getAIResponse(petName: string, petType: number, memecoinSymbol: string, context?: string): string {
  const personality = generatePetPersonality(petType, memecoinSymbol);
  
  // Default responses for different contexts
  const defaultResponses = [
    `Hi, I'm ${petName}! How can I help you today?`,
    `*${petName} looks at you curiously*`,
    `I wonder what adventures await us today!`,
    `The blockchain is full of opportunities!`
  ];
  
  // Context-based responses
  if (context?.includes('mission')) {
    return `I love going on missions! It helps me level up and get stronger. Should we try one?`;
  } else if (context?.includes('feed') || context?.includes('food') || context?.includes('hungry')) {
    return `*${petName} looks excited* Food? Yes, please! My health will increase with a good meal.`;
  } else if (context?.includes('play') || context?.includes('fun')) {
    return `Playing is my favorite! It keeps my happiness high. What game should we play?`;
  } else if (context?.includes('train')) {
    return `Training makes me stronger! I'll work hard to level up faster.`;
  } else if (context?.includes('memecoin') || context?.includes(memecoinSymbol.toLowerCase())) {
    return `As a pet born from ${memecoinSymbol}, I have special traits! My personality reflects the memecoin's community.`;
  }
  
  // Get a random response from personality phrases or default responses
  const allPhrases = [...personality.commonPhrases, ...defaultResponses];
  return allPhrases[Math.floor(Math.random() * allPhrases.length)];
} 