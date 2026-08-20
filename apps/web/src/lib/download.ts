export interface TriggerBrowserDownloadInput {
  blob: Blob
  filename: string
}

export interface TriggerBrowserDownloadDeps {
  doc?: Document
  urlApi?: Pick<typeof URL, 'createObjectURL' | 'revokeObjectURL'>
}

export function triggerBrowserDownload(
  input: TriggerBrowserDownloadInput,
  deps: TriggerBrowserDownloadDeps = {},
): void {
  const doc = deps.doc ?? window.document
  const urlApi = deps.urlApi ?? window.URL

  const url = urlApi.createObjectURL(input.blob)
  const link = doc.createElement('a')
  link.href = url
  link.download = input.filename
  link.style.display = 'none'

  try {
    doc.body.appendChild(link)
    link.click()
    doc.body.removeChild(link)
  } finally {
    urlApi.revokeObjectURL(url)
  }
}
