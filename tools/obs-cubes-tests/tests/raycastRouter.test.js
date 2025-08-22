import { describe, it, expect } from 'vitest'
import { pickCenterPlay, isFrontOverlayHit } from '../../../apps/million-song-mind/public/obs-cubes/raycastRouter.js'

describe('raycast router', () => {
    it('picks center play hit for parent', () => {
        const parent = { id: 1 }
        const hit = { object: { userData: { isCenterPlay: true, parent } } }
        const none = { object: { userData: {} } }
        const res = pickCenterPlay([none, hit], parent)
        expect(res).toBe(hit)
    })
    it('detects overlay hit', () => {
        const parent = { userData: {} }
        const overlay = {}
        parent.userData.overlay = overlay
        const hit = { object: overlay }
        expect(isFrontOverlayHit(hit, parent)).toBe(true)
    })
})


