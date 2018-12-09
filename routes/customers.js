// const mongoose = require('mongoose');
// const Joi = require('joi');
const auth = require('../middleware/auth');
const {Customer, validate} = require('../models/customer');
const express = require('express');
const router = express.Router();


router.get('/', async (req, res) => {
	const customers = await Customer.find().sort('name');
	res.send(customers);
});

router.get('/:id', async (req, res) => {
	const customer = await Customer.findById(req.params.id);
	if(!customer) return res.status(404).send('A custmoer with given id is not found.');
	res.send(customer);
});

router.post('/', auth, async (req, res) => {
	const newCustomer = req.body;
	const {error} = validate(newCustomer);
	if(error) return res.status(400).send(error.details[0].message);

	const customer = new Customer({
		name: newCustomer.name,
		isGold: newCustomer.isGold,
		phone: newCustomer.phone
	});

	await customer.save();
	res.send(customer);
});


router.put('/:id', auth, async (req, res) => {
	const newCustomer = req.body;
	const {error} = validate(newCustomer);
	if(error) return res.satus(400).send(error.detials[0].message);

	const customer = await Customer.findByIdAndUpdate(
		req.params.id,
	 	{
	 		$set: {
		 		name: newCustomer.name,
				isGold: newCustomer.isGold,
				phone: newCustomer.phone
	 		}
	 	},
	 	{ new: true}
	 );

	if(!customer) return res.status(404).send(`A custmoer with ${req.params.id} is not exist.`);

	res.send(customer);
});

router.delete('/:id', auth, async (req, res) => {
	const customer = await Customer.findByIdAndRemove(req.params.id);

	if(!Customer) return res.status(404).send(`A custmoer with ${req.params.id} is not exist.`);

	res.send(customer);
});


module.exports = router;