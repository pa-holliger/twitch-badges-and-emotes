import type { StoredBadge } from "@/composables/useStorage"
import { defineStore } from "pinia"
import { ref } from "vue"
import {
  clearBadges,
  deleteBadge,
  getAllBadges,
  saveBadge,
} from "@/composables/useStorage"

export type Badge = StoredBadge & { url: string }

export const BADGE_LEVELS = [1, 2, 3, 6, 9, 12, 18, 24, 36, 48, 60, 72] as const

export const BADGE_LEVEL_LABELS: Record<number, string> = {
  1: "1 mois",
  2: "2 mois",
  3: "3 mois",
  6: "6 mois",
  9: "9 mois",
  12: "1 an",
  18: "18 mois",
  24: "2 ans",
  36: "3 ans",
  48: "4 ans",
  60: "5 ans",
  72: "6 ans",
}

export const useBadgeStore = defineStore("badges", () => {
  const badges = ref<Badge[]>([])

  async function load() {
    const stored = await getAllBadges()
    badges.value.forEach(b => URL.revokeObjectURL(b.url))
    badges.value = stored.map(b => ({ ...b, url: URL.createObjectURL(b.blob) }))
  }

  async function add(badge: StoredBadge) {
    await saveBadge(badge)
    const existing = badges.value.find(b => b.id === badge.id)
    if (existing)
      URL.revokeObjectURL(existing.url)
    badges.value = [
      ...badges.value.filter(b => b.id !== badge.id),
      { ...badge, url: URL.createObjectURL(badge.blob) },
    ]
  }

  async function remove(id: string) {
    await deleteBadge(id)
    const existing = badges.value.find(b => b.id === id)
    if (existing)
      URL.revokeObjectURL(existing.url)
    badges.value = badges.value.filter(b => b.id !== id)
  }

  async function clear() {
    await clearBadges()
    badges.value.forEach(b => URL.revokeObjectURL(b.url))
    badges.value = []
  }

  return { badges, load, add, remove, clear }
})
