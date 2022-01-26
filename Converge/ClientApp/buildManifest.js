// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
const dotenv = require("dotenv");
const fs = require('fs');
var AdmZip = require("adm-zip");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");

const cleanManifest = async () => {
  await new Promise((resolve, reject) => {
    fs.unlink("appPackage/manifest.json", (err) => {
      if (err && !err.message.startsWith("ENOENT: no such file or directory")) {
        reject(err.message);
      }
      resolve();
    });
  })
  await new Promise((resolve, reject) => {
    fs.unlink("public/appPackage.zip", (err) => {
      if (err && !err.message.startsWith("ENOENT: no such file or directory")) {
        reject(err);
      }
      resolve();
    });
  })
};


async function setDevEnvironment() {
  dotenv.config();

  process.env.AppEnvironment = "_dev";

  if (!process.env.DOMAIN) {
    throw new Error("Missing required environment variable: DOMAIN!");
  }
  if (!process.env.PORT) {
    throw new Error("Missing required environment variable: PORT!");
  }
  if (!process.env.APP_ID) {
    throw new Error("Missing required environment variable: APP_ID!");
  }
}

function checkEnvironmentVariables() {
  if (!process.env.WEBSITE) {
    throw new Error("Missing required environment variable: WEBSITE!");
  }
  if (!process.env.DOMAIN) {
    throw new Error("Missing required environment variable: DOMAIN!");
  }
  if (!process.env.APP_ID) {
    throw new Error("Missing required environment variable: APP_ID!");
  }
}


function getValueFromEnv(key) {
  return process.env[key] || "";
}

const buildManifest = async () => {
  const argv = yargs(hideBin(process.argv)).argv
  switch(argv.environment) {
    case "dev":
      setDevEnvironment();
      break;
    default:
      checkEnvironmentVariables()
  }

  const manifestTemplateString = await new Promise((resolve, reject) => {
    fs.readFile('./appPackage/manifest.template.json', 'utf8', function(err, data) {
      if (err) {
        reject(err)
      }
      resolve(data);
    })
  })

  let newManifest = manifestTemplateString.toString();
  const matches = manifestTemplateString.match(/%([a-zA-Z_]*)%/g);
  if (matches) {
    matches.forEach(match => {
      newManifest = newManifest.replace(match, getValueFromEnv(match.slice(1, -1)))
    })
  }

  // create new file
  await new Promise((resolve, reject) => {
    fs.writeFile('./appPackage/manifest.json',newManifest, (err) => {
      if (err) {
        reject(err)
      }
      resolve()
    })
  })
};

const zipAppPackage = () => {
  var zip = new AdmZip();
  zip.addLocalFile("./appPackage/manifest.json");
  zip.addLocalFile("./appPackage/color.png");
  zip.addLocalFile("./appPackage/outline.png");
  zip.writeZip("./public/appPackage.zip");
}

const cleanBuildZip = async () => {
  await cleanManifest();
  await buildManifest();
  zipAppPackage();
}

cleanBuildZip()