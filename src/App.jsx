import { useState } from 'react';
import { useGameState } from './hooks/useGameState';
import { useTheme } from './hooks/useTheme';
import { PHASES } from './constants/gameConfig';
import SetupScreen from './components/SetupScreen';
import RoleReveal from './components/RoleReveal';
import NightPhase from './components/NightPhase';
import DayPhase from './components/DayPhase';
import VotingPhase from './components/VotingPhase';
import GameHistory from './components/GameHistory';
import GameOver from './components/GameOver';
import './index.css';

function App() {
  const { theme, toggleTheme } = useTheme();
  const [showSettings, setShowSettings] = useState(false);
  const {
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
  } = useGameState();

  const handleStartVote = () => {
    nextPhase();
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <header className="mb-8 text-center relative">
          <h1 className="text-4xl sm:text-5xl font-bold mb-2 bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
            Ma Sói
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Trò chơi Werewolf
          </p>

          {/* Settings Dropdown */}
          <div className="absolute top-0 right-0">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 sm:p-3 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors text-2xl"
              title="Cài đặt"
              aria-label="Settings"
            >
              ⚙️
            </button>

            {showSettings && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50 animate-scale-in">
                <button
                  onClick={() => {
                    toggleTheme();
                    setShowSettings(false);
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-3 text-slate-900 dark:text-white"
                >
                  <span className="text-xl">{theme === 'dark' ? '☀️' : '🌙'}</span>
                  <span className="font-medium">
                    {theme === 'dark' ? 'Chế độ sáng' : 'Chế độ tối'}
                  </span>
                </button>

                {phase !== PHASES.SETUP && (
                  <button
                    onClick={() => {
                      resetGame();
                      setShowSettings(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-danger-50 dark:hover:bg-danger-900/20 transition-colors flex items-center gap-3 text-danger-600 dark:text-danger-400 border-t border-slate-200 dark:border-slate-700"
                  >
                    <span className="text-xl">🔄</span>
                    <span className="font-medium">Game mới</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </header>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Game Area */}
          <div className="flex-1 min-w-0">
            {phase === PHASES.SETUP && (
              <SetupScreen onStartGame={startGame} />
            )}

            {phase === PHASES.ROLE_REVEAL && (
              <RoleReveal players={players} onComplete={nextPhase} />
            )}

            {phase === PHASES.NIGHT && (
              <NightPhase
                players={players}
                dayNumber={dayNumber}
                currentRoleIndex={currentRoleIndex}
                setCurrentRoleIndex={setCurrentRoleIndex}
                recordNightAction={recordNightAction}
                nextPhase={nextPhase}
                witchPotions={witchPotions}
                setWitchPotions={setWitchPotions}
                cupidUsed={cupidUsed}
                setCupidUsed={setCupidUsed}
                nightActions={nightActions}
                addHistoryEvent={addHistoryEvent}
              />
            )}

            {phase === PHASES.DAY && (
              <DayPhase
                players={players}
                dayNumber={dayNumber}
                onStartVote={handleStartVote}
                gameHistory={gameHistory}
              />
            )}

            {phase === PHASES.VOTE && (
              <VotingPhase
                players={players}
                recordVote={recordVote}
                processVotes={processVotes}
                votes={votes}
              />
            )}

            {phase === PHASES.GAME_OVER && (
              <GameOver
                players={players}
                gameResult={gameResult}
                onPlayAgain={resetGame}
              />
            )}
          </div>

          {/* Sidebar - Game History */}
          {phase !== PHASES.SETUP && phase !== PHASES.ROLE_REVEAL && (
            <div className="lg:w-96">
              <GameHistory gameHistory={gameHistory} dayNumber={dayNumber} />
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-8 text-center border-t border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Made with ❤️ by QuangNguyen
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
