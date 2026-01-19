import { useState } from 'react';

const VotingPhase = ({ players, recordVote, processVotes, votes }) => {
    const alivePlayers = players.filter(p => p.isAlive);
    const [currentVoterIndex, setCurrentVoterIndex] = useState(0);
    const [selectedTarget, setSelectedTarget] = useState(null);

    const currentVoter = alivePlayers[currentVoterIndex];

    const handleVote = () => {
        if (!selectedTarget || !currentVoter) return;

        recordVote(currentVoter.id, selectedTarget);

        if (currentVoterIndex < alivePlayers.length - 1) {
            setCurrentVoterIndex(currentVoterIndex + 1);
            setSelectedTarget(null);
        }
    };

    const handleSkipVote = () => {
        if (!currentVoter) return;

        recordVote(currentVoter.id, null);

        if (currentVoterIndex < alivePlayers.length - 1) {
            setCurrentVoterIndex(currentVoterIndex + 1);
            setSelectedTarget(null);
        }
    };

    const allVoted = Object.keys(votes).length === alivePlayers.length;

    return (
        <div className="animate-fade-in">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-slate-700 flex-wrap gap-3">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span>🗳️</span>
                            <span>Bỏ phiếu treo cổ</span>            </h2>
                        {!allVoted && currentVoter && (
                            <div className="text-slate-600 dark:text-slate-400">
                                Lượt của: <strong className="text-slate-900 dark:text-white">{currentVoter.name}</strong>
                            </div>
                        )}
                    </div>
                    <div className="px-4 py-2 bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-400 border border-success-500 rounded-lg font-semibold">
                        {Object.keys(votes).length} / {alivePlayers.length} phiếu
                    </div>
                </div>

                {!allVoted ? (
                    <>
                        <p className="text-slate-600 dark:text-slate-400 mb-6">
                            Chọn người bạn muốn treo cổ
                        </p>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
                            {alivePlayers
                                .filter(p => p.id !== currentVoter?.id)
                                .map(player => (
                                    <div
                                        key={player.id}
                                        className={`p-4 rounded-xl border-2 transition-all cursor-pointer hover:shadow-lg hover:-translate-y-0.5 ${selectedTarget === player.id
                                            ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-500 shadow-lg'
                                            : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                                            }`}
                                        onClick={() => setSelectedTarget(player.id)}
                                    >
                                        <div className="font-semibold text-slate-900 dark:text-white">{player.name}</div>
                                    </div>
                                ))}
                        </div>

                        <div className="flex gap-3">
                            <button
                                className="flex-1 px-6 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-semibold rounded-xl transition-all"
                                onClick={handleSkipVote}
                            >
                                Bỏ phiếu trắng
                            </button>
                            <button
                                className="flex-[2] px-6 py-3 bg-danger-600 hover:bg-danger-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                                onClick={handleVote}
                                disabled={!selectedTarget}
                            >
                                Xác nhận phiếu bầu
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 border-2 border-primary-500 rounded-xl p-6 mb-6 text-center animate-scale-in">
                            <h3 className="text-2xl font-bold text-primary-700 dark:text-primary-400 mb-2">
                                ✅ Tất cả đã bỏ phiếu
                            </h3>
                            <p className="text-primary-600 dark:text-primary-300">
                                Nhấn nút bên dưới để công bố kết quả
                            </p>
                        </div>

                        {/* Vote summary */}
                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Tổng kết phiếu bầu</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {(() => {
                                    const voteCounts = {};
                                    Object.values(votes).forEach(targetId => {
                                        if (targetId) {
                                            voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
                                        }
                                    });

                                    const maxVotes = Math.max(...Object.values(voteCounts));

                                    return Object.entries(voteCounts)
                                        .sort(([, a], [, b]) => b - a)
                                        .map(([playerId, count]) => {
                                            const player = players.find(p => p.id === playerId);
                                            const isTopVoted = count === maxVotes;

                                            return (
                                                <div
                                                    key={playerId}
                                                    className={`p-4 rounded-xl border-2 ${isTopVoted
                                                        ? 'bg-danger-50 dark:bg-danger-900/20 border-danger-500'
                                                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                                                        }`}
                                                >
                                                    <div className="font-semibold text-slate-900 dark:text-white mb-2">
                                                        {player?.name}
                                                    </div>
                                                    <div className={`inline-block px-3 py-1 rounded-lg text-sm font-bold ${isTopVoted
                                                        ? 'bg-danger-100 dark:bg-danger-900/40 text-danger-700 dark:text-danger-400 border border-danger-500'
                                                        : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                                        }`}>
                                                        {count} phiếu
                                                    </div>
                                                </div>
                                            );
                                        });
                                })()}
                            </div>
                        </div>

                        <button
                            className="w-full py-4 px-6 bg-danger-600 hover:bg-danger-700 text-white font-bold text-lg rounded-xl shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                            onClick={processVotes}
                        >
                            Công bố kết quả
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default VotingPhase;
