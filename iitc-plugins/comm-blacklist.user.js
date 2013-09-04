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
window.plugin.commBlacklist = function() {};

window.plugin.commBlacklist.setupCallback = function() {
	$('#toolbox').append('<a onclick="window.plugin.commBlacklist.config()" title="setup blacklist.">Setup Blacklist</a>');
	addHook('factionChatDataAvailable', window.plugin.commBlacklist.blackItCallback);
	addHook('publicChatDataAvailable', window.plugin.commBlacklist.blackItCallback);
	$('#chatcontrols a').click(window.plugin.commBlacklist.blackItCallback);
};

window.plugin.commBlacklist.blackItCallback = function() {
	// should hook the "AFTER" event.
	setTimeout(window.plugin.commBlacklist.blackIt, 20);
	// for slower computer?
	// setTimeout(window.plugin.commBlacklist.blackIt, 500);
};

window.plugin.commBlacklist.blackIt = function() {
	// alert('blackIt');
	var data = window.plugin.commBlacklist.fetchBlacklist();
	console.log("blacklist:" + JSON.stringify(data.list));
	var list = data.list.toLowerCase().replace(/\s+/g, '').split(",");
	var replace = data.text;
	if(data.auto)
		replace = window.plugin.commBlacklist.randomizeChat();

	var blackEach = function(el) {
		var id = $(el).text().toLowerCase();
		if($.inArray(id, list) > -1) {
			// $(el).text("hacked/634");
			var td = $(el).closest('td').next();
			var text = td.data('blacked');
			if(null == text) {
				text = td.text();
				td.data('blacked', text);
                	        if(data.auto)
                        	        replace = window.plugin.commBlacklist.randomizeChat();
                        	td.html('<span style="cursor:pointer;color:red;">' + replace + '</span>');
			}
			td.attr('title', text);
		}
	};

	$('#chatfaction .nickname').each(function(index, el) { blackEach(el); });
	$('#chatpublic .nickname').each(function(index, el) { blackEach(el); });
};

// public interface
window.plugin.commBlacklist.fetchBlacklist = function() {
	var list = window.localStorage['comm-blacklist'];
	var defaultData = { list:'LuoboTiX,wanx,Fire', text: '*** censored ***', auto: true };
	try {
		return null == list ? defaultData : JSON.parse(list);
	} catch(e) {
		return defaultData;
	}
};

