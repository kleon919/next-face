const express = require("express");
const morgan = require("morgan");
const app = express();
const bodyParser = require("body-parser");
const times = require("lodash.times");
const random = require("lodash.random");


const db = require("./models");


const cors = (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE");
    res.header("Access-Control-Allow-Headers", "Authorization");
    res.header("Access-Control-Allow-Credentials", true);
    next();
};

app.use(bodyParser.urlencoded({extended: true, limit: "500mb"}));
app.use(bodyParser.json({limit: "500mb"}));
app.use(cors)
app.use(morgan('combined'));

app.use("/tickets", require("./routes/tickets")(db));


db.sequelize.sync().then(() => {
    // populate user table with dummy data
    db.user.bulkCreate(
        times(10, () => ({
            firstName: "Kleon", //faker.name.firstName(),
            lastName: "Tses", //faker.name.lastName()
        }))
    );
    // populate ticket table with dummy data
    db.ticket.bulkCreate(
        times(10, () => ({
            title: "ela",
            content: "afou", //faker.lorem.paragraph(),
            type: "fhskjdfs",
            userId: random(1, 10)
        }))
    );
    db.question.bulkCreate(
        times(10, () => ({
            content: "What color?"
        }))
    );
})


app.listen(9000, () => console.log('Listening..'));
