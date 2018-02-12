var app = angular.module('appApp');

app.controller('viewWallet', function($scope, userData, $http, $uibModal) {
	walletViewer = this;

  	$scope.user = userData.user;
  	$scope.balances = userData.balances;
  	$scope.vaults = userData.vaults;

//  	$scope.transaction = userData.getTransaction();
	$scope.userData=userData;

	
	/*window.setInterval(function()
		{
			console.log("user data is "+ JSON.stringify(userData));
			console.log("user scope data is "+ JSON.stringify($scope.userData))
		}, 2000
	);*/
  	

    $scope.showWallet = function(user) { //public key retrieves wallet contents

    	//reset data before requerying
    	$scope.balances = []; 
    	$scope.vaults = [];
    	userData.setTransaction("transactionInProgress", false);
    	userData.setTransaction("transactionFailed", false);
    	//end reset data

    	//var url = 'https://horizon.stellar.org/accounts/' + user.publickey; //production
    	var url = 'https://horizon-testnet.stellar.org/accounts/' + user.publickey; //test

	    $http.get(url).then(
	      	function successCallback(r) {
		        //console.log(r.data);
		        $scope.error = "";
		        for (i=0; i<r.data.balances.length;i++) {
		          //console.log(r.data);
		          if (r.data.balances[i].asset_code == undefined) { //XLM add
		            $scope.balances.push({"asset_code": "XLM", "balance": parseFloat(r.data.balances[i].balance), "asset_issuer": r.data.balances[i].asset_issuer, "vaults" : []});
		          }
		          if (r.data.balances[i].asset_code !== undefined) { //Vaults add
		            if (r.data.data.hasOwnProperty(r.data.balances[i].asset_issuer)) {
		              if (r.data.balances[i].balance > 0) {
		                $scope.vaults.push({"asset_code": r.data.balances[i].asset_code, "balance": parseFloat(r.data.balances[i].balance), "asset_issuer": r.data.balances[i].asset_issuer, "asset_name": atob(r.data.data[r.data.balances[i].asset_issuer.toString()])});
		              }
		            }
		            else { //Remaining currencies add
		              $scope.balances.push({"asset_code": r.data.balances[i].asset_code, "balance": parseFloat(r.data.balances[i].balance), "asset_issuer": r.data.balances[i].asset_issuer, "vaults" : []});
		            }
		          }
		        }
				//console.log($scope.vaults);
			    $scope.nameArray=[]; //keep track of vault names to merge vaults with the same asset name
			    
			    angular.forEach($scope.vaults, function(vaults) {
			        //var urlOffers = "https://horizon.stellar.org/accounts/"+ $scope.vaults[j].asset_issuer +"/offers"; //production
			        var urlOffers = "https://horizon-testnet.stellar.org/accounts/"+ vaults.asset_issuer +"/offers"; //test
			        console.log(urlOffers);
			        $scope.assetOrigin="";
			        $scope.priceOrigin="";
			        $scope.availBalance="";

			        $http.get(urlOffers).then(
			        	function successCallback(r) {
			            	console.log(r);
			            	$scope.error = "";
					        	if (r.data._embedded.records[0].selling.asset_type !== undefined) {
					            	$scope.assetOrigin = "XLM";
					            }
					            if (r.data._embedded.records[0].selling.asset_code !== undefined) {
					             	$scope.assetOrigin = r.data._embedded.records[0].selling.asset_code;
					            }
					            if (r.data._embedded.records[0].price !== undefined) {
					                $scope.priceOrigin = parseInt(1 / r.data._embedded.records[0].price);
					            }
					            if (r.data._embedded.records[0].amount !== undefined) {
					                $scope.availBalance = parseFloat(r.data._embedded.records[0].amount);
					            }
					            for (var k=0; k<$scope.balances.length;k++) {
					            	//capture index of vault name to sum balance by vault
								    var index = $scope.nameArray.indexOf(vaults.asset_name.toString(), 0);
								    if (index == -1) {
								     	$scope.nameArray.push(vaults.asset_name);
								    }
					            	if ($scope.assetOrigin == $scope.balances[k].asset_code) {
					                	if (index == -1) {
					                    	$scope.balances[k].vaults.push({"asset_code": vaults.asset_code, "balance": vaults.balance, "availBalance": $scope.availBalance, "asset_issuer": vaults.asset_issuer, "asset_name": vaults.asset_name, "price": $scope.priceOrigin}); //price is exchange rate
					                  	}
					                  	if (index > -1) {
					                    	$scope.balances[k].vaults[index].balance = parseFloat($scope.balances[k].vaults[index].balance) + parseFloat(vaults.balance);
					                    	$scope.balances[k].vaults[index].availBalance = parseFloat($scope.balances[k].vaults[index].availBalance) + parseFloat($scope.availBalance);
					                    //ADD ISSUER AS A AN ARRAY
					                  	}
					                  	$scope.vaultsExist = true;
					                  	break;
					                }
					            }
			              		console.log($scope.balances);
			            }, function errorCallback(r) {
			                $scope.error = r.data.detail;
			                console.log($scope.error);
			            }
			        );
			     })
			} //end success
			      , function errorCallback(r) {
			        $scope.error = r.data.detail;
			        console.log($scope.error);
			      } //end error
			    ); //end http

    }

  	//show Vault Details in Wallet
  	$scope.IsHidden = true;
  	$scope.toggle = function() {
      	//If DIV is hidden it will be visible and vice versa.
      	$scope.IsHidden = $scope.IsHidden ? false : true;
  	}//end toggle

	//calculate vault total
	$scope.getTotal = function(){
		var total = 0;
		for(var i = 0; i < $scope.balances.length; i++){
			for(var j = 0; j < $scope.balances[i].vaults.length; j++){
				var vaultavailBalance = $scope.balances[i].vaults[j].availBalance;
			    total += vaultavailBalance;
			}
		}
		return total;
	}

	$scope.openModal = function(assets) {
	    var assets = assets;
	    var modalInstance = $uibModal.open({
						  scope: $scope,
		                  templateUrl: '/buildVault',
		                  controller: 'formController',
		                  size: 'lg',
		                  resolve: {
		                    assets: function() {
		                      return assets;
		                    }
		                  }
		                }).result.catch(function(res) {
	  							if (!(res === 'cancel' || res === 'escape key press' || res=== 'backdrop click')) {
	  	  							throw res;
	  							}
							});

	} //end openModal

}) //end viewWallet controller