import dotenv from 'dotenv'
dotenv.config()

import config from './config/config.js' 
import app from './server/express.js'
// importing dns and setting servers to 8.8.8.8 if it is NEEDED FOR: 
// v24.14.x, v24.15.x and above (including v26, v25, v24.15.0, v24.16.0, etc) 
// for your computer system configuration if it connects to the database without
// the dns then its okay in that case you don't need the next two line of script on dns.
import dns from 'dns';
dns.setServers(['8.8.8.8'])
import mongoose from 'mongoose' 
mongoose.Promise = global.Promise
mongoose.connect(config.mongoUri, { 
//useNewUrlParser: true,
//useCreateIndex: true, 
//useUnifiedTopology: true
 } )
.then(() => {
console.log("Connected to the database!");
})
 
mongoose.connection.on('error', () => {
throw new Error(`unable to connect to database: ${config.mongoUri}`) 
})
app.get("/", (req, res) => {
res.json({ message: "Welcome to User application." });
});
app.listen(config.port, (err) => { 
if (err) {
console.log(err) 
}
console.info('Server started on port %s.', config.port) 
})

