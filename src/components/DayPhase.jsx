import { getRoleById } from '../constants/roles';

const DayPhase = ({ players, dayNumber, onStartVote, gameHistory }) => {
    const alivePlayers = players.filter(p => p.isAlive);
    const deadLastNight = players.filter(p =>
        !p.isAlive &&
        gameHistory.some(e =>
            (e.type === 'night_kill' || e.type === 'lover_died') &&
            e.playerId === p.id &&
            e.dayNumber === dayNumber
        )
    );

    return (
        <div className="animate-fade-in">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-slate-700 flex-wrap gap-3">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span>☀️</span>
                            <span>Ngày {dayNumber}</span>
                        </h2>
                        <div className="text-slate-600 dark:text-slate-400">Thảo luận và bỏ phiếu</div>
                    </div>
                    <div className="px-4 py-2 bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-400 border border-success-500 rounded-lg font-semibold">
                        {alivePlayers.length} người còn sống
                    </div>
                </div>

                {/* Night deaths announcement */}
                {deadLastNight.length > 0 ? (
                    <div className="bg-gradient-to-br from-danger-50 to-danger-100 dark:from-danger-900/20 dark:to-danger-800/20 border-2 border-danger-500 rounded-xl p-6 mb-6 animate-scale-in">
                        <h3 className="text-2xl font-bold text-danger-700 dark:text-danger-400 mb-4">
                            💀 Tin buồn trong đêm
                        </h3>
                        <div className="space-y-2">
                            {deadLastNight.map(player => (
                                <div
                                    key={player.id}
                                    className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-danger-200 dark:border-danger-800"
                                >
                                    <strong className="text-slate-900 dark:text-white">{player.name}</strong>
                                    <span className="text-slate-700 dark:text-slate-300"> đã chết trong đêm</span>
                                    {player.deathCause === 'lover_death' && (
                                        <span className="text-pink-600 dark:text-pink-400"> (chết theo người yêu)</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="bg-gradient-to-br from-success-50 to-success-100 dark:from-success-900/20 dark:to-success-800/20 border-2 border-success-500 rounded-xl p-6 mb-6 animate-scale-in">
                        <h3 className="text-2xl font-bold text-success-700 dark:text-success-400 mb-2">
                            ✨ Đêm yên bình
                        </h3>
                        <p className="text-success-700 dark:text-success-300">
                            Không ai chết trong đêm qua. Dân làng an toàn!
                        </p>
                    </div>
                )}

                {/* Alive players */}
                <div className="mb-6">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Người chơi còn sống</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {alivePlayers.map(player => (
                            <div
                                key={player.id}
                                className="p-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl"
                            >
                                <div className="font-semibold text-slate-900 dark:text-white">{player.name}</div>
                                {player.loverId && (
                                    <div className="text-xs text-pink-600 dark:text-pink-400 mt-1">
                                        💘 Tình nhân
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Dead players */}
                {players.filter(p => !p.isAlive).length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Người chơi đã chết</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                            {players.filter(p => !p.isAlive).map(player => (
                                <div
                                    key={player.id}
                                    className="p-4 bg-slate-100 dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-xl opacity-50 grayscale"
                                >
                                    <div className="font-semibold text-slate-700 dark:text-slate-400">{player.name}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="text-center mt-8">
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                        Dân làng thảo luận và quyết định ai sẽ bị treo cổ
                    </p>
                    <button
                        className="px-8 py-4 bg-danger-600 hover:bg-danger-700 text-white font-bold text-lg rounded-xl shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                        onClick={onStartVote}
                    >
                        Bắt đầu bỏ phiếu
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DayPhase;
