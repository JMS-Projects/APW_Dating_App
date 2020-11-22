
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
            const blockedList = [];

        } 
        catch (err)
        {
            console.log(err.message);
            throw (err);
        }
		

    }

    // sets the name
    setName(name){
        this.name=name;

    }
    //sets the age
    setAge(age){
        this.age=age;

    }
    //sets the gender
    setGender(gender){
        this.gender=gender;

    }
    //sets the height
    setHeight(height){
        this.height=height;

    }
    //sets the race
    setRace(race){
        this.race=race;

    }
    //sets the income
    setIncome(){
        this.income=income;

    }
    //sets the religion
    setReligion(religion){
        this.religion=religion;

    }
    /*work in progress but will basically check if the
    profile that is passed in's id is in the blocked list if it
    is not then at the end it adds it to the list if it doesnt 
    it will just return
    */
    block(profile)
    {
        for( num in blockedList)
        {
            if(profile.id == num)
            {
                return;
            }
        }
        blockedList.insert(profile.id);
    }
    // should display the profile information
    displayProfile()
    {
        var page = '<html><head><title>Profile</title></head>' +
        '<body><h1>Your Profile</h1>' +
        'Name: ' + this.name+ '<br><br>'+
        'Age: ' + this.age + '<br><br>' +
        'Gender: ' + this.gender + '<br><br>' +
        'Height: ' + this.height + ' cm' + '<br><br>' + 
        'Race: '+ this.race + '<br><br>' +
        'Income: ' + this.income + '<br><br>' +
        'Religion: ' + this.religion + '<br><br>';

        return page;

    }




}
module.exports = profile;