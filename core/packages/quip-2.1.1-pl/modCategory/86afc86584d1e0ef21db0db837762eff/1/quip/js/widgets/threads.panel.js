Quip.panel.Threads = function(config) {
    config = config || {};
    Ext.apply(config,{
        border: false
        ,baseCls: 'modx-formpanel'
        ,items: [{
            html: '<h2>'+_('quip')+'</h2>'
            ,border: false
            ,cls: 'modx-page-header'
        },{
            xtype: 'modx-tabs'
            ,bodyStyle: 'padding: 10px'
            ,defaults: { border: false ,autoHeight: true }
            ,border: true
            ,stateful: true
            ,stateId: 'quip-home-tabpanel'
            ,stateEvents: ['tabchange']
            ,getState:function() {
                return {activeTab:Quip.request.quip_unapproved ? 1 : this.items.indexOf(this.getActiveTab())};
            }
            ,items: [{
                title: _('quip.threads')
                ,defaults: { autoHeight: true }
                ,items: [{
                    html: '<p>'+_('quip.intro_msg')+'</p>'
                    ,border: false
                    ,bodyStyle: 'padding: 10px'
                },{
                    xtype: 'quip-grid-thread'
                    ,preventRender: true
                }]
            },{
                title: _('quip.unapproved_comments')
                ,defaults: { autoHeight: true }
                ,items: [{
                    html: '<p>'+_('quip.unapproved_comments_msg')+'</p>'
                    ,border: false
                    ,bodyStyle: 'padding: 10px'
                },{
                    xtype: 'quip-grid-comments'
                    ,preventRender: true
                    ,baseParams: {
                        action: 'mgr/comment/getUnapproved'
                    }
                }]
            },{
                title: _('quip.latest_comments')
                ,defaults: { autoHeight: true }
                ,items: [{
                    html: '<p>'+_('quip.latest_comments_msg')+'</p>'
                    ,border: false
                    ,bodyStyle: 'padding: 10px'
                },{
                    xtype: 'quip-grid-comments'
                    ,cls: 'quip-thread-grid'
                    ,preventRender: true
                }]
            }]
        }]
    });
    Quip.panel.Threads.superclass.constructor.call(this,config);
};
Ext.extend(Quip.panel.Threads,MODx.Panel);
Ext.reg('quip-panel-threads',Quip.panel.Threads);

Quip.grid.Thread = function(config) {
    config = config || {};
    this.sm = new Ext.grid.CheckboxSelectionModel();
    Ext.applyIf(config,{
        url: Quip.config.connector_url
        ,baseParams: { action: 'mgr/thread/getList' }
        ,fields: ['name','comments','unapproved_comments','pagetitle','url','perm']
        ,paging: true
        ,autosave: false
        ,remoteSort: true
        ,primaryKey: 'name'
        ,sm: this.sm
        ,columns: [this.sm,{
            header: _('quip.thread')
            ,dataIndex: 'name'
            ,sortable: true
            ,width: 300
        },{
            header: _('quip.approved')
            ,dataIndex: 'comments'
            ,sortable: false
            ,width: 80
        },{
            header: _('quip.unapproved')
            ,dataIndex: 'unapproved_comments'
            ,sortable: false
            ,width: 80
        },{
            header: _('quip.view')
            ,dataIndex: 'url'
            ,sortable: false
            ,width: 120
            ,renderer: this._renderUrl
        }]
    });
    Quip.grid.Thread.superclass.constructor.call(this,config)
};
Ext.extend(Quip.grid.Thread,MODx.grid.Grid,{
    _renderUrl: function(v,md,rec) {
        return '<a href="'+v+'" target="_blank">'+rec.data.pagetitle+'</a>';
    }
    ,verifyPerm: function(perm,rs) {
        var valid = true;
        for (var i=0;i<rs.length;i++) {
            if (rs[i].data.perm.indexOf(perm) == -1) {
                valid = false;
            }
        }
        return valid;
    }
    ,getSelectedAsList: function() {
        var sels = this.getSelectionModel().getSelections();
        if (sels.length <= 0) return false;

        var cs = '';
        for (var i=0;i<sels.length;i++) {
            cs += ','+sels[i].data[this.config.primaryKey];
        }

        if (cs[0] == ',') {
            cs = cs.substr(1);
        }
        return cs;
    }
    ,manageThread: function() {
        location.href = '?a='+MODx.request.a+'&action=thread&thread='+this.menu.record.name;
    }
    ,truncateThread: function() {        
        MODx.msg.confirm({
            title: _('warning')
            ,text: _('quip.thread_truncate_confirm')
            ,url: this.config.url
            ,params: {
                action: 'mgr/thread/truncate'
                ,thread: this.menu.record.name
            }
            ,listeners: {
                'success': {fn:this.refresh,scope:this}
            }
        });
    }
    ,truncateSelected: function() {
        var cs = this.getSelectedAsList();
        if (cs === false) return false;

        MODx.msg.confirm({
            title: _('quip.thread_truncate_selected')
            ,text: _('quip.thread_truncate_selected_confirm')
            ,url: this.config.url
            ,params: {
                action: 'mgr/thread/truncateMultiple'
                ,threads: cs
            }
            ,listeners: {
                'success': {fn:function(r) {
                    this.getSelectionModel().clearSelections(true);
                    this.refresh();
                },scope:this}
            }
        });
        return true;
    }
    ,removeThread: function() {
        MODx.msg.confirm({
            title: _('warning')
            ,text: _('quip.thread_remove_confirm')
            ,url: this.config.url
            ,params: {
                action: 'mgr/thread/remove'
                ,thread: this.menu.record.name
            }
            ,listeners: {
                'success': {fn:this.refresh,scope:this}
            }
        });
    }
    ,removeSelected: function() {
        var cs = this.getSelectedAsList();
        if (cs === false) return false;

        MODx.msg.confirm({
            title: _('quip.thread_remove_selected')
            ,text: _('quip.thread_remove_selected_confirm')
            ,url: this.config.url
            ,params: {
                action: 'mgr/thread/removeMultiple'
                ,threads: cs
            }
            ,listeners: {
                'success': {fn:function(r) {
                    this.getSelectionModel().clearSelections(true);
                    this.refresh();
                },scope:this}
            }
        });
        return true;
    }
    ,getMenu: function() {

        var m = [];
        if (this.getSelectionModel().getCount() > 1) {
            var rs = this.getSelectionModel().getSelections();
            
            if (this.verifyPerm('truncate',rs)) {
                m.push({
                    text: _('quip.thread_truncate_selected')
                    ,handler: this.truncateSelected
                });
            }
            if (this.verifyPerm('remove',rs)) {
                if (m.length > 0) { m.push('-'); }
                m.push({
                    text: _('quip.thread_remove_selected')
                    ,handler: this.removeSelected
                });
            }
        } else {
            var r = this.getSelectionModel().getSelected();
            var p = r.data.perm;

            m.push({
                text: _('quip.thread_manage')
                ,handler: this.manageThread
            });
            if (p.indexOf('ptruncate') != -1) {
                m.push('-');
                m.push({
                    text: _('quip.thread_truncate')
                    ,handler: this.truncateThread
                });
            }
            if (p.indexOf('premove') != -1) {
                m.push('-');
                m.push({
                    text: _('quip.thread_remove')
                    ,handler: this.removeThread
                });
            }
        }
        if (m.length > 0) {
            this.addContextMenuItem(m);
        }
    }
});
Ext.reg('quip-grid-thread',Quip.grid.Thread);