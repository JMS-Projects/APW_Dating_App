const http = require("http");
const profile = require("./profile.js");
const qString = require("querystring");
const express = require("express");
const session = require("express-session");
const multer = require("multer");
const path = require("path");
const bp = require("body-parser");
const dbManager = require('./dbManager');
const User = require("./User.js");
let app = express();
const fs = require('fs')
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
//Author: Andrew Griscom
app.get('/', function (req, res){
    if(!req.session.user){
        res.render('home', {pfp: "https://i.ibb.co/0DHyL5k/1.png"});
    }
    else{

        res.render('main_layout', {pfp: `./profile_pictures/${req.session.user.pfp_path}`});
    }
});

app.get('/updateU', function(req, res, next)
{
    res.render('updateU');
});


app.post('/updateU', bp.urlencoded({extended: false}), function(req, res, next)
{
    let updateDoc = {};
    if (req.body.pWord.trim() != '') updateDoc.password = req.body.pWord.trim();
    if (req.body.eMail.trim() != '') updateDoc.email = req.body.eMail.trim();
    if (req.body.city.trim() != '') updateDoc.city = req.body.city.trim();
    if (req.body.state.trim() != '') updateDoc.state = req.body.state.trim();
    try
    {
        dbManager.get().collection("users").updateOne({username: req.session.user.username}, {$set: updateDoc});
        console.log(`[${new Date().toLocaleTimeString("en-US", {timeZone: "America/New_York"})}] ${req.session.user.username}'s account information has been updated`);
        res.end();
        // render the page again with a success message and the new account info
        // let msg = "Your account information has been updated"
        // res.render('/update', {msg: msg})
    }
    catch (err)
    {
        console.log(`[${new Date().toLocaleTimeString("en-US", {timeZone: "America/New_York"})}] There was an error with updating ${req.session.user.username}'s account information: ${err}`);
        res.end();
        // render page again with error message
        // let msg = "There was an error with updating your account information"
        // res.render('/update', {msg:msg})
    }
});
//Author: Jason, Andrew Griscom
app.get('/updateP', function(req, res, next)
{
    res.render('updateP');
});
//Author: Jason, Andrew Griscom
app.post('/updateP', bp.urlencoded({extended: false}), function(req, res, next)
{
    let updateDoc = {};
    if (req.body.name.trim() != '') updateDoc.name = req.body.name.trim();
    if (req.body.age.trim() != '') updateDoc.age = req.body.age.trim();
    if (req.body.gender.trim() != '') updateDoc.gender = req.body.gender.trim();
    if (req.body.height.trim() != '') updateDoc.height = req.body.height.trim();
    if (req.body.race.trim() != '') updateDoc.race = req.body.race.trim();
    if (req.body.hobby.trim() != '') updateDoc.hobby = req.body.race.trim();
    if (req.body.income.trim() != '') updateDoc.income = req.body.income.trim();
    if (req.body.religion.trim() != '') updateDoc.religion = req.body.religion.trim();
   

    try
    {
        dbManager.get().collection("users").updateOne({username: req.session.user.username}, {$set: updateDoc});
        console.log(`[${new Date().toLocaleTimeString("en-US", {timeZone: "America/New_York"})}] ${req.session.user.username}'s personal information has been updated`);
        res.redirect('/');
        // render the page again with a success message and the new account info
        // let msg = "Your account information has been updated"
        // res.render('/update', {msg: msg})
    }
    catch (err)
    {
        console.log(`[${new Date().toLocaleTimeString("en-US", {timeZone: "America/New_York"})}] There was an error with updating ${req.session.user.username}'s personal information: ${err}`);
        res.redirect('/');
        // render page again with error message
        // let msg = "There was an error with updating your account information"
        // res.render('/update', {msg:msg})
    }
});

app.get('/logout', function(req, res,next)
{
    req.session.destroy();
    res.redirect('/');
});

// Ryan Morgan
app.get('/search', function(req, res, next)
{
    if (req.session.user)
    {
        res.render('search');
        /*
        searchResp(null, res).then(
        page=> {    res.send(page); }
        ).catch(next);
        */
    }
    else
    {
        res.redirect('/login');
    }
});

