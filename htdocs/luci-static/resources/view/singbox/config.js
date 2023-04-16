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
    var m, s, o, ss;

    m = new form.Map("singbox", _("sing-box"));

    s = m.section(form.TypedSection, "server", _("Server List"))
    s.anonymous = true;
    // s.addremove = true;
    // s.nodescriptions = true;

    s.tab("log", _("Log"));
    s.tab("dns", _("DNS"));
    s.tab("ntp", _("NTP"));
    s.tab("inbounds", _("Inbounds"));
    s.tab("outbounds", _("Outbounds"));
    s.tab("route", _("Route"));
    s.tab("experimental", _("Experimental"));

    o = s.taboption('log', form.Flag, "enabled", _("Enabled"));
    o.rmempty = false;
    o.default = true;

    o = s.taboption('dns', form.Flag, "enabled", _("Enabled"));
    o.rmempty = false;
    o.default = true;

    o = s.taboption('ntp', form.Flag, "enabled", _("Enabled"));
    o.rmempty = false;
    o.default = true;

    o = s.taboption('inbounds', form.Flag, "enabled", _("Enabled"));
    o.rmempty = false;
    o.default = true;

    o = s.taboption('outbounds', form.Flag, "enabled", _("Enabled"));
    o.rmempty = false;
    o.default = true;

    o = s.taboption('route', form.Flag, "enabled", _("Enabled"));
    o.rmempty = false;
    o.default = true;

    o = s.taboption('experimental', form.Flag, "enabled", _("Enabled"));
    o.rmempty = false;
    o.default = true;

    return m.render()
  }
})