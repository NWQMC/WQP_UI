# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased](https://github.com/NWQMC/WQP_UI/compare/WQP_UI-5.20.0...master)
## Changed
-   Purged logos and text pertaining to ACWI and/or NWQMC.

## [5.20.0](https://github.com/NWQMC/WQP_UI/compare/WQP_UI-5.19.0...WQP_UI-5.20.0)
## Changed
-  Updated contact email

## [5.19.0](https://github.com/NWQMC/WQP_UI/compare/WQP_UI-5.18.0...WQP_UI-5.19.0)
### Removed
- Ability to click on a feature in the coverage mapper

### Changed
-   Using latest tagged version of python 3.7 rather than 3.6.

## [5.18.0](https://github.com/NWQMC/WQP_UI/compare/WQP_UI-5.17.0...WQP_UI-5.18.0)
## Changed
- Jenkins pipeline library was updated to use IOW specific library with new 
configuration method.

## [5.17.0](https://github.com/NWQMC/WQP_UI/compare/WQP_UI-5.14.0...WQP_UI-5.17.0)
### Fixed
- Removed CSRF tokens from web service calls.

### Changed
- Updated url that is in the sites service to point at the new monitoring-location pages

## [5.14.0](https://github.com/NWQMC/WQP_UI/compare/WQP_UI-5.13.0...WQP_UI-5.14.0)
### Fixed
- Issue when using hashed assets on the provider pages.

## [5.13.0](https://github.com/NWQMC/WQP_UI/compare/WQP_UI-5.12.0...WQP_UI-5.13.0)
### Fixed
- Add CSRF protection to Contact Us and Portal pages.

## [5.12.0](https://github.com/NWQMC/WQP_UI/compare/WQP_UI-5.11.0...WQP_UI-5.12.0)
### Added
- Environment-driven application configuration.
- Jenkins build and deployment

## [5.11.0](https://github.com/NWQMC/WQP_UI/compare/WQP_UI-5.10.0...WQP_UI-5.11.0)
### Added
- Docker configuration for the application.
- Radio button for selecting Biological Metric Download form.

### Fixed
- Add nanobar.js to vendor.js so that it is loaded in the manage_cache page.

## [5.10.0](https://github.com/NWQMC/WQP_UI/compare/WQP_UI-5.9.0...WQP_UI-5.10.0)
### Changed
- Updated python dependencies
- Activity download uses a dataProfile in order to get all of the columns.
- Identify dialog now uses a Leaflet popup for all screen sizes and the form within the dialog has
been eliminated in favor of a Populate Form button which populates the form within the portal page.

## [5.9.0](https://github.com/NWQMC/WQP_UI/compare/WQP_UI-5.8.0...WQP_UI-5.9.0)
### Added
- New npm script that can be used to run the static server using https
- Handles 401 or 403 status from ajax calls and informs user that they need to reload the page.
- Radio button for selecting the organization data endpoint in the Download form.

### Changed
- Computed web service calls are now updated when search form changes are made.

### Fixed
- Download proxy now works on Firefox and when remotely deployed.
- Download of data in Excel format when there are undefined counts now works.
- All endpoints now do not allow a download when there is no data to download.
- Bug that prevented portal page selects from working in Internet Explorer 11.

## [5.8.0](https://github.com/NWQMC/WQP_UI/compare/WQP_UI-5.7.0...WQP_UI-5.8.0)
### Added
- Copy to clipboard button that takes the current portal page URL that is the window below the button and puts it in
the browser clipboard.
- Curl command that shows when the 'Show Web Calls' button is clicked

### Changed
- Function of 'Show Web Calls' button so that only one call, based on which result type radio button is selected, is shown

### Fixed
- Media breakpoint formatting that caused 'Select data to download' radio buttons to be inaccessible at screen widths
between 768px and 992px
- Can now select pour points for NLDI navigation.
- An issue that affected the ability to add some query parameters to the 'web calls' on the portal page after the 'Reset
form' button was pressed

