import time
from chalice import Chalice
from chalicelib.db import query, store, show
from chalicelib.id import genID
from chalice import CognitoUserPoolAuthorizer
import json

app = Chalice(app_name='api')

authorizer = CognitoUserPoolAuthorizer(
    'notepad-tugas-dev-prod',
    provider_arns=['arn:aws:cognito-idp:ap-southeast-1:057675665881:userpool/ap-southeast-1_g76VANI61']
)

@app.route('/')
def index():
    return {'hello': 'world'}

@app.route('/notes', methods=['POST'], cors=True, content_types=['application/json'])
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
        'ttl': ttl
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
    return show({'pk': 'public', 'sk': note_id})

@app.route('/v1/notes', methods=['GET'], cors=True, authorizer=authorizer)
def notes_v1_lists():
    context = app.current_request.context
    userId = context['authorizer']['claims']['sub']

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
        'status': body['status'],
        'title': body['title'],
        'content': body['content'],
        'ttl': ttl
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

    # Check if _ in note_id
    isPublic = note_id.find("_") != -1

    if isPublic:
        note_id = note_id.replace("_", "#")
        note = show({'pk': 'private', 'sk': note_id})
    else:
        note = show({'pk': 'private', 'sk': f"{userId}#{note_id}"})

    return json.dumps(note)

@app.route('/v1/notes/{note_id}', methods=['PUT'], cors=True, authorizer=authorizer)
def notes_v1_update(note_id):
    return {'notes': 'update'}

@app.route('/v1/notes/{note_id}', methods=['DELETE'], cors=True, authorizer=authorizer)
def notes_v1_delete(note_id):
    context = app.current_request.context
    userId = context['authorizer']['claims']['sub']

    # Check if _ in note_id
    isPublic = note_id.find("_") != -1

    if isPublic:
        note_id = note_id.replace("_", "#")
        note = show({'pk': 'private', 'sk': note_id})
    else:
        note = show({'pk': 'private', 'sk': f"{userId}#{note_id}"})

    if note is None:
        return {'message': 'Note not found'}
    
    return {
        'message': 'success'
    }

