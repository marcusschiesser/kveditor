# Splunk - KVEditor

Splunk instance for running the KVEditor app 

## Getting Started

You can set up a local dev environment with the following steps:

1. Clone this repository to WSL Ubuntu file system. This is important as file delimiters would be wrong if the project is checked out in the windows file system.
2. Open project in Visual Studio Code
3. Reopen the project in Dev Container and wait first until everything has been setting up
4. Open new terminal, go to the `/splunk` folder and run `yarn setup`
5. After finishing setting up, run `yarn start`. For more information consult the [/splunk/README.md](/splunk/README.md).
6. Open a new second terminal session, make sure, you're in the root folder of the project and use Docker to start the dev environment servers:
    ```
    docker-compose up --build
    ```

    To shut down the servers call:
    ```
    docker-compose down
    ```

## Try your first query

Go to http://localhost:8000/en-US/app/kv-editor/search and call the following SPL query to fill the KV store:

```
| inputlookup example_kv.csv 
| outputlookup example_kv
```

Then you can go to http://localhost:8000/en-US/app/kv-editor/dashboard and use the KV editor.