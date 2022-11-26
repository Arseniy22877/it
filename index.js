const express = require('express');
const mongoose = require('mongoose')
const router = require('./router')
const exphbs = require('express-handlebars')
const DiscordJS = require('discord.js')
const blank = require('./models/blank');
var bodyParser = require('body-parser')
const {EmbedBuilder} = require('discord.js')
const {Partials} = require('discord.js');
const message = require('./models/message');

const channel_id = "1043830298732933150";
const TOKEN = "OTk2MDc5NjQxODY3NjA0MDA4.Guk7ME.YhgAYu_Irrm-YsCmv75zLMkIwfMv30_kcyWbO4";
const banned_channel_id = "1043820095966814230";
const approved_channel_id = "1043820063125413888";

const bot = new DiscordJS.Client({
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
    intents:['GuildMembers','Guilds','GuildMessages', 'GuildEmojisAndStickers', 'GuildMessageReactions','DirectMessageReactions', 'MessageContent']
})


bot.on('ready', () => {
    console.log('Бот запущен')
})

const app = express()

const hbs = exphbs.create({
    defaultLayout:"main",
    extname:"hbs"
})

app.engine("hbs",hbs.engine)
app.set("view engine", "hbs")

app.set("views", "views")


const PORT = 3000;
async function start(){
    try {
        await mongoose.connect("mongodb+srv://Arseniy:abobus@cluster0.d379wji.mongodb.net/?retryWrites=true&w=majority")
        bot.login(TOKEN);
        app.listen(PORT, () => {
            console.log("app started")
        })
    } catch (error) {
        console.log(error)
    }
}

var jsonParser = bodyParser.urlencoded({extended:true})

app.get('/', (req, res) => {
    res.render("index");
})

app.get('/login', async (req, res) => {
    const temp = await blank.findOne({ip:req.ip})
    if(!temp || temp.status == 0){
        res.render("login",{
            has_errors:false
        });
    }else if(temp.status == 1){
        res.render("done",{
            status1:true
        })
    }else if(temp.status == 2){
        res.render("done",{
            status2:true
        })
    }else if(temp.status == 3){
        res.render("done",{
            status3:true
        })
    }else{
        res.render("done",{
            status4:true
        })
    }
    
})

app.post('/login', jsonParser, async (req, res) => {
    if(!(req.body.nick && req.body.description && req.ip && req.body.age && req.body.play_age && req.body.reason && req.body.play_time)){
        res.render("login", {
            has_errors:true,
            nick:req.body.nick,
            description:req.body.description,
            age:req.body.age,
            play_age:req.body.play_age,
            play_time:req.body.play_time,
            reason:req.body.reason
        })
        return;
    }
    const temp = await blank.findOne({ip:req.ip})
    if(!temp){
        console.log(req.body)
        const b = new blank({
            nick: req.body.nick,
            ip:req.ip,
            description: req.body.description,
            age: req.body.age,
            play_age: req.body.play_age,
            reason: req.body.reason,
            play_time:req.body.play_time,
            status:1
    
          })
        
          await b.save()
          await sendM(req.ip)
          res.redirect('/')
    }else if(temp.status == 0){
        console.log(await blank.findOne({ip:req.ip}))
        console.log(req.body)
        await blank.findOneAndUpdate({ip:req.ip}, {
            nick: req.body.nick,
            ip:req.ip,
            description: req.body.description,
            age: req.body.age,
            play_age: req.body.play_age,
            reason: req.body.reason,
            play_time:req.body.play_time,
            status:1
    
          })
          await sendM(req.ip)
          res.redirect('/')
    }else{
        res.redirect('/')
    }
})

app.get('/rules', (req, res) => {
    res.render('rules')
})
app.get('/donate', (req, res) => {
    res.render('donate')
})

async function sendM(ip){
    const b = await blank.findOne({ip:ip});
    if(!b){
        return;
    }
    const Embed = new EmbedBuilder()
    .setColor(0)
    .setTitle(b.ip)
    .setDescription("Ник: " + b.nick + "\nВозраст: " + b.age + "\nИграет: " + b.play_age + "\nМожет играть на сервере: " + b.play_time + "\nУмеет: " + b.description + "\nПланы: " + b.reason);

    const m = await bot.channels.cache.find(ch => ch.id == channel_id).send({ embeds: [Embed] });
    const msg = new message({
        id:m.id,
        ip:ip
    })
    await msg.save()
    
}

