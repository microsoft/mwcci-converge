#Requires -RunAsAdministrator
<#
.SYNOPSIS
Creates two SharePoint lists called "Converge_Places" and "Converge_Places_Photos" for the purposes of adding photos and metadata about Workspaces and Conference Rooms.
.DESCRIPTION
.EXAMPLE
.\SyncPlaces.ps1 -PathToPrivateKey .\MyKey.pfx -ClientID some_guid -CertPassword $CertPassword -SharePointURL https://tenantName.sharepoint.com -Tenant tenantName.onmicrosoft.com
All parameters are necessary to run this script.
#>
Param(

   [Parameter(Mandatory=$true, HelpMessage="This key corresponds to the certificate uploaded in AAD.")]
   [string]$PathToPrivateKey,

   [Parameter(Mandatory=$true, HelpMessage="This password corresponds to the certificate uploaded in AAD.")]
   [SecureString]$CertPassword,

   [Parameter(Mandatory=$true, HelpMessage="The URL of your SharePoint. Should look like https://{tenant}.sharepoint.com")]
   [string]$SharePointURL,

   [Parameter(Mandatory=$true, HelpMessage="Should look like {tenant}.onmicrosoft.com")]
   [string]$Tenant,

   [Parameter(Mandatory=$true, HelpMessage="The ClientID of the application registered in AAD.")]
   [string]$ClientID,

   [Parameter(HelpMessage="The name of the list of places. Defaults to Converge_Places")]
   [string]$PlaceListName="Converge_Places",

   [Parameter(HelpMessage="The name of the list of photos for places. Defaults to Converge_Places_Photos")]
   [string]$PlacePhotosListName="Converge_Places_Photos"
)


# Install the necessary modules
Install-Module -Name PnP.PowerShell -Force -AllowClobber
Import-Module PnP.PowerShell

# Login to Share Point
$pfx_cert = get-content $PathToPrivateKey -Encoding Byte
$base64 = [System.Convert]::ToBase64String($pfx_cert)
Connect-PnPOnline -ClientId $ClientID -CertificateBase64Encoded $base64 -CertificatePassword $CertPassword -Url $SharePointURL -Tenant $Tenant


# Get the place list
$ConvergePlaces = Get-PnPList -Identity "Lists/$PlaceListName"

# If there isn't a list, create one
if ($null -eq $ConvergePlaces) {
  New-PnPList -Title $PlaceListName -Url "Lists/$PlaceListName" -Template GenericList
  $ConvergePlaces = Get-PnPList -Identity "Lists/$PlaceListName"

  $FieldsToCreate = @(
    @{
      Name = 'EmailAddress'
      Type = 'Text'
      IsIndexed = $true
    },
    @{
      Name = 'Latitude'
      Type = 'Number'
      IsIndexed = $true
    },
    @{
      Name = 'Longitude'
      Type = 'Number'
      IsIndexed = $true
    },
    @{
      Name = 'Name'
      Type = 'Text'
      IsIndexed = $true
    },
    @{
      Name = 'PlaceType'
      Type = 'Choice'
      IsIndexed = $true
      Choices = 'Room', 'Space'
    },
    @{
      Name = 'Street'
      Type = 'Text'
    },
    @{
      Name = 'City'
      Type = 'Text'
    },
    @{
      Name = 'State'
      Type = 'Text'
    },
    @{
      Name = 'PostalCode'
      Type = 'Text'
    },
    @{
      Name = 'CountryOrRegion'
      Type = 'Text'
    },
    @{
      Name = 'IsManaged'
      Type = 'Boolean'
    },
    @{
      Name = 'BookingType'
      Type = 'Choice'
      IsIndexed = $true
      Choices = 'Unknown', 'Standard', 'Reserved'
    },
    @{
      Name = 'Phone'
      Type = 'Text'
    },
    @{
      Name = 'Building'
      Type = 'Text'
    },
    @{
      Name = 'Capacity'
      Type = 'Number'
      IsIndexed = $true
    },
    @{
      Name = 'Locality'
      Type = 'Text'
      IsIndexed = $true
    },
    @{
      Name = 'Label'
      Type = 'Text'
    },
    @{
      Name = 'AudioDeviceName'
      Type = 'Text'
      IsIndexed = $true
    },
    @{
      Name = 'VideoDeviceName'
      Type = 'Text'
      IsIndexed = $true
    },
    @{
      Name = 'DisplayDeviceName'
      Type = 'Text'
      IsIndexed = $true
    },
    @{
      Name = 'IsWheelChairAccessible'
      Type = 'Boolean'
      IsIndexed = $true
    },
    @{
      Name = 'Floor'
      Type = 'Text'
    },
    @{
      Name = 'FloorLabel'
      Type = 'Text'
    },
    @{
      Name = 'Tags'
      Type = 'Text'
    }
  )

  foreach ($field in $FieldsToCreate) {
    if ($null -eq $field.Choices) {
      Add-PnPField -List $PlaceListName -DisplayName $field.Name -InternalName $field.Name -Type $field.Type -AddToDefaultView
    } else {
      Add-PnPField -List $PlaceListName -DisplayName $field.Name -InternalName $field.Name -Type $field.Type -AddToDefaultView -Choices $field.Choices
    }
    if ($field.IsIndexed) {
      Set-PnPField -List $PlaceListName -Identity $field.Name -Values @{Indexed=$true}
    }
  }

  # Create isAvailable with a default value of true
  $isAvailableXml = '<Field DisplayName="IsAvailable" Format="Dropdown" IsModern="TRUE" Name="IsAvailable" Title="IsAvailable" Type="Boolean" ID="{'+[guid]::NewGuid()+'}" StaticName="IsAvailable" Indexed="TRUE"><Default>1</Default></Field>'
  Add-PnPFieldFromXml -List $PlaceListName -FieldXml $isAvailableXml

  # Get the place photos list
  $ConvergePlacesPhotos = Get-PnPList -Identity "Lists/$PlacePhotosListName"

  # If there isn't a list, create one
  if ($null -eq $ConvergePlacesPhotos) {
    New-PnPList -Title $PlacePhotosListName -Url "Lists/$PlacePhotosListName" -Template DocumentLibrary
    $fieldId = [guid]::NewGuid()
    $list = Get-PnPList -Identity "Lists/$PlaceListName" 
    $xml = '<Field Type="Lookup" DisplayName="Room" Required="TRUE" EnforceUniqueValues="FALSE" List="{' + $list.Id + '}" ShowField="Name" UnlimitedLengthInDocumentLibrary="FALSE" Indexed="TRUE" ID="{' + $fieldId + '}" StaticName="Room" Name="Room" ColName="int3" RowOrdinal="0" />'
    Add-PnPFieldFromXml -List $PlacePhotosListName -FieldXml $xml
    Add-PnPField -List $PlacePhotosListName -DisplayName "PhotoType" -InternalName "PhotoType" -Type Choice -AddToDefaultView -Choices "FloorPlan","Photo", "Cover"
    Set-PnPView -List $PlacePhotosListName -Identity "All Documents" -Fields "Name","Modified","Modified By","PhotoType","Room"
  }
}

Disconnect-PnPOnline