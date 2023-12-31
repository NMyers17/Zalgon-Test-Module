import {COLOR_DEFAULTS, MODULE, WORLD_DEFAULTS} from "../../const.mjs";

class SettingsMenu extends FormApplication {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      popOut: true,
      width: 550,
      resizable: true,
      classes: [MODULE, "settings-menu"]
    });
  }

  /** @override */
  get template() {
    return null;
  }

  /** @override */
  get id() {
    return null;
  }

  /** @override */
  get title() {
    return null;
  }

  /** @override */
  async _updateObject(event, formData) {
    throw new Error("You must override updateObject.");
  }

  /** @override */
  async getData() {
    throw new Error("You must override getData.");
  }
}

export class GameChangesMenu extends SettingsMenu {
  /** @override */
  get template() {
    return `modules/${MODULE}/templates/settingsGameChangesMenu.hbs`;
  }

  /** @override */
  get id() {
    return "zalgon-custom-stuff-settings-game-changes";
  }

  /** @override */
  get title() {
    return "Additions and Replacements";
  }

  /** @override */
  async _updateObject(event, formData) {
    return game.settings.set(MODULE, "worldSettings", formData, {diff: false});
  }

  /** @override */
  async getData() {
    const def = game.settings.get(MODULE, "worldSettings");
    const data = foundry.utils.mergeObject(WORLD_DEFAULTS, def, {insertKeys: false});
    const settings = Object.entries(data).map(s => {
      return {
        id: s[0],
        checked: s[1],
        name: `ZALGON.SettingsWorld${s[0].capitalize()}Name`,
        hint: `ZALGON.SettingsWorld${s[0].capitalize()}Hint`
      }
    });
    return {settings};
  }
}

export class ColorationMenu extends SettingsMenu {
  /** @override */
  get template() {
    return `modules/${MODULE}/templates/settingsColorationMenu.hbs`;
  }

  /** @override */
  get id() {
    return "zalgon-custom-stuff-settings-coloration";
  }

  /** @override */
  get title() {
    return "Character Sheet Colors";
  }

  /** @override */
  async _updateObject(event, formData) {
    formData = foundry.utils.expandObject(formData);
    return game.settings.set(MODULE, "colorationSettings", formData, {diff: false});
  }

  /** @override */
  async getData() {
    const data = {};
    const curr = game.settings.get(MODULE, "colorationSettings");
    const defs = foundry.utils.deepClone(COLOR_DEFAULTS);
    const _data = foundry.utils.mergeObject(defs, curr, {insertKeys: false});

    for (const [key, val] of Object.entries(foundry.utils.flattenObject(_data))) {
      const [section, entry] = key.split(".");
      data[section] ??= [];
      data[section].push({
        id: entry,
        value: val,
        name: `ZALGON.SettingsColoration${entry.capitalize()}Name`,
        hint: `ZALGON.SettingsColoration${entry.capitalize()}Hint`,
        placeholder: COLOR_DEFAULTS[section][entry]
      });
    }
    return data;
  }
}

export class IdentifiersMenu extends SettingsMenu {
  /** @override */
  get template() {
    return `modules/${MODULE}/templates/settingsIdentifiersMenu.hbs`;
  }

  /** @override */
  get id() {
    return "zalgon-custom-stuff-settings-identifiers";
  }

  /** @override */
  get title() {
    return game.i18n.localize("ZALGON.SettingsMenuIdentifierSettingsName");
  }

  /** @override */
  async _updateObject(event, formData) {
    const data = {};
    return game.settings.set(MODULE, "identifierSettings", data);
  }

  /** @override */
  async getData() {
    return game.settings.get(MODULE, "identifierSettings");
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
  }
}