const dbManager = require('./dbManager.js'); 
class User
{
	constructor(username, password, city, state, email) 
	{
		this.username = username.trim();
		this.password = password.trim();
		this.city = city.toLocaleUpperCase().trim();
		this.state = state.toLocaleUpperCase().trim();
		this.email = email.trim();
		this.blockList = [];
		this.profile = {};
		// this.profile_picture = path_to_image;
	}
	// placeholder for update() function, which updates the object in MongoDB

    unblock(username)
    {
		let temp = this.blockList.indexOf(username.trim());// test this function to see if the if statement will run before assignment finishes
		if (temp > -1)
		{
			console.log(`[${new Date().toLocaleTimeString("en-US", {timeZone: "America/New_York"})}] ${this.username} unblocked ${username}`);
			delete this.blockList[temp]; // this statement can waste memory
		}
    }
    checkBlockList(username)
    {
		for (let i of this.blockList)
		{
			if (i == username.trim())
				return true;
		}
		return false;
    }
    block(username)
    {
		if(this.checkBlockList(username.trim()))
			return;
		else
		{
			console.log(`[${new Date().toLocaleTimeString("en-US", {timeZone: "America/New_York"})}] ${this.username} blocked ${username}`);
			this.blockList.push(username.trim());
		}	
    }
	async login()
	{
		let col = dbManager.get().collection("users");
		const userObj = await col.findOne({username: this.username});
		if (userObj != null)
		{
			if (userObj.password == this.password)
			{
				console.log(`[${new Date().toLocaleTimeString("en-US", {timeZone: "America/New_York"})}] ${this.username} logged in successfully`);
				return true;
			}
		}
		console.log(`[${new Date().toLocaleTimeString("en-US", {timeZone: "America/New_York"})}] Failed login attempt for ${this.username}`);
		return false;
	}
	async register()
	{
		let col = dbManager.get().collection("users");
		const userObj = await col.findOne({username: this.username});
		if(userObj == null)
		{
			let result = await col.insertOne(this);
			if(result.insertedCount == 1)
			{
				console.log(`[${new Date().toLocaleTimeString("en-US", {timeZone: "America/New_York"})}] ${this.username} has been registered`);
				return true;
			}
			else
			{
				console.log(`[${new Date().toLocaleTimeString("en-US", {timeZone: "America/New_York"})}] Registration failed. Mongo failed to insert ${this.username} into the database`);
				return false;
			}
		}
		console.log(`[${new Date().toLocaleTimeString("en-US", {timeZone: "America/New_York"})}] Registration failed. ${this.username} already exists in the database`);
		return false;
	}
	get Username()
	{
		return this.username;
	}
	get Password()
	{
		return this.password;
	}
	get City()
	{
		return this.city;
	}
	get State()
	{
		return this.state;
	}
	get Email()
	{
		return this.email;
	}
	get Profile()
	{
		return this.profile;
	}
	get BlockList()
	{
		return this.blockList;
	}
	// getProfilePicture()
	// {
	// 	return path_to_image;
	// }

	set Username(username)
	{
		this.username = username;
	}
	set Password(password)
	{
		this.password = password;
	}
	set City(city)
	{
		this.city = city;
	}
	set State(state)
	{
		this.state = state;
	}
	set Email(email)
	{
		this.email = email;
	}
	set Profile(profile)
	{
		//check that profile is a valid profile
		this.profile = profile;
	}
	// setProfilePicture()
	// {
	// 	this.profile_picture = path_to_image;
	// }
}

module.exports = User;
