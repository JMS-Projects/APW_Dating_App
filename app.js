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
    resave: false
}));
app.use(function (req, res, next){
    console.log(`[${new Date().toLocaleTimeString("en-US", {timeZone: "America/New_York"})}] ${req.method} request for ${req.url} route with session ID: ${req.session.id}`);
    next();
})
app.get('/', function (req, res){
    res.end('<html><body><title>Home Page</title><h1>Home Page</h1>' +
    '<p>This is a Dating application below you have the option of '+
    'registering an account, viewing your profile or searching profiles '+
    'of people registered.</p>'+
    '<br><br><a href="/login">login/register</a>&emsp;&emsp;<a href="/search">search Page' +
    '</a>&emsp;&emsp;<a href="/match">Find a Match!</a>&emsp;&emsp;' +
    '<a href="/chat">chat now!</a></body></html>');
});

app.get('/update', function(req, res, next)
{
    res.render('update');
});
app.post('/update', bp.urlencoded({extended: false}), function(req, res, next)
{
    let updateUser = new User({username: req.body.uName});
    updateUser.updateProp(req.body);
});
app.get('/logout', function(req, res,next)
{
    req.session.destroy();
    res.redirect('/');
});

app.get('/search', function(req, res, next)
{
    if (req.session.user)
    {
        searchResp(null, res).then(
        page=> {    res.send(page); }
        ).catch(next);
    }
    else
    {
        res.redirect('/login');
    }
});

app.get('/home', function (req, res){
    res.end('<html><body><title>Home Page</title><h1>Home Page</h1>' +
    '<p>This is a Dating application below you have the option of '+
    'registering an account, viewing your profile or searching profiles '+
    'of people registered.</p>'+
    '<br><br><a href="/profile">Profile</a>&emsp;&emsp;<a href="/search">search Page' +
    '</a>&emsp;&emsp;<a href="/match">Find a Match!</a>&emsp;&emsp;' +
    '<a href="/chat">chat now!</a></body></html>');
});

app.get('/home2', function (req, res){
    res.end('<html><body><title>Home Page</title><h1>Home Page</h1>' +
    '<p>This is a Dating application below you have the option of '+
    'registering an account, viewing your profile or searching profiles '+
    'of people registered.</p>'+
    '<br><br><a href="/rProfile">Create Profile</a>&emsp;&emsp;<a href="/search">search Page' +
    '</a>&emsp;&emsp;<a href="/match">Find a Match!</a>&emsp;&emsp;' +
    '<a href="/chat">chat now!</a></body></html>');
});

