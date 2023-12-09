import boto3
from boto3.dynamodb.conditions import Key, Attr

ddb = boto3.resource('dynamodb')
table = ddb.Table('notepad-prod')

def query(pk, sk=None):
    try:
      if sk is None:
        query = table.query(
          KeyConditionExpression=Key('pk').eq(pk)
        )
      else:
        query = table.query(
          KeyConditionExpression=Key('pk').eq(pk) & Key('sk').begins_with(sk)
        )

      # Check if Items is empty or not
      if len(query['Items']) == 0:
        return []
      
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
    query = table.get_item(Key=data)

    if 'Item' not in query:
        return False

    # Delete Object from response
    del query['Item']['pk']
    del query['Item']['sk']

    return query['Item']

def update(data):
    try:
      table.update_item(Key=data['Key'],
                        UpdateExpression=data['UpdateExpression'], 
                        ExpressionAttributeNames=data['ExpressionAttributeNames'],
                        ExpressionAttributeValues=data['ExpressionAttributeValues']
                      )
      return True
    except Exception as e:
      print(f"Error Updating Data: {e}")
      return False

def delete(data):
    try:
      table.delete_item(Key=data)
      return True
    except Exception as e:
      print(f"Error Deleting Data: {e}")
      return False