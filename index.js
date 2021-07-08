const { Plugin } = require('powercord/entities');
const { getModule, constants, messages } = require('powercord/webpack');
const { inject, uninject } = require('powercord/injector');
const { findInReactTree } = require('powercord/util');

const Message = getModule(m => m.default?.displayName == 'Message', false);
const Permissions = getModule(['getChannelPermissions'], false);
const { getCurrentUser } = getModule(['getCurrentUser'], false);

module.exports = class QuickDelete extends Plugin {
   startPlugin() {
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
               if (!e.ctrlKey || !canDelete) return;

               messages.deleteMessage(channel.id, message.id);
            };
         };

         return res;
      });
   }

   pluginWillUnload() {
      uninject('quick-delete');
   }
};