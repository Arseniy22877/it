const {Router} = require('express')
const router = Router()
const blank = require('./models/blank')
const sendMessage = require('./index')
var bodyParser = require('body-parser')
const sendM = require('./index')
   
var jsonParser = bodyParser.json();

router.get('/', (req, res) => {
    res.render("index");
})

router.get('/login', (req, res) => {
    res.render("login");
})

router.post('/login', jsonParser, async (req, res) => {
    if(await blank.findOne({ip:req.ip})){
        res.redirect('/');
        return;
    }
    console.log(await blank.findOne({ip:req.ip}))
    console.log(req.body)
    const b = new blank({
        nick: req.body.nick,
        ip:req.ip,
        description: req.body.description,
        age: req.body.age,
        play_age: req.body.play_age,
        reason: req.body.reason,
        play_time:req.body.play_time,

      })
    
      await b.save()
      await sendM(req.ip)
      res.redirect('/')
})


module.exports = router