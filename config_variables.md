# Configuration Variables
Converge requires multiple configuration variables in order to run. These configuration variables can be set using multiple methods.
Required fields will have an *.
| Key | Value |
|---|---|
| AzureAd:TenantId* | Id of Tenant that app belongs to |
| AzureAd:ClientId* | ClientId of converge azure app service |
| AzureAd:ClientSecret* | Client Secret of converge app registration |
| AzureAd:Audience* | Azure AD Audience of token being authenticated in the format api://{hostname}/{clientId} |
| AzureAD:Instance* | set this value to `https://login.microsoftonline.com/`
| BingMapsAPIKey* | Bing API key used in app. |
| YelpAPIKey* | Yelp API key used in app. |
| SharePointSiteId* | The Graph ID of the SharePoint site where you created the lists to host backing data store for Converge. Find this ID using the [Microsoft Graph documentation about SharePoint sites](https://docs.microsoft.com/en-us/graph/api/resources/sharepoint?view=graph-rest-1.0).  |
| SharePointListId* | Name or ID of SharePoint list where Exchange Places are being stored |
| SharePointPhotoListId* | Name or ID of SharePoint list where Place photos are stored |
| AppInsightsInstrumentationKey* | Instrumentation key from azure app insights resource |
| KeyVaultName | Name of Azure KeyVault being used |
| MaxPredictionWindow | The number of days Converge should attempt to predict where users should be. The recommended value is 14. |
| JobSchedules:PredictorSchedule* | [Crontab expression](https://crontab-generator.org/) for how often to check users' calendars and predict where they will be in the in the next number of days specified by the MaxPredictionWindow |
| JobSchedules:SyncPlacesSchedule* | [Crontab expression](https://crontab-generator.org/) for how often to sync SharePoint with the workspace and conference room data from Exchange |
| FilterUsersByTitle | Adding this string will ensure that users with the given title are filtered out of result sets |
| AppEnvironment | Environment the app is running in. Each environment requires a unique value, the recommendation for the production deployment is to provide an empty string. |
| AppBannerMessage | Message displayed at the top of the site on all pages |
| NewPlacesAvailableByDefault | true/false field representing whether New Places are available by default. The recommended value is true. |

## UserSecrets
User secrets work best when being used for local development.
You can add the configuration as user secrets as shown here:
```json
{
  "AzureAd": {
    "TenantId": "",
    "ClientId": "",
    "ClientSecret": "",
    "Audience": ""
  },
  "BingMapsAPIKey": "",
  "YelpAPIKey": "",
  "SharePointSiteId": "",
  "SharePointListId": "",
  "SharePointPhotoListId": "",
  "AppInsightsInstrumentationKey": ""
}
```