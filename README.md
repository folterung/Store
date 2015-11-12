Simple store object for holding state.

##Store

####Description:
A utility for making data store transactions easier.

####Usage:

    var store = new Store(); //Returns a new Store object
    store.put('data.type', 'informational'); //Stores the value 'informational' in an data.type
    
    store.put({
      data: {
        type: 'information'
      }
    }); //Sets the store object equal to the object that you passed into put
    
    store.put(['data.type', 'data.size'], ['informational', 234]);
    //Iterates through the array and sets the value for each path
    
    NOTE: If the path to the property doesn't exist then it will be created for you automatically
