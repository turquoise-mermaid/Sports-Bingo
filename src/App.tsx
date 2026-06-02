import { useState, useEffect, useRef } from 'react';
import { SportSelection } from './components/SportSelection';
import { SessionLobby } from './components/SessionLobby';
import { HostCredentials } from './components/HostCredentials';
import { MultiplayerCodeLogin } from './components/MultiplayerCodeLogin';
import { GuestLogin } from './components/GuestLogin';
import { BingoBoardV2 as BingoBoard } from './components/BingoBoardV2';
import { FirstUseGameBoard } from './components/FirstUseGameBoard';
import { FAQ } from './components/FAQ';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { TermsOfService } from './components/TermsOfService';
import { AccountPage } from './components/AccountPage';
import { LoginPage } from './components/LoginPage';
import { DevNav } from './components/DevNav';
import { useAuth } from './hooks/useAuth';
import { createMultiplayerSession, loginAsHost, rejoinSession, joinSessionByCode } from './lib/sessions';
import { supabase } from './lib/supabase';
import { logEvent } from './lib/analytics';

export type Sport = 'soccer' | 'americanFootball' | 'baseball' | 'basketball' | 'rugby' | 'hockey';

type AppView =
  | 'session-lobby'
  | 'sport-selection'
  | 'host-credentials'
  | 'multiplayer-code-login'
  | 'guest-login'
  | 'login'
  | 'faq'
  | 'privacy-policy'
  | 'terms-of-service'
  | 'account'
  | 'game';

type SessionMode = 'solo' | 'multiplayer-create';

export interface SessionInfo {
  sessionId: number;
  playerId: number;
  groupName?: string;
  initials?: string;
  isHost?: boolean;
  joinCode?: string;
}

// --- Session persistence helpers ---
const SESSION_KEY = 'sportsbingo_session';

interface StoredSession {
  joinCode: string;
  isHost: boolean;
}

function saveSession(joinCode: string, isHost: boolean) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ joinCode, isHost }));
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

function loadSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function App() {
  const { user, loading, userRole, savedDisplayName } = useAuth();
  const [view, setView] = useState<AppView>('session-lobby');
  const [sessionMode, setSessionMode] = useState<SessionMode>('solo');
  const [selectedSport, setSelectedSport] = useState<Sport | null>(null);
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [username, setUsername] = useState('');
  const [defaultJoinCode, setDefaultJoinCode] = useState<string | undefined>(undefined);
  const [loginMode, setLoginMode] = useState<'signin' | 'signup'>('signin');
  const [firstUseWon, setFirstUseWon] = useState(false);
  const isDev = import.meta.env.DEV || userRole === 'dev';

  useEffect(() => {
    if (savedDisplayName && !username) setUsername(savedDisplayName);
  }, [savedDisplayName]);

  const prevIsAnonymousRef = useRef<boolean | null>(null);
  useEffect(() => {
    if (!user) return;
    const wasAnonymous = prevIsAnonymousRef.current;
    prevIsAnonymousRef.current = user.is_anonymous;
    if (wasAnonymous === true && !user.is_anonymous && username) {
      supabase.from('profiles').update({ display_name: username }).eq('id', user.id);
    }
  }, [user]);

  const [reconnecting, setReconnecting] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('join')) return false;
    return loadSession() !== null;
  });

  const joinedViaUrlRef = useRef(false);

  // Route guests who arrive via shared link (?join=XXXX)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const joinParam = params.get('join');
    if (joinParam) {
      joinedViaUrlRef.current = true;
      setDefaultJoinCode(joinParam);
      setView('guest-login');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // Auto-reconnect from localStorage on load
  useEffect(() => {
    if (loading || !user) return;
    if (joinedViaUrlRef.current) { setReconnecting(false); return; }

    const stored = loadSession();
    if (!stored) { setReconnecting(false); return; }

    const reconnect = async () => {
      try {
        if (stored.isHost) {
          const { session, player } = await loginAsHost(stored.joinCode, user.id);
          setSelectedSport(session.sport as Sport);
          setSessionInfo({
            sessionId: session.id,
            playerId: player.id,
            groupName: session.group_name,
            initials: player.initials,
            isHost: true,
            joinCode: session.join_code,
          });
          setView('game');
        } else {
          const { session, player } = await rejoinSession(stored.joinCode, user.id);
          setSelectedSport(session.sport as Sport);
          setSessionInfo({
            sessionId: session.id,
            playerId: player.id,
            groupName: session.group_name,
            initials: player.initials,
            isHost: false,
            joinCode: stored.joinCode,
          });
          setView('game');
        }
      } catch {
        clearSession();
      } finally {
        setReconnecting(false);
      }
    };

    reconnect();
  }, [user, loading]);

  const persistDisplayName = async (name: string) => {
    if (!user || user.is_anonymous) return;
    const { error } = await supabase.from('profiles').update({ display_name: name }).eq('id', user.id);
    if (error) console.error('[persistDisplayName]', error);
  };

  // --- Session Lobby ---
  const handleSolo = (name: string) => {
    setUsername(name);
    persistDisplayName(name);
    setSessionMode('solo');
    setView('sport-selection');
  };

  const handleMultiplayerCreate = (name: string) => {
    setUsername(name);
    persistDisplayName(name);
    setSessionMode('multiplayer-create');
    setView('sport-selection');
  };

  const handleJoin = async (name: string, code: string) => {
    if (!user) return;
    const { session, player } = await joinSessionByCode(code, user.id, name);
    setUsername(name);
    persistDisplayName(name);
    setSelectedSport(session.sport as Sport);
    setSessionInfo({
      sessionId: session.id,
      playerId: player.id,
      groupName: session.group_name,
      initials: name,
      isHost: false,
      joinCode: code,
    });
    saveSession(code, false);
    setView('game');
  };

  // --- Sport Selection ---
  const handleSportSelect = (sport: Sport) => {
    setSelectedSport(sport);
    logEvent({ eventType: 'sport_selected', sport, isMultiplayer: sessionMode === 'multiplayer-create', userId: user?.id }, isDev);
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
    joinCode: string
  ) => {
    if (!user || !selectedSport) return;
    const { session, player } = await createMultiplayerSession(
      selectedSport,
      user.id,
      groupName,
      initials,
      joinCode
    );
    setSessionInfo({
      sessionId: session.id,
      playerId: player.id,
      groupName,
      initials,
      isHost: true,
      joinCode,
    });
    setUsername(initials);
    persistDisplayName(initials);
    saveSession(joinCode, true);
    setView('game');
  };

  // --- Multiplayer Code Login ---
  const handleHostLogin = (info: SessionInfo, sport: Sport) => {
    setSelectedSport(sport);
    setSessionInfo(info);
    if (info.joinCode != null) saveSession(info.joinCode, true);
    setView('game');
  };

  const handlePlayerRejoin = (info: SessionInfo, sport: Sport) => {
    setSelectedSport(sport);
    setSessionInfo(info);
    if (info.joinCode != null) saveSession(info.joinCode, false);
    setView('game');
  };

  // --- Guest Login ---
  const handleGuestJoined = (info: SessionInfo, sport: Sport) => {
    setSelectedSport(sport);
    setSessionInfo(info);
    if (info.joinCode != null) saveSession(info.joinCode, false);
    setView('game');
  };

  // --- Back navigation ---
  const handleBackToLobby = () => {
    setSelectedSport(null);
    setSessionInfo(null);
    setDefaultJoinCode(undefined);
    clearSession();
    setView('session-lobby');
  };

  const handleBackToSportSelection = () => {
    setView('sport-selection');
  };

  const handleBackToMultiplayerLogin = () => {
    setView('multiplayer-code-login');
  };

  const handleDevNavigate = ({ view, sport, sessionInfo: si, username: un }: {
    view: AppView; sport?: Sport; sessionInfo?: SessionInfo | null; username?: string;
  }) => {
    if (sport !== undefined) setSelectedSport(sport);
    if (si !== undefined) setSessionInfo(si);
    if (un !== undefined) setUsername(un);
    setView(view);
  };

  if (loading || !user || reconnecting) return null;

  return (
    <>
    {import.meta.env.DEV && <DevNav onNavigate={handleDevNavigate} />}
    <div className="min-h-screen bg-zinc-950 relative overflow-hidden">
      <div className="absolute inset-0" style={{ opacity: 0.03,
        backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.5) 10px, rgba(255,255,255,.5) 11px),
                         repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(255,255,255,.5) 10px, rgba(255,255,255,.5) 11px)`
      }}></div>
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/50 via-neutral-950/80 to-stone-950/50"></div>

      <div className="relative z-10">
        {view === 'session-lobby' && (
          <SessionLobby
            user={user}
            defaultUsername={username}
            onSolo={handleSolo}
            onMultiplayerCreate={handleMultiplayerCreate}
            onJoin={handleJoin}
            onFaq={() => setView('faq')}
            onPrivacyPolicy={() => setView('privacy-policy')}
            onTermsOfService={() => setView('terms-of-service')}
            onAccount={() => setView('account')}
            onShowLogin={(mode) => { setLoginMode(mode); setView('login'); }}
            onSaveName={(name) => { setUsername(name); persistDisplayName(name); }}
          />
        )}
        {view === 'faq' && (
          <FAQ onBack={handleBackToLobby} />
        )}
        {view === 'privacy-policy' && (
          <PrivacyPolicy onBack={handleBackToLobby} />
        )}
        {view === 'terms-of-service' && (
          <TermsOfService onBack={handleBackToLobby} />
        )}
        {view === 'account' && (
          <AccountPage
            displayName={username}
            email={user.email ?? ''}
            role={userRole}
            onBack={handleBackToLobby}
            onSignOut={async () => {
              await supabase.auth.signOut();
              setUsername('');
              setView('session-lobby');
            }}
          />
        )}
        {view === 'login' && (
          <LoginPage
            defaultMode={loginMode}
            onSuccess={() => { setFirstUseWon(false); setView('session-lobby'); }}
            onContinueAsGuest={() => { setFirstUseWon(false); setView('session-lobby'); }}
            onBack={() => { firstUseWon ? setView('game') : handleBackToLobby(); }}
          />
        )}
        {view === 'sport-selection' && (
          <SportSelection onSelectSport={handleSportSelect} onBack={handleBackToLobby} />
        )}
        {view === 'host-credentials' && (
          <HostCredentials
            onBack={handleBackToSportSelection}
            onContinue={handleCredentialsComplete}
            defaultUsername={username}
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
            defaultUsername={username}
            onBack={handleBackToLobby}
            onJoined={handleGuestJoined}
          />
        )}
        {view === 'game' && selectedSport && (
          (user?.is_anonymous && !sessionInfo) ? (
            <FirstUseGameBoard
              sport={selectedSport}
              username={username}
              initialHasBingo={firstUseWon}
              userId={user?.id}
              isDev={isDev}
              onShowLogin={(mode) => { setFirstUseWon(true); setLoginMode(mode); setView('login'); }}
              onBack={handleBackToSportSelection}
              onBackToLobby={() => { setUsername(''); setFirstUseWon(false); setView('session-lobby'); }}
            />
          ) : (
            <BingoBoard
              sport={selectedSport}
              sessionInfo={sessionInfo}
              username={username}
              userId={user?.id}
              isDev={isDev}
              onBackToSports={
                sessionInfo
                  ? handleBackToMultiplayerLogin
                  : handleBackToSportSelection
              }
              onGameEnd={handleBackToLobby}
            />
          )
        )}
        <p style={{ position: 'fixed', bottom: '12px', left: 0, right: 0, textAlign: 'center', fontSize: '11px', color: '#525252', zIndex: 30 }}>
          © 2026 Turquoise Sunrise LLC
        </p>
      </div>
    </div>
    </>
  );
}
