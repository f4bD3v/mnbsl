
/**
 * $Id: editor_plugin_src.js 201 2007-02-12 15:56:56Z spocke $
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2008, Moxiecode Systems AB, All rights reserved.
 */





(function() {

	var path = '/assets/components/pagebreaker';

	tinymce.create('tinymce.plugins.PageBreakPlugin', {
		init : function(ed, url) {
			var pb = '<img src="' + path + '/img/trans.gif" class="mcePageBreak mceItemNoResize" />', cls = 'mcePageBreak', sep = ed.getParam('pagebreak_separator', '<!-- pagebreak -->'), pbRE;

			pbRE = new RegExp(sep.replace(/[\?\.\*\[\]\(\)\{\}\+\^\$\:]/g, function(a) {return '\\' + a;}), 'g');

			// Register commands
			ed.addCommand('mcePageBreak', function() {
				ed.execCommand('mceInsertContent', 0, pb);
			});

			ed.addCommand('mcePageBreakManual', function() {

				Popup = new Ext.Window({
					width: 400,
					height: 150,
					layout: 'fit',
					bodyStyle:{'background-color': '#FFFFFF'},
					title:'Ручная разбивка',
					modal: true,
					items:[{
						xtype: 'form',
						bodyStyle: {padding: '10px'},
						items:[
							{
								xtype: 'textfield',
								fieldLabel: 'Кол-во символов',
								id: 'num',
								value: '2500'
							}
						]
					}],
					buttons:[
						{
							text:'Ok',
							id:'buttonOK',
							handler:function() {
								var num = Ext.getCmp('num').getValue();
								Popup.close();
								Ext.Msg.wait('Please wait', 'Loading');
								
								var ajax = new Ext.data.Connection();
								ajax.request
								({
									url: path + '/processor.php',
									method: 'POST',
									params: {
										action: 'break',
										html: tinyMCE.get('ta').getContent(),
										num: num
									},									
									success: function(response)
									{
										ed.setContent(response.responseText);
										Ext.Msg.hide();
									},
									failure: function() 
									{
										Ext.Msg.hide();
										return false;
									}
								});	
							}
						},
						{
							text: 'Cancel',
							handler: function(){
								Popup.close();
							}
						}
					]
				});  
				Popup.show();
			});

			ed.addCommand('mcePageBreakAuto', function() {
				Ext.Msg.wait('Please wait', 'Loading');
				
				var ajax = new Ext.data.Connection();
				ajax.request
				({
					url: path + '/processor.php',
					method: 'POST',
					params: {
						action: 'break',
						html: tinyMCE.get('ta').getContent()
					},						
					success: function(response) {
						ed.setContent(response.responseText);
						Ext.Msg.hide();
					},
					failure: function() {
						Ext.Msg.hide();
						return false;
					}
				});	
			});

			ed.addCommand('mcePageBreakClear', function() {
				Ext.Msg.wait('Please wait', 'Loading');
				
				var ajax = new Ext.data.Connection();
				ajax.request
				({
					url: path + '/processor.php',
					method: 'POST',
					params: {
						action: 'clear',
						html: tinyMCE.get('ta').getContent()
					},
					success: function(response)	{
						ed.setContent(response.responseText);
						Ext.Msg.hide();
					},
					failure: function() {
						Ext.Msg.hide();
						return false;
					}
				});	
			});	
				
			


			// Register buttons
			ed.addButton('pagebreak', {title : 'Добавить разрыв страницы на месте курсора', cmd : cls, image : path + '/img/standart.png'});
			ed.addButton('pagebreakcls', {title : 'Очистить все междустраничные разрывы', cmd :  'mcePageBreakClear', image : path + '/img/cls.png'});
			ed.addButton('pagebreakmanual', {title : 'Указать количество знаков для разбиения', cmd : 'mcePageBreakManual', image : path + '/img/manual.png'});
			ed.addButton('pagebreakauto', {title : 'Автоматически разбить через 2000 знаков', cmd : 'mcePageBreakAuto', image : path + '/img/auto.png'});

			ed.onInit.add(function() {
				if (ed.settings.content_css !== false)
					ed.dom.loadCSS(path + "/inc/content.css");

				if (ed.theme.onResolveName) {
					ed.theme.onResolveName.add(function(th, o) {
						if (o.node.nodeName == 'IMG' && ed.dom.hasClass(o.node, cls))
							o.name = 'pagebreak';
					});
				}
			});

			ed.onClick.add(function(ed, e) {
				e = e.target;

				if (e.nodeName === 'IMG' && ed.dom.hasClass(e, cls))
					ed.selection.select(e);
			});

			ed.onNodeChange.add(function(ed, cm, n) {
				cm.setActive('pagebreak', n.nodeName === 'IMG' && ed.dom.hasClass(n, cls));
			});

			ed.onBeforeSetContent.add(function(ed, o) {
				o.content = o.content.replace(pbRE, pb);
			});

			ed.onPostProcess.add(function(ed, o) {
				if (o.get)
					o.content = o.content.replace(/<img[^>]+>/g, function(im) {
						if (im.indexOf('class="mcePageBreak') !== -1)
							im = sep;

						return im;
					});
			});
		},

		getInfo : function() {
			return {
				longname : 'PageBreak',
				author : 'Moxiecode Systems AB',
				authorurl : 'http://tinymce.moxiecode.com',
				infourl : 'http://wiki.moxiecode.com/index.php/TinyMCE:Plugins/pagebreak',
				version : tinymce.majorVersion + "." + tinymce.minorVersion
			};
		}
	});

	// Register plugin
	tinymce.PluginManager.add('pagebreak', tinymce.plugins.PageBreakPlugin);
})();
