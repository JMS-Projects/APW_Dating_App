
class profile 
{
    constructor(name, age, gender, height, race, income, religion) 
    {

	    
        try
        {
            this.name= name;
            this.age = age;
            this.gender = gender;
            this.height = height;
            this.race= race;
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