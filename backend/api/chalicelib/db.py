import boto3
from boto3.dynamodb.conditions import Key, Attr

ddb = boto3.resource('dynamodb')
table = ddb.Table('notepad-prod')

def query(lastKey = None):
    if lastKey is None:
        response = table.scan()
    else:
        response = table.scan(ExclusiveStartKey=lastKey)
    return response

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
      return query['Item']
    except Exception as e:
      print(f"Error Retrieving Data: {e}")
      return e