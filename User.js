const dbManager = require('./dbManager.js');
class User
{
	// the args object can have the properties: username, password, city, state, email, blockList, profile, pfp_path
	constructor(args = {}) 
	{
		if (args.username)	this.username = args.username.trim();
		if (args.password)	this.password = args.password.trim();
		if (args.city)		this.city = args.city.toLocaleUpperCase().trim();
		if (args.state)		this.state = args.state.toLocaleUpperCase().trim();
		if (args.email)		this.email = args.email.trim();
		if (args.blockList)	this.blockList = args.blockList;
		if (args.profile)	this.profile = args.profile;
		if (args.pfp_path)  this.profile_picture_path = args.pfp_path;
	}

    unblock(username)
    {
		let temp = this.blockList.indexOf(username.trim());
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
	get PfP_Path()
	{
		return this.pfp_path
	}

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
		this.profile = profile;
	}
	set PfP_Path(img_path)
	{
		this.pfp_path = img_path;
	}
}

module.exports = User;
