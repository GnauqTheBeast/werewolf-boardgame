import { useState, useEffect } from 'react';

export const useTheme = () => {
    const [theme, setTheme] = useState(() => {
        const saved = localStorage.getItem('werewolf-theme');
        return saved || 'dark';
    });

    useEffect(() => {
        localStorage.setItem('werewolf-theme', theme);

        // Update HTML class for Tailwind dark mode
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    return { theme, toggleTheme };
};
