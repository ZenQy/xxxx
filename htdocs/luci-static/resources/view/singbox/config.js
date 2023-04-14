'use strict';
'require form';
'require fs';
'require view';

return view.extend({
  load: function () {
    return Promise.all([
      L.resolveDefault(fs.stat('/usr/sbin/nginx'), {}),
      L.resolveDefault(fs.stat('/usr/sbin/uhttpd'), {})
    ]);
  },

  render: function (stats) {
    var m, s, o;

    m = new form.Map("singbox", _("sing-box"));

    s = m.section(form.GridSection, "server", _("Server List"))
    s.anonymous = true;
    s.addremove = true;
    s.nodescriptions = true;

    o = s.tab("server", _("Edit Server Configuration"));
    o = s.taboption('server', form.Flag, "enabled", _("Enabled"));
    //是否允许为空值。false则表示否，不允许为空值。
    o.rmempty = false;
    o.default = true;
    // 不在列表展示
    // o.modalonly = true;

    o = s.taboption('server', form.Value, 'name', _('name'));
    //占位符，用于提示用户应该输入什么样的字符。
    o.placeholder = 'Server Alias';
    o.rmempty = false;

    o = s.taboption('server', form.ListValue, "type", _("Server Node Type"));
    o.value("shadowsocks", _("Shadowsocks"));
    o.value("vmess", _("Vmess"));
    o.value("trojan", _("Trojan"));
    o.default = "shadowsocks";
    o.rmempty = false;

    o = s.taboption('server', form.Value, 'address', _('Server Address'));
    //占位符，用于提示用户应该输入什么样的字符。
    o.placeholder = 'Server Address';
    o.rmempty = false;

    return m.render()
  }
})