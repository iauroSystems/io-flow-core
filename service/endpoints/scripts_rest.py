import sys, os
sys.path.append('../helper.py')
from service.helper import execute_code, check_dangerous_operations
from flask import Flask, request, jsonify
from dotenv import load_dotenv
import requests
load_dotenv('.env')
from service.endpoints import params_rest

"""
    CreatedBy: Atharva Arjun
    UpdatedBy: Atharva Arjun

    Description:
        This function accepts a JSON payload or a multipart/form-data payload containing script code. It executes the code and returns the result as a JSON response.

        JSON payload example:
        {
            "script": "print('Hello, world!')"
        }

        Multipart/form-data payload example:
        [form field] file: [script file]

    Returns:
        A JSON response with the execution result or an error message.

    Raises:
        500 (Internal Server Error): If an exception occurs during execution.
"""
def send_scripts():
    try:
        script = 0
        if request.content_type == 'application/json':
            json_data = request.get_json()
            script = json_data['script']
            if ( json_data['parameters'] == '' or json_data['parameters'] == [] ) and json_data['script'] == '' and json_data['url'] == '':
                return jsonify({'error': 'Add data'}), 500
            if 'parameters' in json_data and json_data['parameters'] != '' and json_data['parameters'] != []:
                return params_rest.send_params()
            if 'url' in json_data and json_data['url'] != '':
                file_url = request.get_json()
                response = requests.get(file_url['url'])
                response.raise_for_status()  
                script = response.text
        elif request.content_type.find('multipart/form-data') == 0:
            file = request.files['file']
            script = file.read().decode('utf-8')
        result = execute_code(script)
        if json_data['parameters'] == '' and json_data['script'] == '' and json_data['url'] == '':
            return jsonify({'error': 'Add something to the payload'}), 500
        if result == '' or result == None:
            return jsonify({'result': os.getenv('RESULT_NOT_FOUND')})
        return jsonify({'result': result})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

