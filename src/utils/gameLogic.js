import { ROLES } from '../constants/roles';

// Shuffle array using Fisher-Yates algorithm
const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

// Assign roles to players based on distribution
export const assignRoles = (playerNames, roleDistribution) => {
    if (!playerNames || playerNames.length === 0) {
        return [];
    }

    const roles = [];

    // Create role array based on distribution
    Object.entries(roleDistribution).forEach(([roleId, count]) => {
        for (let i = 0; i < count; i++) {
            roles.push(roleId);
        }
    });

    // Shuffle roles
    const shuffledRoles = shuffleArray(roles);

    // Assign to players
    return playerNames.map((name, index) => ({
        id: `player-${index}`,
        name: name.trim(),
        role: shuffledRoles[index],
        isAlive: true,
        loverId: null, // For Cupid's lovers
        protectionHistory: [] // Track who guard protected (can't protect same person twice in a row)
    }));
};

// Check win condition - returns { winner: 'village' | 'werewolf' | 'solo' | null, reason: string }
export const checkWinCondition = (players, lastEliminated = null) => {
    // Check Jester win (voted out during day)
    if (lastEliminated?.role === 'jester' && lastEliminated.eliminatedBy === 'vote') {
        return {
            winner: 'solo',
            winnerRole: 'jester',
            reason: 'Kẻ chán đời đã bị treo cổ và chiến thắng!'
        };
    }

    const alivePlayers = players.filter(p => p.isAlive);
    const aliveWerewolves = alivePlayers.filter(p => p.role === 'werewolf');
    const aliveVillageTeam = alivePlayers.filter(p => {
        const role = ROLES[p.role.toUpperCase()];
        return role && role.team === 'village';
    });

    // Check lover win condition
    if (alivePlayers.length === 2) {
        const [p1, p2] = alivePlayers;
        if (p1.loverId === p2.id && p2.loverId === p1.id) {
            return {
                winner: 'lovers',
                reason: 'Đôi tình nhân đã chiến thắng!'
            };
        }
    }

    // Werewolves eliminated
    if (aliveWerewolves.length === 0) {
        return {
            winner: 'village',
            reason: 'Tất cả Ma sói đã bị tiêu diệt. Dân làng chiến thắng!'
        };
    }

    // Werewolves equal or outnumber village team
    if (aliveWerewolves.length >= aliveVillageTeam.length) {
        return {
            winner: 'werewolf',
            reason: 'Ma sói đã chiếm đa số. Ma sói chiến thắng!'
        };
    }

    return null;
};

// Process night actions and determine results
export const processNightActions = (players, nightActions) => {
    const results = {
        deaths: [],
        protected: null,
        healed: null,
        poisoned: null,
        seerChecked: null
    };

    // Guard protection
    if (nightActions.guard) {
        results.protected = nightActions.guard.targetId;
    }

    // Werewolf attack
    const werewolfTarget = nightActions.werewolf?.targetId;

    if (werewolfTarget) {
        // Check if protected
        if (werewolfTarget !== results.protected) {
            results.deaths.push({
                playerId: werewolfTarget,
                cause: 'werewolf'
            });
        }
    }

    // Witch heal
    if (nightActions.witch?.heal) {
        const healTarget = results.deaths.find(d => d.cause === 'werewolf');
        if (healTarget) {
            results.healed = healTarget.playerId;
            results.deaths = results.deaths.filter(d => d.playerId !== healTarget.playerId);
        }
    }

    // Witch poison
    if (nightActions.witch?.poison) {
        results.poisoned = nightActions.witch.poison.targetId;
        results.deaths.push({
            playerId: nightActions.witch.poison.targetId,
            cause: 'poison'
        });
    }

    // Seer check
    if (nightActions.seer) {
        results.seerChecked = nightActions.seer.targetId;
    }

    return results;
};

// Process day vote
export const processDayVote = (votes) => {
    if (!votes || Object.keys(votes).length === 0) {
        return null;
    }

    // Count votes
    const voteCounts = {};
    Object.values(votes).forEach(targetId => {
        voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
    });

    // Find max votes
    const maxVotes = Math.max(...Object.values(voteCounts));
    const playersWithMaxVotes = Object.entries(voteCounts)
        .filter(([_, count]) => count === maxVotes)
        .map(([playerId]) => playerId);

    // If tie, no elimination (or can implement tie-breaker)
    if (playersWithMaxVotes.length > 1) {
        return {
            eliminated: null,
            reason: 'tie',
            tiedPlayers: playersWithMaxVotes
        };
    }

    return {
        eliminated: playersWithMaxVotes[0],
        votes: voteCounts
    };
};

// Apply deaths and handle lover death chain
export const applyDeaths = (players, deaths) => {
    const updatedPlayers = [...players];
    const additionalDeaths = [];

    deaths.forEach(death => {
        const playerIndex = updatedPlayers.findIndex(p => p.id === death.playerId);

        if (playerIndex === -1) {
            return;
        }

        updatedPlayers[playerIndex] = {
            ...updatedPlayers[playerIndex],
            isAlive: false,
            deathCause: death.cause
        };

        // Check for lover death
        const deadPlayer = updatedPlayers[playerIndex];
        if (deadPlayer.loverId) {
            const loverIndex = updatedPlayers.findIndex(p => p.id === deadPlayer.loverId);
            if (loverIndex !== -1 && updatedPlayers[loverIndex].isAlive) {
                updatedPlayers[loverIndex] = {
                    ...updatedPlayers[loverIndex],
                    isAlive: false,
                    deathCause: 'lover_death'
                };
                additionalDeaths.push({
                    playerId: updatedPlayers[loverIndex].id,
                    cause: 'lover_death'
                });
            }
        }
    });

    return {
        players: updatedPlayers,
        additionalDeaths
    };
};
