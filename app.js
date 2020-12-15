const http = require("http");
const qString = require("querystring");
const express = require("express");
const session = require("express-session");
const feedback = require('connect-flash') // 3rd party middleware
const multer = require("multer"); // 3rd party middleware
const path = require("path");
const bp = require("body-parser");
const fs = require('fs')
const profile = require("./profile.js");
const User = require("./User.js");
const dbManager = require('./dbManager');
let app = express();
var postData;
var postParams;


const storage = multer.diskStorage({
    destination: './profile_pictures',
    filename: function(req, file, cb){
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
});
const upload = multer({
    storage: storage,
    limits: {fields: 1, fileSize: 500000, files: 1},
    fileFilter: function(req, file, cb){
        const filetypes = /jpeg|jpg|png|gif/;
        const extension = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if(mimetype && extension){
            return cb(null, true);
        }
        else{
            cb('Error: You can only submit images');
        }
    }
}).single('img');

app.set('views', './views');
app.set('view engine', 'pug');
app.use('/profile_pictures', express.static(path.join(__dirname, 'profile_pictures')));
app.use(session({
    secret: "D@Drj8m$jhZ56R01aiH2v%3#EEMZot4S9Ln3I^1h",
    saveUninitialized: false,
    resave: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 1 // sessions expire after 1 hour
    }
}));
app.use(feedback());
app.use(function (req, res, next){
    if(!req.session.user)
    {
        console.log(`[${new Date().toLocaleTimeString("en-US", {timeZone: "America/New_York"})}] ${req.method} request for ${req.url} route from guest user`);
    }
    else
    {
        console.log(`[${new Date().toLocaleTimeString("en-US", {timeZone: "America/New_York"})}] ${req.method} request for ${req.url} route from ${req.session.user.username}`);
    }
    next();
})
//Author: Andrew Griscom with help from Jason
app.get('/', function (req, res){
    if(!req.session.user){
        res.render('home', {msg: req.flash('msg'), trusted: false, pfp: "./profile_pictures/default_pfp.png"});
    }
    else{

        res.render('home', {msg: req.flash('msg'),trusted: true, pfp: `./profile_pictures/${req.session.user.pfp_path}`});
    }
});

app.get('/logout', function(req, res,next)
{
    req.session.destroy();
    res.redirect('/');
});

// Ryan Morgan with help from Jason and Andrew
app.get('/search', function(req, res, next)
{
    if (req.session.user)
    {
        res.render('search', {trusted: true, msg: app.locals.msg, pfp: `./profile_pictures/${req.session.user.pfp_path}`});
    }
    else
    {
        res.redirect('/login');
    }
});

// Ryan Morgan with help from Jason and Andrew
app.post('/search', function(req, res){
    postData = '';
    req.on('data', (data) =>{
	postData+=data;
    });
    req.on('end', async ()=>{
        //Break into functions
        console.log(postData);
        if (moveOn(postData)){
            let col = dbManager.get().collection("users");
            var prop= postParams.prop;
            var val = postParams.value;
            let regVal;
            let searchDoc;

            /* username and name use regular expressions so you do not need
             to type out a name fully */
            if (prop == "username"){
                regVal = new RegExp(`^${val}+`);
                searchDoc = { [`${prop}`] : regVal};
            } else if (prop == "name") {
                regVal = new RegExp(`^${val}+`);
                searchDoc = { [`profile.${prop}`] : regVal};
            } else if (prop == "city" || prop == "state" || prop == "email"){
                searchDoc = { [prop] : val};
            } else {
                searchDoc = { [`profile.${prop}`] : val};
            }

            try{
            let cursor = col.find(searchDoc);
            let data = [];
		
		await cursor.forEach((item)=>{
		    let curItem={};   
            curItem = new User({username: item.username, password: item.password, email: item.email, city: item.city, state: item.state, profile: item.profile});
            //curItem = new User({username: item.username, password: item.password, email: item.email, city: item.city, state: item.state, profile: item.profile.name,  });
		    data.push(curItem);
		})
            let resultOBJ={data: data, [prop]  : val, prop: prop};
                
            res.render('search', {trusted: true, results: resultOBJ, pfp: `./profile_pictures/${req.session.user.pfp_path}`});
            
                              
            } catch (e){
            console.log(e.message);
            res.writeHead(404);
            res.write("<html><body><h1> ERROR 404. Page NOT FOUND</h1>");
            res.end("<br>" + e.message + "<br></body></html>");
            }
        } else{ // can't move on
            app.locals.msg = 'Enter in a search attribute';
            res.redirect('/search')
            
        
        //);
        }
    });
});

