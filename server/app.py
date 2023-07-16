import numpy as np
import hsluv
from sentence_transformers import SentenceTransformer
from flask import Flask, request, jsonify
from flask_cors import CORS

def _linearize(x, from_range, to_range):
    slope = (to_range[1] - to_range[0]) / (from_range[1] - from_range[0])
    return (x - from_range[0]) * slope + to_range[0]

def convert_to_embedding(sentence, model, conversion_matrix):
    sentence_embedding = model.encode(sentence)
    sentence_embedding = conversion_matrix.dot(sentence_embedding)
    return sentence_embedding.reshape(3)

def cartesian_to_cylindrical(embedding):
    rho = np.sqrt(embedding[0]**2 + embedding[1]**2)
    phi = np.arctan2(embedding[1], embedding[0])
    z_cylindrical = embedding[2]
    
    return [phi, rho, z_cylindrical]

def restrict(embedding, restriction):
    phi, rho, z_cylindrical = embedding
    phi = (phi + np.pi) * (180/np.pi)
    rho = _linearize(rho, [0,1], restriction['rho'])
    z_cylindrical = _linearize(z_cylindrical, [-1,1], restriction['z'])
    return [phi, rho, z_cylindrical]

def transform(sentence, config):
    return hsluv.hsluv_to_hex(restrict(cartesian_to_cylindrical(convert_to_embedding(sentence, config['model'], config['conversion_matrix'])), config['restrictions']))

app = Flask(__name__)
CORS(app)
config = {
        'model': SentenceTransformer('model'),
        'conversion_matrix': np.load('conversion_matrix.npy'),
        'restrictions': {
            'rho': [50,100],
            'z': [50, 90]
        }
    }

@app.route('/color', methods=['POST']) 
def generate_color():
    sentence = request.get_json()['sentence']
    
    # Generate color
    color = transform(sentence, config)
    return jsonify({'hex': color})

if __name__ == '__main__':
   app.run()