window.plugin.commBlacklist.config = function() {
        var data = window.plugin.commBlacklist.fetchBlacklist();
	// console.log("blacklist read: " + JSON.stringify(data));

	var div = $('<div>');
	var names = $('<input placeholder="Example: wanx,Fire,LuoboTiX" value="' + data.list + '" style="width:280px" />');
	var replace = $('<input placeholder="Example: *** censored *** " value="' + data.text + '" style="width:280px" />');
	var check = $('<input type="checkbox" value="auto" ' + (data.auto ? "checked" : "")  + '>Auto chat message</input>');
	var importa = $('<a href="javascript:window.plugin.commBlacklist.importInfo();">Import</a>');
	var exporta = $('<a href="javascript:window.plugin.commBlacklist.exportInfo();">Export</a>');
	var chatset = $('<a href="javascript:	window.plugin.commBlacklist.setChat();">Set Chat List</a>');
	var resetb = $('<a href="javascript:	window.plugin.commBlacklist.reset();">Reset</a>');
	div.append("BlackList Ids:\n").append(names).append("\n\nReplace Text:\n").append(replace)
		.append("\n\n").append(check);
	div.append("<br/>").append(importa).append("&nbsp;&nbsp;&nbsp;").
		append(exporta)
		.append("&nbsp;&nbsp;&nbsp;").append(chatset)
		.append("&nbsp;&nbsp;&nbsp;").append(resetb);
	
	var s = div.html();
	// console.log(s);
	alert(s, true, function() {
		var list = $(".ui-dialog-content input:eq(0)").val();
		var text = $(".ui-dialog-content input:eq(1)").val();
		var auto = $(".ui-dialog-content input:eq(2)").is(":checked");
		var d = { list:list, text:text, auto: auto };
		console.log("blacklist saved:" + JSON.stringify(d));
		window.localStorage['comm-blacklist'] = JSON.stringify(d);
	});
	var $check = $(".ui-dialog-content input:eq(2)");
	$check.click(function() {
                // console.log(check.is(":checked"));
                $check.prev().prop('disabled', $check.is(":checked"));
        });
};
window.plugin.commBlacklist.importInfo = function (){
	var div = $('<div>');
	var inp = $('<textarea placeholder="Enter what you exported here" style="width:280px;height:100px;" >'+ window.localStorage['comm-blacklist'] + '</textarea>');
	div.append(inp);
	// console.log(s);
	var s = div.html();
	alert(s, true, function() {
		var data = $(".ui-dialog-content textarea:eq(0)").val();
		window.localStorage['comm-blacklist'] = data;
	});
};
window.plugin.commBlacklist.exportInfo = function (){
	var div = $('<div>');
	var inp = $('<textarea placeholder="Enter what you exported here" style="width:280px;height:100px;" >'+ window.localStorage['comm-blacklist'] + '</textarea>');
	div.append(inp);
	// console.log(s);
	var s = div.html();
	alert(s, true, function() {
	});
};
window.plugin.commBlacklist.reset = function (){
	console.log("reset");
	var s = "Press OK and your settings for this black-list will be reset";
	alert(s, true, function() {
		localStorage.removeItem('chatList');
		localStorage.removeItem('comm-blacklist');
	});
}
window.plugin.commBlacklist.setChat = function (){
	console.log("set chat");
	var div = $('<div>');
	var inp = $('<textarea placeholder="Enter what you exported here. Clear all to leave it un-edited." style="width:280px;height:100px;" >'+ window.localStorage['chatList'] + '</textarea>');
	div.append(inp);
	console.log(div);
	var s = div.html();
	alert(s, true, function() {
		var data = $(".ui-dialog-content textarea:eq(0)").val();
		console.log(data);
		if (data != "")
			window.plugin.commBlacklist.setChatList(data);
	});
};
var setup = function() {
	window.plugin.commBlacklist.setupCallback();
	window.plugin.commBlacklist.blackIt();
};

window.plugin.commBlacklist.randomizeChat = function() {
	var len = window.plugin.commBlacklist.CHATS.length;
	var ind = Math.round(Math.random() * len);
	var chat = window.plugin.commBlacklist.CHATS[ind];
	if($.inArray("#", chat) == 0 || chat===undefined || chat==="")
		return window.plugin.commBlacklist.randomizeChat();
	return chat;
};