// Ryan Morgan,

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
            } else if (prop == "city" || prop == "state"){
                searchDoc = { [prop] : val};
            } else {
                searchDoc = { [`profile.${prop}`] : val};
            }

            try{
            let cursor = col.find(searchDoc);
            let resultOBJ={data: cursor, [prop]  : val, prop: prop};
                
            //res.render('search', {results: resultOBJ});
            
            searchResp(resultOBJ, res).then( page =>
                              {res.send(page)
                              });//call the searchPage
                              
            } catch (e){
            console.log(e.message);
            res.writeHead(404);
            res.write("<html><body><h1> ERROR 404. Page NOT FOUND</h1>");
            res.end("<br>" + e.message + "<br></body></html>");
            }
        } else{ // can't move on
            res.render('search');
            /*
            searchResp(null, res).then(
            page => {res.send(page)} */
        
        //);
        }
    });
});

app.get('/login', function(req, res, next)
{
    if (!req.session.user)
    {
        let entry = {uName: '', pWord: ''};
        res.render('login', {entry: entry});
    }
    else
    {
        res.redirect('/');
    }
});

app.post('/login', bp.urlencoded({extended: false}), async (req, res) =>
{
    for (prop in req.body)
    {
        if (req.body[prop] === '')
        {
            res.render('login', {msg: "fill out everything"});
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
                res.redirect('/');
                // render home page with login success message
                // let msg = `You logged in successfully as ${req.session.user.username}`
                // res.render('/', {msg:msg})
            }
        }
        console.log(`[${new Date().toLocaleTimeString("en-US", {timeZone: "America/New_York"})}] Failed login attempt for ${req.body.uName}`);
        let msg = "You failed to log in"
        let entry = {uName: req.body.uName, pWord: req.body.pWord};
        res.render('login', {entry: entry, msg: msg});
    } 
    catch (err)
    {
        console.log(`[${new Date().toLocaleTimeString("en-US", {timeZone: "America/New_York"})}] There was an error with logging in: ${err.message}`);
        res.end();
        // render login page with error message
        // let msg = "You failed to log in"
        // res.render('/login', {msg:msg})
    }	    
});

app.get('/register', function(req, res, next)
{
    if (req.session.user)
    {
        res.redirect('/');
    }
    else
    {
        let entry = {uName: '', pWord: '', city: '', state: '', eMail: ''};
        res.render('register', {entry: entry})
    }
});

app.post('/register', bp.urlencoded({extended: false}), async (req, res) =>
{
    for (prop in req.body)
    {
        if (req.body[prop] === '')
        {
            let msg = "You need to fill out all fields"
            res.render('register', {msg: msg, entry: req.body});
        }
    }
    try
    {
        let curUser = new User({username: req.body.uName, password: req.body.pWord, city: req.body.city, state: req.body.state, email: req.body.eMail})
		const userObj = await dbManager.get().collection("users").findOne({username: curUser.username});
		if(userObj == null)
		{
			let result = await dbManager.get().collection("users").insertOne(curUser);
			if(result.insertedCount == 1)
			{
                console.log(`[${new Date().toLocaleTimeString("en-US", {timeZone: "America/New_York"})}] ${curUser.username} has been registered`);
                req.session.user = curUser;
                res.redirect('/')
                // render home page with success message
                // let msg = `You have successfully registered as ${curUser.username}`
                // res.render('/', {msg:msg})
			}
			else
			{
                console.log(`[${new Date().toLocaleTimeString("en-US", {timeZone: "America/New_York"})}] Registration failed. Mongo failed to insert ${curUser.username} into the database`);
                let msg = "There was an error with inserting your account into the database";
                res.render('register', {entry: req.body, msg: msg});
			}
        }
        else
        {
            console.log(`[${new Date().toLocaleTimeString("en-US", {timeZone: "America/New_York"})}] Registration failed. ${curUser.username} already exists in the database`);
            let msg = "That username already exists."
            res.render('register', {entry: req.body, msg: msg});

        }
    } 
    catch (err)
    {
        console.log(`[${new Date().toLocaleTimeString("en-US", {timeZone: "America/New_York"})}] There was an error with user creation or registration: ${err.message}`);
        let msg = "There was an error with your registration";
        res.render('register', {entry: req.body, msg: msg});
    }
});

