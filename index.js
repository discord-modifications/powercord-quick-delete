const { Plugin } = require('powercord/entities');
const { getModule, constants, messages } = require('powercord/webpack');
const { inject, uninject } = require('powercord/injector');

const Message = getModule(m => m.default?.displayName == 'Message', false);
const Permissions = getModule(['getChannelPermissions'], false);
const { getCurrentUser } = getModule(['getCurrentUser'], false);

module.exports = class QuickDelete extends Plugin {
   startPlugin() {
      inject('quick-delete', Message, 'default', (args, res) => {
         if (!args[0]?.childrenAccessories?.props) return res;
         const message = args[0].childrenAccessories.props.message;
         const channel = args[0].childrenAccessories.props.channel;
         const deletePerm = Permissions.can(constants.Permissions.MANAGE_MESSAGES, channel);

         if (res?.props) {
            let old = res.props.children.props.onClick
            res.props.children.props.onClick = function (e) {
               old(e)
               if (e?.ctrlKey && !(deletePerm || getCurrentUser().id === message.author.id)) return;

               if (e?.ctrlKey) {
                  messages.deleteMessage(channel.id, message.id);
               }
            };
         }
         return res;
      });
   }

   pluginWillUnload() {
      uninject('quick-delete');
   }
};