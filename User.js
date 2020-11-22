let dbManager = require('./dbManager'); 
let col = dbManager.get().collections("activities");
class User
{
	constructor(username, password, city, state, email) 
	{
		this.username = username;
		this.password = password;
		this.city = city;
		this.state = state;
		this.email = email;
		// this.profile_picture = path_to_image;
	}
	// placeholder for update() function, which updates the object in MongoDB	
	async login()
	{
		// find a User object in MongoDB by this.username
		// if the user doesn't exist return "fail_username"
		// compare this.password to the MongoDB password
		// if they're the same, return "success" else return "fail_password"
		
		const userObj = await col.findOne({username: [this.username]});
		if (userObj.password == this.password)
			return "success";
		else return "fail_password";
	}
	async register()
	{
		// check if username exists in MongoDB
		// if it does not exist, then save the User object to MongoDB and return true
		// else return false
		if(!exist)
		{
			let result = await col.insertOne(this);
			if(result.insertedCount == 1)
				return true;
		}
		return false;
	}
	getUsername()
	{
		return this.username;
	}
	getPassword()
	{
		return this.password;
	}
	getCity()
	{
		return this.city;
	}
	getState()
	{
		return this.state;
	}
	getEmail()
	{
		return this.email;
	}
	// getProfilePicture()
	// {
	// 	return path_to_image;
	// }

	setUsername(username)
	{
		this.username = username;
	}
	setPassword(password)
	{
		this.password = password;
	}
	setCity(city)
	{
		this.city = city;
	}
	setState(state)
	{
		this.state = state;
	}
	setEmail(email)
	{
		this.email = email;
	}
	// setProfilePicture()
	// {
	// 	this.profile_picture = path_to_image;
	// }
}

module.exports = User;