if (localStorage.getItem("chatList") === null) {
localStorage["chatList"]= (
window.plugin.commBlacklist.CHATS_STR = "幼儿唐诗三百首（文本精选）\n" +
"春眠不觉晓，处处闻啼鸟。\n" +
"夜来风雨声，花落知多少。\n" +
"空山不见人，但闻人语响。\n" +
"返影入深林，复照青苔上。\n" +
"红豆生南国，春来发几枝。\n" +
"愿君多采撷，此物最相思。\n" +
"君自故乡来，应知故乡事。\n" +
"来日绮窗前，寒梅著花未。\n" +
"终南阴岭秀，积雪浮云端。\n" +
"林表明霁色，城中增暮寒。\n" +
"床前明月光，疑是地上霜。\n" +
"举头望明月，低头思故乡。\n" +
"白日依山尽，黄河入海流。\n" +
"欲穷千里目，更上一层楼。\n" +
"千山鸟飞绝，万径人踪灭。\n" +
"孤舟蓑笠翁，独钓寒江雪。\n" +
"向晚意不适，驱车登古原。\n" +
"夕阳无限好，只是近黄昏。\n" +
"泠泠七弦上，静听松风寒。\n" +
"古调虽自爱，今人多不弹。\n" +
"功盖三分国，名成八阵图。\n" +
"江流石不转，遣恨失吞吴。\n" +
"离离原上草，一岁一枯荣。\n" +
"野火烧不尽。春风吹又生。\n" +
"远芳侵古道，晴翠接荒城。\n" +
"又送王孙去，萋萋满别情。\n" +
"慈母手中线，游子身上衣。\n" +
"临行密密缝，意恐迟迟归。\n" +
"谁言寸草心，报得三春晖。\n" +
"明月出天山，苍茫云海间。\n" +
"长风几万里，吹度玉门关。\n" +
"汉下白登道，胡窥青海湾。\n" +
"由来征战地，不见有人还。\n" +
"戍客望边色，思归多苦颜。\n" +
"高楼当此夜，叹息未应闲。\n" +
"海上生明月，天涯共此时。\n" +
"情人怨遥夜，竟夕起相思。\n" +
"灭烛怜光满，披衣觉露滋。\n" +
"不堪盈手赠，还寝梦佳期。\n" +
"城阙辅三秦，风烟望五津。\n" +
"与君离别意，同是宦游人。\n" +
"海内存知己，天涯若比邻。\n" +
"无为在岐路，儿女共沾巾。\n" +
"国破山河在，城春草木深。\n" +
"感时花溅泪，恨别鸟惊心。\n" +
"烽火连三月，家书抵万金。\n" +
"白头搔更短，浑欲不胜簪。\n" +
"昔闻洞庭水，今上岳阳楼。\n" +
"吴楚东南坼，乾坤日夜浮。\n" +
"亲朋无一字，老病有孤舟。\n" +
"戎马关山北，凭轩涕泗流。\n" +
"中岁颇好道，晚家南山陲。\n" +
"兴来每独往，胜事空自知。\n" +
"行到水穷处，坐看云起时。\n" +
"偶然值林叟，谈笑无还期。\n" +
"葡萄美酒夜光杯，欲饮琵琶马上催。\n" +
"醉卧沙场君莫笑，古来征战几人回。\n" +
"日照香炉生紫烟，遥看瀑布挂前川。\n" +
"飞流直下三千尺，疑是银河落九天。\n" +
"故人西辞黄鹤楼，烟花三月下扬州。\n" +
"孤帆远影碧空尽，惟见长江天际流。\n" +
"朝辞白帝彩云间，千里江陵一日还。\n" +
"两岸猿声啼不住，轻舟已过万重山。\n" +
"月落乌啼霜满天，江枫渔火对愁眠。\n" +
"姑苏城外寒山寺，夜半钟声到客船。\n" +
"朱雀桥边野草花，乌衣巷口夕阳斜。\n" +
"旧时王谢堂前燕，飞入寻常百姓家。\n" +
"渭城朝雨浥轻尘，客舍青青柳色新。\n" +
"劝君更尽一杯酒，西出阳关无故人。\n" +
"秦时明月汉时关，万里长征人未还。\n" +
"但使龙城飞将在，不教胡马渡阴山。\n" +
"黄河远上白云间，一片孤城万仞山。\n" +
"羌笛何须怨杨柳，春风不度玉门关。\n" +
"碧玉妆成一树高，万条垂下绿丝绦。\n" +
"不知细叶谁裁出，二月春风似剪刀。\n" +
"昔人已乘黄鹤去，此地空余黄鹤楼。\n" +
"黄鹤一去不复返，白云千载空悠悠。\n" +
"晴川历历汉阳树，芳草萋萋鹦鹉洲。\n" +
"黄四娘家花满蹊，千朵万朵压枝低。\n" +
"留连戏蝶时时舞，自在娇莺恰恰啼。\n" +
"清明时节雨纷纷，路上行人欲断魂。\n" +
"借问酒家何处有，牧童遥指杏花村。\n" +
"远上寒山石径斜，白云生处有人家。\n" +
"停车坐爱枫林晚，霜叶红于二月花。\n" +
"去年今日此门中，人面桃花相映红。\n" +
"人面不知何处去，桃花依旧笑春风。"
);}
else window.plugin.commBlacklist.CHATS_STR=localStorage["chatList"];

window.plugin.commBlacklist.CHATS = window.plugin.commBlacklist.CHATS_STR.split("\n");
	
window.plugin.commBlacklist.setChatList=function(str){
	console.log("setChatList");
	localStorage["chatList"] = (window.plugin.commBlacklist.CHATS_STR = str);
	window.plugin.commBlacklist.CHATS = window.plugin.commBlacklist.CHATS_STR.split("\n");
	return true;
}


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
