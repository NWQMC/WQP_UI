/* jslint browser: true */

/* global L */
/* global _ */

L.SingleClickEventMixin = {

	dblclickInterval : 500,

	_hasAddedClickHandler : false,

	_addClickEventHandlers : function() {
		"use strict";
		var self = this;

		var timeout;

		var clearClickTimeout = function() {
			if (timeout) {
				clearTimeout(timeout);
				timeout = undefined;
			}
		};

		var checkLater = function(ev) {
			if (this._singleClickHandlers.length > 0) {
				clearTimeout(timeout);
				timeout = setTimeout(function() {
					_.each(self._singleClickHandlers, function(handler) {
						handler.boundHandler(ev);
					});
				}, this.dblclickInterval);
			}
		};

		if (this.on) {
			this.on('click', checkLater);
			this.on('dblclick', clearClickTimeout);
		}
	},

	addSingleClickHandler : function(handler, context) {
		"use strict";
		if (!this._hasAddedClickHandler) {
			this._addClickEventHandlers();
			this._hasAddedClickHandler = true;
		}

		this._singleClickHandlers.push({
			handler : handler,
			boundHandler : _.bind(handler, context)
		});
	},

	removeSingleClickHandler : function(handler) {
		"use strict";
		this._singleClickHandlers = _.reject(this._singleClickHandlers, function(thisHandler) {
			return (thisHandler.handler === handler);
		});
	},

	_singleClickHandlers : []

};
