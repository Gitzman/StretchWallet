var app = angular.module('app', ['components'])
//public key retrieves wallet contents
app.controller('viewWallet', function($scope,$http) {
  walletViewer = this;

  $scope.showWallet = function(user) {
  $scope.balances = [];
  //console.log(user.publickey)
  //var url = 'https://horizon.stellar.org/accounts/' + user.publickey;
  var url = 'https://horizon-testnet.stellar.org/accounts/' + user.publickey; //test site
  //console.log(url);
  $http.get(url).then(
     function successCallback(r) {
      //var atobTest = r.data.data.GBV5LKMKWLBOO56E46VRIP65OMWSU3H2FGWOUFBXANXVMZJMPNZYEX7Y;
      //console.log(atob(atobTest));
      //var dataArray : Array = r.data.data;
      //console.log(dataArray);
      //console.log(r.data);
      $scope.error = "";
      for (i=0; i<r.data.balances.length;i++) {
          //console.log(r.data);
          if (r.data.balances[i].asset_code !== undefined) {
            $scope.balances.push({"asset_code" : r.data.balances[i].asset_code, "balance" : r.data.balances[i].balance, "asset_issuer" : r.data.balances[i].asset_issuer});
          }
          if (r.data.balances[i].asset_code == undefined) {
            $scope.balances.push({"asset_code" : "XLM", "balance" : r.data.balances[i].balance, "asset_issuer" : r.data.balances[i].asset_issuer});
          }
        }
    } //end success
    , function errorCallback(r) {
      $scope.error = r.data.detail;
      console.log($scope.error);  
  } //end error
  ); //end http
}; //end add function
//passes public key data to modal  
$scope.passAsset = function(assets) {
      $scope.walletContents = assets;
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

  $scope.addVault = function(vault, walletContents) {
    $scope.vaultObj = { "asset_codeOrigin" : walletContents.asset_code,
     "asset_issuerOrigin": walletContents.asset_issuer,
     "tokenName": vault.tokenName,
     "tokenSymbol": vault.tokenSymbol,
     "storeAmount": vault.storeAmount,
     "denomination": vault.denomination,
     "seed": vault.seed};
     console.log($scope.vaultObj);

    $http.post('/vaultDeposit', $scope.vaultObj).then(
        function successCallback(r) {
          //console.log($scope.vaultObj)
          $scope.error = "";
          
        } //end success
        , function errorCallback(r) {
          $scope.error = r.data.detail;
          console.log($scope.error);  
          } //end error
      ); //end http
    }; //end add function
 
 $scope.timeOut = function(timeInMs) {
    $scope.timeInMs = 0;

    var countUp = function() {
        $scope.timeInMs+= 500;
        $timeout(countUp, 500);
    }

    $timeout(countUp, 500);
}

}); //end viewWallet Controller