import { useState } from 'react';
import { getRoleById } from '../constants/roles';

const RoleReveal = ({ players, onComplete }) => {
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
    const [isRevealing, setIsRevealing] = useState(false);

    const currentPlayer = players[currentPlayerIndex];
    const role = getRoleById(currentPlayer?.role);

    const handleReveal = () => {
        setIsRevealing(true);
    };

    const handleNext = () => {
        if (currentPlayerIndex < players.length - 1) {
            setCurrentPlayerIndex(currentPlayerIndex + 1);
            setIsRevealing(false);
        } else {
            onComplete();
        }
    };

    if (!currentPlayer) {
        return null;
    }

    return (
        <div className="animate-scale-in max-w-2xl mx-auto">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-200 dark:border-slate-700">
                <div className="text-center mb-8 pb-6 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Công bố vai trò</h2>
                    <div className="text-slate-600 dark:text-slate-400">
                        Người chơi {currentPlayerIndex + 1} / {players.length}
                    </div>
                </div>

                {!isRevealing ? (
                    <div className="text-center space-y-6">
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{currentPlayer.name}</h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
                            Nhấn nút bên dưới để xem vai trò của bạn.<br />
                            Đảm bảo chỉ có bạn nhìn thấy màn hình!
                        </p>
                        <button
                            className="px-8 py-4 bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 text-white font-bold text-lg rounded-xl shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                            onClick={handleReveal}
                        >
                            Xem vai trò của tôi
                        </button>
                    </div>
                ) : (
                    <div className="animate-fade-in text-center space-y-6">
                        <div
                            className="p-8 rounded-2xl border-2 shadow-lg"
                            style={{
                                background: `linear-gradient(135deg, ${role.color}20, ${role.color}10)`,
                                borderColor: role.color
                            }}
                        >
                            <div className="text-7xl mb-4">
                                {role.icon}
                            </div>
                            <h2 className="text-3xl font-bold mb-4" style={{ color: role.color }}>
                                {role.name}
                            </h2>
                            <div
                                className="inline-block px-4 py-2 rounded-lg font-semibold mb-4"
                                style={{
                                    background: `${role.color}30`,
                                    color: role.color,
                                    border: `1px solid ${role.color}`
                                }}
                            >
                                {role.team === 'village' && 'Phe Dân làng'}
                                {role.team === 'werewolf' && 'Phe Ma sói'}
                                {role.team === 'solo' && 'Phe thứ 3'}
                            </div>
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                                {role.description}
                            </p>
                        </div>
                        <button
                            className="w-full py-4 px-6 bg-success-600 hover:bg-success-700 text-white font-bold text-lg rounded-xl shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                            onClick={handleNext}
                        >
                            {currentPlayerIndex < players.length - 1 ? 'Người tiếp theo →' : 'Bắt đầu chơi 🎮'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RoleReveal;
