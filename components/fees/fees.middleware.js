const ErrorResponse = require('../../utils/errorResponse')
const { validateFeeComputationData } = require('./fees.validation')

const validateFee = (req, res, next) => {
	const { error } = validateFeeComputationData(req.body)

	if (error) {
		const errors = error.details.map((err) => {
			return {
				path: err.path[0],
				message: err.message,
			}
		})
		return next(new ErrorResponse(null, 400, errors))
	}

	next()
}

module.exports = validateFee