app.get('/match', function(req, res, next)
{
    if (req.session.user)
    {
        matchResp(null, res).then(
        page=> {    res.send(page); }
        ).catch(next);
    }
    else
    {
        res.redirect('/login');
    }
});

// Ryan Morgan,
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
            let resultOBJ={data: cursor, [prop]  : val, prop: prop};
    
            matchResp(resultOBJ, res).then( page =>
                            {res.send(page)
                            });//call the matchPage
        } catch (e){
            console.log(e.message);
            res.writeHead(404);
            res.write("<html><body><h1> ERROR 404. Page NOT FOUND</h1>");
            res.end("<br>" + e.message + "<br></body></html>");
        }
    });
});

//Author: Andrew Griscom
app.get('/profile', function(req, res, next){
    console.log(`[${new Date().toLocaleTimeString("en-US", {timeZone: "America/New_York"})}] Request for viewing profile page`);
    if(req.session.user.profile != null)
    {
        res.render('profile', {user: req.session.user});
    }
    else{
        res.redirect('/rProfile');
    }
});

app.post('/profile', bp.urlencoded({extended: false}) , function(req, res)
{
   
    let updateDoc = {};
    updateDoc.profile = {};
    if (req.body.pWord.trim() != '') updateDoc.password = req.body.pWord.trim();
    if (req.body.email.trim() != '') updateDoc.email = req.body.email.trim();
    if (req.body.city.trim() != '') updateDoc.city = req.body.city.trim();
    if (req.body.state.trim() != '') updateDoc.state = req.body.state.trim();
    if (req.body.name.trim() != '') updateDoc.profile.name = req.body.name.trim();
    if (req.body.age.trim() != '') updateDoc.profile.age = req.body.age.trim();
    if (req.body.gender.trim() != '') updateDoc.profile.gender = req.body.gender.trim();
    if (req.body.height.trim() != '') updateDoc.profile.height = req.body.height.trim();
    if (req.body.race.trim() != '') updateDoc.profile.race = req.body.race.trim();
    if (req.body.hobby.trim() != '') updateDoc.profile.hobby = req.body.race.trim();
    if (req.body.income.trim() != '') updateDoc.profile.income = req.body.income.trim();
    if (req.body.religion.trim() != '') updateDoc.profile.religion = req.body.religion.trim();
    try{
        dbManager.get().collection("users").updateOne({username: req.session.user.username}, {$set: updateDoc});
        console.log(`[${new Date().toLocaleTimeString("en-US", {timeZone: "America/New_York"})}] ${req.session.user.username}'s account information has been updated`);
        res.redirect('/');
    }
    catch (err)
    {
        console.log(`[${new Date().toLocaleTimeString("en-US", {timeZone: "America/New_York"})}] There was an error with updating ${req.session.user.username}'s account information: ${err}`);
        res.redirect('/');
    }
		    res.redirect('/');
            
		
    	    
});

//Author: Andrew Griscom
app.get('/rProfile', function(req, res, next){
    console.log(`[${new Date().toLocaleTimeString("en-US", {timeZone: "America/New_York"})}] Request for creating profile page`);
    if (req.session.user)
    {
        res.render('rProfile');
    }
    else{
        res.redirect('/login');
    }
});
app.post('/rProfile', bp.urlencoded({extended: false}), function(req, res){
    for (prop in req.body)
    {
        if (req.body[prop] === '')
        {
            res.render('rProfile', {msg: "fill out everything"});
        }
    }
    let updateDoc = {};
    updateDoc.name = req.body.name.trim();
    updateDoc.age = req.body.age.trim();
    updateDoc.gender = req.body.gender.trim();
    updateDoc.height = req.body.height.trim();
    updateDoc.race = req.body.race.trim();
    updateDoc.hobby = req.body.hobby.trim();
    updateDoc.income = req.body.income.trim();
    updateDoc.religion = req.body.religion.trim();
    req.session.user.profile = updateDoc;
    try{
        dbManager.get().collection("users").updateOne({username: req.session.user.username}, {$set: {profile: updateDoc}});
        console.log(`[${new Date().toLocaleTimeString("en-US", {timeZone: "America/New_York"})}] ${req.session.user.username}'s profile has been created`);
        res.redirect('/');
    }
    catch (err)
    {
        console.log(`[${new Date().toLocaleTimeString("en-US", {timeZone: "America/New_York"})}] There was an error with updating ${req.session.user.username}'s account information: ${err}`);
        res.redirect('/');
    }
});



