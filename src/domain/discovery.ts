import { z } from 'zod'

export enum DiscoveryType {
  Label = 'label',
  Artist = 'artist',
  Playlist = 'playlist',
  Set = 'set',
  Release = 'release',
  Story = 'story',
  Party = 'party',
}

export enum PartyKind {
  Event = 'event',
  Series = 'series',
  Collective = 'collective',
  ClubNight = 'club-night',
  Festival = 'festival',
}

export enum RelationType {
  Label = 'label',
  Artist = 'artist',
  Playlist = 'playlist',
  Set = 'set',
  Release = 'release',
  Story = 'story',
  Party = 'party',
  CityScene = 'city-scene',
  Content = 'content',
}

const sourceSchema = z.object({
  url: z.url(),
  label: z.string().min(1),
  kind: z.enum(['original', 'official', 'listen', 'reference']),
})

const geographicLocationSchema = z.object({
  kind: z.literal('geographic'),
  name: z.string().min(1),
  countryCode: z.string().length(2),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
})

const onlineLocationSchema = z.object({
  kind: z.literal('online'),
  name: z.string().min(1),
  countryCode: z.never().optional(),
  latitude: z.never().optional(),
  longitude: z.never().optional(),
})

const locationSchema = z.discriminatedUnion('kind', [geographicLocationSchema, onlineLocationSchema])

const relationSchema = z.object({
  id: z.string().min(1),
  type: z.enum(RelationType),
  label: z.string().min(1),
  reason: z.string().min(1).optional(),
})

const bodyBlockSchema = z.object({
  heading: z.string().min(1).optional(),
  html: z.string().min(1),
})

export const producerTrackSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  bpm: z.number().optional(),
  genre: z.string().optional(),
  duration: z.string().optional(),
  votes: z.number().default(0),
  feedbackCount: z.number().default(0),
  audioUrl: z.string().optional(),
  waveform: z.array(z.number()).optional(),
})

export const producerSocialLinkSchema = z.object({
  platform: z.enum(['instagram', 'soundcloud', 'tiktok', 'spotify', 'bandcamp', 'youtube', 'resident_advisor']),
  label: z.string().min(1),
  url: z.string().url(),
  connectedForVerification: z.boolean().optional(),
})

export const producerStatsSchema = z.object({
  tracks: z.number().default(0),
  votesReceived: z.number().default(0),
  feedbackGiven: z.number().default(0),
  challengesCompleted: z.number().default(0),
})

export const producerProfileSchema = z.object({
  level: z.enum([
    'LEVEL 01 — BEDROOM',
    'LEVEL 02 — EMERGING',
    'LEVEL 03 — CLUB READY',
    'LEVEL 04 — BREAKTHROUGH',
  ]),
  levelNumber: z.number().min(1).max(4),
  xpCurrent: z.number().min(0),
  xpNext: z.number().min(0),
  verified: z.boolean().default(false),
  daw: z.string().optional(),
  genres: z.array(z.string()).optional(),
  city: z.string().optional(),
  stats: producerStatsSchema.optional(),
  achievements: z.array(z.string()).optional(),
  socialLinks: z.array(producerSocialLinkSchema).optional(),
  tracks: z.array(producerTrackSchema).optional(),
})

export type ProducerTrack = z.infer<typeof producerTrackSchema>
export type ProducerSocialLink = z.infer<typeof producerSocialLinkSchema>
export type ProducerStats = z.infer<typeof producerStatsSchema>
export type ProducerProfile = z.infer<typeof producerProfileSchema>

export function isProducerVerified(profile: ProducerProfile | null | undefined): boolean {
  return profile?.socialLinks?.some((link) => link.connectedForVerification === true) ?? false
}

const baseSchema = z.object({
  id: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  kicker: z.string().min(1).optional(),
  coverUrl: z.string().min(1).optional(),
  title: z.string().min(1),
  summary: z.string().min(1),
  publishedAt: z.iso.datetime(),
  originalPublishedAt: z.iso.datetime().optional(),
  primaryLocation: locationSchema,
  tags: z.array(z.string().min(1)),
  sources: z.array(sourceSchema).min(1),
  relations: z.array(relationSchema),
  mapEligible: z.boolean(),
  body: z.array(bodyBlockSchema).optional(),
  producerProfile: producerProfileSchema.optional(),
})

const standardItemSchema = baseSchema.extend({
  type: z.enum([
    DiscoveryType.Label,
    DiscoveryType.Artist,
    DiscoveryType.Playlist,
    DiscoveryType.Set,
    DiscoveryType.Release,
    DiscoveryType.Story,
  ]),
  partyKind: z.never().optional(),
})

const partyItemSchema = baseSchema.extend({
  type: z.literal(DiscoveryType.Party),
  partyKind: z.enum(PartyKind),
})

export const discoveryItemSchema = z.discriminatedUnion('type', [standardItemSchema, partyItemSchema]).superRefine((item, context) => {
  if (item.primaryLocation.kind === 'online' && item.mapEligible) {
    context.addIssue({ code: 'custom', path: ['mapEligible'], message: 'Online items cannot be map eligible' })
  }
  if (item.mapEligible && item.primaryLocation.kind === 'geographic' && (item.primaryLocation.latitude === undefined || item.primaryLocation.longitude === undefined)) {
    context.addIssue({ code: 'custom', path: ['primaryLocation'], message: 'Map eligible geographic items require coordinates' })
  }
})
export const discoveryDatasetSchema = z.array(discoveryItemSchema)
export type DiscoveryItem = z.infer<typeof discoveryItemSchema>
export type DiscoveryBodyBlock = z.infer<typeof bodyBlockSchema>

export const categoryLabels: Record<DiscoveryType, string> = {
  [DiscoveryType.Label]: 'Etichette',
  [DiscoveryType.Artist]: 'Artisti',
  [DiscoveryType.Playlist]: 'Playlist',
  [DiscoveryType.Set]: 'Set',
  [DiscoveryType.Release]: 'Radar',
  [DiscoveryType.Story]: 'Guide',
  [DiscoveryType.Party]: 'Festival',
}