bot.on('messageCreate', async (message) => {
    if(message.content.at(0) == '!' && !message.author.bot){
        const args = message.content.split(" ")
        console.log(args)
        if(args.at(0) == "!banan"){
            const b = await blank.findOneAndUpdate({nick: args.at(1)}, {status:3})
            if(!b){
                console.log("error")
                message.channel.send("Игрок не найден " + args.at(1))
                message.delete()
                return;
            }
            const Embed = new EmbedBuilder()
            .setColor("Red")
            .setTitle(b.ip)
            .setDescription("Ник: " + b.nick + "\nВозраст: " + b.age + "\nИграет: " + b.play_age + "\nМожет играть на сервере: " + b.play_time + "\nУмеет: " + b.description + "\nПланы: " + b.reason + "\nЗАБАНЕН");
        
            await bot.channels.cache.find(ch => ch.id == banned_channel_id).send({ embeds: [Embed] });
        }
        if(args.at(0) == "!delete"){
            const b = await blank.findOneAndDelete({nick: args.at(1)})
            if(!b){
                console.log("error")
                message.channel.send("Игрок не найден " + args.at(1))
                message.delete()
                return;
            }
        }
        message.delete()
    }
})

bot.on('messageReactionAdd', async (r,u) => {
    const thismsg = await r.message.fetch()
    if(!thismsg.author){
        console.log(thismsg.author)
        return;
    }
    console.log(thismsg.author.id + "\n" + bot.user.id)
    if(thismsg.author.id != bot.user.id){
        return;
    }
    console.log(r.emoji.name);
    if(r.emoji.name == "✅"){
        const msg = await message.findOne({id:r.message.id})
        if(!msg){
            console.log("error")
            return
        }
        const t = await blank.findOne({ip:msg.ip})
        if(t.status == 1){
            const b = await blank.findOneAndUpdate({ip:msg.ip}, {status:2})
            if(!b){
                console.log("error")
                return;
            }
            const Embed = new EmbedBuilder()
            .setColor("Green")
            .setTitle(b.ip)
            .setDescription("Ник: " + b.nick + "\nВозраст: " + b.age + "\nИграет: " + b.play_age + "\nМожет играть на сервере: " + b.play_time + "\nУмеет: " + b.description + "\nПланы: " + b.reason + "\nОДОБРЕН");
        
            const newmsg = await bot.channels.cache.find(ch => ch.id == approved_channel_id).send({ embeds: [Embed] });
            r.message.delete()
            msg.id = newmsg.id;
            await msg.save()
        }else if(t.status == 2){
            const b = await blank.findOneAndUpdate({ip:msg.ip}, {status:4})
            msg.delete()
        }

    }else if(r.emoji.name == "❎"){
        const msg = await message.findOne({id:r.message.id})
        if(!msg){
            console.log("error")
            return
        }
        const b = await blank.findOneAndUpdate({ip:msg.ip}, {status:3})
        if(!b){
            console.log("error")
            return;
        }
        const Embed = new EmbedBuilder()
        .setColor("Red")
        .setTitle(b.ip)
        .setDescription("Ник: " + b.nick + "\nВозраст: " + b.age + "\nИграет: " + b.play_age + "\nМожет играть на сервере: " + b.play_time + "\nУмеет: " + b.description + "\nПланы: " + b.reason + "\nЗАБАНЕН");
    
        await bot.channels.cache.find(ch => ch.id == banned_channel_id).send({ embeds: [Embed] });
        msg.delete()
        r.message.delete()
    }else if(r.emoji.name == "♻️"){
        const msg = await message.findOne({id:r.message.id})
        if(!msg){
            console.log("error")
            return
        }
        const b = await blank.findOneAndUpdate({ip:msg.ip}, {status:0})
        if(!b){
            console.log("error")
            return;
        }
        msg.delete()
        r.message.delete()
    }
})
start();
