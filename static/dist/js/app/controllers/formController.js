var app = angular.module('appApp');	

app.controller('formController', function ($scope, $uibModalInstance, assets, $http, userData) {

	//set data passed through modal
    $scope.walletContents = assets;
    console.log($scope.walletContents);

    //set and get data in service
	userData.setTransaction("transactionFee", 1.5);
	$scope.transaction = userData.data.transaction;

    $scope.cancel= function () {
        // user cancelled, return to parent controller
        $modalInstance.dismiss('cancel');
    };

    $scope.closeModal = function(){
       $modalInstance.close();
    }

    //toggle form type
    $scope.vaultToggle = 'Deposit';


    //prepopulate fields based on tokenSelection
    $scope.getData = function(option){
    	var myArray = $scope.walletContents.vaults;
    	var pos = myArray.map(function(e) { return e.asset_name; }).indexOf(option);
    	if (pos > -1) {
			$scope.vault = { "tokenSelection" : option, 
							"tokenSymbol" : $scope.walletContents.vaults[pos].asset_code,
						 	"denomination" : $scope.walletContents.vaults[pos].price,
						 	"availBalance" : $scope.walletContents.vaults[pos].availBalance 
						   };
		}
		else if (pos == -1) {
			$scope.vault = { "tokenSelection" : option, 
							"tokenSymbol" : null,
						 	"denomination" : null 
						   };
		}
	}

	//console.log($scope.vault.vaultToggle);

  	$scope.validateVault = function(vault) {
	    $scope.vaultObj = {
	    	"tokenSelection": vault.tokenSelection,
	    	"tokenName": vault.tokenName,
	      	"tokenSymbol": vault.tokenSymbol,
	      	"storeAmount": vault.storeAmount,
	      	"denomination": vault.denomination,
	      	"seed": vault.seed,
	      	"labValidate": vault.labValidate};

	    console.log("im in validateVault")
	    var vault = element(by.exactBinding('vault'));

	    var tokenSelectionValid = element(by.binding('vaultForm.tokenSelection.$valid'));
	    var tokenSelectionError = element(by.binding('vaultForm.tokenSelection.$error'));
	    var tokenSymbolValid = element(by.binding('vaultForm.tokenSymbol.$valid'));
	    var tokenSymbolError = element(by.binding('vaultForm.tokenSymbol.$error'));
	    var seedValid = element(by.binding('vaultForm.seed.$valid'));
	    var seedError = element(by.binding('vaultForm.seed.$error'));
	    var storeAmountValid = element(by.binding('vaultForm.storeAmount.$valid'));
	    var storeAmountError = element(by.binding('vaultForm.storeAmount.$error'));
	    var denominationValid = element(by.binding('vaultForm.denomination.$valid'));
	    var denominationError = element(by.binding('vaultForm.denomination.$error'));

	    var formValid = element(by.binding('vaultForm.$valid'));

	    var tokenSymbolLastInput = element(by.model('vault.tokenSymbol'));
	    var tokenSymbolLastInput = element(by.model('vault.tokenSymbol'));
	    var denominationLastInput = element(by.model('vault.denomination'));
	    var seedLastInput = element(by.model('vault.seed'));

	    //min length
	    it('should be invalid if less than required min length', function() {
	      /*tokenSymbolLastInput.clear();
	      tokenSymbolLastInput.sendKeys('xx');
	      seedLastInput.clear();
	      seedLastInput.sendKeys('xx');*/

	      expect(tokenSymbolValid.getText()).toContain('false');
	      expect(tokenSymbolError.getText()).toContain('minlength');
	      expect(seedValid.getText()).toContain('false');
	      expect(seedError.getText()).toContain('minlength');

	      expect(formValid.getText()).toContain('false');
	    });
	    //max length
	    it('should be invalid if longer than max length', function() {
	      /*tokenSymbolLastInput.clear();
	      tokenSymbolLastInput.sendKeys('some ridiculously long name');
	      seedLastInput.clear();
	      seedLastInput.sendKeys('some ridiculously long name');*/

	      expect(tokenSymbolValid.getText()).toContain('false');
	      expect(tokenSymbolError.getText()).toContain('maxlength');
	      expect(seedValid.getText()).toContain('false');
	      expect(seedError.getText()).toContain('maxlength');

	      expect(formValid.getText()).toContain('false');
	    });
	    //max value
	    it('should be invalid if exceeds max', function() {
	      /*tokenSymbolLastInput.clear();
	      tokenSymbolLastInput.sendKeys('some ridiculously long name');
	      seedLastInput.clear();
	      seedLastInput.sendKeys('some ridiculously long name');*/

	      expect(storeAmountValid.getText()).toContain('false');
	      expect(storeAmountError.getText()).toContain('max');

	      expect(formValid.getText()).toContain('false');
	    });

	    var denomination = element(by.binding('denomination'));
	    var input = element(by.id('denomination'));

	    it('should validate the input with the default pattern', function() {
	      input.sendKeys('aaa');
	      expect(denomination.getText()).not.toContain('aaa');

	      input.clear().then(function() {
	        input.sendKeys('123');
	        expect(denomination.getText()).toContain('123');
	      });
	      expect(denominationValid.getText()).toContain('false');
	      expect(denominationError.getText()).toContain('pattern');
	    });
  	}

   //StellarSdk.Network.useTestNetwork(); //production
   //var server = new StellarSdk.Server('https://horizon-testnet.stellar.org');  //production
   StellarSdk.Network.useTestNetwork(); //test
   var server = new StellarSdk.Server('https://horizon-testnet.stellar.org');  //test
   
   $scope.postVault = function(vault, walletContents, user) {
	   	$scope.vaultObj = { 
	    	"asset_codeOrigin": walletContents.asset_code,
	      	"asset_issuerOrigin": walletContents.asset_issuer,
	      	"tokenName": vault.tokenName,
	      	"tokenSymbol": vault.tokenSymbol,
	      	"storeAmount": vault.storeAmount,
	      	"denomination": vault.denomination,
	      	"publicKey": user.publickey
	     };
	    //overwrite with dropdown selection, if not new
		if (!(vault.tokenSelection == 'new')) {
			$scope.vaultObj.tokenName = vault.tokenSelection;
		}
	    $scope.seed = vault.seed


    console.log($scope.vaultObj);

    $http.post('/vaultDeposit', $scope.vaultObj, $scope.seed).then(
      function successCallback(r) {
        console.log(r.data)
        // wrap the envelope as a transaction object
        $scope.transaction = new StellarSdk.Transaction(r.data.envelope);
        //console.log($scope.vaultObj)
        $scope.error = "";
      }, function errorCallback(r) {
        $scope.error = r.data.detail;
        console.log($scope.error);
      } //end error
    ) //end http
    .then( function(handleFunction){
    	userData.setTransaction("transactionInProgress", true);
    	//$scope.transaction.transactionInProgress = true;
    	console.log(userData.transaction);
      	//sign transaction with seed
      	$scope.transaction.sign(StellarSdk.Keypair.fromSecret(vault.seed));
      	//submit transaction
      	server.submitTransaction($scope.transaction)
      	//instructions to log response from Stellar
      	.then(function (transactionResult) {
    console.log(transactionResult);
    $scope.showWallet(user);
      })
      .catch(function (err) {
        console.error(err);
        //add and pass error
    	userData.setTransaction("transactionFailed", true);
    	console.log($scope.transaction);
      });
    });


  } //end add function


}); 