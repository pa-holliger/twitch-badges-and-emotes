const MAX_SIZE = 128
const GIF_WARN_SIZE = 500 * 1024

export type ProcessedImage = {
  blob: Blob
  sizeWarning: boolean
}

export async function processImage(file: File): Promise<ProcessedImage> {
  if (file.type === "image/gif") {
    return { blob: file, sizeWarning: file.size > GIF_WARN_SIZE }
  }

  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)
      const ratio = Math.min(MAX_SIZE / img.width, MAX_SIZE / img.height, 1)
      const canvas = document.createElement("canvas")
      canvas.width = Math.round(img.width * ratio)
      canvas.height = Math.round(img.height * ratio)
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(
        b => b ? resolve({ blob: b, sizeWarning: false }) : reject(new Error("Compression failed")),
        "image/png",
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("Image load failed"))
    }

    img.src = url
  })
}
