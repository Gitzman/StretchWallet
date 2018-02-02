var app = angular.module('app', [])

app.controller('viewWallet', function($scope,$http,$interval,$timeout) {
walletViewer = this;

$scope.vaultsExist = false; //turn off vault column in wallet view unless vaults exist in data object
StellarSdk.Network.useTestNetwork();
var server = new StellarSdk.Server('https://horizon-testnet.stellar.org');

  $scope.showWallet = function(user) { //public key retrieves wallet contents
    $scope.balances = [];
    $scope.vaults = [];

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
        console.log($scope.vaults);
        $scope.nameArray=[]; //keep track of vault names to merge vaults with the same asset name
        angular.forEach($scope.vaults, function(vaults) {
          //var urlOffers = "https://horizon.stellar.org/accounts/"+ $scope.vaults[j].asset_issuer +"/offers"; //production
          var urlOffers = "https://horizon-testnet.stellar.org/accounts/"+ vaults.asset_issuer +"/offers"; //test

          $scope.assetOrigin="";
          $scope.priceOrigin="";
          $scope.availBalance="";

          //capture index of vault name to sum balance by vault
          var index = $scope.nameArray.indexOf(vaults.asset_name.toString(), 0);
          if (index == -1) {
            $scope.nameArray.push(vaults.asset_name);
          }

          $http.get(urlOffers).then(
            function successCallback(r) {
              console.log(r);
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
                if ($scope.assetOrigin == $scope.balances[k].asset_code) {
                  if (index == -1) {
                    $scope.balances[k].vaults.push({"asset_code": vaults.asset_code, "balance": vaults.balance, "availBalance": $scope.availBalance, "asset_issuer": vaults.asset_issuer, "asset_name": vaults.asset_name, "price": $scope.priceOrigin}); //price is exchange rate

                  }
                  if (index > -1) {
                    console.log("current vault row balance " + vaults.balance);
                    console.log("current vault INDEX row balance " + $scope.balances[k].vaults[index].balance);
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
          //calculate totals
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
        });
      console.log($scope.balances);
      } //end success
      , function errorCallback(r) {
        $scope.error = r.data.detail;
        console.log($scope.error);
      } //end error
    ); //end http
  } //end showWallet function


//passes public key data to modal
  $scope.passAsset = function(assets, vaults, user) {
    $scope.walletContents = assets;
    $scope.vaultContents = assets.vaults;
    $scope.myModalInstance = angular.element('#buildVault').modal();
  } //end passAsset


  $scope.validateVault = function(vault) {
    $scope.vaultObj = {"tokenName": vault.tokenName,
      "tokenSymbol": vault.tokenSymbol,
      "storeAmount": vault.storeAmount,
      "denomination": vault.denomination,
      "seed": vault.seed};

    var vault = element(by.exactBinding('vault'));

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
    var seedLastInput = element(by.model('vault.seed'));
    var storeAmountLastInput = element(by.model('vault.storeAmount'));

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

  $scope.addVault = function(vault, walletContents, user) {
    $scope.vaultObj = { "asset_codeOrigin": walletContents.asset_code,
      "asset_issuerOrigin": walletContents.asset_issuer,
      "tokenName": vault.tokenName,
      "tokenSymbol": vault.tokenSymbol,
      "storeAmount": vault.storeAmount,
      "denomination": vault.denomination,
      "publicKey": user.publickey};

    $scope.seed = vault.seed


      console.log($scope.vaultObj);

    $http.post('/vaultDeposit', $scope.vaultObj, $scope.seed).then(
      function successCallback(r) {
        console.log(r.data)
        // wrap the envelope as a transaction object
        $scope.transaction = new StellarSdk.Transaction(r.data.envelope);
        //console.log($scope.vaultObj)
        $scope.error = "";
        $scope.transactionInProgress = true;
      }, function errorCallback(r) {
        $scope.error = r.data.detail;
        console.log($scope.error);
      } //end error
    ) //end http
    .then( function(handleFunction){

      //sign transaction with seed
      $scope.transaction.sign(StellarSdk.Keypair.fromSecret(vault.seed));
      //submit transaction
      server.submitTransaction($scope.transaction)
      //instructions to log response from Stellar
      .then(function (transactionResult) {
    console.log(transactionResult);
    $scope.showWallet(user);
    $scope.transactionInProgress = false;
      })
      .catch(function (err) {
          console.error(err);
      });
    });


  } //end add function

  

}); //end viewWallet Controller
