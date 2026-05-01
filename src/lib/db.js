import { supabase } from './supabase.js'

function toApp(row) {
  return {
    id: row.id,
    player: row.player,
    team: row.team,
    date: row.date,
    activities: row.activities || [],
    bonuses: row.bonuses || [],
    totalPts: row.total_pts,
    note: row.note || '',
    attachments: row.attachments || [],
    links: row.links || [],
    loggedAt: row.logged_at,
    type: row.type,
  }
}

function toRow(entry) {
  return {
    id: entry.id,
    player: entry.player,
    team: entry.team,
    date: entry.date,
    activities: entry.activities || [],
    bonuses: entry.bonuses || [],
    total_pts: entry.totalPts || 0,
    note: entry.note || '',
    attachments: entry.attachments || [],
    links: entry.links || [],
    logged_at: entry.loggedAt,
    type: entry.type || null,
  }
}

export async function loadEntries() {
  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data.map(toApp)
}

export async function addEntry(entry) {
  const { error } = await supabase.from('entries').insert(toRow(entry))
  if (error) throw error
}

export async function updateEntry(entry) {
  const { error } = await supabase
    .from('entries')
    .update(toRow(entry))
    .eq('id', entry.id)
  if (error) throw error
}

export async function deleteEntry(id) {
  const { error } = await supabase.from('entries').delete().eq('id', id)
  if (error) throw error
}

export async function loadChallengeEntries(challengeId) {
  const { data, error } = await supabase
    .from('challenge_entries')
    .select('*')
    .eq('challenge_id', challengeId)
  if (error) throw error
  const result = {}
  data.forEach(r => { result[`${r.player}||${r.date}`] = String(r.value) })
  return result
}

export async function setChallengeValue(challengeId, player, date, value) {
  const id = `${challengeId}||${player}||${date}`
  const { error } = await supabase.from('challenge_entries').upsert({
    id,
    challenge_id: challengeId,
    player,
    date,
    value: Number(value) || 0,
    updated_at: new Date().toISOString(),
  })
  if (error) throw error
}

export function subscribeToEntries(onInsert, onUpdate, onDelete) {
  return supabase
    .channel('entries-realtime')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'entries' },
      (payload) => onInsert(toApp(payload.new)))
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'entries' },
      (payload) => onUpdate(toApp(payload.new)))
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'entries' },
      (payload) => onDelete(payload.old.id))
    .subscribe()
}

export function subscribeToChallengeEntries(challengeId, onChange) {
  return supabase
    .channel(`challenge-${challengeId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'challenge_entries',
      filter: `challenge_id=eq.${challengeId}` },
      () => onChange())
    .subscribe()
}
