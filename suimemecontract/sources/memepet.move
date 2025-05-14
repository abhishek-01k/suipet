module memepet::memepet {
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::coin::{Self, Coin};
    use sui::url::{Self, Url};
    use sui::event;
    use sui::sui::SUI;
    use std::string::{Self, String};
    
    /// Error codes
    const EInsufficientFunds: u64 = 0;
    const EInvalidPetType: u64 = 1;
    
    /// Pet types enum
    const PET_TYPE_DOG: u8 = 0;
    const PET_TYPE_CAT: u8 = 1;
    const PET_TYPE_FISH: u8 = 2;
    const PET_TYPE_CUSTOM: u8 = 3;
    
    /// Events
    public struct PetCreated has copy, drop {
        id: ID,
        owner: address,
        pet_type: u8,
        name: String,
        memecoin_address: address
    }
    
    public struct PetLeveledUp has copy, drop {
        id: ID,
        old_level: u64,
        new_level: u64
    }
    
    /// The core Pet object
    public struct Pet has key, store {
        id: UID,
        name: String,
        pet_type: u8,
        level: u64,
        experience: u64,
        happiness: u64,
        health: u64,
        memecoin_address: address,
        image_url: Url,
        created_at: u64,
        last_interaction: u64
    }
    
    /// A capability that represents being the creator of the MemePet system
    public struct AdminCap has key {
        id: UID
    }
    
    /// Initialize the module
    fun init(ctx: &mut TxContext) {
        // Create and transfer AdminCap to the deployer
        transfer::transfer(AdminCap {
            id: object::new(ctx)
        }, tx_context::sender(ctx));
    }
    
    /// Create a new pet for the caller
    public entry fun create_pet(
        name: vector<u8>,
        pet_type: u8,
        memecoin_address: address,
        image_url: vector<u8>,
        payment: &mut Coin<SUI>,
        ctx: &mut TxContext
    ) {
        // Verify pet type is valid
        assert!(pet_type <= PET_TYPE_CUSTOM, EInvalidPetType);
        
        // Fee to create a pet - 0.1 SUI
        let pet_creation_fee = 100000000; // 0.1 SUI in MIST
        
        // Verify sufficient payment
        assert!(coin::value(payment) >= pet_creation_fee, EInsufficientFunds);
        
        // Take fee from payment
        let fee_payment = coin::split(payment, pet_creation_fee, ctx);
        // In a real deployment, fee would go to a recipient or treasury
        transfer::public_transfer(fee_payment, tx_context::sender(ctx));
        
        // Current timestamp
        let now = tx_context::epoch(ctx);
        
        // Create the pet
        let pet = Pet {
            id: object::new(ctx),
            name: string::utf8(name),
            pet_type,
            level: 1,
            experience: 0,
            happiness: 100,
            health: 100,
            memecoin_address,
            image_url: url::new_unsafe_from_bytes(image_url),
            created_at: now,
            last_interaction: now
        };
        
        // Emit pet created event
        event::emit(PetCreated {
            id: object::uid_to_inner(&pet.id),
            owner: tx_context::sender(ctx),
            pet_type,
            name: pet.name,
            memecoin_address
        });
        
        // Transfer pet to sender
        transfer::transfer(pet, tx_context::sender(ctx));
    }
    
    /// Interact with a pet to increase happiness
    public entry fun interact_with_pet(pet: &mut Pet, ctx: &mut TxContext) {
        // Get current values
        let current_happiness = pet.happiness;
        let current_exp = pet.experience;
        let new_exp = current_exp + 5;
        let now = tx_context::epoch(ctx);
        
        // Increase happiness (max 100)
        if (current_happiness < 90) {
            pet.happiness = current_happiness + 10;
        } else {
            pet.happiness = 100;
        };
        
        // Update experience and last interaction time
        pet.experience = new_exp;
        pet.last_interaction = now;
        
        // Check if level up is needed
        check_level_up(pet);
    }
    
    /// Feed a pet to increase health
    public entry fun feed_pet(pet: &mut Pet, ctx: &mut TxContext) {
        // Get current values
        let current_health = pet.health;
        let current_exp = pet.experience;
        let new_exp = current_exp + 3;
        let now = tx_context::epoch(ctx);
        
        // Increase health (max 100)
        if (current_health < 90) {
            pet.health = current_health + 10;
        } else {
            pet.health = 100;
        };
        
        // Update experience and last interaction time
        pet.experience = new_exp;
        pet.last_interaction = now;
        
        // Check if level up is needed
        check_level_up(pet);
    }
    
    /// Training a pet increases experience significantly
    public entry fun train_pet(pet: &mut Pet, ctx: &mut TxContext) {
        // Get current values
        let current_happiness = pet.happiness;
        let current_health = pet.health;
        let current_exp = pet.experience;
        let new_exp = current_exp + 20;
        let now = tx_context::epoch(ctx);
        let new_happiness;
        let new_health;
        
        // Calculate new happiness
        if (current_happiness > 10) {
            new_happiness = current_happiness - 10;
        } else {
            new_happiness = 0;
        };
        
        // Calculate new health
        if (current_health > 5) {
            new_health = current_health - 5;
        } else {
            new_health = 0;
        };
        
        // Update pet stats and last interaction time
        pet.happiness = new_happiness;
        pet.health = new_health;
        pet.experience = new_exp;
        pet.last_interaction = now;
        
        // Check if level up is needed
        check_level_up(pet);
    }
    
    /// Add experience to a pet (used by other modules like missions)
    public fun add_experience(pet: &mut Pet, amount: u64) {
        let current_exp = pet.experience;
        pet.experience = current_exp + amount;
        check_level_up(pet);
    }
    
    /// Internal function to check and process level up
    fun check_level_up(pet: &mut Pet) {
        // Simple leveling formula: level * 100 experience needed to level up
        let experience_needed = pet.level * 100;
        
        if (pet.experience >= experience_needed) {
            // Level up
            let old_level = pet.level;
            pet.level = pet.level + 1;
            pet.experience = pet.experience - experience_needed;
            
            // Emit level up event
            event::emit(PetLeveledUp {
                id: object::uid_to_inner(&pet.id),
                old_level,
                new_level: pet.level
            });
        }
    }
    
    // === Getters ===
    
    /// Get pet's ID
    public fun id(pet: &Pet): &UID {
        &pet.id
    }
    
    /// Get pet's UID for other modules
    public fun pet_id(pet: &Pet): &UID {
        &pet.id
    }
    
    /// Get pet's name
    public fun name(pet: &Pet): String {
        pet.name
    }
    
    /// Get pet's type
    public fun pet_type(pet: &Pet): u8 {
        pet.pet_type
    }
    
    /// Get pet's level
    public fun level(pet: &Pet): u64 {
        pet.level
    }
    
    /// Get pet's stats as a tuple
    public fun stats(pet: &Pet): (u64, u64, u64) {
        (pet.level, pet.happiness, pet.health)
    }
    
    /// Get pet's memecoin address
    public fun memecoin_address(pet: &Pet): address {
        pet.memecoin_address
    }
} 