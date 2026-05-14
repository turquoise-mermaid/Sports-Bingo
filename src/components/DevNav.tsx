import { useState } from 'react';
import { Sport } from '../App';
import { SessionInfo } from '../App';

type DevView =
  | 'session-lobby'
  | 'faq'
  | 'sport-selection'
  | 'host-credentials'
  | 'multiplayer-code-login'
  | 'guest-login'
  | 'game';

interface DevNavTarget {
  view: DevView;
  sport?: Sport;
  sessionInfo?: SessionInfo | null;
  username?: string;
}

interface DevNavProps {
  onNavigate: (target: DevNavTarget) => void;
}

const SPORTS: { label: string; value: Sport }[] = [
  { label: 'Soccer', value: 'soccer' },
  { label: 'Football', value: 'americanFootball' },
  { label: 'Baseball', value: 'baseball' },
  { label: 'Basketball', value: 'basketball' },
  { label: 'Rugby', value: 'rugby' },
  { label: 'Hockey', value: 'hockey' },
];

const MOCK_HOST_SESSION = (): SessionInfo => ({
  sessionId: 0, playerId: 0, groupName: 'Dev Team', initials: 'Dev', isHost: true, joinCode: 'DEVXXX',
});

const MOCK_GUEST_SESSION = (): SessionInfo => ({
  sessionId: 0, playerId: 0, groupName: 'Dev Team', initials: 'Guest', isHost: false, joinCode: 'DEVXXX',
});

const S = {
  wrap: { position: 'fixed', bottom: 16, right: 16, zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 } as React.CSSProperties,
  panel: { background: '#18181b', border: '1px solid #52525b', borderRadius: 8, padding: 12, width: 280, maxHeight: '80vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.6)' } as React.CSSProperties,
  heading: { color: '#facc15', fontWeight: 'bold', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 } as React.CSSProperties,
  section: { display: 'flex', flexDirection: 'column', gap: 4 } as React.CSSProperties,
  label: { color: '#71717a', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 } as React.CSSProperties,
  btnRow: { display: 'flex', flexWrap: 'wrap', gap: 4 } as React.CSSProperties,
  btn: { background: '#3f3f46', color: '#e5e5e5', border: 'none', borderRadius: 4, padding: '3px 8px', fontSize: 11, cursor: 'pointer' } as React.CSSProperties,
  btnGreen: { background: '#14532d', color: '#e5e5e5', border: 'none', borderRadius: 4, padding: '3px 8px', fontSize: 11, cursor: 'pointer' } as React.CSSProperties,
  btnBlue: { background: '#1e3a5f', color: '#e5e5e5', border: 'none', borderRadius: 4, padding: '3px 8px', fontSize: 11, cursor: 'pointer' } as React.CSSProperties,
  devBtn: { background: '#facc15', color: '#18181b', fontWeight: 'bold', borderRadius: '9999px', width: 40, height: 40, fontSize: 12, border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' } as React.CSSProperties,
};

const SCREENS: { label: string; view: DevView }[] = [
  { label: 'Lobby', view: 'session-lobby' },
  { label: 'FAQ', view: 'faq' },
  { label: 'Sport Select', view: 'sport-selection' },
  { label: 'Host Setup', view: 'host-credentials' },
  { label: 'MP Login', view: 'multiplayer-code-login' },
  { label: 'Guest Login', view: 'guest-login' },
];

export function DevNav({ onNavigate }: DevNavProps) {
  const [open, setOpen] = useState(false);

  const go = (target: DevNavTarget) => { onNavigate(target); setOpen(false); };

  return (
    <div style={S.wrap}>
      {open && (
        <div style={S.panel}>
          <span style={S.heading}>Dev Nav</span>

          <div style={S.section}>
            <span style={S.label}>Screens</span>
            <div style={S.btnRow}>
              {SCREENS.map(({ label, view }) => (
                <button key={view} style={S.btn} onClick={() => go({ view, username: 'Dev' })}>{label}</button>
              ))}
            </div>
          </div>

          <div style={S.section}>
            <span style={S.label}>Solo Board</span>
            <div style={S.btnRow}>
              {SPORTS.map(({ label, value }) => (
                <button key={value} style={S.btn} onClick={() => go({ view: 'game', sport: value, sessionInfo: null, username: 'Dev' })}>{label}</button>
              ))}
            </div>
          </div>

          <div style={S.section}>
            <span style={S.label}>Host Board</span>
            <div style={S.btnRow}>
              {SPORTS.map(({ label, value }) => (
                <button key={value} style={S.btnGreen} onClick={() => go({ view: 'game', sport: value, sessionInfo: MOCK_HOST_SESSION(), username: 'Dev' })}>{label}</button>
              ))}
            </div>
          </div>

          <div style={S.section}>
            <span style={S.label}>Guest Board</span>
            <div style={S.btnRow}>
              {SPORTS.map(({ label, value }) => (
                <button key={value} style={S.btnBlue} onClick={() => go({ view: 'game', sport: value, sessionInfo: MOCK_GUEST_SESSION(), username: 'Guest' })}>{label}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      <button style={S.devBtn} onClick={() => setOpen(o => !o)}>DEV</button>
    </div>
  );
}
