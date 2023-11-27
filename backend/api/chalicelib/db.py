import boto3
from boto3.dynamodb.conditions import Key, Attr

ddb = boto3.resource('dynamodb')
table = ddb.Table('notepad-prod')

def query(pk, sk):
    try:
      query = table.query(
        KeyConditionExpression=Key('pk').eq(pk) & Key('sk').begins_with(sk)
      )
      
      # Delete Object from response
      for item in query['Items']:
        del item['pk']
        del item['sk']

      return query['Items']
    
    except Exception as e:
      print(f"Error Querying Data: {e}")
      return False

def store(data):
    try:  
      table.put_item(Item=data)
      return True
    except Exception as e:
      print(f"Error Storing Data: {e}")
      return False

def show(data):
    try:
      query = table.get_item(Key=data)

      # Delete Object from response
      del query['Item']['pk']
      del query['Item']['sk']

      return query['Item']
    except Exception as e:
      print(f"Error Retrieving Data: {e}")
      return e