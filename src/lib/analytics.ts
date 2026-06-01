import { supabase } from './supabase';

type EventType = 'sport_selected' | 'game_started' | 'bingo_achieved' | 'game_exited' | 'board_shuffled';

interface LogEventParams {
  eventType: EventType;
  sport?: string;
  isMultiplayer?: boolean;
  hadBingo?: boolean;
  userId?: string;
  sessionId?: number;
  playerId?: number;
}

export function logEvent(params: LogEventParams, isDev: boolean): void {
  const table = isDev ? 'bingo_events_dev' : 'bingo_events';
  supabase.from(table).insert({
    event_type: params.eventType,
    sport: params.sport ?? null,
    is_multiplayer: params.isMultiplayer ?? false,
    had_bingo: params.hadBingo ?? null,
    user_id: params.userId ?? null,
    session_id: params.sessionId ?? null,
    player_id: params.playerId ?? null,
  }).then(() => {});
}
