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

	await Fee.deleteMany({})

	const breakConfigSpec = FeeConfigurationSpec.split('\n')

	for (let spec of breakConfigSpec) {
		const splitWithSpace = spec.split(' ')

		validateFeeConfigurationSpec(splitWithSpace, next)

		const feeEntity = splitWithSpace[3].split('(')[0]
		const entityProperty = splitWithSpace[3].split('(')[1].replace(')', '')

		await Fee.create({
			feeId: splitWithSpace[0],
			feeCurrency: splitWithSpace[1],
			feeLocale: splitWithSpace[2],
			feeEntity,
			entityProperty,
			feeType: splitWithSpace[6],
			feeValue: splitWithSpace[7],
		})
	}

	res.status(200).json({ status: 'ok' })
})

// @desc    Fee computation
// @route   POST /compute-transaction-fee
// @access  Public
exports.feeComputation = asyncHandler(async (req, res, next) => {
	const { Amount, Currency, CurrencyCountry, Customer, PaymentEntity } =
		req.body

	let feeLocale = CurrencyCountry === PaymentEntity.Country ? 'LOCL' : 'INTL'

	const fees = await Fee.find()

	const approximateFee = fees.filter(
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

	approximateFee.forEach((fee) => {
		const data = Object.values(fee._doc)
		const occurrence = data.reduce((a, v) => (v === '*' ? a + 1 : a), 0)

		if (occurrence <= num) {
			validFee = fee
		}
		num = occurrence
	})

	if (Object.keys(validFee).length === 0 && validFee.constructor === Object)
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
