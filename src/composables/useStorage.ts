import { openDB } from "idb"

export type StoredEmote = {
  id: string
  filename: string
  name: string
  prefix: string
  blob: Blob
}

export type StoredBadge = {
  id: string
  filename: string
  level: number
  tier: 1 | 2 | 3
  blob: Blob
}

let dbInstance: Awaited<ReturnType<typeof openDB>> | null = null

async function getDB() {
  if (!dbInstance) {
    dbInstance = await openDB("twitch-emote-badge", 1, {
      upgrade(db) {
        db.createObjectStore("emotes", { keyPath: "id" })
        db.createObjectStore("badges", { keyPath: "id" })
        db.createObjectStore("settings")
      },
    })
  }
  return dbInstance
}

export async function getAllEmotes(): Promise<StoredEmote[]> {
  const db = await getDB()
  return (db.getAll("emotes")) as Promise<StoredEmote[]>
}

export async function saveEmote(emote: StoredEmote): Promise<void> {
  const db = await getDB()
  await db.put("emotes", emote)
}

export async function deleteEmote(id: string): Promise<void> {
  const db = await getDB()
  await db.delete("emotes", id)
}

export async function clearEmotes(): Promise<void> {
  const db = await getDB()
  await db.clear("emotes")
}

export async function getAllBadges(): Promise<StoredBadge[]> {
  const db = await getDB()
  return (db.getAll("badges")) as Promise<StoredBadge[]>
}

export async function saveBadge(badge: StoredBadge): Promise<void> {
  const db = await getDB()
  await db.put("badges", badge)
}

export async function deleteBadge(id: string): Promise<void> {
  const db = await getDB()
  await db.delete("badges", id)
}

export async function clearBadges(): Promise<void> {
  const db = await getDB()
  await db.clear("badges")
}

export async function getSetting<T>(key: string): Promise<T | undefined> {
  const db = await getDB()
  return (db.get("settings", key)) as Promise<T | undefined>
}

export async function setSetting(key: string, value: unknown): Promise<void> {
  const db = await getDB()
  await db.put("settings", value, key)
}
