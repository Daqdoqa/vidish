const request = require('supertest');
const {Genre} = require('../../models/genre');
const {User} = require('../../models/user');
const mongoose = require('mongoose');

let server;

describe('/api/geners', () => {
	beforeEach(() => { server = require('../../index'); });
	afterEach(async () => {
		await Genre.remove({});
		await server.close();
	});

	describe('GET /', () => {
		it('should return all genres', async () => {
			Genre.collection.insertMany([
				{ name: "genre1" },
				{ name: "genre2" }
			]);

			const res = await request(server).get('/api/genres');

			expect(res.status).toBe(200);
			expect(res.body.length).toBe(2);
			expect(res.body.some(g => g.name === 'genre1')).toBeTruthy();
			expect(res.body.some(g => g.name === 'genre1')).toBeTruthy();
		});
	});

	describe('GET /:id', () => {
		it('should return a genre if valid id is passed', async () => {
			const genre = new Genre({ name: 'genre1' });
			await genre.save();

			const res = await request(server).get(`/api/genres/${genre._id}`);

			expect(res.status).toBe(200);
			expect(res.body).toHaveProperty('name', genre.name);
		});

		it('should return 404 Error if invalid id is passed', async () => {
			const res = await request(server).get('/api/genres/1');

			expect(res.status).toBe(404);
		});

		it('should return 404 Error if no genre is found', async () => {
			const id = new mongoose.Types.ObjectId();

			const res = await request(server).get('/api/genres/' + id);

			expect(res.status).toBe(404);
		});
	});

	describe('POST /', () => {
		let token;
		let name;

		const exec = async () => {
			return await request(server)
				.post('/api/genres')
				.set('x-auth-token', token)
				.send({ name });
		}

		beforeEach(() => {
			token =  new User().generateAuthToken();
			name = 'genre1';
		})

		it('should return 401 error if the client is not logged in', async () => {
			token = '';

			const res = await exec();

			expect(res.status).toBe(401);
		});

		it('should return 400 error if genre is less than 5 characters', async () => {
			name = '1234';

			const res = await exec();

			expect(res.status).toBe(400);
		});

		it('should return 400 error if genre is more than 50 characters', async () => {
			name = new Array(52).join('a');

			const res = await exec();

			expect(res.status).toBe(400);
		});

		it('should save the genre if it is valid', async () => {
			await exec();

			const genre = await Genre.find({name: 'genre1' });

			expect(genre).not.toBeNull();
		});

		it('should return the genre if it is valid', async () => {
			const res = await exec();

			expect(res.body).toHaveProperty('_id');
			expect(res.body).toHaveProperty('name', 'genre1');
		});
	});

	describe('PUT /:id', () => {
		let id;
		let token;
		let name;

		const exec = async function () {
			return await request(server)
				.put('/api/genres/' + id)
				.set('x-auth-token', token)
				.send({ name });
		}

		const execNewGenre = function () {
			return request(server)
				.post('/api/genres/')
				.set('x-auth-token', token)
				.send({ name });
		}

		beforeEach(() => {
			id = new mongoose.Types.ObjectId();
			token = new User().generateAuthToken();
			name = 'genre1';
		});

		it('should return 401 if client is not logged in', async () => {
			token = '';

			const res = await exec();

			expect(res.status).toBe(401);
		});

		it('should return 404 if invalid id is passed.', async () => {
			id = 1;

			const res = await exec();

			expect(res.status).toBe(404);
		});

		it('should return 400 error if genre name is less than 5 characters', async () => {
			//TODO: create a new genre to modify it
			name = '1234';

			const res = await exec();

			//TODO:
			// console.log(res.body); // empty
			// console.log(res.status);

			expect(res.status).toBe(400);
		});

		it('should return 400 error if genre name is greater than 50 characters', async () => {
			name = new Array(52).join('a');

			const res = await exec();

			expect(res.status).toBe(400);
		});

		it('sould return 404 error if genre with given id is not found', async () => {
			const res  = await exec();

			expect(res.status).toBe(404);
		});

		it('should update the genre if pass valid id and name', async () => {
			let res = await execNewGenre();

			id = res.body._id;
			name = 'updatedGenre1';
			res = await exec();

			expect(res.status).toBe(200);
			expect(res.body).toHaveProperty('_id');
			expect(res.body).toHaveProperty('name', name);
		});
	});

	describe('DELETE /', () => {
		let id;
		let genre;
		let token;

		const exec = async () => {
			return await request(server)
				.delete('/api/genres/' + id)
				.set('x-auth-token', token)
				.send();
		}

		beforeEach( async () => {
			genre = new Genre({name: 'genre1'});
			await genre.save();

			id = genre._id;
			token = new User({ isAdmin: true }).generateAuthToken();
		});

		it('should return 401 if client is not logged in', async () => {
			token = '';

			const res = await exec();

			expect(res.status).toBe(401);
		});

		it('should return 403 if client is not an Admin', async () => {
			token = new User({isAdmin: false}).generateAuthToken();

			const res = await exec();

			expect(res.status).toBe(403);
		});


		it('should return 404 if id is invalid', async () => {
			id = 1;

			const res = await exec();

			expect(res.status).toBe(404);
		});

		it('should return 404 if genre with given id is not found', async () => {
			id = new mongoose.Types.ObjectId();

			const res = await exec();

			expect(res.status).toBe(404);
		});

		it('should delete genre if input is valid', async () => {
			await exec();

			const genreInDb = await Genre.findById(id);

			expect(genreInDb).toBeNull();
		});

		it('should return the removed genre', async () => {
			const res  = await exec();

			expect(res.body).toHaveProperty('_id', genre._id.toHexString());
			expect(res.body).toHaveProperty('name', genre.name);
		});
	});
});