import { supabase } from './supabase';
import { Sport } from '../App';
import { getBingoItems } from '../components/bingoData';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface PlayerRow {
  id: number;
  player_number: number;
  marked_squares: number[];
  initials?: string;
  is_host?: boolean;
  joined_at?: string;
}

export async function createSession(sport: Sport, userId: string) {
  const terms = getBingoItems(sport);

  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .insert({
      sport,
      terms,
      created_by: userId,
      expires_at: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
      status: 'active',
    })
    .select()
    .single();

  if (sessionError) throw sessionError;

  const { data: player, error: playerError } = await supabase
    .from('players')
    .insert({
      session_id: session.id,
      player_number: 1,
      anonymous_id: userId,
    })
    .select()
    .single();

  if (playerError) throw playerError;

  return { session, player };
}

export async function joinSession(sessionId: number, userId: string) {
  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .select()
    .eq('id', sessionId)
    .eq('status', 'active')
    .gt('expires_at', new Date().toISOString())
    .single();

  if (sessionError || !session) throw new Error('Session not found or expired');

  const { count } = await supabase
    .from('players')
    .select('*', { count: 'exact', head: true })
    .eq('session_id', sessionId);

  const { data: player, error: playerError } = await supabase
    .from('players')
    .insert({
      session_id: sessionId,
      player_number: (count ?? 0) + 1,
      anonymous_id: userId,
    })
    .select()
    .single();

  if (playerError) throw playerError;

  return { session, player };
}

export async function createMultiplayerSession(
  sport: Sport,
  userId: string,
  groupName: string,
  initials: string,
  joinCode: string
) {
  const terms = getBingoItems(sport);
  const now = new Date();

  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .insert({
      sport,
      terms,
      created_by: userId,
      group_name: groupName,
      join_code: joinCode,
      started_at: now.toISOString(),
      expires_at: new Date(now.getTime() + 6 * 60 * 60 * 1000).toISOString(),
      status: 'active',
    })
    .select()
    .single();

  if (sessionError) throw sessionError;

  const { data: player, error: playerError } = await supabase
    .from('players')
    .insert({
      session_id: session.id,
      player_number: 1,
      anonymous_id: userId,
      initials,
      is_host: true,
      joined_at: now.toISOString(),
    })
    .select()
    .single();

  if (playerError) throw playerError;

  return { session, player };
}

export async function joinSessionByCode(joinCode: string, userId: string, initials: string) {
  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .select()
    .eq('join_code', joinCode)
    .eq('status', 'active')
    .gt('expires_at', new Date().toISOString())
    .single();

  if (sessionError || !session) throw new Error('Session not found or expired');

  const { count } = await supabase
    .from('players')
    .select('*', { count: 'exact', head: true })
    .eq('session_id', session.id);

  if ((count ?? 0) >= 5) throw new Error('This session is full');

  const now = new Date().toISOString();
  const { data: player, error: playerError } = await supabase
    .from('players')
    .insert({
      session_id: session.id,
      player_number: (count ?? 0) + 1,
      anonymous_id: userId,
      initials,
      is_host: false,
      joined_at: now,
    })
    .select()
    .single();

  if (playerError) throw playerError;

  return { session, player };
}

export async function rejoinSession(joinCode: string, userId: string) {
  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .select()
    .eq('join_code', joinCode)
    .eq('status', 'active')
    .gt('expires_at', new Date().toISOString())
    .single();

  if (sessionError || !session) throw new Error('Session not found or expired.');

  const { data: players, error: playerError } = await supabase
    .from('players')
    .select()
    .eq('session_id', session.id)
    .eq('anonymous_id', userId)
    .order('joined_at', { ascending: true })
    .limit(1);

  const player = players?.[0];
  if (playerError || !player) throw new Error('No board found. Use the original invite link to join.');

  return { session, player };
}

export async function loginAsHost(joinCode: string, userId: string) {
  const { data: session, error } = await supabase
    .from('sessions')
    .select()
    .eq('join_code', joinCode)
    .eq('status', 'active')
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error || !session) throw new Error('Session not found or expired');

  const { data: players, error: playersError } = await supabase
    .from('players')
    .select()
    .eq('session_id', session.id)
    .eq('anonymous_id', userId)
    .eq('is_host', true);

  if (playersError || !players?.length) throw new Error('You are not the host of this session');

  return { session, player: players[0] };
}

export async function savePlayerBoard(playerId: number, boardOrder: number[], markedSquares: number[]) {
  const { error } = await supabase
    .from('players')
    .update({ board_order: boardOrder, marked_squares: markedSquares })
    .eq('id', playerId);
  if (error) throw error;
}

export async function loadPlayerBoard(playerId: number) {
  const { data, error } = await supabase
    .from('players')
    .select('board_order, marked_squares')
    .eq('id', playerId)
    .single();
  if (error) throw error;
  return data as { board_order: number[]; marked_squares: number[] };
}

export async function getSessionPlayers(sessionId: number): Promise<PlayerRow[]> {
  const { data, error } = await supabase
    .from('players')
    .select('id, player_number, initials, is_host, joined_at, marked_squares')
    .eq('session_id', sessionId)
    .order('joined_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as PlayerRow[];
}

export async function getSessionById(sessionId: number) {
  const { data, error } = await supabase
    .from('sessions')
    .select('id, sport, group_name, join_code, started_at, expires_at, status')
    .eq('id', sessionId)
    .single();
  if (error) throw error;
  return data;
}

export function subscribeToSessionPlayers(
  sessionId: number,
  onUpdate: (player: PlayerRow) => void
): RealtimeChannel {
  return supabase
    .channel(`session-players-${sessionId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'players',
        filter: `session_id=eq.${sessionId}`,
      },
      (payload) => onUpdate(payload.new as PlayerRow)
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'players',
        filter: `session_id=eq.${sessionId}`,
      },
      (payload) => onUpdate(payload.new as PlayerRow)
    )
    .subscribe();
}
