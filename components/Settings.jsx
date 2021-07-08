const { React } = require('powercord/webpack');
const KeybindRecorder = require('./KeybindRecorder');

module.exports = class Settings extends React.Component {
   constructor(props) {
      super(props);
   }

   render() {
      const { updateSetting, getSetting } = this.props;

      return (
         <>
            <KeybindRecorder
               value={getSetting('keybind', 'Control')}
               onChange={(e) => updateSetting('keybind', e)}
               onReset={() => updateSetting('keybind', 'Control')}
            >
               Keybind
            </KeybindRecorder>
         </>
      );
   }
};