// ==UserScript==
// @id             iitc-plugin-comm-blacklist@marstone
// @name           IITC plugin: blacklist
// @version        0.1
// @namespace      https://github.com/marstone/ingress-intel-total-conversion
// @updateURL      @@UPDATEURL@@
// @downloadURL    @@DOWNLOADURL@@
// @description    [@@BUILDNAME@@-@@BUILDDATE@@] set a blacklist & replace chat text shown in COMM public/faction channels.
// @include        https://www.ingress.com/intel*
// @include        http://www.ingress.com/intel*
// @match          https://www.ingress.com/intel*
// @match          http://www.ingress.com/intel*
// ==/UserScript==

function wrapper() {
// ensure plugin framework is there, even if iitc is not yet loaded
if(typeof window.plugin !== 'function') window.plugin = function() {};


// PLUGIN START ////////////////////////////////////////////////////////

// use own namespace for plugin
window.plugin.commDisabler = function() {};

window.plugin.commDisabler.setupCallback = function() {
	addHook('factionChatDataAvailable', window.plugin.commDisabler.disableChat);
	addHook('publicChatDataAvailable', window.plugin.commDisabler.disableChat);
};

window.plugin.commDisabler.disableChat = function() {
	$("#chatinput input").attr("disabled", true);
};

var setup = function() {
        window.plugin.commDisabler.disableChat();
        window.plugin.commDisabler.setupCallback();
};

// PLUGIN END //////////////////////////////////////////////////////////

if(window.iitcLoaded && typeof setup === 'function') {
	setup();
} else {
	if(window.bootPlugins)
		window.bootPlugins.push(setup);
	else	
		window.bootPlugins = [setup];
}

} // wrapper end


// inject code into site context
var script = document.createElement('script');
script.appendChild(document.createTextNode('('+ wrapper +')();'));
(document.body || document.head || document.documentElement).appendChild(script);
