var app = angular.module('app', ['components'])
//public key retrieves wallet contents
app.controller('viewWallet', function($scope,$http,$interval,$timeout) {
  walletViewer = this;

  $scope.showWallet = function(user) {
  $scope.balances = [];
  $scope.vaults = [];

  //var url = 'https://horizon.stellar.org/accounts/' + user.publickey;
  var url = 'https://horizon-testnet.stellar.org/accounts/' + user.publickey; //test site
  //console.log(url);
  $http.get(url).then(
     function successCallback(r) {
      //var atobTest = r.data.data.GBV5LKMKWLBOO56E46VRIP65OMWSU3H2FGWOUFBXANXVMZJMPNZYEX7Y;
      //console.log(atob(atobTest));
      //var dataArray: Array = r.data.data;
      //console.log(dataArray);
      //console.log(r.data);
      $scope.error = "";
      for (i=0; i<r.data.balances.length;i++) {
          //console.log(r.data);
          if (r.data.balances[i].asset_code !== undefined) {
            if (r.data.data.hasOwnProperty(r.data.balances[i].asset_issuer)){
             //console.log(r.data.balances[i].asset_issuer)
             //console.log('IS A VAULT')
             var issuer = r.data.balances[i].asset_issuer;
             var assetName = atob(r.data.data[issuer]);
             //$scope.vaults.push({"asset_code": r.data.balances[i].asset_code, "balance": r.data.balances[i].balance, "asset_issuer": r.data.balances[i].asset_issuer, "asset_name": assetName}});
             //console.log($scope.balances.asset_code.vaults[0]);
           }
           else {
            $scope.balances.push({"asset_code": r.data.balances[i].asset_code, "balance": r.data.balances[i].balance, "asset_issuer": r.data.balances[i].asset_issuer});
          }
          }
          if (r.data.balances[i].asset_code == undefined) {
            $scope.balances.push({"asset_code": "XLM", "balance": r.data.balances[i].balance, "asset_issuer": r.data.balances[i].asset_issuer});
          }
        }

       for (j=0; j<$scope.balances.asset_code.vaults.length;j++) {
        //var urlOffers = "https://horizon.stellar.org/accounts/"+ $scope.vaults[j].asset_issuer +"/offers"; 
        var urlOffers = "https://horizon-testnet.stellar.org/accounts/"+ $scope.vaults[j].asset_issuer +"/offers"; //test
        //console.log(urlOffers);

        $http.get(urlOffers).then(
          function successCallback(r) {
            console.log(r);

            for (k=0; k<$scope.balances.length;i++) {
              if ($scope.balances.asset_code  == "XLM") {

              }
            }


          }, function errorCallback(r) {
          $scope.error = r.data.detail;
          console.log($scope.error);  
       }
       );
      } 
    } //end success
    , function errorCallback(r) {
      $scope.error = r.data.detail;
      console.log($scope.error);  
  } //end error
  ); //end http
}; //end add function
  

//passes public key data to modal  
$scope.passAsset = function(assets, user) {
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

  $scope.addVault = function(vault, walletContents, user) {
    $scope.vaultObj = { "asset_codeOrigin": walletContents.asset_code,
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

    
     function AlbumCtrl() {
        $scope.counter = 10;
        //console.log($scope.counter)
        $scope.onTimeout = function(){
            $scope.counter--;
            if ($scope.counter > 0) {
                mytimeout = $timeout($scope.onTimeout,1000);
            }// closes if statement
        }// coses onTimeout()
        var mytimeout = $timeout($scope.onTimeout,1000);
              
      }// closes AlbumCtrl 


    $interval($scope.showWallet, 10000, 1, true, user); //wait 10 seconds to refresh page 
    $interval(AlbumCtrl, 0, 1, true); 

  } //end add function
 
}); //end viewWallet Controller