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

def getBalance(publicKey):
    response = query('https://horizon.stellar.org/accounts/{0}'.format(publicKey))
    return response['balances']


def buildVault(data):
    seed = data['seed']
    tokenName = data['tokenName']
    tokenSymbol = data['tokenSymbol']
    denomination = data['denomination']
    amount = data['storeAmount']
    response, vault = deal(seed, tokenName, tokenSymbol, denomination, amount, 'createVault')
    response2, vault = deal(seed, tokenName, tokenSymbol, denomination, amount, 'issueVault', vault)
    return None


def deal(seed, tokenName, tokenSymbol, denomination, amount, operationCode, vault =1):
    kp = vault
    passiveOffer = denomination - .00001

    minamount='2'
    #Load signer credentials
    ogkp = Keypair.from_seed(seed)
    publickey = ogkp.address().decode()
    seed = ogkp.seed().decode()

    #Create Vault Account Credentials
    if kp == 1:
        kp = Keypair.random()
    newpublickey = kp.address().decode()
    newseed = kp.seed().decode()

    #Connect to Horizon
    horizon = horizon_testnet()

    #declareAssets
    storedAsset = Asset("XLM")
    safeAsset = Asset(tokenSymbol, newpublickey)

    # Create Vault Account Operation Step 1
    issueAccount = CreateAccount({
        'destination': newpublickey,
        'starting_balance': str (amount)
    })


    #Trust Issuer of safeAsset Step 2
    trustIssuer = ChangeTrust({
        'asset': safeAsset,
        'limit': str(amount/denomination)
    })

    #Set Options to Revocable Authority and Required Authority Step 3
    setAuthority = SetOptions({

        'set_flags': 1,
    })


    #Accept trust of user Step 4
    trustUser = AllowTrust({
        'trustor': publickey,
        'asset_code': tokenSymbol,
        'authorize' : 'True'
    })

    #Pay new asset to user Step 5
    payUser = Payment({
        # 'source' : Alice.address().decode(),
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
    killAccount = SetOptions({
    'low_threshold' : '1',
    'medium_threshold' :'3',
    'high_threshold' : '3'
})
    testFund = Payment({
        # 'source' : Alice.address().decode(),
        'destination': newpublickey,
        'amount': '10000',
        'asset':safeAsset
    })


    declareVault = ManageData({
        'data_name': newpublickey,

        'data_value': tokenName

    })



    operationCodes = {'createVault' : {'operations':[issueAccount, trustIssuer, declareVault],
                                       'signer': ogkp},
                     'issueVault' :  {'operations' :[setAuthority, trustUser, payUser, buyOffer,
                                                     sellOffer],
                                      'signer':kp},
                     'redeemOffer': {'operations':[redeemOffer],
                                     'signer': ogkp},
                     'depositOffer': {'operations':[depositOffer],
                                     'signer':ogkp}}

    sourceAccount = operationCodes[operationCode]['signer']
    # create a memo
    msg = TextMemo('test')
    # get sequence of new account address
    sequence = horizon.account(sourceAccount.address()).get('sequence')
    # construct the transaction
    tx = Transaction(
        source=sourceAccount.address().decode(),
        opts={
            'sequence': sequence,
            'memo': msg,
            'operations': operationCodes[operationCode]['operations'],
            'fee': 500
         },
    )
    # build envelope
    envelope = Te(tx=tx, opts={"network_id": "TESTNET"})
    # sign
    envelope.sign(sourceAccount)

    # submit
    xdr = envelope.xdr()
    response = horizon.submit(xdr)
    return response, kp