app.get('/login', function(req, res, next)
{
    if (!req.session.user)
    {
        res.render('login', {trusted: false, pfp: "./profile_pictures/default_pfp.png", msg: req.flash('msg')});
        return;
    }
    else
    {
        req.flash('msg', 'You are already logged in');
        res.redirect('/');
        return;
    }
});

app.post('/login', bp.urlencoded({extended: false}), async (req, res) =>
{
    for (prop in req.body)
    {
        if (req.body[prop] === '')
        {
            req.flash('msg', 'You must fill in all boxes');
            res.redirect('login');
            return;
        }
    }
    try
    {
		const userObj = await dbManager.get().collection("users").findOne({username: req.body.uName});
		if (userObj != null)
		{
			if (userObj.password === req.body.pWord)
			{
				console.log(`[${new Date().toLocaleTimeString("en-US", {timeZone: "America/New_York"})}] ${userObj.username} logged in successfully`);
                req.session.user = userObj;
                req.flash('msg', `Welcome to our dating app: ${req.session.user.username}`);
                res.redirect('/');
                return;
            }
        }
        console.log(`[${new Date().toLocaleTimeString("en-US", {timeZone: "America/New_York"})}] Failed login attempt for ${req.body.uName}`);
        req.flash('msg', 'Login failed. Try again.')
        res.redirect('/login');
        return;
    } 
    catch (err)
    {
        console.log(`[${new Date().toLocaleTimeString("en-US", {timeZone: "America/New_York"})}] There was an error with logging in: ${err.message}`);
        req.flash('msg', 'Login failed. Try again.')
        res.redirect('/login');
        return;
    }	    
});

app.get('/register', function(req, res, next)
{
    if (req.session.user)
    {
        req.flash('msg', 'You are already logged in')
        res.redirect('/');
        return;
    }
    else
    {
        res.render('register', {pfp: "./profile_pictures/default_pfp.png", msg: req.flash('msg')})
        return;
    }
});

app.post('/register', bp.urlencoded({extended: false}), async (req, res) =>
{
    for (prop in req.body)
    {
        if (req.body[prop] === '')
        {
            req.flash('msg', 'You need to fill out all fields')
            res.redirect('/register')
            return;
        }
    }
    try
    {
        let curUser = new User({username: req.body.uName, password: req.body.pWord, city: req.body.city, state: req.body.state, email: req.body.eMail, pfp_path: 'default_pfp.png'});
		const userObj = await dbManager.get().collection("users").findOne({username: curUser.username});
		if(userObj == null)
		{
			let result = await dbManager.get().collection("users").insertOne(curUser);
			if(result.insertedCount == 1)
			{
                console.log(`[${new Date().toLocaleTimeString("en-US", {timeZone: "America/New_York"})}] ${curUser.username} has been registered`);
                req.session.user = curUser;
                req.flash('msg', `You have successfully registered as ${curUser.username}. Now tell us a bit about yourself`)
                res.redirect('/rProfile');
                return;
			}
			else
			{
                console.log(`[${new Date().toLocaleTimeString("en-US", {timeZone: "America/New_York"})}] Registration failed. Mongo failed to insert ${curUser.username} into the database`);
                req.flash('msg', "There was an error with inserting your account into the database");
                res.redirect('/register');
                return;
			}
        }
        else
        {
            console.log(`[${new Date().toLocaleTimeString("en-US", {timeZone: "America/New_York"})}] Registration failed. ${curUser.username} already exists in the database`);
            req.flash('msg', "That username already exists");
            res.redirect('/register');
            return;
        }
    } 
    catch (err)
    {
        console.log(`[${new Date().toLocaleTimeString("en-US", {timeZone: "America/New_York"})}] There was an error with user creation or registration: ${err.message}`);
        req.flash('msg', "There was an error with your registration");
        res.redirect('/register');
        return;
    }
});

//Ryan Morgan with help from Jason and Andrew
app.get('/match', function(req, res, next)
{
    if (req.session.user)
    {
        res.render('match', {trusted: true, pfp: `./profile_pictures/${req.session.user.pfp_path}`});
    }
    else
    {
        res.redirect('/login');
    }
});

