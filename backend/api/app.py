import time
from chalice import Chalice
from chalicelib.db import store, show
from ulid import ULID

app = Chalice(app_name='api')

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
    if body['ttl']:
        # get number of minutes and convert to timestamp
        ttl = int(body['ttl']) * 60 + int(time.time())

    id = str(ULID())
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

@app.route('/v1/notes', methods=['GET'])
def notes_v1_lists():
    return {'notes': 'list'}

@app.route('/v1/notes', methods=['POST'])
def notes_v1_create():
    return {'notes': 'create'}

@app.route('/v1/notes/{note_id}', methods=['GET'])
def notes_v1_show(note_id):
    return {'notes': 'show'}

@app.route('/v1/notes/{note_id}', methods=['PUT'])
def notes_v1_update(note_id):
    return {'notes': 'update'}

@app.route('/v1/notes/{note_id}', methods=['DELETE'])
def notes_v1_delete(note_id):
    return {'notes': 'delete'}

