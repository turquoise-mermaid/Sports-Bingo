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
import { CompleteProfilePage } from './components/CompleteProfilePage';
import { SupportPage } from './components/SupportPage';
import { HowToPlay } from './components/HowToPlay';
import { DevNav } from './components/DevNav';
import { useAuth } from './hooks/useAuth';
import { createMultiplayerSession, loginAsHost, rejoinSession, joinSessionByCode, SessionRow } from './lib/sessions';
import { supabase } from './lib/supabase';
import { logEvent } from './lib/analytics';
import { generateRandomName } from './lib/randomName';

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
  | 'support'
  | 'how-to-play'
  | 'game';

type SessionMode = 'solo' | 'multiplayer-create';

export interface SessionInfo {
  sessionId: number;
  playerId: number;
  groupName?: string;
  initials?: string;
  isHost?: boolean;
  joinCode?: string;
  gameMode?: 'bingo' | 'blackout';
  useSharedTerms?: boolean;
}

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
  const { user, loading, userRole, username: authUsername, needsProfileCompletion, refetchProfile } = useAuth();
  const [guestName] = useState(() => generateRandomName());
  const username = user?.is_anonymous ? guestName : authUsername;

  const [view, setView] = useState<AppView>('session-lobby');
  const [sessionMode, setSessionMode] = useState<SessionMode>('solo');
  const [selectedSport, setSelectedSport] = useState<Sport | null>(null);
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [defaultJoinCode, setDefaultJoinCode] = useState<string | undefined>(undefined);
  const [loginMode, setLoginMode] = useState<'signin' | 'signup'>('signin');
  const [firstUseWon, setFirstUseWon] = useState(false);
  const isDev = import.meta.env.DEV || userRole === 'dev';

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
          setSessionInfo({ sessionId: session.id, playerId: player.id, groupName: session.group_name, initials: player.initials, isHost: true, joinCode: session.join_code, gameMode: (session.game_mode as 'bingo' | 'blackout') ?? 'bingo', useSharedTerms: session.use_shared_terms ?? false });
          setView('game');
        } else {
          const { session, player } = await rejoinSession(stored.joinCode, user.id);
          setSelectedSport(session.sport as Sport);
          setSessionInfo({ sessionId: session.id, playerId: player.id, groupName: session.group_name, initials: player.initials, isHost: false, joinCode: stored.joinCode, gameMode: (session.game_mode as 'bingo' | 'blackout') ?? 'bingo', useSharedTerms: session.use_shared_terms ?? false });
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

  // --- Session Lobby ---
  const handleSolo = () => {
    setSessionMode('solo');
    setView('sport-selection');
  };

  const handleMultiplayerCreate = () => {
    setSessionMode('multiplayer-create');
    setView('sport-selection');
  };

  const handleJoin = async (code: string) => {
    if (!user) return;
    const { session, player } = await joinSessionByCode(code, user.id, username);
    setSelectedSport(session.sport as Sport);
    setSessionInfo({
      sessionId: session.id,
      playerId: player.id,
      groupName: session.group_name,
      initials: username,
      isHost: false,
      joinCode: code,
      gameMode: (session.game_mode as 'bingo' | 'blackout') ?? 'bingo',
      useSharedTerms: session.use_shared_terms ?? false,
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
  const handleCredentialsComplete = async (groupName: string, initials: string, joinCode: string, gameMode: 'bingo' | 'blackout', useSharedTerms: boolean) => {
    if (!user || !selectedSport) return;
    const { session, player } = await createMultiplayerSession(selectedSport, user.id, groupName, initials, joinCode, gameMode, useSharedTerms);
    setSessionInfo({ sessionId: session.id, playerId: player.id, groupName, initials, isHost: true, joinCode, gameMode, useSharedTerms });
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

  const handleBackToSportSelection = () => setView('sport-selection');
  const handleBackToMultiplayerLogin = () => setView('multiplayer-code-login');

  const handleDevNavigate = ({ view: v, sport, sessionInfo: si }: {
    view: AppView; sport?: Sport; sessionInfo?: SessionInfo | null; username?: string;
  }) => {
    if (sport !== undefined) setSelectedSport(sport);
    if (si !== undefined) setSessionInfo(si);
    setView(v);
  };

  if (loading || !user || reconnecting) return null;

  const bg = (
    <>
      <div className="absolute inset-0" style={{ opacity: 0.03, backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.5) 10px, rgba(255,255,255,.5) 11px), repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(255,255,255,.5) 10px, rgba(255,255,255,.5) 11px)` }} />
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/50 via-neutral-950/80 to-stone-950/50" />
    </>
  );

  // Logged-in users who completed OAuth but haven't set a username yet
  if (!user.is_anonymous && needsProfileCompletion) {
    return (
      <div className="min-h-screen bg-zinc-950 relative overflow-hidden">
        {bg}
        <div className="relative z-10">
          <CompleteProfilePage userId={user.id} onComplete={() => refetchProfile(user.id)} />
        </div>
      </div>
    );
  }

  return (
    <>
      {import.meta.env.DEV && <DevNav onNavigate={handleDevNavigate} />}
      <div className="min-h-screen bg-zinc-950 relative overflow-hidden">
        {bg}
        <div className="relative z-10">
          {view === 'session-lobby' && (
            <SessionLobby
              user={user}
              username={username}
              onSolo={handleSolo}
              onMultiplayerCreate={handleMultiplayerCreate}
              onJoin={handleJoin}
              onFaq={() => setView('faq')}
              onPrivacyPolicy={() => setView('privacy-policy')}
              onTermsOfService={() => setView('terms-of-service')}
              onAccount={() => setView('account')}
              onSupport={() => setView('support')}
              onHowToPlay={() => setView('how-to-play')}
              onShowLogin={(mode) => { setLoginMode(mode); setView('login'); }}
            />
          )}
          {view === 'faq' && <FAQ onBack={handleBackToLobby} />}
          {view === 'privacy-policy' && <PrivacyPolicy onBack={handleBackToLobby} />}
          {view === 'terms-of-service' && <TermsOfService onBack={handleBackToLobby} />}
          {view === 'support' && <SupportPage onBack={handleBackToLobby} userEmail={user.email ?? ''} />}
          {view === 'how-to-play' && <HowToPlay onBack={handleBackToLobby} />}
          {view === 'account' && (
            <AccountPage
              username={username}
              email={user.email ?? ''}
              role={userRole}
              onBack={handleBackToLobby}
              onSignOut={async () => {
                await supabase.auth.signOut();
                setView('session-lobby');
              }}
            />
          )}
          {view === 'login' && (
            <LoginPage
              defaultMode={loginMode}
              onSuccess={() => {
                const pending = localStorage.getItem('sportsbingo_pending_board');
                if (pending) {
                  try {
                    const { sport: pendingSport } = JSON.parse(pending);
                    setSelectedSport(pendingSport as Sport);
                    setSessionInfo(null);
                    setView('game');
                    return;
                  } catch { /* fall through */ }
                }
                setFirstUseWon(false);
                setView('session-lobby');
              }}
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
              isAnonymous={user?.is_anonymous ?? false}
              onShowLogin={(mode) => { setLoginMode(mode); setView('login'); }}
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
                onBackToLobby={() => { setFirstUseWon(false); setView('session-lobby'); }}
              />
            ) : (
              <BingoBoard
                sport={selectedSport}
                sessionInfo={sessionInfo}
                username={username}
                userId={user?.id}
                isDev={isDev}
                gameMode={sessionInfo?.gameMode ?? 'bingo'}
                useSharedTerms={sessionInfo?.useSharedTerms ?? false}
                onBackToSports={sessionInfo ? handleBackToMultiplayerLogin : handleBackToSportSelection}
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
