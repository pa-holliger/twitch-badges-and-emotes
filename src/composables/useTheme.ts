import { readonly, ref } from "vue"

type Theme = "light" | "dark"

const stored = localStorage.getItem("theme") as Theme | null
const theme = ref<Theme>(stored ?? "dark")

function applyTheme(t: Theme) {
  document.documentElement.classList.toggle("dark", t === "dark")
  localStorage.setItem("theme", t)
}

applyTheme(theme.value)

export function useTheme() {
  return {
    theme: readonly(theme),
    toggleTheme() {
      theme.value = theme.value === "dark" ? "light" : "dark"
      applyTheme(theme.value)
    },
  }
}
