const { Plugin } = require('powercord/entities');
const { getModule, constants, messages } = require('powercord/webpack');
const { inject, uninject } = require('powercord/injector');
const { findInReactTree } = require('powercord/util');

const Message = getModule(m => m.default?.displayName == 'Message', false);
const Permissions = getModule(['getChannelPermissions'], false);
const { getCurrentUser } = getModule(['getCurrentUser'], false);

const Settings = require('./components/Settings');

module.exports = class QuickDelete extends Plugin {
   startPlugin() {
      powercord.api.settings.registerSettings(this.entityID, {
         category: this.entityID,
         label: 'Quick Delete',
         render: Settings
      });

      document.body.addEventListener('keydown', this.keyDown);
      document.body.addEventListener('keyup', this.keyUp);

      inject('quick-delete', Message, 'default', (args, res) => {
         let instance = findInReactTree(res, r => r?.message && r?.channel);

         if (instance?.message && instance?.channel) {
            const { message, channel } = instance;
            const canDelete = (
               Permissions.can(constants.Permissions.MANAGE_MESSAGES, channel) ||
               getCurrentUser().id === message.author.id
            );

            let props = res.props.children.props;

            props.oldOnClick = props.onClick;
            props.onClick = (e) => {
               if (props.oldOnClick) props.oldOnClick(e);
               if (!this.keybindDown || !canDelete) return;

               messages.deleteMessage(channel.id, message.id);
            };
         };

         return res;
      });
   }

   pluginWillUnload() {
      uninject('quick-delete');
      powercord.api.settings.unregisterSettings(this.entityID);
      document.body.removeEventListener('keydown', this.keyDown);
      document.body.removeEventListener('keyup', this.keyUp);
   }

   keyDown = (e) => {
      let key = this.settings.get('keybind', 'Control');
      if (key.toLowerCase() == e.key.toLowerCase()) this.keybindDown = true;
   };

   keyUp = (e) => {
      let key = this.settings.get('keybind', 'Control');
      if (key.toLowerCase() == e.key.toLowerCase()) this.keybindDown = false;
   };
};