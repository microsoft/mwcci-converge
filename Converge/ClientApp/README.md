
## Setting environment variables
Before you can build your appPackage and Manifest.json for Teams, you will need to add environment variables according to the [.env.example](./.env.example) file. 
When developing locally, create a file called [.env](https://github.com/motdotla/dotenv) based on .env.example and the variables will be injected during the build, 
for staging/production builds, add the [variables to your pipeline](https://docs.microsoft.com/en-us/azure/devops/pipelines/process/variables?view=azure-devops&tabs=yaml%2Cbatch) instead.

## Available Scripts

To run the project locally do:

### `npm install`

This installs the necessary packages to build the site.

### `npm run start`

Runs the app in the development mode.\
Open [https://localhost:3000](https://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

It is important to run in HTTPS or the app will not load
in Teams.

**You will need to add your local, self signed certificate to the trusted root authority of your machine to run this application in Teams**

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\

### `npm run eject`

**Do not do this without consensus from the team**

## Build against the local API

To work on the front end in conjunction with the back end, ensure the proxy value in `package.json` is `"proxy": "https://localhost:44306"` and then run the application.

## Install in Teams

To install in Teams, run the local app and go to `https://localhost:3000/appPackage.zip`. Then follow [these instructions](https://docs.microsoft.com/en-us/microsoftteams/platform/concepts/deploy-and-publish/apps-upload) to sideload the app.
