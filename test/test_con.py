import json, pytest
import pytest, ast, os
from app import app
from unittest import mock
from io import BytesIO
from flask import Flask
from flask.testing import FlaskClient
from service.endpoints.scripts_rest import send_scripts
from service.endpoints.params_rest import send_params
from werkzeug.datastructures import FileStorage
from service.helper import is_module_installed, install_module, extract_required_modules, install_required_modules, check_dangerous_operations

@pytest.fixture
def client():
    with app.test_client() as client:
        yield client


def test_send_scripts_with_valid_script(client: FlaskClient):
    script = "print('Hello, World!')"
    response = client.post('/scripts', json={'script': script})
    assert response.status_code == 200
    assert response.get_json() == {'result': 'Hello, World!\n'}

def test_send_scripts_with_empty_script(client: FlaskClient):
    script = ""
    response = client.post('/scripts', json={'script': script})
    assert response.status_code == 200
    assert response.get_json() == {'error': 'script not found'}

def test_send_scripts_with_dangerous_script(client: FlaskClient):
    script = "import os; os.system('rm -rf /')"
    response = client.post('/scripts', json={'script': script})
    assert response.status_code == 500
    assert response.get_json() == {'error': 'Dangerous function call detected'}

def test_send_scripts_with_no_result(client: FlaskClient):
    script = "def test(): pass"
    response = client.post('/scripts', json={'script': script})
    assert response.status_code == 200
    assert response.get_json() == {'result': 'May be you haven\'t added a print statement or your script is executed successfully'}

def test_is_module_installed():
    assert is_module_installed('sys') == True
    assert is_module_installed('nonexistentmodule') == False
    assert is_module_installed('os') == True

def test_send_scripts_with_multipart_form_data(client: FlaskClient):
    script_code = "print('Hello, World!')"
    file = FileStorage(stream=BytesIO(script_code.encode()), filename='script.py')
    response = client.post('/scripts', data={'file': file})
    assert response.status_code == 200
    assert response.get_json() == {'result': 'Hello, World!\n'}


def test_install_module(monkeypatch):
    def mock_check_call(command):
        assert command == ['pip', 'install', 'mymodule']
    monkeypatch.setattr('subprocess.check_call', mock_check_call)
    install_module('mymodule')


def test_extract_required_modules():
    parsed_code = ast.parse("import module1\nfrom module2 import function1")
    required_modules = extract_required_modules(parsed_code)
    expected_modules = {'module1', 'module2'}
    assert required_modules == expected_modules


def test_install_required_modules():
    with mock.patch('service.helper.extract_required_modules') as mock_extract_required_modules:
        mock_extract_required_modules.return_value = {'module2'}
        with mock.patch('service.helper.is_module_installed') as mock_is_module_installed:
            mock_is_module_installed.side_effect = [False, True]
            with mock.patch('service.helper.install_module') as mock_install_module:
                install_required_modules(None)
                assert mock_install_module.call_count == 1
                mock_install_module.assert_called_with('module2')


def test_check_dangerous_operations_dangerous_call():
    parsed_code = ast.parse("os.system('rm -rf /')")
    with pytest.raises(Exception) as exc_info:
        check_dangerous_operations(parsed_code)
    assert str(exc_info.value) == "Dangerous function call detected"


def test_check_dangerous_operations_dangerous_import():
    parsed_code = ast.parse("from subprocess import *")
    with pytest.raises(Exception) as exc_info:
        check_dangerous_operations(parsed_code)
    assert str(exc_info.value) == "Dangerous module call detected"


def test_send_params_success():
    # Test case for successful execution
    payload = {
        'script': "def custom(param): return param * 2",
        'parameters': [5]
    }
    expected_result = {'result': 10}

    with app.test_client() as client:
        response = client.post('/params', json=payload)
        assert response.status_code == 200
        assert response.json == expected_result

def test_send_params_script_not_found():
    # Test case for missing script
    payload = {
        'script': '',
        'parameters': [5]
    }
    expected_error = {'result': os.getenv("SCRIPT_NOT_FOUND")}

    with app.test_client() as client:
        response = client.post('/params', json=payload)
        assert response.status_code == 500
        assert response.json == expected_error

def test_send_params_params_not_found():
    # Test case for missing params
    payload = {
        'script': "def custom(param): return param * 2"
    }
    expected_error = {'error': os.getenv("PARAMS_NOT_FOUND")}

    with app.test_client() as client:
        response = client.post('/params', json=payload)
        assert response.status_code == 500
        assert response.json == expected_error

def test_send_params_array_params_error():
    # Test case for array params
    payload = {
        'script': "def custom(param): return param * 2",
        'params': [5, 10]
    }
    expected_error = {'error': 'custom() takes 1 positional argument but 2 were given'}

    with app.test_client() as client:
        response = client.post('/params', json=payload)
        assert response.status_code == 500
        assert response.json == expected_error

