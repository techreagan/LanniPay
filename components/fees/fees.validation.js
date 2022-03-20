const Joi = require('joi')

function validateFeeConfigurationSpec(spec, next) {
	if (spec[4] !== ':')
		return next(
			new ErrorResponse(`Please add ':' after the fourth(4th) word`, 400)
		)

	if (spec[5] !== 'APPLY')
		return next(
			new ErrorResponse(`Please add 'APPLY' after the fifth(5th) word`, 400)
		)

	if (spec.length !== 8)
		return next(
			new ErrorResponse(
				`Fee configuration spec must be eight(8) words long`,
				400
			)
		)
}

function validateFeeComputationData(data) {
	let stringSixID = Joi.string().length(6)
	let numSixID = Joi.number().min(100000).max(999999).integer()

	const schema = Joi.object({
		ID: Joi.number().required(),
		Amount: Joi.number().positive().required(),
		Currency: Joi.string().required(),
		CurrencyCountry: Joi.string().required(),
		Customer: Joi.object().keys({
			ID: Joi.number().required(),
			EmailAddress: Joi.string().email().required(),
			FullName: Joi.string().required(),
			BearsFee: Joi.boolean().required(),
		}),
		PaymentEntity: Joi.object().keys({
			ID: Joi.number().required(),
			Issuer: Joi.string().required(),
			Brand: Joi.string().allow('', null),
			Number: Joi.string().required(),
			SixID: Joi.alternatives().try(stringSixID, numSixID).required(),
			Type: Joi.string().required(),
			Country: Joi.string().required(),
		}),
	})

	return schema.validate(data, { abortEarly: false })
}

module.exports = { validateFeeConfigurationSpec, validateFeeComputationData }
