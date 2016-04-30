/**
 * Panel Component, embeds Google Chrome Frame for IE browsers
 * It acts like a cross-domain iframe, use postMessage
 */
Ext.define('Ext.ux.panel.ChromeFrame', {
	extend: 'Ext.panel.Panel',
	requires: ['Ext.JSON'],

	alias: 'widget.chromeframepanel',
	layout: 'fit',
	
	// defaults
	frameName: 'ChromeFrame',
	frameSrc: 'about:blank;',
	frameHeight: '100%',
	frameWidth: '100%',

	messageOrigin: '*',
	isMessageJson: true,

    tpl: [
        '<object name="{name}" style="height:{height}; width:{width}; margin:0px;"',
            ' codebase="http://www.google.com" classid="CLSID:E0A900DF-9611-4446-86BD-4B1D47E7DB2A">',
            '<param name="src" value="{src}">',
            '<embed name="{name}Plugin" style="height:{height}; width:{width}; margin:0px;"',
            ' type="application/chromeframe">',
        '</embed></object>'
    ],

	constructor: function (config) {
		var me = this;

		me.callParent(arguments);
	},

	initComponent: function () {
		var me = this;

		// custom vars for template
        me.data = {
            src:    me.frameSrc,
			name:   me.frameName,
			height: me.frameHeight,
			width:  me.frameWidth
		};

		// init parent
		me.callParent();

		// custom events
		me.addEvents([
            'beforeload',
            'load',
            'error',
            'message'
        ]);

        Ext.apply(this.renderSelectors, {
            frameEl: 'object'
        });
    },

    getDoc: function () {
        var me = this,
            frame = me.getFrame();

        if (frame) {
            return frame.contentDocument;
        }
    },

    getFrame: function() {
        var me = this;

        if (me.frameEl && me.frameEl.dom) {
            return me.frameEl.dom;
        }
    },

    initEvents : function() {
        var me = this,
            frame = me.getFrame(),
            doc;

        me.callParent();

        if (frame) {
            doc = frame.contentDocument;
            if (doc) {
                doc.onload = function () {
                    me.onLoad();
                };
            }
            frame.onmessage = function (evt) {
                me.onMessage(evt);
            };
            frame.onloaderror = function () {
                me.onLoadError();
            };
        }
    },

    load: function (src) {
        var me = this,
            frame = me.getFrame();

        if (me.fireEvent('beforeload', me, src) !== false) {
            frame.src = me.frameSrc = (src || me.frameSrc);
        }
    },

    onLoad: function () {
        var me = this;
        me.fireEvent('load', me);
    },

    onLoadError: function () {
        var me = this;
        me.fireEvent('error', me);
    },

	onMessage: function (evt) {
		var me = this,
			evt = evt || window.event,
			message = evt.data,
			origin = evt.origin;

		if (me.isMessageJson) {
			var fromJson = JSON ? JSON.parse : Ext.JSON.decode;
			message = fromJson(message);
		}

		me.fireEvent('message', me, message, origin);
	},

	sendMessage: function (msg, origin) {
		var me = this,
            frame = me.getFrame(),
            message = msg,
			origin = origin || me.messageOrigin || '*';

		if (typeof message != 'string') {
			var toJson = JSON ? JSON.stringify : Ext.JSON.encode;
            message = toJson(message);
		}

		if (frame) {
			frame.postMessage(message, origin);
		}
	},

    destroy: function () {
        var me = this,
            frame = me.getFrame();

		if (frame) {
            frame.onload = null;
            frame.onmessage = null;
			frame.onloaderror = null;
		}

		me.callParent();
    }

});