const Joi = require('joi')

const asyncHandler = require('../../middleware/async')
const ErrorResponse = require('../../utils/errorResponse')
const { validateFeeConfigurationSpec } = require('./fees.validation')
const Fee = require('./fee.model')

// @desc    Create fee configuration spec
// @route   POST /fees
// @access  Public
exports.createFeeConfigurationSpec = asyncHandler(async (req, res, next) => {
	const { FeeConfigurationSpec } = req.body

	if (!FeeConfigurationSpec)
		return next(new ErrorResponse(`Please add FeeConfigurationSpec`, 400))

	await Fee.deleteOne()

	const breakConfigSpec = FeeConfigurationSpec.split('\n')

	const fee = new Fee()

	for (let spec of breakConfigSpec) {
		const splitWithSpace = spec.split(' ')

		validateFeeConfigurationSpec(splitWithSpace, next)

		const feeEntity = splitWithSpace[3].split('(')[0]
		const entityProperty = splitWithSpace[3].split('(')[1].replace(')', '')

		fee.fees.push({
			feeId: splitWithSpace[0],
			feeCurrency: splitWithSpace[1],
			feeLocale: splitWithSpace[2],
			feeEntity,
			entityProperty,
			feeType: splitWithSpace[6],
			feeValue: splitWithSpace[7],
		})
	}
	await fee.save()
	res.status(200).json({ status: 'ok' })
})

// @desc    Fee computation
// @route   POST /compute-transaction-fee
// @access  Public
exports.feeComputation = asyncHandler(async (req, res, next) => {
	const { Amount, Currency, CurrencyCountry, Customer, PaymentEntity } =
		req.body

	let feeLocale = CurrencyCountry === PaymentEntity.Country ? 'LOCL' : 'INTL'

	const fees = await Fee.findOne().lean().exec()

	// conso

	const approximateFee = fees.fees.filter(
		(fee) =>
			(fee.feeCurrency === Currency || fee.feeCurrency === '*') &&
			(fee.feeLocale === feeLocale || fee.feeLocale === '*') &&
			(fee.feeEntity === PaymentEntity.Type || fee.feeEntity === '*') &&
			(fee.entityProperty === PaymentEntity.ID ||
				fee.entityProperty === PaymentEntity.Issuer ||
				fee.entityProperty === PaymentEntity.Brand ||
				fee.entityProperty === PaymentEntity.Number ||
				fee.entityProperty === PaymentEntity.SixID ||
				fee.entityProperty === '*')
	)

	let num = Number.POSITIVE_INFINITY
	let validFee = {}

	for (let fee of approximateFee) {
		// approximateFee.forEach((fee) => {
		const data = Object.values(fee)

		// const occurrence = data.reduce((a, v) => (v === '*' ? a + 1 : a), 0)
		// const occurrence = data.filter((v) => v === '*').length
		const occurrence = occ(data, '*')

		if (occurrence <= num) {
			validFee = fee
		}
		num = occurrence
	}

	if (approximateFee.length === 0)
		return res
			.status(400)
			.json({ Error: `No fee configuration for USD transactions` })

	let AppliedFeeValue

	if (validFee.feeType === 'FLAT') {
		AppliedFeeValue = Number(validFee.feeValue)
	} else if (validFee.feeType === 'PERC') {
		AppliedFeeValue = (validFee.feeValue / 100) * Amount
	} else {
		const flatPerc = validFee.feeValue.split(':')
		AppliedFeeValue = Number(flatPerc[0]) + (Number(flatPerc[1]) / 100) * Amount
	}

	AppliedFeeValue = Math.round(AppliedFeeValue)

	const ChargeAmount =
		Customer.BearsFee === true ? Amount + AppliedFeeValue : Amount

	const SettlementAmount = ChargeAmount - AppliedFeeValue

	res.status(200).json({
		AppliedFeeID: validFee.feeId,
		AppliedFeeValue,
		ChargeAmount,
		SettlementAmount,
	})
})

function occ(array, value) {
	let count = 0
	for (let i = 0; i < array.length; i++) {
		if (array[i] === value) count++
	}

	return count
}
