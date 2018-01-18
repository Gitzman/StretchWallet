from __future__ import print_function # Python 2/3 compatibility
from locoin import *
from stellar_base.horizon import horizon_testnet, horizon_livenet, query
import boto3
import json
import decimal
from boto3.dynamodb.conditions import Key

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

def add_files(job_id, filename):
    table = dynamodb.Table('Jobs')

    response = table.update_item(
        Key={
            'job_id': job_id ,
        },
        UpdateExpression="set info.files = list_append(info.files, :f)",
        ExpressionAttributeValues={
            ':f': [filename]
        },
        ReturnValues="ALL_NEW"
    )

    print("UpdateItem succeeded:")
    print(json.dumps(response, indent=4, cls=DecimalEncoder))
    return response

def add_job(uuid, job_id, job_title, job_url):
    table = dynamodb.Table("Users")
    response = table.update_item(
        Key={
            'uuid': uuid ,
        },
        UpdateExpression="set info.active_jobs = list_append(info.active_jobs, :j)",
        ExpressionAttributeValues={
            ':j': [{'job_id':job_id, 'job_title':job_title, 'job_url': job_url}]
        },
        ReturnValues="ALL_NEW"
    )

    print("UpdateItem succeeded:")
    print(json.dumps(response, indent=4, cls=DecimalEncoder))
    return response

def add_completed_job(uuid, job_id, job_title, job_url):
    table = dynamodb.Table("Users")
    response = table.update_item(
        Key={
            'uuid': uuid ,
        },
        UpdateExpression="set info.completed_jobs = list_append(info.completed_jobs, :j)",
        ExpressionAttributeValues={
            ':j': [{'job_id':job_id, 'job_title':job_title, 'job_url': job_url}]
        },
        ReturnValues="ALL_NEW"
    )

    print("UpdateItem succeeded:")
    print(json.dumps(response, indent=4, cls=DecimalEncoder))
    return response

def add_message(job_id, message):
    table = dynamodb.Table("Jobs")
    print (message.decode('utf-8'))
    print (job_id)
    response = table.update_item(
        Key={
            'job_id': job_id ,
        },
        UpdateExpression="set info.feed = list_append(info.feed, :f)",
        ExpressionAttributeValues={
            ':f': [message.decode('utf-8')]
        },
        ReturnValues="ALL_NEW"
    )

    print("UpdateItem succeeded:")
#    print(json.dumps(response, indent=4, cls=DecimalEncoder))
    return response

def read_records (uuid):
    table = dynamodb.Table("Users")

    response = table.query(
        KeyConditionExpression=Key('uuid').eq(uuid)
    )
    return response


def read_auth (email, password):

    table = dynamodb.Table("Authentication")
    try:
        response = table.query(
            KeyConditionExpression=Key('email').eq(email)
        )
        return response
    except:
        return "Nothing"

def read_job (job_id):
    print (job_id)
    table = dynamodb.Table("Jobs")

    try:

        response = table.query(
            KeyConditionExpression=Key('job_id').eq(job_id)
        )

    except:
        return 'couldnt find job'

    print (response)
    return response

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def create_new_records (item):
    role_table ={'stenographer' : 'Stenographers',
                'Stenographer' : 'Stenographers',
                'Scopist' : 'Scopists',
                'scopist' : 'Scopists'}

    table = dynamodb.Table('Users')

    response = table.put_item(
       Item=item
    )

    print("PutItem succeeded:")
    print(json.dumps(response, indent=4, cls=DecimalEncoder))
    print (response['ResponseMetadata']['HTTPStatusCode'])

    return None

def create_new_user (auth):
    table = dynamodb.Table('Authentication')

    response = table.put_item(
       Item=auth
    )

    print("PutItem succeeded:")
    print(json.dumps(response, indent=4, cls=DecimalEncoder))
    print (response['ResponseMetadata']['HTTPStatusCode'])

    return None

def create_new_job (job):
    table = dynamodb.Table('Jobs')

    response = table.put_item(
       Item=job
    )

    print("PutItem succeeded:")
    print(json.dumps(response, indent=4, cls=DecimalEncoder))
    print (response['ResponseMetadata']['HTTPStatusCode'])

    return None

def remove_active_job(uuid, job_position):
    print ("remove info.active_jobs[{0}]".format(job_position))
    table = dynamodb.Table("Users")
    response = table.update_item(
        Key={
            'uuid': uuid ,
        },
        UpdateExpression="remove info.active_jobs[{0}]".format(str(job_position)),
        ReturnValues="ALL_NEW"
    )

    print("UpdateItem succeeded:")
    print(json.dumps(response, indent=4, cls=DecimalEncoder))
    return response
