import { getRoleById } from '../constants/roles';

const GameOver = ({ players, gameResult, onPlayAgain }) => {
    const getWinnerBadgeClass = () => {
        if (gameResult?.winner === 'village') return 'bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-400 border-success-500';
        if (gameResult?.winner === 'werewolf') return 'bg-danger-100 dark:bg-danger-900/30 text-danger-700 dark:text-danger-400 border-danger-500';
        if (gameResult?.winner === 'solo' || gameResult?.winner === 'lovers') return 'bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-400 border-accent-500';
        return 'bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-400 border-success-500';
    };

    const getWinnerTitle = () => {
        if (gameResult?.winner === 'village') return '🎉 Dân Làng Chiến Thắng!';
        if (gameResult?.winner === 'werewolf') return '🐺 Ma Sói Chiến Thắng!';
        if (gameResult?.winner === 'solo') return '🤡 Kẻ Chán Đời Chiến Thắng!';
        if (gameResult?.winner === 'lovers') return '💘 Đôi Tình Nhân Chiến Thắng!';
        return 'Trò Chơi Kết Thúc';
    };

    const getWinnerPlayers = () => {
        if (!gameResult) return [];

        if (gameResult.winner === 'lovers') {
            return players.filter(p => p.loverId);
        }

        if (gameResult.winner === 'solo' && gameResult.winnerRole) {
            return players.filter(p => p.role === gameResult.winnerRole);
        }

        if (gameResult.winner === 'village') {
            return players.filter(p => {
                const role = getRoleById(p.role);
                return role?.team === 'village';
            });
        }

        if (gameResult.winner === 'werewolf') {
            return players.filter(p => p.role === 'werewolf');
        }

        return [];
    };

    const winnerPlayers = getWinnerPlayers();

    return (
        <div className="animate-scale-in max-w-5xl mx-auto">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-200 dark:border-slate-700">
                <div className="text-center mb-8 pb-6 border-b border-slate-200 dark:border-slate-700">
                    <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                        {getWinnerTitle()}
                    </h1>
                    <div className={`inline-block px-6 py-3 rounded-xl font-semibold border-2 ${getWinnerBadgeClass()}`}>
                        {gameResult?.reason}
                    </div>
                </div>

                {/* Winners */}
                <div className="mb-8">
                    <h3 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-4">
                        🏆 Người chiến thắng
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {winnerPlayers.map(player => {
                            const role = getRoleById(player.role);
                            return (
                                <div
                                    key={player.id}
                                    className="p-4 rounded-xl border-2 text-center"
                                    style={{
                                        borderColor: role?.color,
                                        background: `linear-gradient(135deg, ${role?.color}20, ${role?.color}10)`
                                    }}
                                >
                                    <div className="text-4xl mb-2">{role?.icon}</div>
                                    <div className="font-bold text-slate-900 dark:text-white">{player.name}</div>
                                    <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">{role?.name}</div>
                                    {player.isAlive && (
                                        <div className="mt-2 inline-block px-3 py-1 rounded-lg text-xs font-semibold bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-400 border border-success-500">
                                            Còn sống
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* All players with roles revealed */}
                <div className="mb-8">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">👥 Tất cả vai trò</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {players.map(player => {
                            const role = getRoleById(player.role);
                            const isWinner = winnerPlayers.some(w => w.id === player.id);

                            return (
                                <div
                                    key={player.id}
                                    className={`p-4 rounded-xl border-2 ${!player.isAlive ? 'opacity-60 grayscale' : ''
                                        } ${isWinner ? 'ring-2 ring-offset-2 dark:ring-offset-slate-800' : ''
                                        }`}
                                    style={{
                                        borderColor: isWinner ? role?.color : undefined,
                                        ringColor: isWinner ? role?.color : undefined
                                    }}
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-2xl">{role?.icon}</span>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold text-slate-900 dark:text-white truncate">{player.name}</div>
                                            <div className="text-sm text-slate-600 dark:text-slate-400">{role?.name}</div>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {player.loverId && (
                                            <div className="px-2 py-1 rounded-lg text-xs font-semibold bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400 border border-pink-500">
                                                💘 Tình nhân
                                            </div>
                                        )}
                                        {!player.isAlive && (
                                            <div className="px-2 py-1 rounded-lg text-xs font-semibold bg-danger-100 dark:bg-danger-900/30 text-danger-700 dark:text-danger-400 border border-danger-500">
                                                💀 Đã chết
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Game statistics */}
                <div className="bg-slate-100 dark:bg-slate-900 rounded-xl p-6 mb-6">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">📊 Thống kê</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-1">
                                {players.length}
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">Tổng người chơi</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-success-600 dark:text-success-400 mb-1">
                                {players.filter(p => p.isAlive).length}
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">Còn sống</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-danger-600 dark:text-danger-400 mb-1">
                                {players.filter(p => !p.isAlive).length}
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">Đã chết</div>
                        </div>
                    </div>
                </div>

                <button
                    className="w-full py-4 px-6 bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 text-white font-bold text-lg rounded-xl shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                    onClick={onPlayAgain}
                >
                    🎮 Chơi lại
                </button>
            </div>
        </div>
    );
};

export default GameOver;
