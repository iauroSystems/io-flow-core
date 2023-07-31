from locust import HttpUser, task, between

class MyUser(HttpUser):
    wait_time = between(1, 3)  # Time between consecutive requests

    @task
    def execute_script(self):
        script = "print('Hello, World!')"  # Replace with the desired script
        payload = {"script": script}
        self.client.post("/scripts", json=payload)

    @task
    def execute_function(self):
        script = "def custom(param): return param * 2" 
        params = [5]  # Replace with the desired parameters
        payload = {"script": script, "params": params}
        self.client.post("/params", json=payload)
