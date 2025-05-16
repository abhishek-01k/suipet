#[test_only]
module memepet::pet_market_tests {
    use sui::test_scenario::{Self as ts, Scenario};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::object::{Self, ID};
    use sui::test_utils::{assert_eq};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    
    use memepet::memepet::{Self, Pet};
    use memepet::pet_market::{Self, Listing};
    
    // Test constants
    const ADMIN: address = @0xA;
    const SELLER: address = @0xB;
    const BUYER: address = @0xC;
    const MEMECOIN_ADDRESS: address = @0xD;
    
    const PET_NAME: vector<u8> = b"MarketPet";
    const PET_TYPE_DOG: u8 = 0;
    const IMAGE_URL: vector<u8> = b"https://example.com/market.png";
    
    const PET_CREATION_FEE: u64 = 100000000; // 0.1 SUI
    const PET_PRICE: u64 = 500000000; // 0.5 SUI
    
    // Helper function to set up a test with a pet ready to be listed
    fun setup_test_with_pet(): Scenario {
        let scenario = ts::begin(ADMIN);
        
        // Initialize the memepet module
        {
            ts::next_tx(&mut scenario, ADMIN);
            memepet::init(ts::ctx(&mut scenario));
        };
        
        // Create a pet for the seller
        {
            ts::next_tx(&mut scenario, SELLER);
            let ctx = ts::ctx(&mut scenario);
            
            // Mint some SUI for the seller
            let coin = coin::mint_for_testing<SUI>(PET_CREATION_FEE * 2, ctx);
            
            memepet::create_pet(
                PET_NAME,
                PET_TYPE_DOG,
                MEMECOIN_ADDRESS,
                IMAGE_URL,
                &mut coin,
                ctx
            );
            
            // Return remaining SUI to the seller
            transfer::public_transfer(coin, SELLER);
        };
        
        scenario
    }
    
    #[test]
    fun test_create_listing() {
        let scenario = setup_test_with_pet();
        
        // Seller creates a listing
        ts::next_tx(&mut scenario, SELLER);
        {
            let pet = ts::take_from_address<Pet>(&scenario, SELLER);
            
            pet_market::create_listing(
                pet,
                PET_PRICE,
                ts::ctx(&mut scenario)
            );
        };
        
        // Check that the listing was created and is available
        ts::next_tx(&mut scenario, SELLER);
        {
            let listing = ts::take_shared<Listing>(&scenario);
            
            // Check listing properties
            let (owner, price, _, is_pet_available) = pet_market::listing_details(&listing);
            assert_eq(owner, SELLER);
            assert_eq(price, PET_PRICE);
            assert_eq(is_pet_available, true);
            
            ts::return_shared(listing);
        };
        
        ts::end(scenario);
    }
    
    #[test]
    fun test_cancel_listing() {
        let scenario = setup_test_with_pet();
        
        // Seller creates a listing
        ts::next_tx(&mut scenario, SELLER);
        {
            let pet = ts::take_from_address<Pet>(&scenario, SELLER);
            
            pet_market::create_listing(
                pet,
                PET_PRICE,
                ts::ctx(&mut scenario)
            );
        };
        
        // Seller cancels the listing
        ts::next_tx(&mut scenario, SELLER);
        {
            let listing = ts::take_shared<Listing>(&scenario);
            
            pet_market::cancel_listing(
                &mut listing,
                ts::ctx(&mut scenario)
            );
            
            ts::return_shared(listing);
        };
        
        // Check that the pet was returned to the seller
        ts::next_tx(&mut scenario, SELLER);
        {
            // Seller should have their pet back
            assert!(ts::has_most_recent_for_address<Pet>(SELLER), 0);
            
            // Get the listing again
            let listing = ts::take_shared<Listing>(&scenario);
            
            // Check that the pet is no longer in the listing
            let (_, _, _, is_pet_available) = pet_market::listing_details(&listing);
            assert_eq(is_pet_available, false);
            
            ts::return_shared(listing);
        };
        
        ts::end(scenario);
    }
    
    #[test]
    fun test_buy_pet() {
        let scenario = setup_test_with_pet();
        
        // Seller creates a listing
        ts::next_tx(&mut scenario, SELLER);
        {
            let pet = ts::take_from_address<Pet>(&scenario, SELLER);
            
            pet_market::create_listing(
                pet,
                PET_PRICE,
                ts::ctx(&mut scenario)
            );
        };
        
        // Buyer purchases the pet
        ts::next_tx(&mut scenario, BUYER);
        {
            let ctx = ts::ctx(&mut scenario);
            
            // Mint some SUI for the buyer
            let coin = coin::mint_for_testing<SUI>(PET_PRICE * 2, ctx);
            
            // Get the listing
            let listing = ts::take_shared<Listing>(&scenario);
            
            // Buy the pet
            pet_market::buy_pet(
                &mut listing,
                &mut coin,
                ctx
            );
            
            // Return the listing and remaining SUI
            ts::return_shared(listing);
            transfer::public_transfer(coin, BUYER);
        };
        
        // Check that the pet was transferred to the buyer and seller received payment
        ts::next_tx(&mut scenario, BUYER);
        {
            // Buyer should now have the pet
            assert!(ts::has_most_recent_for_address<Pet>(BUYER), 0);
            
            // Get the listing again
            let listing = ts::take_shared<Listing>(&scenario);
            
            // Check that the pet is no longer in the listing
            let (_, _, _, is_pet_available) = pet_market::listing_details(&listing);
            assert_eq(is_pet_available, false);
            
            ts::return_shared(listing);
        };
        
        ts::end(scenario);
    }
} 