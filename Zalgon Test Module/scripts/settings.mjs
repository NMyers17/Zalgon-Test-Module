import {COLOR_DEFAULTS, MODULE, WORLD_DEFAULTS} from "./const.mjs";
import {ColorationMenu, GameChangesMenu, IdentifiersMenu} from "./modules/settingsMenu.mjs";
import {SheetEdits} from "./modules/sheetEdits.mjs";
  
export function registerSettings() {
  _registerSettings();
  _registerSettingsMenus();
}

function _registerSettingsMenus() {
  // Game additions, replacements, and tweaks.
  game.settings.register(MODULE, "worldSettings", {
    scope: "world",
    config: false,
    type: Object,
    default: WORLD_DEFAULTS,
    onChange: () => SettingsConfig.reloadConfirm({world: true})
  });

  game.settings.registerMenu(MODULE, "worldSettings", {
    name: "ZALGON.SettingsMenuWorldSettingsName",
    hint: "ZALGON.SettingsMenuWorldSettingsHint",
    label: "ZALGON.SettingsMenuWorldSettingsName",
    icon: "fa-solid fa-atlas",
    type: GameChangesMenu,
    restricted: true
  });

  // Settings that change the colors on character sheets.
  game.settings.register(MODULE, "colorationSettings", {
    scope: "client",
    config: false,
    type: Object,
    default: COLOR_DEFAULTS,
    onChange: SheetEdits.refreshColors
  });

  game.settings.registerMenu(MODULE, "colorationSettings", {
    name: "ZALGON.SettingsMenuColorationSettingsName",
    hint: "ZALGON.SettingsMenuColorationSettingsHint",
    label: "ZALGON.SettingsMenuColorationSettingsName",
    icon: "fa-solid fa-paint-roller",
    type: ColorationMenu,
    restricted: false
  });

  // Settings for various keys, ids, and uuids.
  game.settings.register(MODULE, "identifierSettings", {
    scope: "world",
    config: false,
    type: Object,
    default: {}
  });

  game.settings.registerMenu(MODULE, "identifierSettings", {
    name: "ZALGON.SettingsMenuIdentifierSettingsName",
    hint: "ZALGON.SettingsMenuIdentifierSettingsHint",
    label: "ZALGON.SettingsMenuIdentifierSettingsName",
    icon: "fa-solid fa-key",
    type: IdentifiersMenu,
    restricted: true
  });
}
