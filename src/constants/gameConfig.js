// Game configuration and settings
export const GAME_CONFIG = {
    MIN_PLAYERS: 7,
    MAX_PLAYERS: 30,

    // Default role distribution based on player count
    getRoleDistribution: (playerCount) => {
        if (playerCount < 7) {
            return null; // Not enough players
        }

        const werewolfCount = Math.floor(playerCount / 4);
        const distribution = {
            werewolf: werewolfCount,
            seer: 1,
            guard: 1,
            witch: 0,
            cupid: 0,
            jester: 0,
            villager: 0
        };

        // Add optional roles based on player count
        if (playerCount >= 9) {
            distribution.witch = 1;
        }

        if (playerCount >= 12) {
            distribution.cupid = 1;
        }

        if (playerCount >= 15) {
            distribution.jester = 1;
        }

        // Fill remaining with villagers
        const assignedRoles = Object.values(distribution).reduce((sum, count) => sum + count, 0);
        distribution.villager = playerCount - assignedRoles;

        return distribution;
    }
};

export const PHASES = {
    SETUP: 'setup',
    ROLE_REVEAL: 'role_reveal',
    NIGHT: 'night',
    DAY: 'day',
    VOTE: 'vote',
    GAME_OVER: 'game_over'
};

export const EVENT_TYPES = {
    GAME_START: 'game_start',
    PHASE_CHANGE: 'phase_change',
    NIGHT_KILL: 'night_kill',
    PROTECTED: 'protected',
    HEALED: 'healed',
    POISONED: 'poisoned',
    SEER_CHECK: 'seer_check',
    LOVERS_PAIRED: 'lovers_paired',
    DAY_VOTE: 'day_vote',
    PLAYER_ELIMINATED: 'player_eliminated',
    LOVER_DIED: 'lover_died',
    GAME_END: 'game_end'
};
