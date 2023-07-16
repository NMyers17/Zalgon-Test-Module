import {MODULE} from "../const.mjs";

export class GameChangesHandler {
  // hooks on setup.
  static _setUpGameChanges() {
    const settings = game.settings.get(MODULE, "worldSettings");
    if (settings.addEquipment) GameChangesHandler._addEquipment();
    if (settings.addConditions) GameChangesHandler._addConditions();
    if (settings.replaceTokenConditions) GameChangesHandler._conditions();
  }

  static _addConditions() {
    const toAdd = {turned: "Turned"};
    foundry.utils.mergeObject(CONFIG.DND5E.conditionTypes, toAdd);

    CONFIG.DND5E.conditionTypes = Object.fromEntries(Object.entries(CONFIG.DND5E.conditionTypes).sort((a, b) => a[1].localeCompare(b[1])));
  }

  static _conditions() {
    // these are gotten from a different file, combined, and then sorted.
    const statusEffects = SPELL_EFFECTS.concat(STATUS_EFFECTS).sort((a, b) => {
      return a.sort - b.sort;
    });
    CONFIG.statusEffects = statusEffects;
  }

  static async _itemStatusCondition(sheet, html) {
    if (!sheet.isEditable) return;
    const list = html[0].querySelector(".items-list.effects-list");
    if (!list) return;

    const options = CONFIG.statusEffects.filter(s => {
      return !sheet.document.effects.find(e => e.statuses.has(s.id));
    }).sort((a, b) => a.name.localeCompare(b.name)).reduce(function(acc, s) {
      return acc + `<option value="${s.id}">${game.i18n.localize(s.name)}</option>`;
    }, "");

    if (!options.length) return;

    const div = document.createElement("DIV");
    div.innerHTML = await renderTemplate("modules/zhell-custom-stuff/templates/statusConditionSelect.hbs");
    list.append(...div.children);

    const add = html[0].querySelector("[data-effect-type='statusCondition'] a[data-action='statusCondition']");
    if (add) add.addEventListener("click", async function() {
      const id = sheet.document.uuid.replaceAll(".", "-") + "-" + "add-status-condition";
      const effId = await Dialog.wait({
        title: "Add Status Condition",
        content: `
        <form class="dnd5e">
          <div class="form-group">
            <label>Status Condition:</label>
            <div class="form-fields">
              <select autofocus>${options}</select>
            </div>
          </div>
        </form>`,
        buttons: {
          ok: {
            label: "Add",
            icon: '<i class="fa-solid fa-check"></i>',
            callback: (html) => html[0].querySelector("select").value
          }
        },
        default: "ok"
      }, {id});
      if (!effId) return;
      const eff = foundry.utils.deepClone(CONFIG.statusEffects.find(e => e.id === effId));
      const data = foundry.utils.mergeObject(eff, {
        statuses: [eff.id],
        transfer: false,
        origin: sheet.document.uuid,
        "flags.effective-transferral.transferrable.self": false,
        "flags.effective-transferral.transferrable.target": true,
        name: game.i18n.localize(eff.name)
      });
      return sheet.document.createEmbeddedDocuments("ActiveEffect", [data]);
    });
  }

}