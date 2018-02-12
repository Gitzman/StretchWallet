from __future__ import print_function # Python 2/3 compatibility
from stellarVault import *
from stellar_base.horizon import horizon_testnet, horizon_livenet, query
import boto3
import json
import decimal
from boto3.dynamodb.conditions import Key
from stellar_base.keypair import Keypair
from stellar_base.asset import Asset
from stellar_base.operation import Payment
from stellar_base.operation import CreateAccount
from stellar_base.transaction import Transaction
from stellar_base.transaction_envelope import TransactionEnvelope as Te
from stellar_base.memo import TextMemo
from stellar_base.horizon import horizon_testnet, horizon_livenet
import requests
from stellar_base.operation import AllowTrust
from stellar_base.operation import ChangeTrust
from stellar_base.operation import SetOptions
from stellar_base.operation import ManageOffer
from stellar_base.operation import CreatePassiveOffer
from stellar_base.operation import ManageData
import sys

# Helper class to convert a DynamoDB item to JSON.
class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, decimal.Decimal):
            if o % 1 > 0:
                return float(o)
            else:
                return int(o)
        return super(DecimalEncoder, self).default(o)

dynamodb = boto3.resource('dynamodb', region_name='us-west-2', endpoint_url="http://localhost:8000")
ALLOWED_EXTENSIONS = set(['txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'xlsx', "odt"])

def getFederation(stellar_address, requesttype):
    data = {
      "stellar_address": stellar_address,
      "account_id": "GCQROFPY6VKJHLQYYFNHDXVDKBNSYNXESCBA7BE3EGNISDY6DT2ORJ2P",
      "memo_type": "text",
      "memo": "hello"
    }
    return data

def getBalance(publicKey):
    response = query('https://horizon.stellar.org/accounts/{0}'.format(publicKey))
    return response['balances']


def buildVault(data):
    tokenName = data['tokenName']
    tokenSymbol = data['tokenSymbol']
    denomination = data['denomination']
    amount = data['storeAmount']
    assetSymbol = data['asset_codeOrigin']
    publickey = data['publicKey']
    try:
        assetIssuer =  data['asset_issuerOrigin']
    except:
        assetIssuer = ''

    xdr = deal(publickey, tokenName, tokenSymbol, assetSymbol, assetIssuer, denomination, amount, 'createVault')
    labLink = "https://www.stellar.org/laboratory/#txsigner?xdr={0}&network=test".format(urllib.quote_plus(xdr))
    #response2, vault = deal(seed, tokenName, tokenSymbol, assetSymbol, assetIssuer, denomination, amount, 'issueVault', vault)
    print((xdr), file=sys.stderr)
    return xdr, labLink


    """

              StellarSdk.Network.useTestNetwork();
              var server = new StellarSdk.Server('https://horizon-testnet.stellar.org');

              var transaction = new StellarSdk.Transaction(r.data.envelope);
              transaction.sign(StellarSdk.Keypair.fromSecret($scope.vaultObj.seed));
              server.submitTransaction(transaction)
    """

def redeemVault(data):
    seed = data['seed']
    tokenIssuer = data['tokenIssuer']
    tokenSymbol = data['tokenSymbol']
    denomination = data['denomination']
    amount = data['redeemAmount']
    assetSymbol = data['asset_codeOrigin'],
    tokenName = ''
    try:
        assetIssuer =  data['asset_issuerOrigin'],
    except:
        assetIssuer = ''
    response = deal(seed, tokenName, tokenSymbol, assetSymbol, assetIssuer, denomination, amount, 'redeemOffer', vaultAddress = tokenIssuer)
    print((response), file=sys.stderr)
    response2, vault = deal(seed, tokenName, tokenSymbol, assetSymbol, assetIssuer, denomination, amount, 'issueVault', vault)
    return response2

def deal(publickey, tokenName, tokenSymbol,assetSymbol, assetIssuer, denomination, amount, operationCode, vault =1, vaultAddress=''):
    kp = vault

    minamount='2'


    #Create Vault Account Credentials
    if kp == 1:
        kp = Keypair.random()
    vaultKey = kp.address().decode()
    newseed = kp.seed().decode()


    #Connect to Horizon
    horizon = horizon_testnet()

    #declareAssets
    if assetIssuer == '':
        storedAsset = Asset("XLM")
    else:
        storedAsset = Asset(assetSymbol, assetIssuer)
    safeAsset = Asset(tokenSymbol, vaultKey)

    # Create Vault Account Operation Step 1
    issueAccount = CreateAccount({
        'destination': vaultKey,
        'starting_balance': str (amount)
    })


    #Trust Issuer of safeAsset Step 2
    trustIssuer = ChangeTrust({
        'asset': safeAsset,
        'limit': str(amount/denomination)
    })

    #Set Options to Revocable Authority and Required Authority Step 3
    setAuthority = SetOptions({
        'source': vaultKey,
        'set_flags': 1
    })


    #Accept trust of user Step 4
    trustUser = AllowTrust({
        'source' : vaultKey,
        'trustor': publickey,
        'asset_code': tokenSymbol,
        'authorize' : 'True'
    })

    #Pay new asset to user Step 5
    payUser = Payment({
        'source' : vaultKey,
        'destination': publickey,
        'amount': str(amount/denomination),
        'asset':safeAsset
    })

    #Create Offer to redeem token
    buyOffer = CreatePassiveOffer({
        'selling': safeAsset,
        'buying': storedAsset,
        'amount': str(amount),
        'price':str(denomination)
    })

    #Create offer to sell token
    sellOffer = CreatePassiveOffer({
        'source' : vaultKey,
        'selling': storedAsset,
        'buying': safeAsset,
        'amount': str(amount),
        'price':str(1.0 / denomination)
    })


    #Redeem token for Asset
    depositOffer = ManageOffer({
        'selling': storedAsset,
        'buying': safeAsset,
        'amount': str(amount),
        'price':str(1/(denomination+.0000001))
    })

    #Redeem token for Asset
    redeemOffer = ManageOffer({
        'selling': safeAsset,
        'buying': storedAsset,
        'amount': str(amount/denomination),
        'price':str((denomination-.0000001))
    })


    #Kill Account Step 8
    killVault = SetOptions({
        'source' : vaultKey,
        'master_weight' : 0
})

    declareVault = ManageData({
            'data_name': vaultKey,
            'data_value': tokenName})

    operationCodes = {'createVault' : {'operations': [issueAccount, trustIssuer, declareVault,
                                                    setAuthority, trustUser, payUser,
                                                    sellOffer, killVault]},
                     'redeemOffer': {'operations':[redeemOffer]},
                     'depositOffer': {'operations':[depositOffer]}}


    # create a memo
    msg = TextMemo('test')
    # get sequence of new account address
    sequence = horizon.account(publickey).get('sequence')
    # construct the transaction
    tx = Transaction(
        source=publickey,
        opts={
            'sequence': sequence,
            'memo': msg,
            'operations': operationCodes[operationCode]['operations'],
            'fee': 100 * len(operationCodes[operationCode]['operations'])
         },
    )
    # build envelope
    envelope = Te(tx=tx, opts={"network_id": "TESTNET"})
    # sign with vault
    envelope.sign(kp)

    # submit
    xdr = envelope.xdr()
    #response = horizon.submit(xdr)
    return xdr
