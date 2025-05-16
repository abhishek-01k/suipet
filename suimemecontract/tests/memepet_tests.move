#[test_only]
module memepet::memepet_tests {
    use sui::test_scenario::{Self as ts, Scenario};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::object::{Self, ID};
    use sui::test_utils::{assert_eq};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    
    use memepet::memepet::{Self, Pet, AdminCap};
    
    // Test constants
    const ADMIN: address = @0xA;
    const USER1: address = @0xB;
    const USER2: address = @0xC;
    const MEMECOIN_ADDRESS: address = @0xD;
    
    const PET_NAME: vector<u8> = b"TestPet";
    const PET_TYPE_DOG: u8 = 0;
    const PET_TYPE_CAT: u8 = 1;
    const IMAGE_URL: vector<u8> = b"https://example.com/image.png";
    
    const PET_CREATION_FEE: u64 = 100000000; // 0.1 SUI
    
    // Helper function to set up a test with initialized memepet module
    fun setup_test(): Scenario {
        let scenario = ts::begin(ADMIN);
        
        // Initialize the memepet module
        {
            ts::next_tx(&mut scenario, ADMIN);
            memepet::init(ts::ctx(&mut scenario));
        };
        
        scenario
    }
    
    // Helper function to mint test SUI coins
    fun mint_sui(amount: u64, ctx: &mut TxContext): Coin<SUI> {
        coin::mint_for_testing<SUI>(amount, ctx)
    }
    
    #[test]
    fun test_init() {
        let scenario = setup_test();
        
        // Check that the AdminCap was transferred to the admin
        ts::next_tx(&mut scenario, ADMIN);
        {
            assert!(ts::has_most_recent_for_address<AdminCap>(ADMIN), 0);
        };
        
        ts::end(scenario);
    }
    
    #[test]
    fun test_create_pet() {
        let scenario = setup_test();
        
        // User creates a pet
        ts::next_tx(&mut scenario, USER1);
        {
            let ctx = ts::ctx(&mut scenario);
            
            // Mint some SUI for the user
            let coin = mint_sui(PET_CREATION_FEE * 2, ctx);
            
            memepet::create_pet(
                PET_NAME,
                PET_TYPE_DOG,
                MEMECOIN_ADDRESS,
                IMAGE_URL,
                &mut coin,
                ctx
            );
            
            // Return remaining SUI to the user
            transfer::public_transfer(coin, USER1);
        };
        
        // Check that the pet was created and transferred to the user
        ts::next_tx(&mut scenario, USER1);
        {
            let pet = ts::take_from_address<Pet>(&scenario, USER1);
            
            // Check pet properties
            assert_eq(memepet::name(&pet), std::string::utf8(PET_NAME));
            assert_eq(memepet::pet_type(&pet), PET_TYPE_DOG);
            assert_eq(memepet::level(&pet), 1);
            assert_eq(memepet::experience(&pet), 0);
            assert_eq(memepet::health(&pet), 100);
            assert_eq(memepet::happiness(&pet), 100);
            
            ts::return_to_address(USER1, pet);
        };
        
        ts::end(scenario);
    }
    
