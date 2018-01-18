var app = angular.module('app', ['components'])
//public key retrieves wallet contents
app.controller('viewWallet', function($scope,$http) {
  walletViewer = this;

  $scope.showWallet = function(user) {
  $scope.balances = [];
  //console.log(user.publickey)
  var url = 'https://horizon.stellar.org/accounts/' + user.publickey;
  //console.log(url);
  $http.get(url).then(
     function successCallback(r) {
      //console.log(r.data)
      $scope.error = "";
      for (i=0; i<r.data.balances.length;i++) {
          //console.log(r.data);
          if (r.data.balances[i].asset_code !== undefined) {
            $scope.balances.push({"asset_code" : r.data.balances[i].asset_code, "balance" : r.data.balances[i].balance});
          }
          if (r.data.balances[i].asset_code == undefined) {
            $scope.balances.push({"asset_code" : "XLM", "balance" : r.data.balances[i].balance});
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

$scope.addVault = function(vault) {

  $scope.vaultObj = {"tokenName": vault.tokenName,
   "tokenSymbol": vault.tokenSymbol,
   "storeAmount": vault.storeAmount,
   "denomination": vault.denomination,
   "seed": vault.seed};
   //console.log($scope.vaultObj);

  $http.post('/submit', $scope.vaultObj).then(
      function successCallback(r) {
        console.log(r.data);
        $scope.error = "";
        
      } //end success
      , function errorCallback(r) {
        $scope.error = r.data.detail;
        console.log($scope.error);  
        } //end error
    ); //end http
  }; //end add function
  
}); //end viewWallet Controller