const feesRoutes = require('./components/fees/fees.routes')

module.exports = (app) => {
	app.use(feesRoutes)
}
