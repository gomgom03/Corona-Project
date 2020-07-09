const express = require('express');
const app = express();
const port = process.env.PORT || 3000;


let server = app.listen(port, () => {
    console.log(`listening to port ${port}`)
})

app.use(express.static('public'))
app.set('view engine', 'ejs');


app.get('/', (req, res) => {
    res.render("home.ejs");
})

app.get('/simulation', (req, res) => {
    res.render("simulation.ejs");
})

app.get('/test', (req, res) => {
    res.render("test.ejs");
})