var htmlPath = path.join(__dirname, 'html');
app.use('/chat', express.static(htmlPath));


app.get('/pfp_upload', function(req, res){
    res.render('pfp_upload');
})

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

// Ryan Morgan,
async function searchResp(result, response)
{
    let page = '<html><head><title>Dating App Search</title></head>'+
    '<body> <form method="post">'+
    '<h1>Search for a profile</h1>'+
    'Property <select name="prop">'+
    '<option>username</option>' +
    '<option>city</option>' +
    '<option>state</option>' +
    '<option>name</option>' +
    '<option>age</option>' +
    '<option>gender</option>' +
    '<option>height</option>' +
    '<option>race</option>' +
    '<option>income</option>' +
    '<option>religion</option>' +
    '</select>'+
    '  <input name="value">'+
    '<input type="submit" value="Search!">' +
    '<input type="reset" value="Clear">'+
    '</form>';
    
    if (result)
    {
        page+=`<h2>Search results for ${result.prop}: ${result[result.prop]}</h2>`
        let count = 0;
        //the await must be wrapped in a try/catch in case the promise rejects
        try{
            await result.data.forEach((item) =>{
                page+=`Result ${++count}: ${item.username} from ${item.city}, ${item.state}. Profile { Name: ${item.profile.name}, Age: ${item.profile.age}, 
                Gender: ${item.profile.gender}, Height: ${item.profile.height}cm, Race: ${item.profile.race}, Income: ${item.profile.income}, Religion: ${item.profile.religion} } <br>`;
                });
            } catch (e){
                page+=e.message;
                throw e;
            }
    }
    page+='<br><br><a href="/">Home Page</a></body></html>';
      
    return page;
}

