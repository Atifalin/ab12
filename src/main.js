import './styles/base.css';
import './styles/home.css';
import './styles/settings.css';
import './styles/modes.css';

import { MODES } from './modes/index.js';
import { initScreens, show } from './core/screens.js';
import { initKeyboard } from './core/keyboard.js';
import { initHome } from './core/home.js';
import { initSettingsPanel } from './core/settingsPanel.js';

initScreens(MODES);
initKeyboard();
initHome(MODES);
initSettingsPanel(MODES);
show('home');
