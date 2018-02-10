## Store

#### Description:
A utility for creating and maintaining the state of your client side application.

#### PUT:

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

#### GET:

    var store = new Store(); //Returns a new Store object
    store.get(); //Returns the store object
    store.get('data.type'); //Returns the value of the path, e.g., 'informational'
    
#### REMOVE:

    var store = new Store(); //Returns a new Store object
    store.remove('data.type'); //Removes the type property of the data object and returns the store object
    
## StoreProvider

#### Description:
A utility for AngularJS applications that automatically keeps the data returned from the server in the store so that you don't have to worry about manually keeping the client side state up-to-date.

#### Usage:

    angular.module('example.module', ['store.module'])
        .run(function(Store) {
            Store.setBaseUrl('smurf/api');
        })
        .factory('RandomService', function(Store) {
            var randomServiceStore = new Store();
            var typeStoragePath = 'data.type'; //Tells the randomServiceStore where to store the response from the ajax call
            var typeStorageConfiguration = {
                url: '/type/{id}', //Tells the randomServiceStore what api to hit. Automatically prepends the baseUrl, e.g., smurf/api
                //Note: If the url is left out of the configuration object then the Store utility will not make ajax calls and will only updated the data store on the client
                method: 'GET', //Only creates the get method for this call. Leave blank to create all CRUD methods
                headers: { //Headers for the ajax call
                    "cache-control": "no-cache"
                },
                store: true //Tells the randomServiceStore whether to keep the returned data in memory automatically
            };
            
            randomServiceStore.set(typeStoragePath, typeStorageConfiguration);
            
            //Note: For informational purposes I will be giving examples of all of the CRUD methods even though we only used 'GET' in the method above. If you want to generate all of the CRUD methods similar to my example please don't set the method property in the configuration object.
            
            //Note: All methods created by the Store utility return a promise if a url was provided.
            
            return {
                store: randomServiceStore,
                getType: getType,
                putType: putType,
                postType: postType,
                removeType: removeType
            };
            
            function getType() {
                return randomServiceStore.get(typeStoragePath, {
                    id: 3
                });
                //Gets data from smurf/api/type/{id}
                //Replaces id with the matching parameter object property, e.g., 3
                //Then it returns the response from the server
            }
            
            function putType(newValue) {
                return randomServiceStore.put(typeStoragePath, newValue, {
                    id: 3
                });
                //Performs a put request and stores the response in the typeStoragePath if store was set to true in the configuration object
                //Then it returns the response from the server
            }
            
            function postType(newValue) {
                return randomServiceStore.post(typeStoragePath, newValue, {
                    id: 3
                });
                //Performs a post request and stores the response in the typeStoragePath if store was set to true in the configuration object
                //Then it returns the response from the server
            }
            
            function removeType() {
                return randomServiceStore.remove(typeStoragePath, {
                    id: 3
                });
                //Performs a delete request and then returns the updated store.
            }
        });

    angular.module('example.module')
        .controller(function(RandomService) {
            var model = this; //If using controllerAs syntax otherwise it will just be $scope
            var newTypeObject = {
                description: 'New type information goes here'
            };
            
            model.data = {};
            
            RandomService.store.bind(model.data); //Updates the model.data with the with the data on the RandomService.store
            
            //Note: bind only performs a one-time binding to the object that you pass in
            
            RandomService.store.setBind(model.data); //Sets the model.data object as the default binding object for the RandomService.store
            
            //Note: setBind performs a binding to the object that you pass in each time that you execute a CRUD method
            RandomService.getType().then(function(response) {
                //If you used setBind then the response will be automatically reflected on model.data
                //e.g. modal.data.type will be equal to response already
                //OR
                //RandomService.store.bind(model.data);
                //OR
                //model.data.type = response;
            });
            
            RandomService.putType(newTypeOjbect).then(function(response) {
                //If you used setBind then the response will be automatically reflected on model.data
                //e.g. modal.data.type will be equal to response already
                //OR
                //RandomService.store.bind(model.data);
                //OR
                //model.data.type = response;
            });
            
            RandomService.postType(newTypeObject).then(function(response) {
                //If you used setBind then the response will be automatically reflected on model.data
                //e.g. modal.data.type will be equal to response already
                //OR
                //RandomService.store.bind(model.data);
                //OR
                //model.data.type = response;
            });
            
            RandomService.removeType().then(function(response) {
                //If you used setBind then the response will be automatically reflected on model.data
                //e.g. modal.data.type will be equal to response already
                //OR
                //RandomService.store.bind(model.data);
                //OR
                //model.data.type = response;
            });
        });