    #[test]
    fun test_pet_interactions() {
        let scenario = setup_test();
        
        // First, create a pet
        ts::next_tx(&mut scenario, USER1);
        {
            let ctx = ts::ctx(&mut scenario);
            let coin = mint_sui(PET_CREATION_FEE * 2, ctx);
            
            memepet::create_pet(
                PET_NAME,
                PET_TYPE_DOG,
                MEMECOIN_ADDRESS,
                IMAGE_URL,
                &mut coin,
                ctx
            );
            
            transfer::public_transfer(coin, USER1);
        };
        
        // Test feeding the pet
        ts::next_tx(&mut scenario, USER1);
        {
            let pet = ts::take_from_address<Pet>(&scenario, USER1);
            
            // Store initial values
            let initial_exp = memepet::experience(&pet);
            
            // Feed the pet
            memepet::feed_pet(&mut pet, ts::ctx(&mut scenario));
            
            // Check that experience increased
            assert_eq(memepet::experience(&pet), initial_exp + 3);
            // Health should be 100 (max)
            assert_eq(memepet::health(&pet), 100);
            
            ts::return_to_address(USER1, pet);
        };
        
        // Test playing with the pet
        ts::next_tx(&mut scenario, USER1);
        {
            let pet = ts::take_from_address<Pet>(&scenario, USER1);
            
            // Store initial values
            let initial_exp = memepet::experience(&pet);
            
            // Play with the pet
            memepet::interact_with_pet(&mut pet, ts::ctx(&mut scenario));
            
            // Check that experience increased
            assert_eq(memepet::experience(&pet), initial_exp + 5);
            // Happiness should be 100 (max)
            assert_eq(memepet::happiness(&pet), 100);
            
            ts::return_to_address(USER1, pet);
        };
        
        // Test training the pet
        ts::next_tx(&mut scenario, USER1);
        {
            let pet = ts::take_from_address<Pet>(&scenario, USER1);
            
            // Store initial values
            let initial_exp = memepet::experience(&pet);
            let initial_health = memepet::health(&pet);
            let initial_happiness = memepet::happiness(&pet);
            
            // Train the pet
            memepet::train_pet(&mut pet, ts::ctx(&mut scenario));
            
            // Check that experience increased
            assert_eq(memepet::experience(&pet), initial_exp + 20);
            // Health and happiness should decrease
            assert_eq(memepet::health(&pet), initial_health - 5);
            assert_eq(memepet::happiness(&pet), initial_happiness - 10);
            
            ts::return_to_address(USER1, pet);
        };
        
        ts::end(scenario);
    }
    
    #[test]
    fun test_level_up() {
        let scenario = setup_test();
        
        // First, create a pet
        ts::next_tx(&mut scenario, USER1);
        {
            let ctx = ts::ctx(&mut scenario);
            let coin = mint_sui(PET_CREATION_FEE * 2, ctx);
            
            memepet::create_pet(
                PET_NAME,
                PET_TYPE_DOG,
                MEMECOIN_ADDRESS,
                IMAGE_URL,
                &mut coin,
                ctx
            );
            
            transfer::public_transfer(coin, USER1);
        };
        
        // Add enough experience to level up
        ts::next_tx(&mut scenario, USER1);
        {
            let pet = ts::take_from_address<Pet>(&scenario, USER1);
            
            // Initial level should be 1
            assert_eq(memepet::level(&pet), 1);
            
            // Train pet multiple times to gain enough experience for level up
            // Need 100 experience to level up from level 1
            // Using 6 training sessions (each gives 20 XP) = 120 XP
            memepet::train_pet(&mut pet, ts::ctx(&mut scenario));
            memepet::train_pet(&mut pet, ts::ctx(&mut scenario));
            memepet::train_pet(&mut pet, ts::ctx(&mut scenario));
            memepet::train_pet(&mut pet, ts::ctx(&mut scenario));
            memepet::train_pet(&mut pet, ts::ctx(&mut scenario));
            memepet::train_pet(&mut pet, ts::ctx(&mut scenario));
            
            // Should now be level 2
            assert_eq(memepet::level(&pet), 2);
            // Experience should reset after leveling up
            assert!(memepet::experience(&pet) < 100, 0);
            
            ts::return_to_address(USER1, pet);
        };
        
        ts::end(scenario);
    }
    
    #[test]
    fun test_experience() {
        let scenario = setup_test();
        
        // First, create a pet
        ts::next_tx(&mut scenario, USER1);
        {
            let ctx = ts::ctx(&mut scenario);
            let coin = mint_sui(PET_CREATION_FEE * 2, ctx);
            
            memepet::create_pet(
                PET_NAME,
                PET_TYPE_DOG,
                MEMECOIN_ADDRESS,
                IMAGE_URL,
                &mut coin,
                ctx
            );
            
            transfer::public_transfer(coin, USER1);
        };
        
        // Add experience and check
        ts::next_tx(&mut scenario, USER1);
        {
            let pet = ts::take_from_address<Pet>(&scenario, USER1);
            
            // Initial experience should be 0
            assert_eq(memepet::experience(&pet), 0);
            
            // For testing, we can use internal function
            memepet::add_experience(&mut pet, 50);
            
            // Experience should now be 50
            assert_eq(memepet::experience(&pet), 50);
            
            ts::return_to_address(USER1, pet);
        };
        
        ts::end(scenario);
    }
} 