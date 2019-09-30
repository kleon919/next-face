const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const vizql = require('vizql');
const times = require("lodash.times");
const random = require("lodash.random");
const faker = require("faker");

const db = require("./models");
const {passport, cors} = require('./middle');

const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const {auth} = require('./routes');
const secureRoutes = require('./routes/api');
require('./routes/ws')(io);

app.use(bodyParser.urlencoded({extended: true, limit: "500mb"}));
app.use(bodyParser.json({limit: "500mb"}));
app.use(passport.initialize());
app.use(morgan('combined'));
app.use(cors);

app.get('/schema', vizql(db.sequelize).pageRoute);

app.use('/', auth(passport));
app.use('/api', secureRoutes(db));

app.use((req, res, next) => {
    console.log('http & ws');
    return next();
});

app.use((err, req, res, next) => {
    console.log('General ==> ' + err);
});

db.sequelize.query('DROP SCHEMA IF EXISTS `hola_db`;', {raw: true})
    .then(() => db.sequelize.query('CREATE SCHEMA IF NOT EXISTS `hola_db`;', {raw: true}))
    .then(() => db.sequelize.query('USE `hola_db`;', {raw: true}))
    .then(() => db.sequelize.sync())
    .then(() => {

        db.hotel.bulkCreate(times(10, () => ({
            name: faker.company.companyName(),
            address: faker.address.streetAddress(),
        })))
            .then(() => db.room.bulkCreate(times(20, () => ({
                room_number: random(1, 500),
                type: ['floor', 'top', 'middle'][(random(0, 2))],
                hotelId: random(1, 10)
            }))));

        db.account.bulkCreate(times(10, () => ({
            username: faker.internet.userName(),
            password: faker.internet.password()
        })), {individualHooks: true})
            .then(createdInstances => db.customer.bulkCreate(times(10, (i) => ({
                name: faker.name.firstName(),
                surname: faker.name.lastName(),
                profile_pic: faker.image.imageUrl(),
                genre: ['Male', 'Female'][random(0, 1)],
                country: faker.address.country(),
                accountId: createdInstances[i].dataValues.id
            })), {individualHooks: true}))
            .then(createdInstances => db.booking.bulkCreate(times(10, (i) => ({
                date_from: faker.date.recent(),
                date_to: faker.date.future(),
                type_of_trip: ['work', 'holiday', 'educational'][random(0, 2)],
                customerId: createdInstances[i].dataValues.id,
                hotelId: random(1, 5)
            }))));

        db.account.bulkCreate(times(10, () => ({
            username: faker.internet.userName(),
            password: faker.internet.password()
        })), {individualHooks: true})
            .then(createdInstances => db.staff.bulkCreate(times(10, (i) => ({
                name: faker.name.firstName(),
                surname: faker.name.lastName(),
                profile_pic: faker.image.imageUrl(),
                role: random(1, 3),
                accountId: createdInstances[i].dataValues.id,
                hotelId: random(1, 5)
            })), {individualHooks: true}))
            .then(createdInstances => db.task.bulkCreate(times(10, (i) => ({
                title: faker.lorem.word(),
                body: faker.lorem.paragraph(),
                close_date: faker.date.future(),
                status: ['ON', 'OFF'][random(0, 1)],
                hotelStaffId: createdInstances[i].dataValues.id
            })), {individualHooks: true}))
            .then(createdInstances => db.ticket.bulkCreate(times(10, (i) => ({
                title: faker.lorem.word(),
                content: faker.hacker.phrase(),
                taskId: createdInstances[i].dataValues.id
            }))));

        db.question.bulkCreate([
            {key: 'age', phrase: 'What is your age?'},
            {key: 'age', phrase: 'How old are you?'},
            {key: 'country', phrase: 'Where are you from?'},
            {key: 'country', phrase: 'What is your age?'},
            {key: 'genre', phrase: 'What is your gender?'},
            {key: 'genre', phrase: 'How do you currently describe your gender identity?'}
        ], {individualHooks: true})


    })
    .catch(err => console.log(err));

http.listen(8000, () => console.log('Listening..'));


// app.ws('/ws-login', (ws, req) => {
//
//     // todo: Associate ws connection with the id of the client
//     clients.push(ws)
//
//     ws.on('message', (msg) => {
//         clients.map(con => con.send("Iela mwreeee"))
//         // ws.send(msg + " EVRETHI");
//     });
//
//     ws.on('close', (c) => {
//         console.log(c)
//     })
// });

// app.get('/avout/:num', (req, res) => {
//
//     // todo : require notification-emitter
//
//     if (req.params.num === "0") {
//         clients[0].send('prwtos kai kalos')
//     } else if (req.params.num === "1") {
//         clients[1].send('deuteros kai kalos')
//     } else {
//
//         myEmitter.emit('event');
//     }
//
//     res.send("ntaxei")
//
// });
//


