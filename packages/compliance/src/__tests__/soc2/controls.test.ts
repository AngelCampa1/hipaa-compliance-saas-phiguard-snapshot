import { describe, it, expect, vi } from 'vitest'
import { listControls } from '../../soc2/controls.js'

type ListControlsDb = Parameters<typeof listControls>[0]

describe('listControls', () => {
  it('returns global controls when no tenantId provided', async () => {
    const globalControls = [
      { id: 'ctrl-1', controlId: 'CC1.1', tenantId: null, title: 'Control Environment' },
    ]
    const mockSelectChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue(globalControls),
    }
    const mockDb = { select: vi.fn().mockReturnValue(mockSelectChain) }

    const result = await listControls(mockDb as ListControlsDb, {})
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'ctrl-1', controlId: 'CC1.1' }),
        expect.objectContaining({ id: 'seed:CC6.1', controlId: 'CC6.1' }),
      ]),
    )
    expect(mockDb.select).toHaveBeenCalled()
    expect(mockSelectChain.where).toHaveBeenCalled()
  })

  it('returns global controls union tenant-specific controls when tenantId provided', async () => {
    const rows = [
      { id: 'ctrl-1', controlId: 'CC1.1', tenantId: null },
      { id: 'ctrl-2', controlId: 'CC1.1', tenantId: 'tenant-123' },
    ]
    const mockSelectChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue(rows),
    }
    const mockDb = { select: vi.fn().mockReturnValue(mockSelectChain) }

    const result = await listControls(mockDb as ListControlsDb, { tenantId: 'tenant-123' })
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'ctrl-1', controlId: 'CC1.1' }),
        expect.objectContaining({ id: 'ctrl-2', controlId: 'CC1.1' }),
        expect.objectContaining({ id: 'seed:CC6.1', controlId: 'CC6.1' }),
      ]),
    )
    expect(mockSelectChain.where).toHaveBeenCalled()
  })

  it('returns bundled seed controls when no controls exist', async () => {
    const mockSelectChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([]),
    }
    const mockDb = { select: vi.fn().mockReturnValue(mockSelectChain) }

    const result = await listControls(mockDb as ListControlsDb, { tenantId: 'tenant-abc' })
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'seed:CC6.1',
          controlId: 'CC6.1',
          tenantId: null,
        }),
      ]),
    )
    expect(result.length).toBeGreaterThan(1)
  })

  it('fills missing bundled controls when the database is partially seeded', async () => {
    const rows = [{ id: 'ctrl-1', controlId: 'CC1.1', tenantId: null }]
    const mockSelectChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue(rows),
    }
    const mockDb = { select: vi.fn().mockReturnValue(mockSelectChain) }

    const result = await listControls(mockDb as ListControlsDb, { tenantId: 'tenant-abc' })

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'ctrl-1', controlId: 'CC1.1' }),
        expect.objectContaining({ id: 'seed:CC6.1', controlId: 'CC6.1' }),
      ]),
    )
  })
})
