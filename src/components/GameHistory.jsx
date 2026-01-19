const GameHistory = ({ gameHistory, dayNumber }) => {
    if (gameHistory.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 border border-slate-200 dark:border-slate-700">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <span>📜</span>
                    <span>Lịch sử trận đấu</span>
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-center py-8">Chưa có sự kiện nào</p>
            </div>
        );
    }

    const getEventIcon = (type) => {
        const icons = {
            game_start: '🎮',
            phase_change: '🔄',
            night_kill: '💀',
            protected: '🛡️',
            healed: '💊',
            poisoned: '☠️',
            seer_check: '🔮',
            lovers_paired: '💘',
            day_vote: '🗳️',
            player_eliminated: '⚰️',
            lover_died: '💔',
            game_end: '🏆'
        };
        return icons[type] || '📌';
    };

    const getEventColor = (type) => {
        const colors = {
            night_kill: 'border-danger-500',
            poisoned: 'border-danger-500',
            player_eliminated: 'border-danger-500',
            protected: 'border-success-500',
            healed: 'border-success-500',
            lovers_paired: 'border-pink-500',
            game_end: 'border-primary-500'
        };
        return colors[type] || 'border-slate-400 dark:border-slate-600';
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 border border-slate-200 dark:border-slate-700 sticky top-6">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>📜</span>
                    <span>Lịch sử trận đấu</span>
                </h3>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                    {gameHistory.length} sự kiện
                </div>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {gameHistory.slice().reverse().map((event) => (
                    <div
                        key={event.id}
                        className={`bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border-l-4 ${getEventColor(event.type)} animate-slide-in`}
                    >
                        <div className="flex items-start justify-between mb-1">
                            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                <span>{getEventIcon(event.type)}</span>
                                <span>{formatTime(event.timestamp)}</span>
                                {event.dayNumber > 0 && <span>• Ngày {event.dayNumber}</span>}
                            </div>
                        </div>
                        <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                            {event.message}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GameHistory;
