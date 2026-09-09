const signatures: Record<string, number[][]> = {
  'image/jpeg': [[0xff, 0xd8, 0xff]],
  'image/png': [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
  'image/webp': [[0x52, 0x49, 0x46, 0x46]],
  'image/gif': [
    [0x47, 0x49, 0x46, 0x38, 0x37, 0x61],
    [0x47, 0x49, 0x46, 0x38, 0x39, 0x61],
  ],
  'application/pdf': [[0x25, 0x50, 0x44, 0x46]],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [[0x50, 0x4b]],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [[0x50, 0x4b]],
}

export function hasExpectedFileSignature(mediaType: string, bytes: Uint8Array) {
  const expected = signatures[mediaType]
  if (!expected) return mediaType === 'text/plain' || mediaType === 'text/csv'
  if (mediaType === 'image/webp') {
    return (
      expected[0].every((byte, index) => bytes[index] === byte) &&
      [0x57, 0x45, 0x42, 0x50].every((byte, index) => bytes[index + 8] === byte)
    )
  }
  return expected.some((signature) => signature.every((byte, index) => bytes[index] === byte))
}

export function sanitizeAttachmentName(name: string) {
  const normalized = name
    .normalize('NFKC')
    .replace(/[\u0000-\u001F\u007F/\\]/g, '-')
    .trim()
  return normalized.slice(0, 180) || 'lampiran'
}
