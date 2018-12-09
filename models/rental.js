const moment = require('moment');
const mongoose = require('mongoose');
const Joi = require('joi');


const customerSchema = mongoose.Schema({
	isGold: {
		type: Boolean,
		default: false
	},
	name: {
		type: String,
		required: true,
		minlength: 5,
		maxlength: 50
	},
	phone: {
		type: String,
		required: true,
		minlength: 5,
		maxlength: 50
	}
});

const movieSchema = mongoose.Schema({
	title: {
		type: String,
		required: true,
		trim: true,
		minlength: 5,
		maxlength: 255
	},
	dailyRentalRate: {
		type: Number,
		required: true,
		min: 0,
		max: 255,
	}
});

const rentalSchema = new mongoose.Schema({
	movie: {
		type: movieSchema ,
		required: true
	},
	customer: {
		type: customerSchema,
		required: true
	},
	dateOut: {
		type: Date,
		required: true,
		default: Date.now
	},
	dateReturned: {
		type: Date,
	},
	rentalFee: {
		type: Number,
		min: 0
	}
});

rentalSchema.statics.lookup = function(customerId, movieId) {
	return this.findOne({
		'customer._id': customerId,
		'movie._id': movieId
	});
};

rentalSchema.methods.return = function () {
	this.dateReturned = new Date();

	const rentalDays = moment().diff(this.dateOut, 'days');
	this.rentalFee = rentalDays * this.movie.dailyRentalRate;
};

const Rental = mongoose.model('Rental', rentalSchema);

function validateRental(rental) {
	const schema = {
		movieId: Joi.objectId().required(),
		customerId: Joi.objectId().required()
	};

	const result = Joi.validate(rental, schema);
	return result;
}

module.exports.Rental = Rental;
module.exports.validate = validateRental;