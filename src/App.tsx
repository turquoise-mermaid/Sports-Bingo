import { useState, useEffect } from 'react';
import { SportSelection } from './components/SportSelection';
import { SessionLobby } from './components/SessionLobby';
import { HostCredentials } from './components/HostCredentials';
import { MultiplayerCodeLogin } from './components/MultiplayerCodeLogin';
import { GuestLogin } from './components/GuestLogin';
import { BingoBoard } from './components/BingoBoard';
import { useAuth } from './hooks/useAuth';
import { createMultiplayerSession } from './lib/sessions';

export type Sport = 'soccer' | 'americanFootball' | 'baseball' | 'basketball' | 'tennis' | 'hockey';

type AppView =
  | 'session-lobby'
  | 'sport-selection'
  | 'host-credentials'
  | 'multiplayer-code-login'
  | 'guest-login'
  | 'game';

type SessionMode = 'solo' | 'multiplayer-create';

export interface SessionInfo {
  sessionId: number;
  playerId: number;
  groupName?: string;
  initials?: string;
  isHost?: boolean;
  joinCode?: number;
  hostCode?: number;
}

export default function App() {
  const { user, loading } = useAuth();
  const [view, setView] = useState<AppView>('session-lobby');
  const [sessionMode, setSessionMode] = useState<SessionMode>('solo');
  const [selectedSport, setSelectedSport] = useState<Sport | null>(null);
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [defaultJoinCode, setDefaultJoinCode] = useState<number | undefined>(undefined);

  // Route guests who arrive via shared link (?join=XXXX)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const joinParam = params.get('join');
    if (joinParam) {
      const code = parseInt(joinParam, 10);
      if (!isNaN(code)) {
        setDefaultJoinCode(code);
        setView('guest-login');
      }
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // --- Session Lobby ---
  const handleSolo = () => {
    setSessionMode('solo');
    setView('sport-selection');
  };

  const handleMultiplayerCreate = () => {
    setSessionMode('multiplayer-create');
    setView('sport-selection');
  };

  const handleJoinReady = (sessionId: number, playerId: number, sport: Sport) => {
    setSelectedSport(sport);
    setSessionInfo({ sessionId, playerId });
    setView('game');
  };

  // --- Sport Selection ---
  const handleSportSelect = (sport: Sport) => {
    setSelectedSport(sport);
    if (sessionMode === 'multiplayer-create') {
      setView('host-credentials');
    } else {
      setSessionInfo(null);
      setView('game');
    }
  };

  // --- Host Credentials ---
  const handleCredentialsComplete = async (
    groupName: string,
    initials: string,
    hostCode: number,
    joinCode: number
  ) => {
    if (!user || !selectedSport) return;
    const { session, player } = await createMultiplayerSession(
      selectedSport,
      user.id,
      groupName,
      initials,
      hostCode,
      joinCode
    );
    setSessionInfo({
      sessionId: session.id,
      playerId: player.id,
      groupName,
      initials,
      isHost: true,
      joinCode,
      hostCode,
    });
    setView('game');
  };

  // --- Multiplayer Code Login ---
  const handleHostLogin = (info: SessionInfo, sport: Sport) => {
    setSelectedSport(sport);
    setSessionInfo(info);
    setView('game');
  };

  const handlePlayerRejoin = (info: SessionInfo, sport: Sport) => {
    setSelectedSport(sport);
    setSessionInfo(info);
    setView('game');
  };

  // --- Guest Login ---
  const handleGuestJoined = (info: SessionInfo, sport: Sport) => {
    setSelectedSport(sport);
    setSessionInfo(info);
    setView('game');
  };

  // --- Back navigation ---
  const handleBackToLobby = () => {
    setSelectedSport(null);
    setSessionInfo(null);
    setDefaultJoinCode(undefined);
    setView('session-lobby');
  };

  const handleBackToSportSelection = () => {
    setView('sport-selection');
  };

  const handleBackToMultiplayerLogin = () => {
    setView('multiplayer-code-login');
  };

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-zinc-950 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.5) 10px, rgba(255,255,255,.5) 11px),
                         repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(255,255,255,.5) 10px, rgba(255,255,255,.5) 11px)`
      }}></div>
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/50 via-neutral-950/80 to-stone-950/50"></div>

      <div className="relative z-10">
        {view === 'session-lobby' && (
          <SessionLobby
            user={user}
            onSolo={handleSolo}
            onMultiplayerCreate={handleMultiplayerCreate}
            onJoinReady={handleJoinReady}
          />
        )}
        {view === 'sport-selection' && (
          <SportSelection onSelectSport={handleSportSelect} onBack={handleBackToLobby} />
        )}
        {view === 'host-credentials' && (
          <HostCredentials
            onBack={handleBackToSportSelection}
            onContinue={handleCredentialsComplete}
          />
        )}
        {view === 'multiplayer-code-login' && (
          <MultiplayerCodeLogin
            user={user}
            onBackToLobby={handleBackToLobby}
            onHostLogin={handleHostLogin}
            onPlayerRejoin={handlePlayerRejoin}
          />
        )}
        {view === 'guest-login' && (
          <GuestLogin
            user={user}
            defaultJoinCode={defaultJoinCode}
            onBack={() => setView('multiplayer-code-login')}
            onJoined={handleGuestJoined}
          />
        )}
        {view === 'game' && selectedSport && (
          <BingoBoard
            sport={selectedSport}
            sessionInfo={sessionInfo}
            onBackToSports={
              sessionInfo
                ? handleBackToMultiplayerLogin
                : handleBackToSportSelection
            }
            onGameEnd={handleBackToLobby}
          />
        )}
      </div>
    </div>
  );
}
