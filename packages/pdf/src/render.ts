import { renderToBuffer, type DocumentProps } from '@react-pdf/renderer'
import type { ReactElement } from 'react'

export async function renderDocumentToBuffer(
  doc: ReactElement,
): Promise<Buffer> {
  return renderToBuffer(doc as ReactElement<DocumentProps>)
}
