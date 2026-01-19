import { useState, useCallback } from 'react';
import { PHASES, EVENT_TYPES } from '../constants/gameConfig';
import { assignRoles, checkWinCondition, processNightActions, applyDeaths } from '../utils/gameLogic';

export const useGameState = () => {
    const [players, setPlayers] = useState([]);
    const [phase, setPhase] = useState(PHASES.SETUP);
    const [dayNumber, setDayNumber] = useState(0);
    const [nightActions, setNightActions] = useState({});
    const [gameHistory, setGameHistory] = useState([]);
    const [witchPotions, setWitchPotions] = useState({ heal: 1, poison: 1 });
    const [currentRoleIndex, setCurrentRoleIndex] = useState(0);
    const [votes, setVotes] = useState({});
    const [gameResult, setGameResult] = useState(null);
    const [cupidUsed, setCupidUsed] = useState(false);

    const addHistoryEvent = useCallback((type, data) => {
        const event = {
            id: `event-${Date.now()}-${Math.random()}`,
            type,
            timestamp: new Date().toISOString(),
            dayNumber,
            ...data
        };
        setGameHistory(prev => [...prev, event]);
    }, [dayNumber]);

    const startGame = useCallback((playerNames, roleDistribution) => {
        const assignedPlayers = assignRoles(playerNames, roleDistribution);
        setPlayers(assignedPlayers);
        setPhase(PHASES.ROLE_REVEAL);
        setDayNumber(0);
        setGameHistory([]);
        setWitchPotions({ heal: 1, poison: 1 });
        setCupidUsed(false);

        addHistoryEvent(EVENT_TYPES.GAME_START, {
            message: `Trò chơi bắt đầu với ${assignedPlayers.length} người chơi`,
            playerCount: assignedPlayers.length
        });
    }, [addHistoryEvent]);

    const nextPhase = useCallback(() => {
        if (phase === PHASES.ROLE_REVEAL) {
            setPhase(PHASES.NIGHT);
            setDayNumber(1);
            setCurrentRoleIndex(0);
            addHistoryEvent(EVENT_TYPES.PHASE_CHANGE, {
                message: `Đêm ${1} bắt đầu`,
                phase: PHASES.NIGHT
            });
            return;
        }

        if (phase === PHASES.NIGHT) {
            const results = processNightActions(players, nightActions);

            const { players: updatedPlayers, additionalDeaths } = applyDeaths(
                players,
                results.deaths
            );

            setPlayers(updatedPlayers);

            if (results.deaths.length > 0) {
                results.deaths.forEach(death => {
                    const player = players.find(p => p.id === death.playerId);
                    addHistoryEvent(EVENT_TYPES.NIGHT_KILL, {
                        message: `${player.name} đã bị giết trong đêm`,
                        playerId: death.playerId,
                        playerName: player.name,
                        cause: death.cause
                    });
                });
            }

            if (results.protected) {
                const player = players.find(p => p.id === results.protected);
                addHistoryEvent(EVENT_TYPES.PROTECTED, {
                    message: `${player.name} đã được bảo vệ khỏi tấn công`,
                    playerId: results.protected,
                    playerName: player.name
                });
            }

            additionalDeaths.forEach(death => {
                const player = updatedPlayers.find(p => p.id === death.playerId);
                addHistoryEvent(EVENT_TYPES.LOVER_DIED, {
                    message: `${player.name} đã chết theo người yêu`,
                    playerId: death.playerId,
                    playerName: player.name
                });
            });

            // Check win condition
            const winResult = checkWinCondition(updatedPlayers);
            if (winResult) {
                setGameResult(winResult);
                setPhase(PHASES.GAME_OVER);
                addHistoryEvent(EVENT_TYPES.GAME_END, {
                    message: winResult.reason,
                    winner: winResult.winner
                });
                return;
            }

            setPhase(PHASES.DAY);
            setNightActions({});
            addHistoryEvent(EVENT_TYPES.PHASE_CHANGE, {
                message: `Ngày ${dayNumber} bắt đầu`,
                phase: PHASES.DAY
            });
            return;
        }

        if (phase === PHASES.DAY) {
            setPhase(PHASES.VOTE);
            setVotes({});
            return;
        }

        if (phase === PHASES.VOTE) {
            return;
        }
    }, [phase, dayNumber, players, nightActions, addHistoryEvent]);

    const recordNightAction = useCallback((roleId, action) => {
        setNightActions(prev => ({
            ...prev,
            [roleId]: action
        }));
    }, []);

    const recordVote = useCallback((voterId, targetId) => {
        setVotes(prev => ({
            ...prev,
            [voterId]: targetId
        }));
    }, []);

    const processVotes = useCallback(() => {
        if (Object.keys(votes).length === 0) {
            setPhase(PHASES.NIGHT);
            setDayNumber(prev => prev + 1);
            setCurrentRoleIndex(0);
            return;
        }

        const voteCounts = {};
        Object.values(votes).forEach(targetId => {
            if (targetId) {
                voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
            }
        });

        if (Object.keys(voteCounts).length === 0) {
            addHistoryEvent(EVENT_TYPES.DAY_VOTE, {
                message: 'Toàn bộ là phiếu trắng, không ai bị loại',
                tie: true
            });
            setPhase(PHASES.NIGHT);
            setDayNumber(prev => prev + 1);
            setCurrentRoleIndex(0);
            return;
        }

        const maxVotes = Math.max(...Object.values(voteCounts));
        const playersWithMaxVotes = Object.entries(voteCounts)
            .filter(([_, count]) => count === maxVotes)
            .map(([playerId]) => playerId);

        if (playersWithMaxVotes.length > 1) {
            addHistoryEvent(EVENT_TYPES.DAY_VOTE, {
                message: 'Phiếu bầu hòa, không ai bị loại',
                tie: true
            });
            setPhase(PHASES.NIGHT);
            setDayNumber(prev => prev + 1);
            setCurrentRoleIndex(0);
            return;
        }

        const eliminatedId = playersWithMaxVotes[0];
        const eliminatedPlayer = players.find(p => p.id === eliminatedId);

        const updatedPlayers = players.map(p =>
            p.id === eliminatedId
                ? { ...p, isAlive: false, eliminatedBy: 'vote' }
                : p
        );

        const { players: finalPlayers, additionalDeaths } = applyDeaths(
            updatedPlayers,
            [{ playerId: eliminatedId, cause: 'vote' }]
        );

        setPlayers(finalPlayers);

        addHistoryEvent(EVENT_TYPES.PLAYER_ELIMINATED, {
            message: `${eliminatedPlayer.name} (${eliminatedPlayer.role}) đã bị treo cổ`,
            playerId: eliminatedId,
            playerName: eliminatedPlayer.name,
            role: eliminatedPlayer.role,
            votes: voteCounts[eliminatedId]
        });

        additionalDeaths.forEach(death => {
            const player = finalPlayers.find(p => p.id === death.playerId);
            addHistoryEvent(EVENT_TYPES.LOVER_DIED, {
                message: `${player.name} đã chết theo người yêu`,
                playerId: death.playerId,
                playerName: player.name
            });
        });

        const winResult = checkWinCondition(finalPlayers, {
            role: eliminatedPlayer.role,
            eliminatedBy: 'vote'
        });

        if (winResult) {
            setGameResult(winResult);
            setPhase(PHASES.GAME_OVER);
            addHistoryEvent(EVENT_TYPES.GAME_END, {
                message: winResult.reason,
                winner: winResult.winner
            });
            return;
        }

        setPhase(PHASES.NIGHT);
        setDayNumber(prev => prev + 1);
        setCurrentRoleIndex(0);
    }, [votes, players, addHistoryEvent]);

    const resetGame = useCallback(() => {
        setPlayers([]);
        setPhase(PHASES.SETUP);
        setDayNumber(0);
        setNightActions({});
        setGameHistory([]);
        setWitchPotions({ heal: 1, poison: 1 });
        setCurrentRoleIndex(0);
        setVotes({});
        setGameResult(null);
        setCupidUsed(false);
    }, []);

    return {
        players,
        phase,
        dayNumber,
        nightActions,
        gameHistory,
        witchPotions,
        currentRoleIndex,
        votes,
        gameResult,
        cupidUsed,

        startGame,
        nextPhase,
        recordNightAction,
        recordVote,
        processVotes,
        resetGame,
        setCurrentRoleIndex,
        setPlayers,
        setCupidUsed,
        setWitchPotions,
        addHistoryEvent
    };
};
