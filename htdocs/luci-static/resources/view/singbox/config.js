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

    m = new form.Map('singbox');
    m.tabbed = true;

    s = m.section(form.TypedSection, 'log', _('Log'));
    s.anonymous = true;
    s.addremove = false;
    log(s)

    s = m.section(form.TypedSection, 'dns', _('DNS'));
    s.anonymous = true;
    s.addremove = false;
    dns(s)

    s = m.section(form.GridSection, 'ntp', _('NTP'));
    s.anonymous = true;
    s.addremove = true;

    s = m.section(form.GridSection, 'inbounds', _('Inbounds'));
    s.anonymous = true;
    s.addremove = true;

    s = m.section(form.GridSection, 'outbounds', _('Outbounds'));
    s.anonymous = true;
    s.addremove = true;

    s = m.section(form.GridSection, 'route', _('Route'));
    s.anonymous = true;
    s.addremove = true;

    s = m.section(form.GridSection, 'experimental', _('Experimental'));
    s.anonymous = true;
    s.addremove = true;

    return m.render()
  }
})

function log(s) {
  var o;
  o = s.option(form.Flag, 'disabled', _('Disable logging'));
  o.rmempty = false;
  o.default = true;
  o = s.option(form.ListValue, 'level', _('Log level'));
  o.depends('disabled', '0');
  o.value('trace', _('Trace'));
  o.value('debug', _('Debug'));
  o.value('info', _('Info'));
  o.value('warn', _('Warn'));
  o.value('error', _('Error'));
  o.value('fatal', _('Fatal'));
  o.value('panic', _('Panic'));
  o.default = 'info';
  o = s.option(form.Value, 'output', _('Log file'),
    _('The file name of the log file.'));
  o.depends('disabled', '0');
  o.placeholder = '/var/log/box.log';
  o = s.option(form.Flag, 'timestamp', _('Timestamp'),
    _('Add time to each line.'));
  o.depends('disabled', '0');
  o.default = true;
}

function dns(s) {
  var o, ss;

  // DNS Server
  o = s.option(form.SectionValue, 'dns_servers', form.GridSection, 'dns_servers', _('DNS Server List'));
  ss = o.subsection;
  ss.anonymous = true;
  ss.addremove = true;
  ss.nodescriptions = true;
  o = ss.option(form.Value, 'tag', _('DNS Server Tag'));
  o = ss.option(form.Value, 'address', _('DNS Server Address'));
  o = ss.option(form.Value, 'address_resolver', _('Address Resolver')
    , _('Tag of a another server to resolve the domain name in the address.'));
  o = ss.option(form.ListValue, 'address_strategy', _('Address Strategy')
    , _('The domain strategy for resolving the domain name in the address.'));
  strategy(o)
  o = ss.option(form.ListValue, 'strategy', _('Strategy')
    , _('Default domain strategy for resolving the domain names.'));
  strategy(o)
  o = ss.option(form.Value, 'detour', _('Detour')
    , _('Tag of an outbound for connecting to the dns server.'));

  // DNS Rule
  o = s.option(form.SectionValue, 'dns_rules', form.GridSection, 'dns_rules', _('DNS Rule List'));
  ss = o.subsection;
  ss.anonymous = true;
  ss.addremove = true;
  ss.nodescriptions = true;
  o = ss.option(form.DynamicList, 'inbound', _('Inbound Tag'));
  o = ss.option(form.ListValue, 'ip_version', _('IP Version'));
  o.value('4', _('ipv4'));
  o.value('6', _('ipv6'));
  o.rmempty = true;

  o = s.option(form.Value, 'final', _('Default DNS Server')
    , _('The first server will be used if empty.'));
  o = s.option(form.ListValue, 'strategy', _('Strategy')
    , _('Take no effect if server.strategy is set.'));
  strategy(o)
  o = s.option(form.Flag, 'disable_cache', _('Disable Cache'));
  o.default = false;
  o = s.option(form.Flag, 'disable_expire', _('Disable Expire'));
  o.default = false;
  o = s.option(form.Flag, 'reverse_mapping', _('Reverse Mapping'));
  o.default = false;

  // FakeIP
  o = s.option(form.SectionValue, 'dns_fakeip', form.GridSection, 'dns_fakeip', _('FakeIP'));
  ss = o.subsection;
  ss.anonymous = true;
  ss.addremove = true;
  ss.nodescriptions = true;
  o = ss.option(form.Flag, 'enabled', _('Enable'));
  o.default = true;
  o = ss.option(form.Value, 'inet4_range', _('Inet4 Range'));
  o.depends('enabled', '1');
  o = ss.option(form.Value, 'inet6_range', _('inet6_range Range'));
  o.depends('enabled', '1');
}
function strategy(o) {
  o.value('prefer_ipv4', _('Prefer ipv4'));
  o.value('prefer_ipv6', _('Prefer ipv6'));
  o.value('ipv4_only', _('Only ipv4'));
  o.value('ipv6_only', _('Only ipv6'));
  o.default = 'prefer_ipv6';
}
