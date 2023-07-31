import subprocess
import ast, os
from io import StringIO
from contextlib import redirect_stdout
from dotenv import load_dotenv
load_dotenv('.env')
"""
    CreatedBy: Atharva Arjun
    UpdatedBy: Atharva Arjun

    Description:
        This function takes Python script code as input, checks for any dangerous operations in the code, and executes the code securely. The code is parsed into an abstract syntax tree (AST) and checked for dangerous function calls and module imports. If no dangerous operations are detected, the code is executed and any desired result is returned.

        Args:
            code (str): The Python script code to execute.

        Returns:
            str: The result of the script execution.

        Raises:
            Exception: If there is an error during script execution or if any dangerous operations are detected.
"""
def execute_code(code):
    parsed_code = ast.parse(code, mode='exec')
    check_dangerous_operations(parsed_code)
    # install_required_modules(parsed_code)
    output_buffer = StringIO()
    with redirect_stdout(output_buffer):
        exec(compile(parsed_code, filename='<string>', mode='exec'), {})
    output = output_buffer.getvalue()
    return output


"""
    CreatedBy: Atharva Arjun
    UpdatedBy: Atharva Arjun
    
    Description:
        This function checks the parsed abstract syntax tree (AST) of the Python script code for any dangerous operations, such as executing system commands or importing dangerous modules. If any dangerous operations are detected, an exception is raised.

        Args:
            parsed_code (ast.Module): The parsed AST of the Python script code.

        Raises:
            Exception: If any dangerous operations are detected.
"""
def check_dangerous_operations(parsed_code):
    dangerous_functions = ['os.system', 'subprocess.call']
    dangerous_modules = ['os', 'subprocess']

    for node in ast.walk(parsed_code):
        if isinstance(node, ast.Call):
            if isinstance(node.func, ast.Attribute):
                if hasattr(node.func.value, 'id') and hasattr(node.func, 'attr'):
                    if f"{node.func.value.id}.{node.func.attr}" in dangerous_functions:
                        raise Exception(os.getenv("DANGEROUS_FUNCTION"))
            elif isinstance(node.func, ast.Name):
                if node.func.id in dangerous_functions:
                    raise Exception(os.getenv('DANGEROUS_FUNCTION'))

        elif isinstance(node, ast.ImportFrom):
            if node.module in dangerous_modules:
                raise Exception(os.getenv('DANGEROUS_MODULE'))


"""
    CreatedBy: Atharva Arjun
    UpdatedBy: Atharva Arjun
    
    Description:
        This function checks the parsed code for any required modules that are not installed and installs them using pip.

    Args:
        parsed_code (ast.AST): The parsed abstract syntax tree of the code.
"""
def install_required_modules(parsed_code):
    try:
        required_modules = extract_required_modules(parsed_code)
        for module in required_modules:
            if not is_module_installed(module):
                install_module(module)
        print(required_modules)
        if required_modules == None:
            return False
        return True
    except Exception as e:
        return jsonify({'error': str(e)})


"""
    CreatedBy: Atharva Arjun
    UpdatedBy: Atharva Arjun
    
    Description:
        This function extracts the names of the required modules from the parsed code.

    Args:
        parsed_code (ast.AST): The parsed abstract syntax tree of the code.

    Returns:
        set: A set of required module names.
"""
def extract_required_modules(parsed_code):
    try:
        required_modules = set()
        for node in ast.walk(parsed_code):
            if isinstance(node, ast.Import):
                for alias in node.names:
                    required_modules.add(alias.name.split('.')[0])
            elif isinstance(node, ast.ImportFrom):
                required_modules.add(node.module.split('.')[0])
        return required_modules
    except ImportError as e:
        return jsonify({'error': str(e)})


"""
    CreatedBy: Atharva Arjun
    UpdatedBy: Atharva Arjun
    
    Description:
        This function checks if a module is installed by attempting to import it.

    Args:
        module (str): The name of the module to check.

    Returns:
        bool: True if the module is installed, False otherwise.
"""
def is_module_installed(module):

    try:
        __import__(module)
        return True
    except ImportError:
        return False


"""
    CreatedBy: Atharva Arjun
    UpdatedBy: Atharva Arjun
    
    Description:
        This function installs a module using pip.

    Args:
        module (str): The name of the module to install.
"""
def install_module(module):
    try:
        subprocess.check_call(['pip', 'install', module])
    except subprocess.CalledProcessError as e:
        return jsonify({'error': e})