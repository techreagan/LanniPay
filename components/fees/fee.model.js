const mongoose = require('mongoose')

const Schema = mongoose.Schema

const FeeSchema = new Schema(
	{
		fees: {
			type: [
				new Schema({
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
						required: [true, 'Please add a fee locale'],
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
						required: [true, 'Please add a entity property'],
					},
					feeType: {
						type: String,
						required: [true, 'Please add a fee type'],
						enum: {
							values: ['FLAT', 'PERC', 'FLAT_PERC'],
							message: '{VALUE} is not a valid Fee Type',
						},
					},
					feeValue: {
						type: String,
						required: true,
						validate: {
							validator: function (v) {
								// console.log(this.feeType)
								return this.feeType === 'FLAT_PERC'
									? /\d+:\d+/.test(v)
									: /\d+/.test(v)
							},
							message: (props) => {
								console.log(props)
								return `${props.value} is not the valid format, check fee type`
							},
						},
					},
				}),
			],
			required: true,
		},
	}
	// {
	// 	timestamps: true,
	// }
)

module.exports = mongoose.model('Fee', FeeSchema)
