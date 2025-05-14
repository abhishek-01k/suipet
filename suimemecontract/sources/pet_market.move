module memepet::pet_market {
    use sui::object::{Self, UID, ID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::event;
    use std::option::{Self, Option};
    use memepet::memepet::{Self, Pet};
    
    /// Error codes
    const EInvalidPrice: u64 = 0;
    const EInvalidListing: u64 = 1;
    const EInsufficientPayment: u64 = 2;
    const ENotListingOwner: u64 = 3;
    
    /// Events
    public struct PetListed has copy, drop {
        id: ID,
        pet_id: ID,
        price: u64,
        seller: address
    }
    
    public struct PetSold has copy, drop {
        id: ID,
        pet_id: ID,
        price: u64,
        seller: address,
        buyer: address
    }
    
    public struct PetListingCancelled has copy, drop {
        id: ID,
        pet_id: ID
    }
    
    /// Pet Listing object
    public struct Listing has key {
        id: UID,
        owner: address,
        pet: Option<Pet>,
        price: u64,
        created_at: u64
    }
    
    /// Create a new listing for a pet
    public entry fun create_listing(
        pet: Pet,
        price: u64,
        ctx: &mut TxContext
    ) {
        // Verify price is reasonable (greater than zero)
        assert!(price > 0, EInvalidPrice);
        
        // Get pet ID for the event
        let pet_id = object::uid_to_inner(memepet::pet_id(&pet));
        
        // Create the listing object
        let listing_id = object::new(ctx);
        let listing = Listing {
            id: listing_id,
            owner: tx_context::sender(ctx),
            pet: option::some(pet),
            price,
            created_at: tx_context::epoch(ctx)
        };
        
        // Emit listing created event
        event::emit(PetListed {
            id: object::uid_to_inner(&listing.id),
            pet_id,
            price,
            seller: tx_context::sender(ctx)
        });
        
        // Transfer listing to sender - use share_object since multiple users need to access it
        transfer::share_object(listing);
    }
    
    /// Cancel a listing and retrieve the pet
    public entry fun cancel_listing(
        listing: &mut Listing,
        ctx: &mut TxContext
    ) {
        // Verify listing owner
        assert!(listing.owner == tx_context::sender(ctx), ENotListingOwner);
        
        // Verify pet exists in the listing
        assert!(option::is_some(&listing.pet), EInvalidListing);
        
        // Remove pet from listing
        let pet = option::extract(&mut listing.pet);
        
        // Emit listing cancelled event
        event::emit(PetListingCancelled {
            id: object::uid_to_inner(&listing.id),
            pet_id: object::uid_to_inner(memepet::pet_id(&pet))
        });
        
        // Return pet to the owner using public_transfer
        transfer::public_transfer(pet, tx_context::sender(ctx));
    }
    
    /// Buy a pet from a listing
    public entry fun buy_pet(
        listing: &mut Listing,
        payment: &mut Coin<SUI>,
        ctx: &mut TxContext
    ) {
        // Verify pet exists in the listing
        assert!(option::is_some(&listing.pet), EInvalidListing);
        
        // Verify sufficient payment
        assert!(coin::value(payment) >= listing.price, EInsufficientPayment);
        
        // Split the payment
        let paid = coin::split(payment, listing.price, ctx);
        
        // Transfer payment to the seller
        transfer::public_transfer(paid, listing.owner);
        
        // Get the pet
        let pet = option::extract(&mut listing.pet);
        let pet_id = object::uid_to_inner(memepet::pet_id(&pet));
        
        // Emit pet sold event
        event::emit(PetSold {
            id: object::uid_to_inner(&listing.id),
            pet_id,
            price: listing.price,
            seller: listing.owner,
            buyer: tx_context::sender(ctx)
        });
        
        // Transfer pet to the buyer using public_transfer
        transfer::public_transfer(pet, tx_context::sender(ctx));
    }
    
    /// Get listing details
    public fun listing_details(listing: &Listing): (address, u64, u64, bool) {
        (
            listing.owner,
            listing.price,
            listing.created_at,
            option::is_some(&listing.pet)
        )
    }
    
    /// Check if a pet is available in the listing
    public fun is_pet_available(listing: &Listing): bool {
        option::is_some(&listing.pet)
    }
    
    /// Get the price of a listed pet
    public fun price(listing: &Listing): u64 {
        listing.price
    }
} 