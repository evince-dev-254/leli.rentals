/**
 * UUID Generation Utility
 * 
 * Provides UUID v4 generation for the application.
 * Used for creating unique identifiers compatible with Supabase UUID columns.
 */

/**
 * Generates a RFC4122 version 4 compliant UUID
 * @returns A UUID string in the format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 * 
 * @example
 * const id = generateUUID()
 * // => "a3f2c8e9-4b5d-4e7f-9a2c-1234567890ab"
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

/**
 * Validates if a string is a valid UUID
 * @param uuid - The string to validate
 * @returns True if the string is a valid UUID, false otherwise
 * 
 * @example
 * isValidUUID('a3f2c8e9-4b5d-4e7f-9a2c-1234567890ab') // => true
 * isValidUUID('123') // => false
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

/**
 * Generates multiple UUIDs at once
 * @param count - Number of UUIDs to generate
 * @returns Array of UUID strings
 * 
 * @example
 * const ids = generateMultipleUUIDs(3)
 * // => ['uuid1', 'uuid2', 'uuid3']
 */
export function generateMultipleUUIDs(count: number): string[] {
  return Array.from({ length: count }, () => generateUUID())
}

/**
 * Type guard for UUID strings
 */
export type UUID = string & { __brand: 'UUID' }

/**
 * Creates a branded UUID type
 * @param uuid - The UUID string
 * @returns A branded UUID
 */
export function createUUID(uuid: string): UUID {
  if (!isValidUUID(uuid)) {
    throw new Error(`Invalid UUID format: ${uuid}`)
  }
  return uuid as UUID
}

