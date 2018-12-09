const { genreSchema } = require('./genre');
const mongoose = require('mongoose');
const Joi = require('joi');

const movieSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true,
		trim: true,
		minlength: 5,
		maxlength: 255
	},
	genre: {
		type: genreSchema,
		required: true
	},
	numberInStock: {
		type: Number,
		required: true,
		min: 0,
		max: 255
	},
	dailyRentalRate: {
		type: Number,
		required: true,
		min: 0,
		max: 255,
	}
});

const Movie = mongoose.model('Movie', movieSchema);

function validateMovie(movie) {
	const schema = {
		title: Joi.string().min(5).max(255).required(),
		genreId: Joi.objectId().required(),
		numberInStock: Joi.number().integer().min(0).required(),
		dailyRentalRate: Joi.number().integer().min(0).required()
	};

	const result = Joi.validate(movie, schema);
	return result;
}


exports.Movie = Movie;
exports.validate = validateMovie;
exports.movieSchema = movieSchema;