import ast, requests, os, subprocess
from dotenv import load_dotenv
load_dotenv('.env')
import time
from service.helper import install_required_modules
from flask import Flask, request, jsonify


def install(library_name):
    try:
        subprocess.check_call(['pip', 'install', library_name])
        return True
    except subprocess.CalledProcessError:
        return False
    except Exception as e:
        print(f"Error during installation: {str(e)}")
        return False

def uninstall(library_name):
    try:
        subprocess.check_call(['pip', 'uninstall', library_name, '-y'])
        return True
    except subprocess.CalledProcessError:
        return False
    except Exception as e:
        print(f"Error during uninstallation: {str(e)}")
        return False
    