import { useState } from 'react';
import { NIGHT_ACTION_ORDER, getRoleById } from '../constants/roles';
import { EVENT_TYPES } from '../constants/gameConfig';

const NightPhase = ({
    players,
    dayNumber,
    currentRoleIndex,
    setCurrentRoleIndex,
    recordNightAction,
    nextPhase,
    witchPotions,
    setWitchPotions,
    cupidUsed,
    setCupidUsed,
    addHistoryEvent
}) => {
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [werewolfVotes, setWerewolfVotes] = useState({});
    const [witchAction, setWitchAction] = useState(null);
    const [loverPair, setLoverPair] = useState([]);

    const alivePlayers = players.filter(p => p.isAlive);

    const activeRoles = NIGHT_ACTION_ORDER.filter(role => {
        if (role.id === 'cupid' && cupidUsed) return false;
        return players.some(p => p.isAlive && p.role === role.id);
    });

    const currentRole = activeRoles[currentRoleIndex];
    const currentRolePlayers = players.filter(p => p.isAlive && p.role === currentRole?.id);

    const handlePlayerSelect = (playerId) => {
        if (currentRole?.id === 'cupid') {
            if (loverPair.includes(playerId)) {
                setLoverPair(loverPair.filter(id => id !== playerId));
            } else if (loverPair.length < 2) {
                setLoverPair([...loverPair, playerId]);
            }
            return;
        }
        setSelectedPlayer(playerId);
    };

    const handleWerewolfVote = (voterId, targetId) => {
        setWerewolfVotes(prev => ({
            ...prev,
            [voterId]: targetId
        }));
    };

    const moveToNextRole = () => {
        if (currentRoleIndex < activeRoles.length - 1) {
            setCurrentRoleIndex(currentRoleIndex + 1);
            return;
        }
        nextPhase();
    };

    const handleConfirmAction = () => {
        if (!currentRole) return;
        const roleId = currentRole.id;

        if (roleId === 'cupid' && loverPair.length === 2) {
            recordNightAction('cupid', { lovers: loverPair });
            const lover1 = players.find(p => p.id === loverPair[0]);
            const lover2 = players.find(p => p.id === loverPair[1]);
            addHistoryEvent(EVENT_TYPES.LOVERS_PAIRED, {
                message: `Cupid đã ghép đôi ${lover1.name} và ${lover2.name}`,
                lovers: [lover1.name, lover2.name]
            });
            setCupidUsed(true);
            setLoverPair([]);
            moveToNextRole();
            return;
        }

        if (roleId === 'werewolf') {
            const totalWerewolves = currentRolePlayers.length;
            const voteCounts = {};

            Object.values(werewolfVotes).forEach(targetId => {
                voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
            });

            // No votes - skip
            if (Object.keys(voteCounts).length === 0) {
                setWerewolfVotes({});
                moveToNextRole();
                return;
            }

            // Build detailed vote message
            const voteDetails = Object.entries(werewolfVotes).map(([werewolfId, targetId]) => {
                const werewolf = players.find(p => p.id === werewolfId);
                const target = players.find(p => p.id === targetId);
                return `${werewolf.name} vote ${target.name}`;
            }).join(', ');

            const maxVotes = Math.max(...Object.values(voteCounts));
            const requiredVotes = Math.ceil(totalWerewolves / 2);

            // Not enough consensus - re-vote
            if (maxVotes < requiredVotes) {
                addHistoryEvent(EVENT_TYPES.NIGHT_KILL, {
                    message: `Đêm ${dayNumber}: Ma sói chưa đủ đồng thuận (${maxVotes}/${requiredVotes} vote) - Bắt vote lại!\n${voteDetails}`,
                    night: dayNumber
                });
                setWerewolfVotes({});
                return;
            }

            const targets = Object.entries(voteCounts)
                .filter(([_, count]) => count === maxVotes)
                .map(([playerId]) => playerId);

            // Tie - re-vote
            if (targets.length > 1) {
                addHistoryEvent(EVENT_TYPES.NIGHT_KILL, {
                    message: `Đêm ${dayNumber}: Ma sói hòa vote (${maxVotes} vote cho nhiều mục tiêu) - Bắt vote lại!\n${voteDetails}`,
                    night: dayNumber
                });
                setWerewolfVotes({});
                return;
            }

            // Success - kill target
            const targetId = targets[0];
            recordNightAction('werewolf', { targetId });
            const target = players.find(p => p.id === targetId);
            addHistoryEvent(EVENT_TYPES.NIGHT_KILL, {
                message: `Đêm ${dayNumber}: Ma sói đồng thuận tấn công ${target.name} (${maxVotes}/${totalWerewolves} vote)\n${voteDetails}`,
                targetName: target.name,
                voteCount: maxVotes,
                totalWerewolves: totalWerewolves,
                night: dayNumber
            });
            setWerewolfVotes({});
            moveToNextRole();
            return;
        }

        if (roleId === 'seer' && selectedPlayer) {
            recordNightAction('seer', { targetId: selectedPlayer });
            const target = players.find(p => p.id === selectedPlayer);
            const targetRole = getRoleById(target.role);
            addHistoryEvent(EVENT_TYPES.SEER_CHECK, {
                message: `Tiên tri đã soi ${target.name} - ${targetRole.name}`,
                targetName: target.name,
                role: targetRole.name
            });
            setSelectedPlayer(null);
            moveToNextRole();
            return;
        }

        if (roleId === 'guard' && selectedPlayer) {
            recordNightAction('guard', { targetId: selectedPlayer });
            const target = players.find(p => p.id === selectedPlayer);
            addHistoryEvent(EVENT_TYPES.PROTECTED, {
                message: `Đêm ${dayNumber}: Bảo vệ đã bảo vệ ${target.name}`,
                targetName: target.name,
                night: dayNumber
            });
            setSelectedPlayer(null);
            moveToNextRole();
            return;
        }

        if (roleId === 'witch' && witchAction) {
            if (witchAction.type === 'heal') {
                recordNightAction('witch', { heal: true });
                addHistoryEvent(EVENT_TYPES.HEALED, {
                    message: `Phù thủy đã sử dụng thuốc cứu người`
                });
                setWitchPotions({ ...witchPotions, heal: 0 });
            } else if (witchAction.type === 'poison' && selectedPlayer) {
                recordNightAction('witch', { poison: { targetId: selectedPlayer } });
                const target = players.find(p => p.id === selectedPlayer);
                addHistoryEvent(EVENT_TYPES.POISONED, {
                    message: `Phù thủy đã đầu độc ${target.name}`,
                    targetName: target.name
                });
                setWitchPotions({ ...witchPotions, poison: 0 });
            }
            setWitchAction(null);
            setSelectedPlayer(null);
            moveToNextRole();
        }
    };

    const handleSkip = () => {
        if (currentRole?.id === 'werewolf') setWerewolfVotes({});
        setSelectedPlayer(null);
        setWitchAction(null);
        moveToNextRole();
    };

    if (!currentRole) return null;

    const canConfirm = () => {
        if (currentRole.id === 'cupid') return loverPair.length === 2;
        if (currentRole.id === 'werewolf') return Object.keys(werewolfVotes).length > 0;
        if (currentRole.id === 'witch') {
            if (!witchAction) return false;
            if (witchAction.type === 'poison') return !!selectedPlayer;
            return true;
        }
        return !!selectedPlayer;
    };

    return (
        <div className="animate-fade-in">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-slate-700 flex-wrap gap-3">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span>🌙</span>
                            <span>Đêm {dayNumber}</span>
                        </h2>
                        <div className="text-slate-600 dark:text-slate-400">
                            {currentRole.icon} {currentRole.name} - {currentRole.actionName}
                        </div>
                    </div>
                    <div className="px-4 py-2 bg-danger-100 dark:bg-danger-900/30 text-danger-700 dark:text-danger-400 border border-danger-500 rounded-lg font-semibold">
                        Vai trò {currentRoleIndex + 1}/{activeRoles.length}
                    </div>
                </div>

                {/* Role Instruction */}
                <div
                    className="p-4 rounded-xl border-2 mb-6"
                    style={{
                        background: `linear-gradient(135deg, ${currentRole.color}15, ${currentRole.color}08)`,
                        borderColor: currentRole.color
                    }}
                >
                    <p className="text-slate-800 dark:text-slate-200">
                        <strong>{currentRole.name}:</strong> {currentRole.description}
                    </p>
                </div>

                {/* Werewolf Voting */}
                {currentRole.id === 'werewolf' && (
                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Ma sói bình chọn nạn nhân</h3>
                        {currentRolePlayers.map(werewolf => (
                            <div key={werewolf.id} className="mb-4">
                                <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                                    {werewolf.name} bình chọn:
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                    {alivePlayers
                                        .filter(p => p.role !== 'werewolf')
                                        .map(player => (
                                            <div
                                                key={player.id}
                                                className={`p-3 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5 ${werewolfVotes[werewolf.id] === player.id
                                                    ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-500 shadow-lg'
                                                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                                                    }`}
                                                onClick={() => handleWerewolfVote(werewolf.id, player.id)}
                                            >
                                                <div className="font-semibold text-slate-900 dark:text-white text-center">
                                                    {player.name}
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Witch Actions */}
                {currentRole.id === 'witch' && (
                    <div className="mb-6">
                        <div className="flex gap-3 mb-4">
                            <button
                                className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${witchAction?.type === 'heal'
                                    ? 'bg-success-600 text-white shadow-lg'
                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-success-500 hover:text-white'
                                    }`}
                                disabled={witchPotions.heal === 0 || witchAction?.type === 'poison'}
                                onClick={() => setWitchAction({ type: 'heal' })}
                            >
                                💊 Cứu người ({witchPotions.heal})
                            </button>
                            <button
                                className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${witchAction?.type === 'poison'
                                    ? 'bg-danger-600 text-white shadow-lg'
                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-danger-500 hover:text-white'
                                    }`}
                                disabled={witchPotions.poison === 0 || witchAction?.type === 'heal'}
                                onClick={() => setWitchAction({ type: 'poison' })}
                            >
                                ☠️ Đầu độc ({witchPotions.poison})
                            </button>
                        </div>
                        {witchAction?.type === 'poison' && (
                            <p className="text-slate-600 dark:text-slate-400 mb-4">Chọn người bị đầu độc:</p>
                        )}
                    </div>
                )}

                {/* Cupid Selection */}
                {currentRole.id === 'cupid' && (
                    <div className="mb-6">
                        <p className="text-slate-600 dark:text-slate-400">
                            Chọn 2 người làm đôi tình nhân ({loverPair.length}/2)
                        </p>
                    </div>
                )}

                {/* Player Selection Grid */}
                {currentRole.id !== 'werewolf' && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
                        {alivePlayers.map(player => {
                            let isDisabled = false;
                            if (currentRole.id === 'guard') {
                                const lastProtected = player.protectionHistory?.[player.protectionHistory.length - 1];
                                isDisabled = lastProtected === player.id;
                            }
                            const isSelected = currentRole.id === 'cupid'
                                ? loverPair.includes(player.id)
                                : selectedPlayer === player.id;

                            return (
                                <div
                                    key={player.id}
                                    className={`p-4 rounded-xl border-2 transition-all ${isDisabled
                                        ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-600'
                                        : isSelected
                                            ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-500 shadow-lg cursor-pointer'
                                            : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 cursor-pointer hover:shadow-lg hover:-translate-y-0.5'
                                        }`}
                                    onClick={() => !isDisabled && handlePlayerSelect(player.id)}
                                >
                                    <div className="font-semibold text-slate-900 dark:text-white text-center">
                                        {player.name}
                                    </div>
                                    {currentRole.id === 'seer' && isSelected && (
                                        <div className="mt-2 text-center text-sm">
                                            <span className="inline-block px-2 py-1 rounded bg-slate-200 dark:bg-slate-700">
                                                {getRoleById(player.role)?.icon} {getRoleById(player.role)?.name}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="flex gap-3">
                    <button
                        className="flex-1 px-6 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-semibold rounded-xl transition-all"
                        onClick={handleSkip}
                    >
                        Bỏ qua
                    </button>
                    <button
                        className="flex-[2] px-6 py-3 bg-success-600 hover:bg-success-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                        onClick={handleConfirmAction}
                        disabled={!canConfirm()}
                    >
                        Xác nhận
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NightPhase;
