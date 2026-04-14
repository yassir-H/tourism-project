const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet')
const hpp = require('hpp')
const mongoSanitize = require('express-mongo-sanitize')
const rateLimit = require('express-rate-limit');
const { number } = require('joi');

mongoose.connect("mongodb://127.0.0.1:27017/tourism_db")
.then(()=> console.log("connected to mongodb"))
.catch((err)=> console.error("mongodb connection error", err));
const app = express();
app.use((req, res, next) => {
    Object.defineProperty(req, 'query', {
        value: { ...req.query },
        writable: true,
        configurable: true,
        enumerable: true,
    });
    next();
});

app.use(express.json())
app.use(mongoSanitize())
app.use(helmet());
app.use(cors());

app.use(cors({
    origin: "http://localhost:5173"
}))

app.use(hpp());

const limiter = rateLimit({
    windowMs : 15*60*1000,
    max : 100
});

app.use('/api', limiter);

const authenticate = (req,res,next) =>{
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer')){
        return  res.status(401).send("access denied");
    }
    const token = authHeader.split(' ')[1];
try{
const verified = jwt.verify(token, 'secretKey');
req.user = verified;
next();
}catch(err) {
    res.status(400).send("invalid token")
}

}

app.get('/api/test', (req,res)=>{
    res.send({message: "Backend is connected  man"})
});

const DestinationSchema = new mongoose.Schema({
    title: {type: String, required: true},
    description: {type: String, required: true},
    location: {type: String, required: true},
    price :{ type: Number, required: true},
    image: {type : String, required : true}
})

const Destination = mongoose.model('Destination', DestinationSchema)

const UserSchema = new mongoose.Schema({
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    favorites: [{type: mongoose.Schema.Types.ObjectId, ref: 'Destination'}]
})
const User = mongoose.model('User', UserSchema);

const BookingSchema = new mongoose.Schema({
    userId: { type : mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    destinationId : {type :mongoose.Schema.Types.ObjectId, ref: 'Destination', required : true},
    date : {type: String, required: true}
})

const Booking = mongoose.model('Booking', BookingSchema);
app.post('/api/bookings', authenticate, async (req,res) =>{
    try {
        const newBooking = new Booking(
            {userId: req.user._id,
                 destinationId: req.body.destinationId, 
                 date: req.body.date
     } );
        await newBooking.save();
        res.status(201).send({message: "Booking saved to Database"})

    }catch (error){
        res.status(400).send({message : "Error saving booking"})
    }
})
// to fill the db we create a seed route
app.post('/api/destinations/seed', async (req,res)=>{
    const sampleDestinations = [
        {title: "paris", description: 'visit eiffel tower', location: 'france', price: 1200, image: 'https://unsplash.com'},
        {title: "bali retreat", description: 'relax on the beaches ', location: 'indonesia', price: 800, image: 'https://unsplash.com'},
        {title: "swiss alps", description: 'hiking', location: 'switzerland', price: 1200, image: 'https://unsplash.com'}
    ];
    await Destination.insertMany(sampleDestinations);
    res.send({message: "db seeded"})
})

app.get('/api/destinations', async (req,res) =>{
    const destinations = await Destination.find();
    res.send(destinations)
})

app.get('/api/destinations/:id', async (req,res) =>{
  try{  const destination = await Destination.findById(req.params.id)
    res.send(destination);}
    catch(error){
        res.status(404).send({message: "destination not found"})
    }
})


app.post('/api/favorites/:id', authenticate, async(req,res)=>{
    try{
        const user = await User.findById(req.user._id);
        const  index = user.favorites.indexOf(req.params.id)
    if(index === -1){
        user.favorites.push(req.params.id);
    }else{
        user.favorites.splice(index, 1)
    }
await user.save();
res.send(user.favorites);

    }catch(error){
        res.status(400).send({message: "error updating favorites"})
    }
});

app.get('/api/dashboard', authenticate, async (req, res)=>{
    try{
        const user = await User.findById(req.user._id).populate('favorites');

        const bookings = await Booking.find({userId: req.user._id}).populate('destinationId')

        console.log("user favorites", user.favorites)
    res.send({
        favorites: user.favorites,
        bookings: bookings
    })

    }catch (error){
        res.status(500).send({message: "error fetching dashboard data"})
    }

})
app.post('/api/register', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        
        const user = new User({ 
            email: req.body.email, 
            password: hashedPassword 
        });

        await user.save();
        res.status(201).send({ message: "Registration Successful!" });
    } catch (error) {
        res.status(400).send({ message: "User already exists or data invalid" });
    }
});


app.post('/api/login', async (req, res) => {
 
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send({ message: "Invalid Email or Password" });

    
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(400).send({ message: "Invalid Email or Password" });

    
    const token = jwt.sign({ _id: user._id }, 'secretKey'); 
    res.send({ token, message: "Login Successful!" });
});
const port = 5000;
app.listen(port , ()=> console.log(`server running on port ${port}`)
);