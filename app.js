var http = require("http");
//var profile = require("./profile.js");
var qString = require("querystring");
let dbManager = require('./dbManager');
let express = require("express");
let app = express();

app.get('/', function (req, res){
    res.end('<html><body><title>Home Page</title><h1>Home Page</h1>' +
    '<p>This is a Dating application below you have the option of '+
    'registering an account, viewing your profile or searching profiles '+
    'of people registered.</p>'+
    '<br><br><a href="/login">login/register</a>&emsp;&emsp;<a href="/search">search Page' +
    '</a>&emsp;&emsp;<a href="/match">Find a Match!</a>&emsp;&emsp;' +
    '<a href="/chat">chat now!</a></body></html>');
});

app.get('/search', function(req, res, next){
    searchResp(null, res).then(
	page=> {    res.send(page); }
    ).catch(next);
});

app.get('/login', function(req, res, next){
    logResp(null, res).then(
    page=> {   res.send(page); }
    ).catch(next);
});

app.get('/register', function(req, res, next){
    regResp(null, res).then(
	page=> {    res.send(page); }
    ).catch(next);
});

app.get('/match', function(req, res, next){
    matchResp(null, res).then(
    page=> {    res.send(page); }
    ).catch(next);
});

app.get('/chat', function(req, res){
    res.end('<html><body><title>Chat Page</title><h1>Chat</h1>'+
    '<p>NOT YET IMPLEMENTED<p><br><br><a href="/">Home Page</a></body></html>');
});


var postParams;
function moveOn(postData){
    let proceed = true;
    postParams = qString.parse(postData);
    //handle empty data
    for (property in postParams){
	if (postParams[property].toString().trim() == ''){
        //proceed = false;
	}
    }
    return proceed;
}


async function regResp(info, res){
    let page = '<html><head><title>Dating App Registration</title></head>' +
    '<body> <form method="post">' +
    '<h1>Please fill in information about yourself</h1>' +
    'Enter your Name <input name="name"><br><br>'+
    'Enter your Age <input name="age"><br><br>' +
    'Enter your Gender <input name="gender"><br><br>' +
    'Enter your height in cm <input name="height"><br><br>' +
    '<label for="race">Select the race that you most identify as</label>'+ 
    '<select name="race" id="race">' +
    '<option value="White">White</option>' +
    '<option value="Black/African American">Black/African American</option>' +
    '<option value="Asian" value= "Asian">Asian</option>' +
    '<option value="Hispanic">Hispanic</option>' +
    '</select><br><br>' +
    '<label>Select the income range you fall into<name="income"></label><br><br>' +
    '<input type = "radio" id = "less" name="income" value="less than $40,000">'+
    '<label for="less">Less than $40,000 a year</label><br>' +
    '<input type = "radio" id = "40,000" name="income" value="$40,000">'+
    '<label for="40,000">Around $40,000 a year</label><br>' +
    '<input type = "radio" id = "75,000" name="income" value="$75,000">'+
    '<label for="75,000">Around $75,000 a year</label><br>' +
    '<input type = "radio" id = "100,000" name="income" value="$100,000">'+
    '<label for="100,000">Around $100,000 a year</label><br>' +
    '<input type = "radio" id = "300,000" name="income" value="$300,000">'+
    '<label for="300,000">Around $300,000 a year</label><br>' +
    '<input type = "radio" id = "more" name="income" value="more than $300,000">'+
    '<label for="more">More than $300,000 a year</label><br><br>' +
    'Enter your religion <input name="religion"><br><br>'+
    '<input type="submit" value="Sumbit">' +
    '<input type="reset" value="Reset">' +
    '</form>';

    page+='<br><br><a href="/">Home Page</a></body></html>';
    
    return page;

}

async function logResp(info, res){
    let page = '<html><head><title>Dating App Registration</title></head>' +
    '<body> <form method="post">' +
    '<h1>Please fill in your login information</h1>' +
    'Enter your username <input name="username"><br><br>'+
    'Enter your password <input name="password"><br><br>' +
    '<input type="submit" value="Login">' +
    '</form>';

    page+='<br><br><a href="/">Home Page</a>&emsp;&emsp;<a href="/register">Register here</a> </body></html>';
    
    
    return page;

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

app.post('/register', function(req, res){
    postData = '';
    req.on('data', (data) =>{
	postData+=data;
    });
    req.on('end', async ()=>{
	//Break into functions
	console.log(postData);
	if (moveOn(postData)){
	    //let col = dbManager.get().collection("activities");
	    //on the insert page
		try{
		    //if the data is bad, object creation throws an
		    //error (as we have seen since Week 4).
		    //And no document will be inserted
		    var currProfile = new profile(postParams.name,
						 postParams.age,
						 postParams.gender,
                         postParams.height,
                         postParams.race,
						 postParams.income,
                         postParams.religion);

		    //insert the document into the db
		  //let result = await col.insertOne(curDoc);
            
            let page = currProfile.displayProfile();
            page += '<br><br><a href="/">Home Page</a></body></html>';
            res.send(page);
		 // console.log(result); //log result for viewing
		} catch (err){
		    console.log(err.message);
		    let page = regResp(null, res);
		    res.send(page);
		}
	} else{ //can't move on
	    let page =  regResp(null, res);
	    res.send(page);
	}
    });
    	    
});


app.post('/login', function(req, res){
    postData = '';
    req.on('data', (data) =>{
	postData+=data;
    });
    req.on('end', async ()=>{
	//Break into functions
	console.log(postData);
	if (moveOn(postData)){
	    //let col = dbManager.get().collection("activities");
	    //on the insert page
		try{


		    //insert the document into the db
		  //  let result = await col.insertOne(curDoc);


          // insert code to verify login here
            
            res.send(page);
            





		   // console.log(result); //log result for viewing
		} catch (err){
		    console.log(err.message);
		    let page = regResp(null, res);
		    res.send(page);
		}
	} else{ //can't move on
	    let page =  regResp(null, res);
	    res.send(page);
	}
    });
    	    
});


app.use('*', function(req, res){
    res.writeHead(404);
    res.end(`<h1> ERROR 404. ${req.url} NOT FOUND</h1><br><br>`);
});


app.listen(6900, async ()=> {
    //start and wait for the DB connection
   try{
        await dbManager.get("datingApp");
    } catch (e){
        console.log(e.message);
    }

    console.log("Server is running...");
});