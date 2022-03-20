const express = require('express')
const {
	createFeeConfigurationSpec,
	feeComputation,
} = require('./fees.controller')

const router = express.Router()

// const validateFee = require('./fees.middleware')

router.post('/fees', createFeeConfigurationSpec)
router.post('/compute-transaction-fee', feeComputation)

module.exports = router
