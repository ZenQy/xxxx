'use strict';
//使用紧凑格式，编译时会自动压缩此脚本。
'require view';
'require fs';
'require form';
'require tools.widgets as widgets';
//上面这些都是声明的接口调用，OpenWrt 下有效。

return view.extend({
  load: function () {
    return Promise.all([
      L.resolveDefault(fs.stat('/sbin/block'), null),
      //读取文件状态。
      L.resolveDefault(fs.stat('/etc/config/fstab'), null),
      L.resolveDefault(fs.stat('/usr/sbin/nmbd'), {}),
      L.resolveDefault(fs.stat('/usr/sbin/samba'), {}),
      L.resolveDefault(fs.stat('/usr/sbin/winbindd'), {}),
      L.resolveDefault(fs.exec('/usr/sbin/smbd', ['-V']), null),
      //执行命令，获取版本号。
    ]);
  },
  render: function (stats) {
    var m, s, o, v;
    v = '';

    m = new form.Map('samba4', _('Network Shares-samba4'));
    //关联配置文件/etc/config/samba4，括号内为页面标题名称。

    if (stats[5] && stats[5].code === 0) {
      v = stats[5].stdout.trim();
    }
    s = m.section(form.TypedSection, 'samba', 'Samba ' + v);
    //配置名为 samba 的子配置节点，此处也为页面说明，这里仅用于显示 samba 的版本号了。
    s.anonymous = true;
    //隐藏配置文件中的 Section 节点名称。

    s.tab('general', _('General Settings'));
    //子菜单，选项卡界面。
    s.tab('template', _('Edit Template'));

    s.taboption('general', form.Flag, 'enable', _('Enable'));
    //复选框选项，此选项位于'general'子菜单下。

    s.taboption('general', widgets.NetworkSelect, 'interface', _('Interface'),
      //这是菜单名称
      _('Listen only on the given interface or, if unspecified, on lan'));//这是菜单注释，详细说明。

    o = s.taboption('general', form.Value, 'workgroup', _('Workgroup'));
    o.placeholder = 'WORKGROUP';
    //占位符，用于提示用户应该输入什么样的字符。

    o = s.taboption('general', form.Value, 'description', _('Description'));
    o.placeholder = 'Samba4 on OpenWrt';

    s.taboption('general', form.Flag, 'enable_extra_tuning', _('Enable extra Tuning'),
      _('Enable some community driven tuning parameters, that may improve write speeds and better operation via WiFi.'));

    s.taboption('general', form.Flag, 'allow_legacy_protocols', _('Allow legacy protocols'),
      _('Allow connection using smb(v1) protocol.'));

    s.taboption('general', form.Flag, 'disable_async_io', _('Force synchronous I/O'),
      _('On lower-end devices may increase speeds, by forceing synchronous I/O instead of the default asynchronous.'));

    s.taboption('general', form.Flag, 'macos', _('Enable macOS compatible shares'),
      _('Enables Apple\'s AAPL extension globally and adds macOS compatibility options to all shares.'));

    o = s.taboption('general', form.Value, 'nice', _('Scheduling priority'),
      _('Set the scheduling priority of the spawned process.'));
    o.datatype = 'range(-20,19)';
    //限制此输入框的格式，只允许输入-20至19的数字。
    o.default = '0';
    //此选项的默认值。
    o.rmempty = false;
    //是否允许为空值。false则表示否，不允许为空值。

    if (stats[2].type === 'file') {
      s.taboption('general', form.Flag, 'disable_netbios', _('Disable Netbios'))
    }
    //符合判断条件才会显示出来的菜单。
    if (stats[3].type === 'file') {
      s.taboption('general', form.Flag, 'disable_ad_dc', _('Disable Active Directory Domain Controller'))
    }
    if (stats[4].type === 'file') {
      s.taboption('general', form.Flag, 'disable_winbind', _('Disable Winbind'))
    }

    o = s.taboption('template', form.TextValue, '_tmpl',
      _(''),
      _("This is the content of the file '/etc/samba/smb.conf.template' from which your samba configuration will be generated. "
        + "Values enclosed by pipe symbols ('|') should not be changed. They get their values from the 'General Settings' tab."));
    //这句话太长，不方便阅读，可以切断，用 + 号连接，这样程序仍然会认为这是一句话。
    o.rows = 20;
    //行高
    o.cfgvalue = function (section_id) {
      return fs.trimmed('/etc/samba/smb.conf.template');
    };
    //读取指定的文件。
    o.write = function (section_id, formvalue) {
      return fs.write('/etc/samba/smb.conf.template', formvalue.trim().replace(/\r\n/g, '\n') + '\n');
    };
    //写入数据到指定的文件。


    s = m.section(form.TableSection, 'sambashare', _('Shared Directories'),
      _('Please add directories to share. Each directory refers to a folder on a mounted device.'));//配置名为 sambashare 的子配置节点
    s.anonymous = true;
    s.addremove = true;
    //允许添加或删除此配置节点

    s.option(form.Value, 'name', _('Name'));
    o = s.option(form.Value, 'path', _('Path'));
    if (stats[0] && stats[1]) {
      o.titleref = L.url('admin', 'system', 'mounts');
    }

    o = s.option(form.Flag, 'browseable', _('Browse-able'));
    o.enabled = 'yes';
    //使复选框选项使用指定的参数，勾选则写入参数 yes
    o.disabled = 'no';
    //使复选框选项使用指定的参数，不勾选则写入参数 no
    o.default = 'yes';

    o = s.option(form.Flag, 'read_only', _('Read-only'));
    o.enabled = 'yes';
    o.disabled = 'no';
    o.default = 'no'; // smb.conf default is 'yes'
    o.rmempty = false;

    s.option(form.Flag, 'force_root', _('Force Root'));

    o = s.option(form.Value, 'users', _('Allowed users'));
    o.rmempty = true;

    o = s.option(form.Flag, 'guest_ok', _('Allow guests'));
    o.enabled = 'yes';
    o.disabled = 'no';
    o.default = 'yes'; // smb.conf default is 'no'
    o.rmempty = false;

    o = s.option(form.Flag, 'guest_only', _('Guests only'));
    o.enabled = 'yes';
    o.disabled = 'no';
    o.default = 'no';

    o = s.option(form.Flag, 'inherit_owner', _('Inherit owner'));
    o.enabled = 'yes';
    o.disabled = 'no';
    o.default = 'no';

    o = s.option(form.Value, 'create_mask', _('Create mask'));
    o.maxlength = 4;
    //限制字符长度，4表示最多只允许4个英文字符长度。
    o.default = '0666'; // smb.conf default is '0744'
    o.placeholder = '0666';
    o.rmempty = false;

    o = s.option(form.Value, 'dir_mask', _('Directory mask'));
    o.maxlength = 4;
    o.default = '0777'; // smb.conf default is '0755'
    o.placeholder = '0777';
    o.rmempty = false;

    o = s.option(form.Value, 'vfs_objects', _('Vfs objects'));
    o.rmempty = true;

    s.option(form.Flag, 'timemachine', _('Apple Time-machine share'));

    o = s.option(form.Value, 'timemachine_maxsize', _('Time-machine size in GB'));
    o.rmempty = true;
    o.maxlength = 5;

    return m.render();
  }
});