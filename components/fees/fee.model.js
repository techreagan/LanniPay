const mongoose = require('mongoose')

const Schema = mongoose.Schema

const FeeSchema = new Schema(
	{
		feeId: {
			type: String,
			required: [true, 'Please add a fee ID'],
			minlength: [8, 'Must be eight(8) characters long'],
			unique: true,
		},
		feeCurrency: {
			type: String,
			minlength: [2, 'Must be two(2) or three(3) characters long'],
			maxlength: [3, 'Must be two(2) or three(3) characters long'],
			required: [true, 'Please add a fee currency'],
		},
		feeLocale: {
			type: String,
			required: [true, 'Please add a FeeLocale'],
			enum: {
				values: ['LOCL', 'INTL', '*'],
				message: '{VALUE} is not a valid fee locale',
			},
		},
		feeEntity: {
			type: String,
			required: [true, 'Please add a fee entity'],
			enum: {
				values: [
					'CREDIT-CARD',
					'DEBIT-CARD',
					'BANK-ACCOUNT',
					'USSD',
					'WALLET-ID',
					'*',
				],
				message: '{VALUE} is not a valid fee entity',
			},
		},
		entityProperty: {
			type: String,
			required: true,
		},
		feeType: {
			type: String,
			required: true,
			enum: {
				values: ['FLAT', 'PERC', 'FLAT_PERC'],
				message: '{VALUE} is not a valid Fee Type',
			},
		},
		feeValue: {
			type: String,
			required: true,
		},
		// email: {
		// 	type: String,
		// 	required: [true, 'Please add an email'],
		// 	unique: true,
		// 	uniqueCaseInsensitive: true,
		// 	match: [
		// 		/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
		// 		'Please add a valid email',
		// 	],
		// },
	},
	{
		timestamps: true,
	}
)

module.exports = mongoose.model('Fee', FeeSchema)
