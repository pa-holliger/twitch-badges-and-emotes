import { ref } from "vue"

const isOpen = ref(false)

export function useUserDialog() {
  return {
    isOpen,
    open: () => { isOpen.value = true },
    close: () => { isOpen.value = false },
  }
}
