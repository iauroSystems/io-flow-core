# IO Flow

A IO Flow is a software tool or system designed to automate and manage the flow of tasks, activities, and information within an organization or system. It serves as a central platform that orchestrates and coordinates the execution of business processes or workflows. The main purpose of a IO Flow is to streamline and optimize complex, repetitive, or time-sensitive processes, improving efficiency, productivity, and accuracy.

At its core, a IO Flow provides a framework for defining, modeling, and executing workflows. It typically includes the following key components:

### Workflow Design:
The IO Flow allows users to create or define workflows using a graphical user interface or other modeling tools. Workflows can be represented as a series of interconnected tasks, activities, or steps, along with the associated dependencies, conditions, and rules.
### Workflow Execution:
Once a workflow is defined, the engine is responsible for executing it according to the specified logic and rules. It manages the sequencing, coordination, and allocation of tasks to the appropriate individuals or systems involved in the workflow. This may involve triggering events, assigning tasks, and monitoring progress.
### Task Management:
The IO Flow tracks the status and progress of individual tasks within the workflow. It ensures that tasks are assigned to the right participants, monitors their completion, and handles exceptions or errors that may occur during task execution.
### Rules and Conditions:
IO Flow often incorporate rule engines or decision management systems to enable the enforcement of business rules and conditions. These rules can be used to control the flow of the workflow, make decisions, validate inputs, and ensure compliance with business policies.
### Integration:
A IO Flow can integrate with various external systems, databases, or applications to gather inputs, retrieve or update data, and trigger actions. This enables seamless communication and interaction between the IO Flow and other systems involved in the workflow.
### Monitoring and Analytics:
IO Flow provide real-time monitoring and reporting capabilities, allowing stakeholders to track the progress, performance, and key metrics of workflows. Analytics features may include dashboards, visualizations, and data-driven insights to identify bottlenecks, optimize processes, and make informed decisions.

By employing a IO Flow, organizations can automate and streamline their business processes, reducing manual effort, minimizing errors, and enhancing operational efficiency. Workflows can be customized, adapted, and scaled as needed, enabling organizations to respond to changing requirements and improve their overall productivity and agility.

## Getting Started

These instructions will get you a service up and running on your local machine for development and testing purposes. 
## How to build & deploy
### Configuration
Following are the environment variables required to pass for the deployment 

```
NODE_ENV
TCP_PORT=30009
GRPC_HOST=localhost
GRPC_PORT=40009
MONGO_PROTOCOL=mongodb
MONGO_HOST=localhost
MONGO_PORT=27017
MONGO_USER=
MONGO_PASS=
MONGO_DBNAME=workflowEngine
SWAGGER_TITLE= IO Flow API Documentation
SWAGGER_DESC=This documentation is only for the REST APIs
SWAGGER_VERSION=1.0
SWAGGER_TAG
SWAGGER_BASEPATH
SWAGGER_DOC_PATH=api/documentation
APP_BASEPATH=v1

```
30009 is the default port for REST APIs
40009 is the default port for gRPC APIs

### Deployment
#### Local Development

1. Install Node.js: Ensure that Node.js is installed on your local machine. [How to install?](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)

2. Install Nestjs
```
 npm install -g @nestjs/cli
```

3. Install dependencies
```
 npm i
```

4. Build and Run Locally: Build your NestJS application using the command ``` npm run build ```, then start the application using ``` export NODE_ENV=development && npm run start:dev ``` or ``` npm run start:prod ```.

#### Containerization (Docker)

Install Docker: Install Docker on your local machine or the target server.

Create Dockerfile: Create a Dockerfile in the root directory of your NestJS application. The Dockerfile specifies the necessary dependencies and commands to build your application image.

Build Docker Image: Use the command docker ``` build -t my-app ``` . to build a Docker image of your NestJS application.

Run Docker Container: Start a Docker container using the built image with the command ``` docker run -d -p 3000:3000 my-app ```. Adjust the port number if your application uses a different port.

#### Cloud-based Deployments

Cloud Platforms: Choose a cloud provider such as AWS, Azure, Google Cloud, or Heroku.

Set Up Cloud Account: Create an account and set up the necessary credentials and permissions.

Deploy to Cloud: Each cloud provider has its own deployment process and tools. Typically, you need to configure a deployment pipeline, define the necessary environment variables, and specify the deployment instructions (e.g., using Infrastructure as Code or cloud-specific deployment mechanisms).

#### Continuous Integration and Deployment (CI/CD)

CI/CD Tools: Utilize popular CI/CD tools like Jenkins, GitLab CI/CD, CircleCI, or Travis CI.

Configure CI/CD Pipeline: Set up a pipeline that automatically builds and deploys your NestJS application whenever changes are pushed to the repository. Define the necessary build steps, testing, and deployment instructions.

Please note that the specific steps and commands may vary depending on your environment, preferences, and deployment targets. It's always a good practice to consult the official documentation for the tools and platforms you choose to ensure accurate and up-to-date information.
## Authors

- [Sudhir Raut](https://github.com/sudhir-raut)

## Contributing to IO Flow

Follow the [contributing guidelines](CONTRIBUTING.md) if you want to propose a change in the IO Flow core.

### Reporting Issues

If you experience or witness any unacceptable behavior while interacting with our project, please report it to the project maintainers by contacting [sudhir.raut@iauro.com]. All reports will be kept confidential.

## Code of Conduct

We are committed to providing a friendly, safe, and welcoming environment for all contributors and participants. Please review our [Code of Conduct](CODE_OF_CONDUCT.md) to understand our expectations for behavior.

## License

IO Flow is licensed under the free License - see the [LICENSE.md](LICENSE.md) file for details 
