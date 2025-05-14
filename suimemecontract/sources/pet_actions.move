module memepet::pet_actions {
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::event;
    use sui::clock::{Self, Clock};
    use std::string::{Self, String};
    use memepet::memepet::{Self, Pet};
    
    /// Error codes
    const EInsufficientLevel: u64 = 0;
    const EMissionInProgress: u64 = 1;
    const EMissionNotComplete: u64 = 2;
    const ENotMissionOwner: u64 = 3;
    
    /// Mission types
    const MISSION_EXPLORE: u8 = 0;
    const MISSION_GUARD: u8 = 1;
    const MISSION_TREASURE: u8 = 2;
    
    /// Mission difficulty levels
    const DIFFICULTY_EASY: u8 = 0;
    const DIFFICULTY_MEDIUM: u8 = 1;
    const DIFFICULTY_HARD: u8 = 2;
    
    /// Events
    public struct MissionStarted has copy, drop {
        id: ID,
        pet_id: ID,
        mission_type: u8,
        difficulty: u8,
        start_time: u64,
        duration: u64
    }
    
    public struct MissionCompleted has copy, drop {
        id: ID,
        pet_id: ID,
        reward_experience: u64,
        success: bool
    }
    
    /// Active mission data
    public struct Mission has key, store {
        id: UID,
        pet_id: ID,
        owner: address,
        mission_type: u8,
        difficulty: u8,
        start_time: u64,
        duration: u64,
        completed: bool
    }
    
    /// Start a new mission for a pet
    public entry fun start_mission(
        pet: &mut Pet, 
        mission_type: u8,
        difficulty: u8,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        // Verify mission type and difficulty are valid
        assert!(mission_type <= MISSION_TREASURE, 0);
        assert!(difficulty <= DIFFICULTY_HARD, 0);
        
        // Check pet level requirements
        let pet_level = memepet::level(pet);
        let required_level = if (difficulty == DIFFICULTY_EASY) {
            1
        } else if (difficulty == DIFFICULTY_MEDIUM) {
            5
        } else {
            10
        };
        
        assert!(pet_level >= required_level, EInsufficientLevel);
        
        // Calculate mission duration based on difficulty (in seconds)
        let duration = if (difficulty == DIFFICULTY_EASY) {
            60 * 5 // 5 minutes
        } else if (difficulty == DIFFICULTY_MEDIUM) {
            60 * 15 // 15 minutes
        } else {
            60 * 30 // 30 minutes
        };
        
        let start_time = clock::timestamp_ms(clock) / 1000; // Convert to seconds
        
        // Create mission object
        let mission_id = object::new(ctx);
        let mission = Mission {
            id: mission_id,
            pet_id: object::uid_to_inner(memepet::pet_id(pet)),
            owner: tx_context::sender(ctx),
            mission_type,
            difficulty,
            start_time,
            duration,
            completed: false
        };
        
        // Emit mission started event
        event::emit(MissionStarted {
            id: object::uid_to_inner(&mission.id),
            pet_id: mission.pet_id,
            mission_type,
            difficulty,
            start_time,
            duration
        });
        
        // Transfer mission to sender
        transfer::transfer(mission, tx_context::sender(ctx));
    }
    
    /// Complete a mission and collect rewards
    public entry fun complete_mission(
        mission: &mut Mission,
        pet: &mut Pet,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        // Verify the mission owner
        assert!(mission.owner == tx_context::sender(ctx), ENotMissionOwner);
        
        // Verify pet ID matches mission
        assert!(mission.pet_id == object::uid_to_inner(memepet::pet_id(pet)), 0);
        
        // Check if mission is already completed
        assert!(!mission.completed, EMissionInProgress);
        
        // Check if mission duration has passed
        let current_time = clock::timestamp_ms(clock) / 1000; // Convert to seconds
        let end_time = mission.start_time + mission.duration;
        
        assert!(current_time >= end_time, EMissionNotComplete);
        
        // Mark mission as completed
        mission.completed = true;
        
        // Calculate rewards based on difficulty
        let base_xp = if (mission.difficulty == DIFFICULTY_EASY) {
            25
        } else if (mission.difficulty == DIFFICULTY_MEDIUM) {
            75
        } else {
            150
        };
        
        // Add experience to the pet
        memepet::add_experience(pet, base_xp);
        
        // Emit mission completed event
        event::emit(MissionCompleted {
            id: object::uid_to_inner(&mission.id),
            pet_id: mission.pet_id,
            reward_experience: base_xp,
            success: true
        });
    }
    
    /// Check if a mission is complete but still need to claim rewards
    public fun is_mission_complete(mission: &Mission, clock: &Clock): bool {
        let current_time = clock::timestamp_ms(clock) / 1000;
        let mission_end_time = mission.start_time + mission.duration;
        let is_completed = mission.completed;
        
        if (is_completed) {
            false // Already claimed
        } else {
            current_time >= mission_end_time
        }
    }
    
    /// Get mission details
    public fun mission_details(mission: &Mission): (ID, u8, u8, u64, u64, bool) {
        (
            mission.pet_id,
            mission.mission_type,
            mission.difficulty,
            mission.start_time,
            mission.duration,
            mission.completed
        )
    }
    
    /// Calculate time remaining for a mission in seconds (returns 0 if complete)
    public fun time_remaining(mission: &Mission, clock: &Clock): u64 {
        let current_time = clock::timestamp_ms(clock) / 1000;
        let end_time = mission.start_time + mission.duration;
        let is_completed = mission.completed;
        let result: u64;
        
        if (is_completed) {
            result = 0
        } else {
            if (current_time >= end_time) {
                result = 0
            } else {
                result = end_time - current_time
            }
        };
        
        result
    }
} 