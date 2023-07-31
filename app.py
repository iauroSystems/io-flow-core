import sys, os, ast, socket, subprocess
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from service.endpoints import params_rest
# from service.endpoints.GRPC import connector_pb2
# from service.endpoints.GRPC import connector_pb2_grpc
from service.endpoints import scripts_rest
from service.helper import install_required_modules
from service.endpoints import libraries_rest
import time

load_dotenv('.env')
app = Flask(__name__)

@app.route(os.getenv('EXECUTE'), methods=['POST'])
def execute_scripts():
    return scripts_rest.send_scripts()

@app.route(os.getenv('PIP'), methods=['POST'])
def install_libraries():
    data = request.get_json()
    library_name = data.get('pip')
    if library_name.startswith('-i'):
        if libraries_rest.install(library_name.strip().split()[-1]):
            return jsonify({'result':  'Library Installation Successfully'})
        else:
            return jsonify({'result': 'Library Installation Failed'})
    elif library_name.startswith('-u'):
        if libraries_rest.uninstall(library_name.strip().split()[-1]):
            return jsonify({'result': 'Library UnInstallation Successfully'})
        else:
            return jsonify({'result': 'Library UnInstallation Failed'})
    else:
        return "Invalid action. Please specify 'install' or 'uninstall'."


if __name__ == '__main__':
    socket.setdefaulttimeout(300)
    app.run(debug=True)

