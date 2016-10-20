var PORTAL = PORTAL || {};
PORTAL.VIEWS = PORTAL.VIEWS || {};

PORTAL.VIEWS.downloadProgressDialog = function(el) {
	"use strict";

    var that = {};

    // constants for the two different download statuses
    var DIALOG = {
        map : {
            title : 'Map Sites Status',
            continueMessage : 'map the sites',
            cancelDownload : function(sitesCount) {
                var intSiteCount = parseInt(sitesCount.split(',').join(''));
                return (intSiteCount > 250000);
            },
            cancelMessage : 'Your query is returning more than 250,000 sites and can not be mapped.'
        },
        download : {
            title : 'Download Status',
            continueMessage : 'download the data',
            cancelDownload : function(counts, fileFormat) {
                 return (fileFormat === 'xlsx') &&  (parseInt(counts.split(',').join('')) > 1048575);
            },
            cancelMessage : 'Your query is returning more than 1,048,575 results which exceeds Excel\'s limit.'
        }
    };

    var opKind;

    var buttonHtml = function(id, label) {
        return '<button id="' + id + '" type="button" class="btn btn-default">' + label + '</button>';
    };

    that.show = function(thisOpKind, dialogMessage) {
		var message = (dialogMessage) ? dialogMessage : 'Validating query ... Please wait.'
        opKind = thisOpKind;
        
        el.find('.modal-footer').html('');
        el.find('.modal-body').html(message);
        el.find('.modal-header h4').html(DIALOG[opKind].title);
        el.modal('show');
    };

    that.hide = function() {
        el.modal('hide');
    };
    
	that.updateProgress = function(counts, resultType, fileFormat, continueFnc) {
		var i;
		var id;
		
		var resultsReturned = resultType !== 'Station';
		var totalCount = resultsReturned ? counts.total.results : counts.total.sites;
	
		var getCountMessage = function(){
			// Return a string showing the site counts, formatted to be shown in html.
			var message = 'Your query will return ';
			var providers = PORTAL.MODELS.providers.getIds();
			if (resultsReturned) {
				message += '<b>' + counts.total.results + '</b> sample results from <b>' + counts.total.sites + '</b> sites:<br />';
				for (i = 0; i < providers.length; i++) {
					id = providers[i];
					message += 'From ' + id + ': ' + counts[id].results + ' sample results from ' + counts[id].sites + ' sites<br />';
				}
			}
			else {
				message += counts.total.sites + ':<br />';
				for (i = 0; i < providers.length; i++) {
					id = providers[i];
					message += 'From ' + id + ': ' + counts[id].sites + '<br/>';
				}
			}
			return message;
		};
		

		if (totalCount === '0') {
			that.cancelProgress('Your query returned no data to download.');
		}
		else if (DIALOG[opKind].cancelDownload(totalCount, fileFormat)) {
			that.cancelProgress(getCountMessage() + DIALOG[opKind].cancelMessage);
		}
		
		else {
			el.find('.modal-body').html(getCountMessage() + '<p>Click Continue to ' + DIALOG[opKind].continueMessage);
            el.find('.modal-footer').html(buttonHtml('progress-cancel-btn', 'Cancel') +
                    buttonHtml('progress-continue-btn', 'Continue'));
            $('#progress-cancel-btn').click(function() {
                el.modal('hide');
            });
            $('#progress-continue-btn').click(function() {
                el.modal('hide');
                continueFnc(totalCount);
            });			
		}
	};
    
	that.cancelProgress = function(message) {
		el.find('.modal-body').html(message);
		el.find('.modal-footer').html(buttonHtml('progress-ok-btn', 'Ok'));
		$('#progress-ok-btn').click(function() {
			el.modal('hide');
		});
	};

    return that;

};


