import { parseDid, isDidValid } from '../index'

const mockIdentifier = 'BAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD'
const mockDID = `did:hypns:${mockIdentifier}`
const mockInvalidDID = `${mockIdentifier}`

describe('parseDid', () => {
  it('should parse DID correctly', async () => {
    const result = await parseDid(mockDID)

    expect(result).toEqual({ method: 'hypns', identifier: mockIdentifier })
  })

  it('should fail if invalid DID', async () => {
    expect(() => parseDid('foo:bar:a1b2c3')).toThrow('Invalid DID: foo:bar:a1b2c3')
  })
})

describe('isDidValid', () => {
  it('should validate did or not', async () => {
    expect(isDidValid(mockDID)).toBe(true)
    expect(isDidValid(mockInvalidDID)).toBe(false)
  })
})