app.get('/login', function(req, res, next)
{
    if (!req.session.user)
    {
        res.render('login');
    }
    else
    {
        res.redirect('/');
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
       res.render('register');
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
app.get('/profile', function(req, res, next){
    profileResp(null, res).then(
    page=> {    res.send(page); }
    ).catch(next);
});

app.get('/rProfile', function(req, res, next){
    console.log(`[${new Date().toLocaleTimeString("en-US", {timeZone: "America/New_York"})}] Request for creating profile page`);
    res.render('rProfile');
});


app.get('/match', function(req, res, next){
    matchResp(null, res).then(
    page=> {    res.send(page); }
    ).catch(next);
});

app.get('/chat', function(req, res)
{
    if (req.session.user)
    {
        res.sendFile(__dirname + '/chatroom.html');
    }
    else
    {
        res.redirect('/login');
    }
});
app.get('/test', function(req, res){
    res.render('test');
})

var postParams;
var currProfile;
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

async function profileResp(info, res){
    try{
        let page = currProfile.displayProfile();
        page += '<br><br><a href="/home">Home Page</a></body></html>';
        res.send(page);
    }
    catch(err)
    {
        console.log(err.message);

    }
}


async function searchResp(result, response)
{
    let page = '<html><head><title>Dating App Search</title></head>'+
    '<body> <form method="post">'+
    '<h1>Search for a profile</h1>'+
    'Property <select name="prop">'+
    '<option>Name</option>' +
    '<option>Age</option>' +
    '<option>Race</option>' +
    '<option>Religion</option>' +
    '<option>gender</option>' +
    '</select>'+
    '  <input name="value">'+
    '<input type="submit" value="Search!">' +
    '<input type="reset" value="Clear">'+
    '</form>';
    
    if (result)
    {
        page+=`<h2>Matches for ${result.prop}: ${result[result.prop]}</h2>`
        let count = 0;
        //the await must be wrapped in a try/catch in case the promise rejects
        try{
        await result.data.forEach((item) =>{
            page+=`Match ${++count} ${item.name} <br>`;
            });
        } catch (e){
            page+=e.message;
            throw e;
        }
    }
    page+='<br><br><a href="/">Home Page</a></body></html>';
      
    return page;
}

async function matchResp(result, response){
    let page = '<html><head><title>Dating Match Page</title></head>'+
    '<body> <form method="post">'+
    '<h1>Fill out the following information to make a match</h1>'+
    'Prefered Gender:'+
        '<select name="gender" size="1">'+
        '<option value="n" selected="selected"> No Preference </option>'+
        '<option value="m"> Male </option>'+
        '<option value="F"> Female </option>'+
        '<option value="o"> Other </option>'+
        '</select> <br>'+
    'Prefered Race:'+
        '<select name="race" size="1">'+
        '<option value="n" selected="selected"> No Preference </option>'+
        '<option value="White"> White </option>'+
        '<option value="black"> Black </option>'+
        '<option value="asian"> Asian </option>'+
        '</select> <br>'+
    'Prefered Age Range: '+
        'min<input type="number" name="minAge" min="18" max="100" step="1"> '+
        'max<input type="number" name="maxAge" min="18" max="100" step="1"> <br>'+
    'Prefered Height Range in cm: '+
        'min<input type="number" name="minHeight" min="0" max="500" step="1"> '+
        'max<input type="number" name="maxHeight" min="0" max="500" step="1"> <br>'+
    'Prefered Religion:'+
        '<select name="religion" size="1">'+
        '<option value="n" selected="selected"> No Preference </option>'+
        '<option value="None"> None </option>'+
        '<option value="catholic"> Catholic </option>'+
        '<option value="muslim"> Muslim </option>'+
        '<option value="jewish"> Jewish </option>'+
        '</select> <br>'+
    '<input type="submit" value="Search!">' +
    '<input type="reset" value="Clear">'+
    '</form>';

        if (result) {
            page+=`<h2>Your Matches:</h2>`
        let count = 0;
        //the await must be wrapped in a try/catch in case the promise rejects
        try{
        await result.data.forEach((item) =>{
            page+=`Match ${++count}: ${item.name} age ${item.age} hobbies include: ${item.hobbies} <button>Chat Now!</button><br>`;
            });
        } catch (e){
            page+=e.message;
            throw e;
        }
        }

    page +='<br><br><a href="/">Home Page</a></body></html>';
    return page;
}

var postData;
app.post('/search', function(req, res){
    postData = '';
    req.on('data', (data) =>{
	postData+=data;
    });
    req.on('end', async ()=>{
        //Break into functions
        console.log(postData);
        if (moveOn(postData)){
            let col = dbManager.get().collection("profiles");
            var prop= postParams.prop;
            var val = postParams.value;
            if (prop == "age" || prop == "height"){
                val = Number(postParams.value);
            }
            //simple equality search. using [] allows a variable
            //in the property name
            let searchDoc = { [prop] : val };
            try{
            let cursor = col.find(searchDoc);
            let resultOBJ={data: cursor, [prop]  : val, prop: prop};
    
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
            searchResp(null, res).then(
            page => {res.send(page)}
        );
        }
    });
});

app.post('/match', function(req, res){
    postData = '';
    req.on('data', (data) =>{
        postData+=data;
    });
    req.on('end', async ()=>{
        //Break into functions
        console.log(postData);
        if (moveOn(postData)){
            let col = dbManager.get().collection("profiles");
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
                console.log("Min age = ", postParams.minAge);
                console.log("Max age = ", postParams.maxAge);
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
            let searchDoc = { "gender": gender, "race": race, "age": age, 
                "height": height, "religion": religion};

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
        } else{ // can't move on
            matchResp(null, res).then(
            page => {res.send(page)}
        );
        }
    });
});

app.post('/register', bp.urlencoded({extended: false}), async (req, res) =>
{
    try
    {
        curUser = new User({username: req.body.uName, password: req.body.pWord, city: req.body.city, state: req.body.state, email: req.body.email});
        let result = await curUser.register();
        res.render('registration_result', {username: curUser.username, result: result});    
    } 
    catch (err)
    {
        console.log(`[${new Date().toLocaleTimeString("en-US", {timeZone: "America/New_York"})}] There was an error with user creation or registration: ${err.message}`);
        res.render('registration_result', {username: curUser.username, result: false});
    }
});
app.post('/login', bp.urlencoded({extended: false}), async (req, res) =>
{
    try
    {
        curUser = new User({username: req.body.uName, password: req.body.pWord});
        let result = await curUser.login();
        if (result)
        {
            req.session.user = {name: curUser.username};
            app.locals.user = curUser;
        }
        res.render('login_result', {username: curUser.username, result: result});
    } 
    catch (err)
    {
        console.log(`[${new Date().toLocaleTimeString("en-US", {timeZone: "America/New_York"})}] There was an error with logging in: ${err.message}`);
        res.render('login_result', {result: false});
    }	    
});
app.get('/test/upload/complete', function(req, res){
    res.render('test', {msg: app.locals.msg, file: app.locals.file});
});
app.post('/test/upload', function(req, res){
    upload(req, res, (err)=>{
        if(err){
            app.locals.msg = err;
            res.redirect('/test/upload/complete');
        }
    
        if(req.file == undefined){
            app.locals.msg = 'Error: No file selected';
            res.redirect('/test/upload/complete');
        }
        else{
            app.locals.msg = 'File uploaded';
            app.locals.file = `/profile_pictures/${req.file.filename}`;
            res.redirect('/test/upload/complete');
        }
        
    });
});


app.post('/rProfile', function(req, res){
    postData = '';
    req.on('data', (data) =>{
	postData+=data;
    });
    req.on('end', async ()=>{
	//Break into functions
	console.log(postData);
	if (moveOn(postData)){
		try{

		    currProfile = new profile(postParams.name,
						 postParams.age,
						 postParams.gender,
                         postParams.height,
                         postParams.race,
						 postParams.income,
                         postParams.religion);

            
            let page = currProfile.displayProfile();
            page += '<br><br><a href="/home">Home Page</a></body></html>';
            res.send(page);
		 // console.log(result); //log result for viewing
		} catch (err){
		    console.log(err.message);
		    //let page = rProfileResp(null, res);
		    //res.send(page);
		}
	} else{ //can't move on
	   // let page =  rProfileResp(null, res);
	    //res.send(page);
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