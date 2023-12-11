from chalice import Chalice, CognitoUserPoolAuthorizer, Response
from chalicelib.db import query, store, show, update, delete
from chalicelib.id import genID
from datetime import datetime
import time
import json

app = Chalice(app_name='api')

authorizer = CognitoUserPoolAuthorizer(
    'notepad-tugas-dev-prod',
    provider_arns=['arn:aws:cognito-idp:ap-southeast-1:057675665881:userpool/ap-southeast-1_g76VANI61']
)

contentTypes = {
    "array": ['application/json'],
    "object": {'Content-Type': 'application/json'},
    "str": 'application/json',
}

@app.route('/')
def index():
    return {'message': 'success'}

@app.route('/notes', methods=['POST'], cors=True, content_types=contentTypes['array'])
def notes_create():
    body = app.current_request.json_body

    if body is None:
        return {'message': 'Invalid request body'}
    
    if 'title' not in body:
        return {'message': 'Missing title'}
    
    if 'content' not in body:
        return {'message': 'Missing content'}
    
    ttl = None
    if 'ttl' in body and body['ttl'] != '':
        # get number of minutes and convert to timestamp
        ttl = int(body['ttl']) * 60 + int(time.time())

    id = str(genID())
    save = store({
        'pk': 'public',
        'sk': id,
        'id': id,
        'status': 'public',
        'title': body['title'],
        'content': body['content'],
        'ttl': ttl,
        'createdAt': datetime.now().isoformat(),
        'updatedAt': datetime.now().isoformat()
    })

    if save == False:
        return {'message': 'Error saving note'}
    
    return {
        'message': 'success', 
        'data': {
            'id': id
        }
    }

@app.route('/notes/{note_id}', methods=['GET'], cors=True)
def notes_show(note_id):
    code = 200
    message = 'success'

    if note_id.find("_") != -1:
        print("_ found")
        note_id = note_id.replace("_", "#")
        data = show({'pk': 'private', 'sk': note_id})
    else:
        data = show({'pk': 'public', 'sk': note_id})

    if data == False:
        code = 404
        message = 'Note not found'
        data = None
        
    return Response(body={
        'code': code,
        'message': message,
        'data': data
    }, status_code=code, headers=contentTypes['object'])

@app.route('/v1/notes', methods=['GET'], cors=True, authorizer=authorizer)
def notes_v1_lists():
    context = app.current_request.context
    cognito = context['authorizer']['claims']
    userId = cognito['sub']

    if 'cognito:groups' in cognito and 'administrator' in cognito['cognito:groups']:
        params = app.current_request.query_params
        view = params.get('view', None)

        if view == 'public':
            notes = query('public')
        else:
            userId = params.get('userId', None)
            notes = query('private', userId)
    else:
        notes = query('private', userId)

    return {
        'message': 'success', 
        'data': notes
    }

@app.route('/v1/notes', methods=['POST'], cors=True, authorizer=authorizer)
def notes_v1_create():
    body = app.current_request.json_body
    context = app.current_request.context
    userId = context['authorizer']['claims']['sub']

    if body is None:
        return {'message': 'Invalid request body'}
    
    if 'title' not in body:
        return {'message': 'Missing title'}
    
    if 'content' not in body:
        return {'message': 'Missing content'}

    if 'status' not in body:
        return {'message': 'Missing status'}

    ttl = None
    if 'ttl' in body and body['ttl'] != '':
        # get number of minutes and convert to timestamp
        ttl = int(body['ttl']) * 60 + int(time.time())

    id = str(genID())
    sk = f"{userId}#{id}"
    idPub = sk.replace("#", "_") if body['status'] == 'public' else id

    save = store({
        'pk': 'private',
        'sk': sk,
        'id': idPub,
        'userId': userId,
        'status': body['status'],
        'title': body['title'],
        'content': body['content'],
        'ttl': ttl,
        'createdAt': datetime.now().isoformat(),
        'updatedAt': datetime.now().isoformat()
    })

    if save == False:
        return {'message': 'Error saving note'}
    
    return {
        'message': 'success', 
        'data': {
            'id': id
        }
    }

@app.route('/v1/notes/{note_id}', methods=['GET'], cors=True, authorizer=authorizer)
def notes_v1_show(note_id):
    context = app.current_request.context
    userId = context['authorizer']['claims']['sub']
    code = 200
    message = 'success'

    # Check if _ in note_id
    isPublic = note_id.find("_") != -1

    if isPublic:
        note_id = note_id.replace("_", "#")
        note = show({'pk': 'private', 'sk': note_id})
    else:
        note = show({'pk': 'private', 'sk': f"{userId}#{note_id}"})

    if note == False:
        code = 404
        message = 'Note not found'

    return Response(body={
        'code': code,
        'message': message,
        'data': note
    }, status_code=code, headers=contentTypes['object'])

@app.route('/v1/notes/{note_id}', methods=['PUT'], cors=True, authorizer=authorizer)
def notes_v1_update(note_id):
    body = app.current_request.json_body
    context = app.current_request.context
    userId = context['authorizer']['claims']['sub']

    # Check if _ in note_id
    isPublic = note_id.find("_") != -1
    key = {'pk': 'private', 'sk': f"{userId}#{note_id}"} if not isPublic else {'pk': 'private', 'sk': note_id.replace("_", "#")}

    # Check if note exists
    note = show(key)

    if note == False:
        return {'message': 'Note not found'}
    
    if note['userId'] != userId:
        return {'message': 'Unauthorized'}

    data = {
        'Key': key,
        'UpdateExpression': 'SET #title = :title, #content = :content, #updatedAt = :updatedAt',
        'ExpressionAttributeNames': {
            '#title': 'title',
            '#content': 'content',
            '#updatedAt': 'updatedAt'
        },
        'ExpressionAttributeValues': {
            ':title': body['title'],
            ':content': body['content'],
            ':updatedAt': datetime.now().isoformat()
        }
    }

    query = update(data)

    if query == False:
        return {'message': 'Error updating note'}

    return {
        'message': 'success'
    }

@app.route('/v1/notes/{note_id}', methods=['DELETE'], cors=True, authorizer=authorizer)
def notes_v1_delete(note_id):
    context = app.current_request.context
    cognito = context['authorizer']['claims']
    userId = cognito['sub']
    isAdmin = False

    # Check if _ in note_id
    isPublic = note_id.find("_") != -1
    key = {'pk': 'private', 'sk': f"{userId}#{note_id}"} if not isPublic else {'pk': 'private', 'sk': note_id.replace("_", "#")}

    if 'cognito:groups' in cognito and 'administrator' in cognito['cognito:groups']:
        params = app.current_request.query_params
        userId = params.get('userId', None)
        view = params.get('view', None)

        if userId is None:
            return {'message': 'Missing userId'}
        
        if view == 'public':
            key = {'pk': 'public', 'sk': note_id}

    print(key)
    note = show(key)

    if note == False or note is None:
        return {'message': 'Note not found'}
    
    if view != 'public' and isAdmin == False:
        if note['userId'] != userId:
            return {'message': 'Unauthorized'}
    
    query = delete(key)

    if query == False:
        return {'message': 'Error deleting note'}
    
    return {
        'message': 'success'
    }