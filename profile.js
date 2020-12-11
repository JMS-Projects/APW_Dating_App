
class profile 
{
    constructor(name, age, gender, height, race, hobby, income, religion) 
    {

	    
        try
        {
            this.name= name;
            this.age = age;
            this.gender = gender;
            this.height = height;
            this.race= race;
            this.hobby = hobby;
            this.income = income;
            this.religion = religion;

        } 
        catch (err)
        {
            console.log(err.message);
            throw (err);
        }
		

    }


}
module.exports = profile;