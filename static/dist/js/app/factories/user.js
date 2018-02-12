var app = angular.module('appApp', ['ngAnimate', 'ngSanitize', 'ui.bootstrap']);

app.factory('userData', function() {
  //public key object
  var data = {
    transaction: {}		
  }
  return {
  	data, 
  	setTransaction: function(prop, val) {
  		this.data = Object.assign({}, data, {transaction: Object.assign({}, data.transaction, {[prop]: val})});
  	},
  	/*getTransaction: function() {
  		return data.transaction;
  	}*/

  }
  
}); //end service