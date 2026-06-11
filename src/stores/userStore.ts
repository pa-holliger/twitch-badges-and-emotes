import { defineStore } from "pinia"
import { ref } from "vue"
import { getSetting, setSetting } from "@/composables/useStorage"

export const USERNAME_COLORS = [
  "#ff4500", "#ff0000", "#ff69b4", "#9acd32", "#1e90ff", "#daa520", "#8a2be2",
]

export const useUserStore = defineStore("user", () => {
  const pseudo = ref("")
  const color = ref(USERNAME_COLORS[0])
  const badgeId = ref<string | undefined>()
  const prefix = ref("")

  async function load() {
    const [p, c, bid, pre] = await Promise.all([
      getSetting<string>("user-pseudo"),
      getSetting<string>("user-color"),
      getSetting<string>("user-badge-id"),
      getSetting<string>("emote-prefix"),
    ])
    if (p) pseudo.value = p
    if (c) color.value = c
    if (bid) badgeId.value = bid
    if (pre) prefix.value = pre
  }

  async function save(data: { pseudo: string, color: string, badgeId: string | undefined, prefix: string }) {
    pseudo.value = data.pseudo
    color.value = data.color
    badgeId.value = data.badgeId
    prefix.value = data.prefix
    await Promise.all([
      setSetting("user-pseudo", data.pseudo),
      setSetting("user-color", data.color),
      setSetting("user-badge-id", data.badgeId ?? null),
      setSetting("emote-prefix", data.prefix),
    ])
  }

  return { pseudo, color, badgeId, prefix, load, save }
})
