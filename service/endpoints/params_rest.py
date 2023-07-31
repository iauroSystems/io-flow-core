import ast, os
from flask import Flask, request, jsonify
from dotenv import load_dotenv
import requests
load_dotenv('.env')


"""
    CreatedBy: Atharva Arjun
    UpdatedBy: Atharva Arjun
    
    Description: 
        This endpoint takes a JSON payload containing a Python script code and a list of parameters. It searches for a function called 'custom' in the script and executes it with the provided parameters. The result of the function execution is returned as a JSON response.

        Returns:
            JSON: A JSON response containing the result of the function execution.

        Raises:
            Exception: If there is an error during the function execution.
"""

def send_params():
    try: 
        script = request.json['script']
        params = request.json['parameters']
        if 'url' in request.get_json() and request.json['url'] != '':
            file_url = request.get_json()
            response = requests.get(file_url['url'])
            response.raise_for_status()  
            script = response.text
        parsed_ast = ast.parse(script)
        if not script:
            print('script')
            return jsonify({'result': os.getenv("SCRIPT_NOT_FOUND")}), 500
        for node in parsed_ast.body:
            if isinstance(node, ast.FunctionDef) and node.name == 'custom':
                custom_func = compile(parsed_ast, '<string>', 'exec')
                namespace = {}
                exec(custom_func, namespace)
                result = namespace['custom'](*params)
        return jsonify({'result': result})
    except Exception as e:
        if str(e) == "'parameters'":
            return jsonify({'error': os.getenv("PARAMS_NOT_FOUND")}), 500
        return jsonify({'error': str(e)}), 500
    