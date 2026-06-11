import { defineStore } from "pinia"
import { ref } from "vue"
import {
  clearEmotes,
  deleteEmote,
  getAllEmotes,
  saveEmote,
} from "@/composables/useStorage"
import type { StoredEmote } from "@/composables/useStorage"

export type Emote = StoredEmote & { url: string }

export const useEmoteStore = defineStore("emotes", () => {
  const emotes = ref<Emote[]>([])

  async function load() {
    const stored = await getAllEmotes()
    emotes.value.forEach(e => URL.revokeObjectURL(e.url))
    emotes.value = stored.map(e => ({ ...e, url: URL.createObjectURL(e.blob) }))
  }

  async function add(emote: StoredEmote) {
    await saveEmote(emote)
    const existing = emotes.value.find(e => e.id === emote.id)
    if (existing) URL.revokeObjectURL(existing.url)
    emotes.value = [
      ...emotes.value.filter(e => e.id !== emote.id),
      { ...emote, url: URL.createObjectURL(emote.blob) },
    ]
  }

  async function remove(id: string) {
    await deleteEmote(id)
    const existing = emotes.value.find(e => e.id === id)
    if (existing) URL.revokeObjectURL(existing.url)
    emotes.value = emotes.value.filter(e => e.id !== id)
  }

  async function clear() {
    await clearEmotes()
    emotes.value.forEach(e => URL.revokeObjectURL(e.url))
    emotes.value = []
  }

  return { emotes, load, add, remove, clear }
})
