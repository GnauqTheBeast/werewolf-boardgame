import { useState } from 'react';
import { GAME_CONFIG } from '../constants/gameConfig';
import { ROLES } from '../constants/roles';

const SetupScreen = ({ onStartGame }) => {
    const [playerInput, setPlayerInput] = useState('');
    const [error, setError] = useState('');
    const [roleDistribution, setRoleDistribution] = useState({
        werewolf: 2,
        seer: 1,
        guard: 1,
        witch: 1,
        cupid: 1,
        jester: 1,
        villager: 3
    });

    const handlePlayerInputChange = (e) => {
        setPlayerInput(e.target.value);
        setError('');

        const lines = e.target.value.split('\n').filter(line => line.trim());
        if (lines.length > 0) {
            const suggestedDistribution = GAME_CONFIG.getRoleDistribution(lines.length);
            if (suggestedDistribution) {
                setRoleDistribution(suggestedDistribution);
            }
        }
    };

    const handleStartGame = () => {
        const playerNames = playerInput
            .split('\n')
            .map(name => name.trim())
            .filter(name => name.length > 0);

        if (playerNames.length < GAME_CONFIG.MIN_PLAYERS) {
            setError(`Cần ít nhất ${GAME_CONFIG.MIN_PLAYERS} người chơi để bắt đầu`);
            return;
        }

        if (playerNames.length > GAME_CONFIG.MAX_PLAYERS) {
            setError(`Tối đa ${GAME_CONFIG.MAX_PLAYERS} người chơi`);
            return;
        }

        const uniqueNames = new Set(playerNames);
        if (uniqueNames.size !== playerNames.length) {
            setError('Có tên người chơi bị trùng lặp');
            return;
        }

        const totalRoles = Object.values(roleDistribution).reduce((sum, count) => sum + count, 0);
        if (totalRoles !== playerNames.length) {
            setError(`Tổng vai trò (${totalRoles}) phải bằng số người chơi (${playerNames.length})`);
            return;
        }

        // Check werewolf vs villager rule
        const werewolfCount = roleDistribution.werewolf || 0;
        const villagerCount = roleDistribution.villager || 0;
        if (werewolfCount >= villagerCount) {
            setError(`Số Ma Sói (${werewolfCount}) phải nhỏ hơn số Dân Làng (${villagerCount})`);
            return;
        }

        onStartGame(playerNames, roleDistribution);
    };

    const handleRoleChange = (roleId, increment) => {
        const newDistribution = { ...roleDistribution };

        newDistribution[roleId] = Math.max(0, newDistribution[roleId] + increment);

        // Validate werewolf < villager rule
        const werewolfCount = newDistribution.werewolf || 0;
        const villagerCount = newDistribution.villager || 0;

        if (roleId === 'werewolf' && werewolfCount >= villagerCount) {
            setError(`Số Ma Sói không được lớn hơn hoặc bằng Dân Làng`);
            return;
        }

        if (roleId === 'villager' && increment < 0 && werewolfCount >= villagerCount) {
            setError(`Số Dân Làng phải lớn hơn số Ma Sói`);
            return;
        }

        setError('');
        setRoleDistribution(newDistribution);
    };

    const playerCount = playerInput.split('\n').filter(line => line.trim()).length;
    const totalRoles = Object.values(roleDistribution).reduce((sum, count) => sum + count, 0);
    const canStart = playerCount >= GAME_CONFIG.MIN_PLAYERS && playerCount === totalRoles;

    return (
        <div className="animate-scale-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Player Input */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span>👥</span>
                            <span>Danh sách người chơi</span>
                        </h2>
                        <div className="px-4 py-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-lg font-semibold text-sm shadow-md">
                            {playerCount > 0 ? `${playerCount} người` : '0 người'}
                        </div>
                    </div>

                    <div className="flex flex-col">
                        <textarea
                            className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all font-mono text-sm resize-none h-[450px]"
                            value={playerInput}
                            onChange={handlePlayerInputChange}
                            placeholder="Nhập tên người chơi...&#10;&#10;Ví dụ:&#10;Nguyễn Văn A&#10;Trần Thị B&#10;Lê Văn C&#10;..."
                        />
                        <div className="mt-3 text-sm">
                            {playerCount > 0
                                ? totalRoles === playerCount
                                    ? <span className="text-success-600 dark:text-success-400 font-medium">✓ Tổng vai trò khớp với số người chơi</span>
                                    : <span className="text-accent-600 dark:text-accent-400 font-medium">⚠️ Tổng vai trò ({totalRoles}) {totalRoles > playerCount ? '>' : '<'} số người chơi ({playerCount})</span>
                                : <span className="text-slate-600 dark:text-slate-400">Tối thiểu {GAME_CONFIG.MIN_PLAYERS} người, tối đa {GAME_CONFIG.MAX_PLAYERS} người</span>}
                        </div>
                    </div>
                </div>

                {/* Right Column - Role Selection */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 border border-slate-200 dark:border-slate-700 flex flex-col">
                    <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span>🎭</span>
                            <span>Vai trò trong game</span>
                        </h2>
                        <div className="px-4 py-2 bg-gradient-to-r from-accent-500 to-primary-500 text-white rounded-lg font-semibold text-sm shadow-md">
                            Tổng: {totalRoles}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 max-h-[500px] custom-scrollbar">
                        {Object.entries(roleDistribution).map(([roleId, count]) => {
                            const role = ROLES[roleId.toUpperCase()];
                            if (!role) return null;

                            const isVillager = roleId === 'villager';

                            return (
                                <div
                                    key={roleId}
                                    className="grid grid-cols-[auto_1fr_auto] items-center gap-4 p-4 rounded-xl border-2 transition-all hover:shadow-lg hover:-translate-y-0.5"
                                    style={{
                                        borderColor: role.color,
                                        background: `linear-gradient(135deg, ${role.color}08, ${role.color}04)`
                                    }}
                                >
                                    <div className="text-4xl" style={{ color: role.color }}>
                                        {role.icon}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="font-bold text-lg truncate" style={{ color: role.color }}>
                                            {role.name}
                                        </div>
                                        <div className="text-xs text-slate-600 dark:text-slate-400 truncate hidden sm:block">
                                            {role.description.split('.')[0].substring(0, 60)}...
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            className="w-10 h-10 rounded-lg border-2 border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 hover:bg-primary-500 hover:text-white hover:border-primary-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed font-bold text-lg active:scale-95"
                                            onClick={() => handleRoleChange(roleId, -1)}
                                            disabled={count === 0}
                                            aria-label="Giảm"
                                        >
                                            −
                                        </button>
                                        <span className="min-w-[2rem] text-center text-2xl font-bold" style={{ color: role.color }}>
                                            {count}
                                        </span>
                                        <button
                                            className="w-10 h-10 rounded-lg border-2 border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 hover:bg-primary-500 hover:text-white hover:border-primary-500 transition-all font-bold text-lg active:scale-95"
                                            onClick={() => handleRoleChange(roleId, 1)}
                                            aria-label="Tăng"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {error && (
                        <div className="mt-4 p-4 bg-danger-50 dark:bg-danger-900/20 border-2 border-danger-500 rounded-xl text-danger-700 dark:text-danger-400 font-semibold text-center">
                            {error}
                        </div>
                    )}

                    <button
                        className="mt-4 w-full py-4 px-6 bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 text-white font-bold text-lg rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                        onClick={handleStartGame}
                        disabled={!canStart}
                    >
                        {!canStart && playerCount > 0 && playerCount < GAME_CONFIG.MIN_PLAYERS
                            ? `Cần thêm ${GAME_CONFIG.MIN_PLAYERS - playerCount} người chơi`
                            : !canStart && totalRoles !== playerCount
                                ? 'Điều chỉnh vai trò cho khớp'
                                : '🎮 Bắt đầu trò chơi'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SetupScreen;
