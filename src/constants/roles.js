// Role definitions for Werewolf game
export const ROLES = {
    VILLAGER: {
        id: 'villager',
        name: 'Dân làng',
        description: 'Người dân bình thường không có khả năng đặc biệt. Mục tiêu: Tìm và loại bỏ tất cả Ma sói.',
        team: 'village',
        nightAction: false,
        color: '#4CAF50',
        icon: '👨'
    },
    WEREWOLF: {
        id: 'werewolf',
        name: 'Ma sói',
        description: 'Mỗi đêm, Ma sói tập hợp và chọn một người để tấn công. Mục tiêu: Tiêu diệt tất cả dân làng.',
        team: 'werewolf',
        nightAction: true,
        actionName: 'Chọn nạn nhân',
        color: '#F44336',
        icon: '🐺'
    },
    SEER: {
        id: 'seer',
        name: 'Tiên tri',
        description: 'Mỗi đêm, có thể kiểm tra vai trò thực sự của một người chơi. Phe Dân làng.',
        team: 'village',
        nightAction: true,
        actionName: 'Kiểm tra vai trò',
        color: '#9C27B0',
        icon: '🔮'
    },
    GUARD: {
        id: 'guard',
        name: 'Bảo vệ',
        description: 'Mỗi đêm, bảo vệ một người khỏi Ma sói (không thể bảo vệ người giống nhau 2 đêm liên tiếp). Phe Dân làng.',
        team: 'village',
        nightAction: true,
        actionName: 'Bảo vệ người chơi',
        color: '#2196F3',
        icon: '🛡️'
    },
    WITCH: {
        id: 'witch',
        name: 'Phù thủy',
        description: 'Có 2 lọ thuốc (dùng 1 lần): Thuốc cứu (hồi sinh nạn nhân) và thuốc độc (giết một người). Phe Dân làng.',
        team: 'village',
        nightAction: true,
        actionName: 'Sử dụng thuốc',
        color: '#E91E63',
        icon: '🧙‍♀️',
        potions: {
            heal: 1,
            poison: 1
        }
    },
    CUPID: {
        id: 'cupid',
        name: 'Cupid',
        description: 'Đêm đầu tiên, chọn 2 người làm đôi tình nhân. Nếu một người chết, người còn lại cũng chết theo. Phe Dân làng.',
        team: 'village',
        nightAction: true,
        actionName: 'Chọn đôi tình nhân',
        firstNightOnly: true,
        color: '#FF9800',
        icon: '💘'
    },
    JESTER: {
        id: 'jester',
        name: 'Kẻ chán đời',
        description: 'Người chơi đơn độc muốn bị treo cổ. Nếu bị bỏ phiếu giết ban ngày, Kẻ chán đời thắng một mình.',
        team: 'solo',
        nightAction: false,
        color: '#795548',
        icon: '🤡'
    }
};

// Get role by ID
export const getRoleById = (roleId) => {
    return Object.values(ROLES).find(role => role.id === roleId);
};

// Get roles by team
export const getRolesByTeam = (team) => {
    return Object.values(ROLES).filter(role => role.team === team);
};

// Night action order
export const NIGHT_ACTION_ORDER = [
    ROLES.CUPID,
    ROLES.WEREWOLF,
    ROLES.SEER,
    ROLES.GUARD,
    ROLES.WITCH
];
