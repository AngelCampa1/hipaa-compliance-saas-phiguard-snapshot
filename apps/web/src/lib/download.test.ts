import { describe, expect, it } from 'vitest'
import { triggerBrowserDownload } from './download'

describe('triggerBrowserDownload', () => {
  it('calls createObjectURL with the blob and assigns the url to the anchor href', () => {
    const blob = new Blob(['hello'], { type: 'text/plain' })
    const objectUrl = 'blob:fake-url-1'
    const callLog: string[] = []

    const link = {
      href: '',
      download: '',
      style: { display: '' },
      click: () => { callLog.push('click') },
    }

    const body = {
      appendChild: (_el: unknown) => { callLog.push('append') },
      removeChild: (_el: unknown) => { callLog.push('remove') },
    }

    const doc = {
      createElement: (_tag: string) => link,
      body,
    } as unknown as Document

    const urlApi = {
      createObjectURL: (b: Blob) => {
        expect(b).toBe(blob)
        return objectUrl
      },
      revokeObjectURL: (_url: string) => { callLog.push('revoke') },
    }

    triggerBrowserDownload({ blob, filename: 'test.txt' }, { doc, urlApi })

    expect(link.href).toBe(objectUrl)
    expect(link.download).toBe('test.txt')
  })

  it('sets display none on the anchor', () => {
    const blob = new Blob(['x'], { type: 'text/plain' })
    const link = {
      href: '',
      download: '',
      style: { display: '' },
      click: () => {},
    }
    const body = {
      appendChild: (_el: unknown) => {},
      removeChild: (_el: unknown) => {},
    }
    const doc = {
      createElement: (_tag: string) => link,
      body,
    } as unknown as Document
    const urlApi = {
      createObjectURL: () => 'blob:fake',
      revokeObjectURL: () => {},
    }

    triggerBrowserDownload({ blob, filename: 'file.pdf' }, { doc, urlApi })

    expect(link.style.display).toBe('none')
  })

  it('enforces call order: append → click → remove, then revoke', () => {
    const blob = new Blob(['data'], { type: 'application/pdf' })
    const callLog: string[] = []

    const link = {
      href: '',
      download: '',
      style: { display: '' },
      click: () => { callLog.push('click') },
    }
    const body = {
      appendChild: (_el: unknown) => { callLog.push('append') },
      removeChild: (_el: unknown) => { callLog.push('remove') },
    }
    const doc = {
      createElement: (_tag: string) => link,
      body,
    } as unknown as Document
    const urlApi = {
      createObjectURL: () => 'blob:ordered-url',
      revokeObjectURL: (_url: string) => { callLog.push('revoke') },
    }

    triggerBrowserDownload({ blob, filename: 'doc.pdf' }, { doc, urlApi })

    expect(callLog).toEqual(['append', 'click', 'remove', 'revoke'])
  })

  it('revokes the object url even if click throws', () => {
    const blob = new Blob(['oops'])
    const callLog: string[] = []
    const objectUrl = 'blob:error-url'

    const link = {
      href: '',
      download: '',
      style: { display: '' },
      click: () => { throw new Error('click failed') },
    }
    const body = {
      appendChild: (_el: unknown) => { callLog.push('append') },
      removeChild: (_el: unknown) => { callLog.push('remove') },
    }
    const doc = {
      createElement: (_tag: string) => link,
      body,
    } as unknown as Document
    const urlApi = {
      createObjectURL: () => objectUrl,
      revokeObjectURL: (url: string) => {
        expect(url).toBe(objectUrl)
        callLog.push('revoke')
      },
    }

    expect(() =>
      triggerBrowserDownload({ blob, filename: 'bad.pdf' }, { doc, urlApi }),
    ).toThrow('click failed')

    expect(callLog).toContain('revoke')
  })

  it('revokeObjectURL is called with the same url that createObjectURL returned', () => {
    const blob = new Blob(['content'])
    const objectUrl = 'blob:specific-url-xyz'
    let revokedUrl = ''

    const link = {
      href: '',
      download: '',
      style: { display: '' },
      click: () => {},
    }
    const body = {
      appendChild: (_el: unknown) => {},
      removeChild: (_el: unknown) => {},
    }
    const doc = {
      createElement: (_tag: string) => link,
      body,
    } as unknown as Document
    const urlApi = {
      createObjectURL: () => objectUrl,
      revokeObjectURL: (url: string) => { revokedUrl = url },
    }

    triggerBrowserDownload({ blob, filename: 'cleanup.pdf' }, { doc, urlApi })

    expect(revokedUrl).toBe(objectUrl)
  })
})
