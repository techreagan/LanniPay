const express = require('express')
const {
	createFeeConfigurationSpec,
	feeComputation,
} = require('./fees.controller')

const router = express.Router()

router.post('/fees', createFeeConfigurationSpec)
router.post('/compute-transaction-fee', feeComputation)

module.exports = router
