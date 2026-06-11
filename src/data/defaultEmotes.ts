import type { Emote } from "@/stores/emoteStore"
import kappaUrl from "@/assets/kappa.png"
import lulUrl from "@/assets/lul.png"
import seemsgoodUrl from "@/assets/seemsgood.png"

export const DEFAULT_EMOTES: Emote[] = [
  { id: "__kappa", filename: "kappa.png", name: "Kappa", prefix: "", blob: new Blob(), url: kappaUrl },
  { id: "__lul", filename: "lul.png", name: "LUL", prefix: "", blob: new Blob(), url: lulUrl },
  { id: "__seemsgood", filename: "seemsgood.png", name: "SeemsGood", prefix: "", blob: new Blob(), url: seemsgoodUrl },
]