// Ryan Morgan with help from Jason and Andrew
app.post('/match', function(req, res){
    postData = '';
    req.on('data', (data) =>{
        postData+=data;
    });
    req.on('end', async ()=>{
        //Break into functions
        console.log(postData);
        postParams = qString.parse(postData);

        let col = dbManager.get().collection("users");
        var prop= postParams.prop;
        var val = postParams.value;
        var gender;
        var race;
        var age;
        var height;
        var religion;

        if (postParams.gender == 'n'){
            gender = {$exists: true};
        } else {
            gender = postParams.gender;
        }

        if (postParams.race == 'n'){
            race = {$exists: true};
        } else {
            race = postParams.race;
        }

        if (postParams.minAge != '' && postParams.maxAge != ''){
            age = {$gte: Number(postParams.minAge), $lte: Number(postParams.maxAge)};
        } else {
            age = {$exists: true};
        }

        if (postParams.minHeight != '' && postParams.maxHeight != '') {
            height = {$gte: Number(postParams.minHeight), $lte: Number(postParams.maxHeight)};
        } else {
            height = {$exists: true};
        }

        if (postParams.religion == 'n'){
            religion = {$exists: true};
        } else {
            religion = postParams.religion;
        }

        //simple equality search. using [] allows a variable
        //in the property name
        let searchDoc = { "profile.gender": gender, "profile.race": race, "profile.age": age, 
            "profile.height": height, "profile.religion": religion};

        try{
            let cursor = col.find(searchDoc);
            let data = [];
		
            await cursor.forEach((item)=>{
                let curItem={};   
                curItem = new User({username: item.username, password: item.password, email: item.email, city: item.city, state: item.state, profile: item.profile, pfp_path: item.pfp_path});
                // Check to see if profile pulled from database is not the profile of current user
                if (item.username != req.session.user.username){
                    data.push(curItem);
                }
            })
            let resultOBJ={data: data, [prop]  : val, prop: prop};
    
           res.render('match', {trusted: true, results: resultOBJ, pfp: `./profile_pictures/${req.session.user.pfp_path}`});
        } catch (e){
            console.log(e.message);
            res.writeHead(404);
            res.write("<html><body><h1> ERROR 404. Page NOT FOUND</h1>");
            res.end("<br>" + e.message + "<br></body></html>");
        }
    });
});

//Author: Andrew Griscom with help form Jason
app.get('/profile', function(req, res, next){
    console.log(`[${new Date().toLocaleTimeString("en-US", {timeZone: "America/New_York"})}] Request for viewing profile page`);
    if (req.session.user)
    {
        if(req.session.user.profile != null)
        {
            res.render('profile', {trusted: true, msg: req.flash('msg'), user: req.session.user, pfp: `./profile_pictures/${req.session.user.pfp_path}`});
        }
        else
        {
            res.redirect('/rProfile');
        }
    }
    else
    {
        res.redirect('/login');
    }
});
// Author: Andrew Griscom with help from Jason
app.post('/profile', bp.urlencoded({extended: false}) , async function(req, res)
{
    //The document to update user
    let updateDoc = {};
    // The update for the subdocument of profile
    updateDoc.profile = {};
    //update statements that will update the values in the db if not blank
    if (req.body.pWord.trim() != '') updateDoc.password = req.body.pWord.trim();
    if (req.body.email.trim() != '') updateDoc.email = req.body.email.trim();
    if (req.body.city.trim() != '') updateDoc.city = req.body.city.trim();
    if (req.body.state.trim() != '') updateDoc.state = req.body.state.trim();
    if (req.body.name.trim() != '') updateDoc.profile.name = req.body.name.trim();
    if (req.body.age.trim() != '') updateDoc.profile.age = parseFloat(req.body.age.trim());
    if (req.body.gender.trim() != '') updateDoc.profile.gender = req.body.gender.trim();
    if (req.body.height.trim() != '') updateDoc.profile.height = parseFloat(req.body.height.trim());
    if (req.body.race.trim() != '') updateDoc.profile.race = req.body.race.trim();
    if (req.body.hobby.trim() != '') updateDoc.profile.hobby = req.body.hobby.trim();
    if (req.body.income.trim() != '') updateDoc.profile.income = req.body.income.trim();
    if (req.body.religion.trim() != '') updateDoc.profile.religion = req.body.religion.trim();
    try{
        // Statement to get the correct user and update its properties
        dbManager.get().collection("users").updateOne({username: req.session.user.username}, {$set: updateDoc});
        // Statement to change the sessions users to reflect the updates made to the user
        req.session.user = await dbManager.get().collection("users").findOne({username: req.session.user.username});
        console.log(`[${new Date().toLocaleTimeString("en-US", {timeZone: "America/New_York"})}] ${req.session.user.username}'s account information has been updated`);
        req.flash('msg', 'Profile has been updated');
        res.redirect('/profile');
    }
    catch (err)
    {
        console.log(`[${new Date().toLocaleTimeString("en-US", {timeZone: "America/New_York"})}] There was an error with updating ${req.session.user.username}'s account information: ${err}`);
        req.flash('msg', 'There was an error with updating your information. Try again.');
        res.redirect('/profile');
    }
});

