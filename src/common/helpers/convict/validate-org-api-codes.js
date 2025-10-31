import Joi from 'joi'

export const convictValidateOrgApiCodes = {
  name: 'org-api-codes',
  validate: () => Joi.string(),
  coerce: (value) =>
    atob(value)
      .split(',')
      .map((value) => {
        const valueParts = value.split('=')
        return { apiCode: valueParts[0], orgId: valueParts[0] }
      })
}
