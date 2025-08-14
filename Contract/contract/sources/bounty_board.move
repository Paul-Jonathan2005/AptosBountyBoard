module bounty_board::task_bounty {

    use std::signer;
    use std::vector;
    use aptos_std::table::{Table, new, add, remove, borrow, borrow_mut, contains};
    use aptos_framework::coin::{Coin, deposit, withdraw, transfer, value};
    use aptos_framework::aptos_coin::AptosCoin;

    /// TaskData: Immutable after creation
    struct TaskData has copy, drop, store {
        company: address,
        freelancer: address,
        reward: u64,
    }

    /// DisputeData: Mutable
    struct DisputeData has copy, drop, store {
        freelancer_votes: u64,
        company_votes: u64,
        is_open: bool,
        voters: vector<address>,
        reward: u64,
        client_amount_transferred: bool,
        freelancer_amount_transferred: bool,
    }

    /// Resource storing task and dispute maps
    struct TaskStore has key {
        tasks: Table<u64, TaskData>,
        disputes: Table<u64, DisputeData>,
    }

    /// Initialize TaskStore resource
    public entry fun init(s: &signer) {
        move_to(s, TaskStore {
            tasks: new<u64, TaskData>(),
            disputes: new<u64, DisputeData>(),
        });
    }

    public entry fun create_task(
        s: &signer,
        task_id: u64,
        company: address,
        freelancer: address,
        reward: u64
    ) acquires TaskStore {
        let store = borrow_global_mut<TaskStore>(signer::address_of(s));
        assert!(signer::address_of(s) == company, 101);
        assert!(signer::address_of(s) == company, 1001); // Only company can create task

        assert!(!contains(&store.tasks, task_id), 1002);

        add(&mut store.tasks, task_id, TaskData {
            company,
            freelancer,
            reward,
        });

        // Simulate escrow: deduct reward from signer directly
        transfer<AptosCoin>(s, signer::address_of(s), reward);
    }

    public entry fun release_reward(s: &signer, task_id: u64) acquires TaskStore {
        let store = borrow_global_mut<TaskStore>(signer::address_of(s));
        let task = remove(&mut store.tasks, task_id);
        assert!(signer::address_of(s) == task.company, 201);

        transfer<AptosCoin>(s, task.freelancer, task.reward);
    }

    public entry fun start_appeal(s: &signer, task_id: u64) acquires TaskStore {
        let store = borrow_global_mut<TaskStore>(signer::address_of(s));
        let task = borrow(&store.tasks, task_id);
        let caller = signer::address_of(s);
        assert!(caller == task.company || caller == task.freelancer, 301);
        assert!(!contains(&store.disputes, task_id), 302);

        add(&mut store.disputes, task_id, DisputeData {
            freelancer_votes: 0,
            company_votes: 0,
            is_open: true,
            voters: vector::empty(),
            reward: task.reward,
            client_amount_transferred: false,
            freelancer_amount_transferred: false,
        });
    }

    public entry fun cast_vote(s: &signer, task_id: u64, vote_for_freelancer: bool) acquires TaskStore {
        let store = borrow_global_mut<TaskStore>(signer::address_of(s));
        let dispute = borrow_mut(&mut store.disputes, task_id);
        let caller = signer::address_of(s);
        assert!(dispute.is_open, 401);

        // Check if already voted
        let  found = false;
        let  i = 0;
        while (i < vector::length(&dispute.voters)) {
            if (vector::borrow(&dispute.voters, i) == &caller) {
                found = true;
                break;
            };
            i = i + 1;
        };
        assert!(!found, 402);

        // Vote
        if (vote_for_freelancer) {
            dispute.freelancer_votes = dispute.freelancer_votes + 1;
        } else {
            dispute.company_votes = dispute.company_votes + 1;
        };

        vector::push_back(&mut dispute.voters, caller);
    }

    public entry fun resolve_dispute(s: &signer, task_id: u64) acquires TaskStore {
        let store = borrow_global_mut<TaskStore>(signer::address_of(s));
        let caller = signer::address_of(s);

        let task = borrow(&store.tasks, task_id);
        let dispute = borrow_mut(&mut store.disputes, task_id);

        assert!(dispute.is_open, 501);

        let total_reward = dispute.reward;
        let voter_reward_pool = if (vector::length(&dispute.voters) > 0) {
            total_reward / 10
        } else {
            0
        };
        let winner_reward = total_reward - voter_reward_pool;

        if (dispute.freelancer_votes > dispute.company_votes) {
            transfer<AptosCoin>(s, task.freelancer, winner_reward);
            dispute.client_amount_transferred = true;
            dispute.freelancer_amount_transferred = true;
        } else if (dispute.freelancer_votes < dispute.company_votes) {
            transfer<AptosCoin>(s, task.company, winner_reward);
            dispute.client_amount_transferred = true;
            dispute.freelancer_amount_transferred = true;
        } else {
            assert!(caller == task.company || caller == task.freelancer, 502);
            let half = winner_reward / 2;
            transfer<AptosCoin>(s, caller, half);

            if (caller == task.company) {
                dispute.client_amount_transferred = true;
            } else {
                dispute.freelancer_amount_transferred = true;
            };
        };

        if (dispute.freelancer_amount_transferred && dispute.client_amount_transferred) {
            remove(&mut store.tasks, task_id);
            dispute.is_open = false;
        };
    }

    public entry fun claim_voting_reward(s: &signer, task_id: u64) acquires TaskStore {
        let store = borrow_global_mut<TaskStore>(signer::address_of(s));
        let dispute = borrow_mut(&mut store.disputes, task_id);
        let caller = signer::address_of(s);

        let  found = false;
        let  new_voters = vector::empty<address>();
        let old_voters = &dispute.voters;
        let  i = 0;
        while (i < vector::length(old_voters)) {
            let v = *vector::borrow(old_voters, i);
            if (v == caller) {
                found = true;
            } else {
                vector::push_back(&mut new_voters, v);
            };
            i = i + 1;
        };
        assert!(found, 601);

        let share = dispute.reward / 10 / vector::length(old_voters);
        dispute.voters = new_voters;

        // no need to withdraw; transfer directly using `share` as u64
        transfer<AptosCoin>(s, caller, share);

        if (vector::length(&dispute.voters) == 0) {
            remove(&mut store.disputes, task_id);
        };
    }
}