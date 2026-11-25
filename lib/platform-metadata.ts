import type { PublishingPlatform } from '@/lib/ingredora-metadata'

export interface ResolvedPlatformMetadata {
  title: string
  description: string
  hashtags: string
  tags: string[]
  pinnedComment: string
  altText: string
}

interface JobMetadataSource {
  platform_metadata?: unknown
  title?: unknown
  description?: unknown
  tags?: unknown
}

type UnknownRecord = Record<string, unknown>

function asRecord(value: unknown): UnknownRecord | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as UnknownRecord)
    : null
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

function parseTags(value: unknown): string[] {
  const values = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(/[,;\n]/)
      : []

  const result: string[] = []
  const seen = new Set<string>()

  for (const raw of values) {
    if (typeof raw !== 'string') continue
    const tag = raw.trim().replace(/^#+/, '')
    const key = tag.toLocaleLowerCase()
    if (!tag || seen.has(key)) continue
    seen.add(key)
    result.push(tag)
  }

  return result
}

/**
 * Resolve metadata for one platform.
 *
 * A valid platform block is authoritative, including intentionally empty
 * values. Legacy jobs without platform_metadata keep the old global fields.
 */
export function getPlatformMetadata(
  job: JobMetadataSource,
  platform: PublishingPlatform,
): ResolvedPlatformMetadata {
  const root = asRecord(job.platform_metadata)
  const platforms = asRecord(root?.platforms)
  const platformBlock = asRecord(platforms?.[platform])

  if (platformBlock) {
    return {
      title: asString(platformBlock.title, asString(job.title)),
      description: asString(platformBlock.description, asString(job.description)),
      hashtags: asString(platformBlock.hashtags),
      tags: parseTags(platformBlock.tags),
      pinnedComment: asString(platformBlock.pinnedComment),
      altText: asString(platformBlock.altText),
    }
  }

  const legacyTags = parseTags(job.tags)

  return {
    title: asString(job.title),
    description: asString(job.description),
    hashtags: legacyTags.map((tag) => '#' + tag).join(' '),
    tags: legacyTags,
    pinnedComment: '',
    altText: '',
  }
}

function normalizeHashtags(value: string): string[] {
  const result: string[] = []
  const seen = new Set<string>()

  for (const raw of value.replace(/[,;\n]/g, ' ').split(/\s+/)) {
    const hashtag = raw
      .trim()
      .replace(/^#+/, '')
      .replace(/[^\p{L}\p{N}_]/gu, '')

    const key = hashtag.toLocaleLowerCase()
    if (!hashtag || seen.has(key)) continue
    seen.add(key)
    result.push('#' + hashtag)
  }

  return result
}

/** Append only hashtags that are not already present in the description. */
export function appendMetadataHashtags(description: string, hashtags: string): string {
  const base = description.trim()
  const existing = new Set<string>()

  for (const match of base.matchAll(/#[\p{L}\p{N}_]+/gu)) {
    existing.add(match[0].toLocaleLowerCase())
  }

  const additions = normalizeHashtags(hashtags)
    .filter((hashtag) => !existing.has(hashtag.toLocaleLowerCase()))

  return [base, additions.join(' ')].filter(Boolean).join(base ? '\n\n' : '').trim()
}

/** Instagram and Threads captions include the platform title before the copy. */
export function formatSocialCaption(metadata: ResolvedPlatformMetadata): string {
  const title = metadata.title.trim()
  const description = appendMetadataHashtags(metadata.description, metadata.hashtags)

  return [title, description].filter(Boolean).join('\n\n').trim()
}