//Author: Andrew Griscom
app.get('/rProfile', function(req, res, next){
    console.log(`[${new Date().toLocaleTimeString("en-US", {timeZone: "America/New_York"})}] Request for creating profile page`);
    // if there is a user and but not a profile
    if (req.session.user && req.session.user.profile == null)
    {
        res.render('rProfile', {trusted: true, msg: req.flash('msg'), pfp: `./profile_pictures/${req.session.user.pfp_path}`});
    }
    // if there is a user but they already have a profile
    else if(req.session.user && req.session.user.profile != null){
        req.flash('msg', 'You have already created a profile! You can edit your profile here.');
        res.redirect('/profile');
    }   
    // if there is no user  
    else{
        
        res.redirect('/login');
    }
});
//Author: Andrew Griscom
app.post('/rProfile', bp.urlencoded({extended: false}), function(req, res){
    for (prop in req.body)
    {
        if (req.body[prop] === '')
        {
            res.render('rProfile', {trusted: true, msg: "fill out everything", pfp: `./profile_pictures/${req.session.user.pfp_path}`});
            req.flash('msg', "fill out everything");
            res.redirect('/rProfile');
            return;
        }
    }
    // update document for the profile subdocument in user class
    let updateDoc = {};
    // update statements to update the profile attributes.
    updateDoc.name = req.body.name.trim();
    updateDoc.age = parseFloat(req.body.age.trim());
    updateDoc.gender = req.body.gender.trim();
    updateDoc.height = parseFloat(req.body.height.trim());
    updateDoc.race = req.body.race.trim();
    updateDoc.hobby = req.body.hobby.trim();
    updateDoc.income = req.body.income.trim();
    updateDoc.religion = req.body.religion.trim();
    req.session.user.profile = updateDoc;
    try{
        // Statement to update the profile in the database
        dbManager.get().collection("users").updateOne({username: req.session.user.username}, {$set: {profile: updateDoc}});
        console.log(`[${new Date().toLocaleTimeString("en-US", {timeZone: "America/New_York"})}] ${req.session.user.username}'s profile has been created`);
        req.flash('msg', 'Your profile has been created')
        res.redirect('/profile');
    }
    catch (err)
    {
        console.log(`[${new Date().toLocaleTimeString("en-US", {timeZone: "America/New_York"})}] There was an error with creating ${req.session.user.username}'s profile: ${err}`);
        req.flash('msg', 'There was an error with creating your profile. Try again');
        res.redirect('/rProfile');
    }
});



var htmlPath = path.join(__dirname, 'html');
app.use('/chat', express.static(htmlPath));


function moveOn(postData){
    let proceed = true;
    postParams = qString.parse(postData);
    //handle empty data
    for (property in postParams){
	if (postParams[property].toString().trim() == ''){
        proceed = false;
	}
    }
    return proceed;
}

app.get('/pfp_upload', function(req, res){
    if (req.session.user)
    {
        res.render('pfp_upload', {trusted: true, msg: req.flash('msg')});
        return;
    }
    else
    {
        res.redirect('/login');
        return;
    }
})

app.post('/pfp_upload', function(req, res){
    upload(req, res, (err)=>{
        // errors
        if(err){
            console.log(`[${new Date().toLocaleTimeString("en-US", {timeZone: "America/New_York"})}] There was an error with uploading ${req.session.user.username}'s profile picture: ${err}`);
            req.flash('msg', "There was an error with uploading your picture:");
            res.redirect('/pfp_upload');
            return;
        }
        // no file selected
        if(req.file == undefined){
            req.flash('msg', 'No image selected');
            res.redirect('/pfp_upload');
            return;
        }
        // successful upload
        else{
            // in this case, we delete the picture in the server's file system
            if (req.session.user.pfp_path)
            {
                let path = `./profile_pictures/${req.session.user.pfp_path}`;
                fs.unlink(path, (err) => {
                if (err) 
                {
                    console.error(`[${new Date().toLocaleTimeString("en-US", {timeZone: "America/New_York"})}] ${req.session.user.username}'s profile picture deletion has run into an error: ${err}`);
                }});
            }
            req.session.user.pfp_path = req.file.filename;
            dbManager.get().collection("users").updateOne({username: req.session.user.username}, {$set: {pfp_path: req.file.filename}});
            console.log(`[${new Date().toLocaleTimeString("en-US", {timeZone: "America/New_York"})}] ${req.session.user.username}'s profile picture has been updated`);
            req.flash('msg', 'Profile picture uploaded successfully');
            res.redirect('/profile');
            return;
        }
    });
});

app.use('*', function(req, res){
    res.writeHead(404);
    res.end(`<h1> ERROR 404. ${req.url} NOT FOUND</h1><br><br>`);
});


app.listen(6900, async ()=> 
{
    //start and wait for the DB connection
   try
    {
        await dbManager.get("datingApp");     
    } 
    catch (e)
    {
        console.log(e.message);
    }
    console.log("Server is running...");
});