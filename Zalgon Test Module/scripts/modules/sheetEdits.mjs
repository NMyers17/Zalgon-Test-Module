import {COLOR_DEFAULTS, MODULE} from "../const.mjs";
import {EXHAUSTION} from "./zalgon_functions.mjs";

export function _performSheetEdits(sheet, html) {
  if (!sheet.sheetEdits) {
    const edits = new SheetEdits();
    sheet.sheetEdits = edits;
    edits.sheet = sheet;
    edits.html = html;
  } else {
    sheet.sheetEdits.html = html;
  }
  const e = sheet.sheetEdits;
  e.render(html);
}

export class SheetEdits {
  async render() {
    this.settings = {
      ...game.settings.get(MODULE, "worldSettings"),
      ...game.settings.get(MODULE, "colorationSettings")
    };
    const isChar = this.sheet.document.type === "character";
    const isGroup = this.sheet.document.type === "group";
    const isNPC = this.sheet.document.type === "npc";

    this._setMagicItemsColor();
    if (!isGroup) this._setHealthColor();
    if (this.settings.collapsibleHeaders) this._collapsibleHeaders();
    if (isChar) this._createExhaustion();
    if (isChar) this._createNewDay();
    if (isChar) this._createInspirationToggle();
    if (isChar) this._createAttunement();
  }

    /** Set the color of magic items by adding css classes to them. */
    _setMagicItemsColor() {
      this.html[0].querySelectorAll(".items-list .item").forEach(item => {
        const id = item.dataset.itemId;
        const rarity = this.sheet.document.items.get(id)?.system.rarity;
        if (rarity) item.classList.add(rarity.slugify().toLowerCase());
      });
    }

  /** Set the color of the health attributes by adding a css class. */
  _setHealthColor() {
    const hp = this.sheet.document.system.attributes.hp;
    const a = (hp.value ?? 0) + (hp.temp ?? 0);
    const b = (hp.max ?? 0) + (hp.tempmax ?? 0);
    if (!b) return;
    const nearDeath = a / b < 0.33;
    const bloodied = a / b < 0.66 && !nearDeath;

    const node = this.html[0].querySelector(
      "[name='system.attributes.hp.value']"
    );
    node.classList.toggle("near-death", nearDeath);
    node.classList.toggle("bloodied", bloodied);
  }
  
/** Make embedded document headers collapsible. */
_collapsibleHeaders() {
  this.html[0].querySelectorAll(".dnd5e .items-list .items-header h3").forEach(header => {
    const itemHeader = header.closest(".items-header.flexrow");
    if (!itemHeader) return;

    // apply collapse class for hover effect.
    itemHeader.classList.toggle("zhell-header-collapse");

    // Read whether to initially collapse.
    const applyNoCreate = this.headers.has(header.innerText);

    // initially add 'no-create' class if applicable.
    if (applyNoCreate) itemHeader.classList.add("no-create");

    // set up listeners to change display.
    header.addEventListener("click", (event) => {
      const text = event.currentTarget.innerText;
      const current = this.headers.has(text);
      if (current) this.headers.delete(text);
      else this.headers.add(text);
      itemHeader.classList.toggle("no-create", this.headers.has(text));
    });
  });
}

  /** Rename Rest Labels */
  _renameRestLabels(html) {
    const SR = html[0].querySelector(".sheet-header .attributes a.rest.short-rest");
    const LR = html[0].querySelector(".sheet-header .attributes a.rest.long-rest");
    if (SR) SR.innerHTML = "SR";
    if (LR) LR.innerHTML = "LR";
  }
  
  /** Remove Resources Under Attributes */
  _removeResources(html) {
    const resources = html[0].querySelector("section > form > section > div.tab.attributes.flexrow > section > ul");
    if (resources) resources.remove();
  }

   /** Create 'New Day' button after Short and Long rest buttons.*/
   _createNewDay() {
    const lr = this.html[0].querySelector(".rest.long-rest");
    const div = document.createElement("DIV");
    div.innerHTML = "<a class='rest new-day' data-tooltip='DND5E.NewDay'>Day</a>";
    div.querySelector(".new-day").addEventListener("click", this._onClickNewDay.bind(this.sheet));
    lr.after(div.firstChild);
  }

