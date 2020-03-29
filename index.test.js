let server = require('../index');
let mongoose = require("mongoose");
let Event = require('../models/event');
let Booking = require('../models/booking');

const apiPath = '/api/';
const version = 'v1';
var mongoURI = 'mongodb://localhost:27017/eventbackend';
var port = process.env.PORT || 3000;

//These are the actual modules we use
let chai = require('chai');
let should = chai.should();
let chaiHttp = require('chai-http');
chai.use(chaiHttp);



describe('Endpoint tests', () => {
    //###########################
    //These variables contain the ids of the existing event/booking
    //That way, you can use them in your tests (e.g., to get all bookings for an event)
    //###########################
    let eventId = '';
    let bookingId = '';

    it("GET /events", function (done) {
        chai.request('http://localhost:3000'+apiPath + version).get('/events').end( (err,res) => {
            chai.expect(res).to.have.status(200);
            chai.expect(res).to.be.json;
            chai.expect(res.body).to.be.a('array');
            chai.expect(res.body.length).to.eq(1);

            done();
        });
    });
    
    it("GET /events/"+eventId, function (done) {
        chai.request('http://localhost:3000'+apiPath + version).get('/events/'+eventId).end( (err,res) => {
            chai.expect(res).to.have.status(200);
            chai.expect(res).to.be.json;
            // console.log(res.body);
            chai.expect(res.body).to.have.all.keys(['_id','capacity','endDate','startDate','name','bookings','description','location']);
            chai.expect(res.body.name).to.be.a('string');
            chai.expect(res.body.bookings).to.be.a('array');
            chai.expect(res.body.description).to.be.a('string');
            chai.expect(res.body.location).to.be.a('string');
            chai.expect(res.body.capacity).to.be.a('number');

            done();
        });
    });

    it("POST /events", function (done) {
        chai.request('http://localhost:3000' + apiPath + version)
        .post('/events')
        .set('Content-Type', 'application/json')
        .send({
            name: 'The Hills Have Eyes',
            description: 'A scary film',
            location: 'My basement',
            bookings: [],
            capacity: 10,
            startDate: new Date(2020,03,11,1,0,0,0),
            endDate: new Date(2020,03,11,3,0,0,0),
        })
        .end( (err,res,body) => {
            chai.expect(res).to.have.status(201);
            chai.expect(res.body).to.contain.key('_id');
            done();
        });
    });

    it("DELETE from /events with authentication", function (done) {

        chai.request('http://localhost:3000' + apiPath + version)
        .delete('/events/'+eventId+'/bookings/'+bookingId)
        .set({name:'admin',password:'secret'})
        .end( (err,res,body) => {
            chai.expect(res).to.have.status(200);
            done();
        });
    });

    it("FAILURE from /events with authentication", function (done) {

        chai.request('http://localhost:3000' + apiPath + version)
        .delete('/events/'+eventId+'/bookings/'+bookingId)
        .set({name:'admin',password:'wrong password'})
        .end( (err,res,body) => {
            chai.expect(res).to.not.have.status(200);
            done();
        });
    });

    it("GET /events/:eventId/bookings", function (done) {
        chai.request('http://localhost:3000'+apiPath + version).get('/events/'+eventId+'/bookings').end( (err,res) => {
            chai.expect(res).to.have.status(200);
            chai.expect(res).to.be.json;
            chai.expect(res.body).to.be.a('array');
            chai.expect(res.body.length).to.eq(1);

            done();
        });
    });


    //###########################
    //The beforeEach function makes sure that before each test, 
    //there is exactly one event and one booking (for the existing event).
    //The ids of both are stored in eventId and bookingId
    //###########################
    beforeEach((done) => {
        let event = new Event({ name: "Test Event", capacity: 10, startDate: 1590840000000, endDate: 1590854400000});

        Event.deleteMany({}, (err) => {
            Booking.deleteMany({}, (err) => {
                event.save((err, ev) => {
                    let booking = new Booking({ eventId: ev._id, firstName: "Jane", lastName: "Doe", email: "jane@doe.com", spots: 2 });
                    booking.save((err, book) => {
                        eventId = ev._id;
                        bookingId = book._id;
                        done();
                    });
                });
            });
        });
    });

    //###########################
    //Write your tests below here
    //###########################

    it("should always pass", function() {
        console.log("Our event has id " + eventId);
        console.log("Our booking has id " + bookingId);
        chai.expect(1).to.equal(1);
    });
});