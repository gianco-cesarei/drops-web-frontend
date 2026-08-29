import { describe, expect, it } from 'vitest'
import { DiscoveryType, PartyKind, discoveryItemSchema, isProducerVerified } from './discovery'
import { developmentDiscoveryItems } from '../data/discovery.fixture'

const base = {
  id: 'test', slug: 'test-item', title: 'Test', summary: 'Test summary', type: DiscoveryType.Story,
  publishedAt: '2026-08-15T10:00:00.000Z', primaryLocation: { kind: 'geographic' as const, name: 'Lisbon', countryCode: 'PT' },
  tags: [], relations: [], mapEligible: false,
}

describe('DiscoveryItem schema', () => {
  it('valida dataset fixture development', () => {
    expect(developmentDiscoveryItems).toHaveLength(10)
  })

  it('richiede almeno una fonte', () => {
    expect(() => discoveryItemSchema.parse({ ...base, sources: [] })).toThrow()
  })

  it('richiede partyKind per Party', () => {
    expect(() => discoveryItemSchema.parse({ ...base, type: DiscoveryType.Party, sources: [{ url: 'https://example.com', label: 'Source', kind: 'original' }] })).toThrow()
    expect(discoveryItemSchema.parse({ ...base, type: DiscoveryType.Party, partyKind: PartyKind.Event, sources: [{ url: 'https://example.com', label: 'Source', kind: 'original' }] }).partyKind).toBe(PartyKind.Event)
  })

  it.each(['original', 'official', 'listen', 'reference'] as const)('accetta fonte %s', (kind) => {
    expect(discoveryItemSchema.parse({ ...base, sources: [{ url: 'https://example.com', label: 'Source', kind }] }).sources[0].kind).toBe(kind)
  })

  it.each([PartyKind.Event, PartyKind.Series, PartyKind.Collective, PartyKind.ClubNight, PartyKind.Festival])('accetta partyKind %s', (partyKind) => {
    expect(discoveryItemSchema.parse({ ...base, type: DiscoveryType.Party, partyKind, sources: [{ url: 'https://example.com', label: 'Source', kind: 'official' }] }).partyKind).toBe(partyKind)
  })

  it('richiede countryCode per luogo geografico', () => {
    expect(() => discoveryItemSchema.parse({ ...base, primaryLocation: { kind: 'geographic', name: 'Lisbon' }, sources: [{ url: 'https://example.com', label: 'Source', kind: 'original' }] })).toThrow()
  })

  it('richiede coordinate quando mapEligible è true', () => {
    expect(() => discoveryItemSchema.parse({ ...base, mapEligible: true, sources: [{ url: 'https://example.com', label: 'Source', kind: 'original' }] })).toThrow()
  })

  it('vieta paese e mapEligible per luogo online', () => {
    expect(() => discoveryItemSchema.parse({ ...base, mapEligible: true, primaryLocation: { kind: 'online', name: 'Online' }, sources: [{ url: 'https://example.com', label: 'Source', kind: 'original' }] })).toThrow()
    expect(() => discoveryItemSchema.parse({ ...base, primaryLocation: { kind: 'online', name: 'Online', countryCode: 'IT' }, sources: [{ url: 'https://example.com', label: 'Source', kind: 'original' }] })).toThrow()
    expect(discoveryItemSchema.parse({ ...base, primaryLocation: { kind: 'online', name: 'Online' }, sources: [{ url: 'https://example.com', label: 'Source', kind: 'original' }] }).mapEligible).toBe(false)
  })

  it('valida profilo producer con livelli, tracce e badge', () => {
    const itemWithProducer = discoveryItemSchema.parse({
      ...base,
      type: DiscoveryType.Artist,
      sources: [{ url: 'https://soundcloud.com/alex-rossi', label: 'SoundCloud', kind: 'official' }],
      producerProfile: {
        level: 'LEVEL 03 — CLUB READY',
        levelNumber: 3,
        xpCurrent: 740,
        xpNext: 1000,
        verified: true,
        daw: 'Ableton Live 12',
        genres: ['Minimal', 'Microhouse'],
        city: 'Roma, IT',
        stats: { tracks: 4, votesReceived: 184, feedbackGiven: 47, challengesCompleted: 3 },
        achievements: ['TOP 10 — MAY 2026', 'CHALLENGE WINNER'],
        socialLinks: [
          { platform: 'instagram', label: 'Instagram', url: 'https://instagram.com/alexrossi', connectedForVerification: true },
        ],
        tracks: [
          { id: 'trk-1', title: 'Orbital Resonance', bpm: 126, genre: 'Microhouse', votes: 84, feedbackCount: 12 },
        ],
      },
    })
    expect(itemWithProducer.producerProfile?.verified).toBe(true)
    expect(itemWithProducer.producerProfile?.level).toBe('LEVEL 03 — CLUB READY')
    expect(itemWithProducer.producerProfile?.tracks).toHaveLength(1)
  })

  it('deriva verifica solo da presenza esterna collegata', () => {
    const profile = discoveryItemSchema.parse({
      ...base,
      type: DiscoveryType.Artist,
      sources: [{ url: 'https://example.com/artist', label: 'Artist', kind: 'official' }],
      producerProfile: {
        level: 'LEVEL 01 — BEDROOM', levelNumber: 1, xpCurrent: 0, xpNext: 100, verified: true,
        socialLinks: [{ platform: 'instagram', label: 'Instagram', url: 'https://instagram.com/test', connectedForVerification: false }],
      },
    }).producerProfile
    expect(isProducerVerified(profile)).toBe(false)
    expect(isProducerVerified({ ...profile!, socialLinks: [{ platform: 'instagram', label: 'Instagram', url: 'https://instagram.com/test', connectedForVerification: true }] })).toBe(true)
  })
})
