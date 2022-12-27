# KVEditor

Generic editor for Splunk's KV store written in Splunk's [React-UI](https://splunkui.splunk.com/Packages/react-ui/Overview) framework.

## Overview

The project contains a variety of packages that are published and versioned collectively. Each package lives in its own 
directory in the `/packages` directory. Each package is self contained, and defines its dependencies in a package.json file.

We use [Yarn Workspaces](https://yarnpkg.com/lang/en/docs/workspaces/) and [Lerna](https://github.com/lerna/lerna) for
managing and publishing multiple packages in the same repository.

## Getting Started

1. Clone the repo.
2. Install yarn (>= 1.2) if you haven't already: `npm install --global yarn`.
3. Run the setup task: `yarn run setup`.
4. Ensure that your `SPLUNK_HOME` environment variable is set and call `yarn run link:app` from the `packages/kv-editor` folder. 
This links this KV store app with your local Splunk installation
5. Call `yarn run start` from the root folder to run the local development server
6. Go to http://localhost:8000/en-US/app/kv-editor/search and call the following SPL query to fill the KV store:

```
| inputlookup example_kv.csv 
| outputlookup example_kv
```

Then you can go to http://localhost:8000/en-US/app/kv-editor/dashboard and use the KV editor.

## Yarn Tasks

* `start` – Run the `start` task for each project
* `build` – Create a production bundle for all projects
* `test` – Run unit tests for each project
* `lint` – Run JS and CSS linters for each project
* `format` – Run prettier to auto-format `*.js`, `*.jsx` and `*.css` files. This command will overwrite files without 
asking, `format:verify` won't.

Running `yarn run setup` once is required to enable all other tasks. The command might take a few minutes to finish.


## Developer Scripts

Commands run from the root directory will be applied to all packages. This is handy when working on multiple packages 
simultaneously. Commands can also be run from individual packages. This may be better for performance and reporting when
 only working on a single package. All of the packages have similar developer scripts, but not all scripts are implemented 
 for every package. See the `package.json` of the package in question to see which scripts are available there.

For more granular control of development scripts, consider using [Lerna](https://github.com/lerna/lerna) directly.


## Code Formatting

KVEditor uses [prettier](https://github.com/prettier/prettier) to ensure consistent code formatting. It is recommended
 to [add a prettier plugin to your editor/ide](https://github.com/prettier/prettier#editor-integration).