// Ryan Morgan,
async function matchResp(result, response){
    let page = '<html><head><title>Dating Match Page</title>'+
    '<link rel="stylesheet" href="//code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css">'+
    '<script src="https://code.jquery.com/jquery-1.12.4.js"></script>' + 
    '<script src="https://code.jquery.com/ui/1.12.1/jquery-ui.js"></script>' + 
    '<script>' +
    'var minage;'+
    'var maxage;'+
    'var minheight;'+
    'var maxheight;'+
    '$( function() {'+
    '   $( "#age-range" ).slider({'+
    '       range: true, min: 18, max: 100, values: [ 18, 35 ], slide: function( event, ui ) {'+
    '           minage = ui.values[0];'+
    '           maxage = ui.values[1];'+
    '           $("#minAge").val(minage);'+
    '           $("#maxAge").val(maxage);'+
    '       }'+
    '   });'+
    '   minage = $("#age-range").slider("values", 0);'+
    '   maxage = $("#age-range").slider("values", 1);'+
    '   $("#minAge").val(minage);'+
    '   $("#maxAge").val(maxage);'+
    '   $( "#height-range" ).slider({'+
    '       range: true, min: 100, max: 300, values: [ 150, 200 ], slide: function( event, ui ) {'+
    '           minheight = ui.values[0];'+
    '           maxheight = ui.values[1];'+
    '           $("#minHeight").val(minheight);'+
    '           $("#maxHeight").val(maxheight);'+
    '       }'+
    '   });'+
    '   minheight = $("#height-range").slider("values", 0);'+
    '   maxheight = $("#height-range").slider("values", 1);'+
    '   $("#minHeight").val(minheight);'+
    '   $("#maxHeight").val(maxheight);'+
    '});'+
    '</script>'+
    '</head>'+
    '<body> <form method="post">'+
    '<h1>Fill out the following information to make a match</h1>'+
    'Prefered Gender:'+
        '<select name="gender" size="1">'+
        '<option value="n" selected="selected"> No Preference </option>'+
        '<option value="Male"> Male </option>'+
        '<option value="Female"> Female </option>'+
        '<option value="Other"> Other </option>'+
        '</select> <br>'+
    'Prefered Race:'+
        '<select name="race" size="1">'+
        '<option value="n" selected="selected"> No Preference </option>'+
        '<option value="White"> White </option>'+
        '<option value="Black/African American"> Black/African American </option>'+
        '<option value="Asian"> Asian </option>'+
        '<option value="Hispanic"> Hispanic </option>'+
        '<option value="Other"> Other </option>'+
        '</select> <br>'+
    'Prefered Age Range: '+
        'min<input type="text" id="minAge" name="minAge" readonly style="width:25px;">'+
        '<div id="age-range" style="width:150px; display:inline-block; margin-left:10px; margin-right:10px;"></div>'+
        'max<input type="text" id="maxAge" name="maxAge" readonly style="width:25px;"> <br>'+
    'Prefered Height Range in cm: '+
        'min<input type="text" id="minHeight" name="minHeight" readonly style="width:30px;"> '+
        '<div id="height-range" style="width:150px; display:inline-block; margin-left:10px; margin-right:10px;"></div>'+
        'max<input type="text" id="maxHeight" name="maxHeight" readonly style="width:30px;""> <br>'+
    'Prefered Religion:'+
        '<select name="religion" size="1">'+
        '<option value="n" selected="selected"> No Preference </option>'+
        '<option value="Christianity"> Christianity </option>'+
        '<option value="Islam"> Islam </option>'+
        '<option value="Hinduism"> Hinduism </option>'+
        '<option value="Buddhism"> Buddhism </option>'+
        '<option value="Other"> Other </option>'+
        '<option value="Not religious"> Not religious </option>'+
        '</select> <br>'+
    '<script>console.log(min, max);</script>'+
    '<input type="submit" value="Search!">' +
    '<input type="reset" value="Clear">'+
    '</form>';

        if (result) {
            page+=`<h2>Your Matches:</h2>`
        let count = 0;
        //the await must be wrapped in a try/catch in case the promise rejects
        try{
        await result.data.forEach((item) =>{
            page+=`Match ${++count}: ${item.profile.name} age ${item.profile.age} <button onclick="window.location.href='/chat';">Chat Now!</button><br>`;
            });
        } catch (e){
            page+=e.message;
            throw e;
        }
        }

    page +='<br><br><a href="/">Home Page</a></body></html>';
    return page;
}


app.get('/pfp_upload/complete', function(req, res){
    res.render('pfp_upload', {msg: app.locals.msg, file: app.locals.file});
});

app.post('/pfp_upload', function(req, res){
    upload(req, res, (err)=>{
        // errors
        if(err){
            app.locals.msg = err;
            res.render('/pfp_upload', {msg: err});
        }
        // no file selected
        if(req.file == undefined){
            app.locals.msg = 'Error: No file selected';
            res.redirect('/pfp_upload');
        }
        // successful upload
        else{
            app.locals.msg = 'File uploaded';
            app.locals.file = `/profile_pictures/${req.file.filename}`;
            // in this case, we delete the picture in the server's file system
            if (req.session.user.pfp_path)
            {
                let path = `./profile_pictures/${req.session.user.pfp_path}`;
                fs.unlink(path, (err) => {
                if (err) 
                {
                    console.error(`[${new Date().toLocaleTimeString("en-US", {timeZone: "America/New_York"})}] ${req.session.user.username}'s profile picture upload has run into an error: ${err}`);
                    return;
                }});
            }
            req.session.user.pfp_path = req.file.filename;
            dbManager.get().collection("users").updateOne({username: req.session.user.username}, {$set: {pfp_path: req.file.filename}});
            console.log(`[${new Date().toLocaleTimeString("en-US", {timeZone: "America/New_York"})}] ${req.session.user.username}'s profile picture has been updated`);
            res.redirect('/pfp_upload/complete');
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