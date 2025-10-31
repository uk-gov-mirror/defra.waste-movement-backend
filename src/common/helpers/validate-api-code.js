import { ValidationError } from '../helpers/errors/validation-error.js'

export function validateApiCode(requestApiCode, orgApiCodes) {
  const requestOrgid = getOrganisationIdForApiCode(orgApiCodes, requestApiCode)

  if (!requestOrgid) {
    throw new ValidationError('apiCode must be valid')
  }

  return requestOrgid
}

export async function validateRequestOrgIdMatchesOriginalOrgId(
  requestApiCode,
  requestWasteTrackingId,
  db,
  orgApiCodes
) {
  const requestOrgid = validateApiCode(requestApiCode, orgApiCodes)

  const result = await db
    .collection('waste-inputs-history')
    .findOne({ wasteTrackingId: requestWasteTrackingId, revision: 1 })

  if (!Array.isArray(result)) {
    throw new ValidationError('wasteTrackingId must be valid')
  }

  const originalWasteInputApiCode = result[0].receipt.movement.apiCode
  const originalWasteInputOrgId = getOrganisationIdForApiCode(
    orgApiCodes,
    originalWasteInputApiCode
  )

  if (requestOrgid !== originalWasteInputOrgId) {
    throw new ValidationError(
      'apiCode must relate to the same Organisation that created the original waste item record'
    )
  }

  return true
}

function getOrganisationIdForApiCode(orgApiCodes, apiCode) {
  return orgApiCodes.find((orgApiCode) => orgApiCode.apiCode === apiCode)?.orgId
}