    /**
   * Roll limited uses recharge of all items that recharge on a new day.
   * @param {PointerEvent} event      The initiating click event.
   * @returns {Item5e[]}              The array of updated items.
   */
    async _onClickNewDay(event) {
      const conf = await Dialog.confirm({
        title: "New Day",
        content: "Would you like to recharge all items that regain charges on a new day?",
        options: {id: `${this.document.uuid.replaceAll(".", "-")}-new-day-confirm`}
      });
      if (!conf) return;
      const updates = await this.document._getRestItemUsesRecovery({
        recoverShortRestUses: false,
        recoverLongRestUses: false,
        recoverDailyUses: true,
        rolls: []
      });
      return this.document.updateEmbeddedDocuments("Item", updates);
    }

    /** Make 'Inspiration' a toggle. */
  _createInspirationToggle() {
    const insp = this.html[0].querySelector(".inspiration h4");
    insp.classList.add("rollable");
    insp.dataset.action = "inspiration";
    insp.addEventListener("click", this._onClickInspiration.bind(this.sheet));
  }

  /**
   * Toggle inspiration on or off when clicking the 'label'.
   * @param {PointerEvent} event      The initiating click event.
   * @returns {Actor}                 The updated actor.
   */
  async _onClickInspiration(event) {
    return this.document.update({"system.attributes.inspiration": !this.document.system.attributes.inspiration});
  }

 /** Disable the exhaustion input and add a listener to the label. */
 _createExhaustion() {
  this.html[0].querySelector(".counter.flexrow.exhaustion .counter-value input").disabled = true;
  const header = this.html[0].querySelector(".counter.flexrow.exhaustion h4");
  header.classList.add("rollable");
  header.setAttribute("data-action", "updateExhaustion");
  header.addEventListener("click", this._onClickExhaustion.bind(this.sheet));
}

/**
 * Handle clicking the exhaustion label.
 * @param {PointerEvent} event      The initiating click event.
 */
_onClickExhaustion(event) {
  const actor = this.document;
  const level = actor.system.attributes.exhaustion;
  const effect = {
    0: "You are not currently exhausted.",
    1: "You currently have 1 level of exhaustion.",
  }[level] ?? `You currently have ${level} levels of exhaustion.`;
  const buttons = {
    up: {
      icon: "<i class='fa-solid fa-arrow-up'></i>",
      label: "Gain a Level",
      callback: () => EXHAUSTION.increaseExhaustion(actor)
    },
    down: {
      icon: "<i class='fa-solid fa-arrow-down'></i>",
      label: "Down a Level",
      callback: () => EXHAUSTION.decreaseExhaustion(actor)
    }
  };
  if (level < 1) delete buttons.down;
  if (level > 10) delete buttons.up;

  return new Dialog({
    title: `Exhaustion: ${actor.name}`,
    content: `<p>Adjust your level of exhaustion.</p><p>${effect}</p>`,
    buttons
  }, {
    id: `${MODULE}-exhaustion-dialog-${actor.id}`,
    classes: [MODULE, "exhaustion", "dialog"]
  }).render(true);
}

 /** Set the color of magic items by adding css classes to them. */
 _setMagicItemsColor() {
  this.html[0].querySelectorAll(".items-list .item").forEach(item => {
    const id = item.dataset.itemId;
    const rarity = this.sheet.document.items.get(id)?.system.rarity;
    if (rarity) item.classList.add(rarity.slugify().toLowerCase());
  });
}

static refreshColors() {
  const colors = game.settings.get(MODULE, "colorationSettings");
  const stl = document.querySelector(":root").style;
  for (const key of Object.keys(COLOR_DEFAULTS.sheetColors)) stl.setProperty(`--${key}`, colors.sheetColors[key]);
  for (const key of Object.keys(COLOR_DEFAULTS.rarityColors)) stl.setProperty(`--rarity${key.capitalize()}`, colors.rarityColors[key]);
}
}