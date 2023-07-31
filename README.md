# Flask Script Executor

The Flask Script Executor is a web service that securely executes Python scripts and functions. It provides two routes to handle script execution and function invocation.

## Features

- Secure execution of Python script code
- Detection of dangerous function calls and module imports
- Installation of required modules using pip
- Support for direct code execution or script file upload


## Routes
----------------

### `/execute/run`

This route accepts a POST request with a JSON payload containing the Python script code to execute. The script is executed securely by parsing the code using the `ast` module and checking for any dangerous operations. The result of the script execution is returned as a JSON response.

- Request Body: JSON or form-data containing the script code.
  - For JSON request, provide the script code in the `script` field.
  - For form-data request, provide the script code in a file named `file`.
- Response: JSON containing the result of script execution or any error encountered.

To execute Python script code securely, you have two options:

1. Direct Code Execution: Make a `POST` request to the /execute/run endpoint with the script code in the request body as JSON.

2. You can also add any file link to the `script` field and specify if params there in `params` field

3. You can also specify the module to be installed inside the deployed environment by using the `pip` field and add flags to it to install or uninstall the library/ package


**Example Request for Script:**

```http
POST /execute/run
Content-Type: application/json

{
  "script": "print('Hello, World!')",
  "parameters": "", // Here pass the parameters if you want to execute the script with parameters
  "pip": "" //Here pass if we need to install or delete any module inside the deployed environment
}
```


**Example Response:**
```
HTTP/1.1 200 OK
Content-Type: application/json

{
  "result": "Hello, World!"
}
```

**Example Request for Script with Parameters:**

```http
POST /execute/run
Content-Type: application/json

{
  "script": "def custom(a, b): return a + b;",
  "params": [3,2] // Here pass the parameters if you want to execute the script with parameters
  "pip": "" //Here pass if we need to install or delete any module inside the deployed environment
}
```


**Example Response:**
```
HTTP/1.1 200 OK
Content-Type: application/json

{
  "result": "5"
}
```


**Example Request for Package Installation:**

` -i ` ----> for install
` -u ` ----> for uninstall

```http
POST /execute/run
Content-Type: application/json

{
  "script": "",
  "parameters": [] // Here pass the parameters if you want to execute the script with parameters
  "pip": "-i numpy" 
}
```


**Example Response:**
```
HTTP/1.1 200 OK
Content-Type: application/json

{
  "result": "Library Installation Successfully"
}
```



## Requirements
--------------------

    1. Python 3.6+
    2. Flask
    3. RestrictedPython


## Error Handling

- If any dangerous operations are detected in the code, an exception is raised.
- If the required modules cannot be installed, an exception is raised.
- If any errors occur during script execution, the error message is returned.


## Installation
--------------------

1. Clone the repository: `git clone <repository_url>`

2. Install all dependencies: `pip install -r requirements.txt`


### Usage

1. Run the flask app: `flask run`

2. Send HTTP requests to the appropriate endpoints as described above.


## Security Considerations
-----------------------

The script execution is performed in a restricted environment using the `ast` module to parse the code and check for dangerous operations. Dangerous functions and module imports are explicitly disallowed. However, it's important to thoroughly review and validate any code executed in this service to ensure security.

## Authors

- Created by: Atharva Arjun
- Updated by: Atharva Arjun


## License
-----------------------

This project is licensed under the MIT License. See the LICENSE file for details.

Feel free to customize and expand this README to provide more information about your specific use case and any additional functionality or features of your Flask app.