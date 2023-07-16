import {MODULE} from "../const.mjs";

export class EXHAUSTION {

    // Increase exhaustion.
    static async increaseExhaustion(actor) {
      if (!(actor instanceof Actor)) {
        ui.notifications.warn("Invalid actor provided.");
        return null;
      }
  
      // get current exhaustion effect, if any.
      const exhaustion = actor.effects.find(i => {
        return i.flags.core?.statusId === "exhaustion";
      });
  
      // if exhausted, increase the level.
      if (exhaustion) {
        const currentLevel = exhaustion.flags[MODULE].exhaustion;
        return this.updateExhaustion(currentLevel + 1, actor);
      }
  
      // if not exhausted, set to 1.
      if (!exhaustion) return this.updateExhaustion(1, actor);
    }
  
    // Decrease exhaustion.
    static async decreaseExhaustion(actor, suppress = false) {
      if (!(actor instanceof Actor)) {
        ui.notifications.warn("Invalid actor provided.");
        return null;
      }
  
      // get current exhaustion effect, if any.
      const exhaustion = actor.effects.find(i => {
        return i.flags.core?.statusId === "exhaustion";
      });
  
      // if exhausted, decrease the level.
      if (exhaustion) {
        const currentLevel = exhaustion.flags[MODULE].exhaustion;
        return this.updateExhaustion(currentLevel - 1, actor);
      }
  
      // if not exhausted, error.
      if (!suppress) ui.notifications.warn(`${actor.name} was not exhausted.`);
      return null;
    }
  
    // Update or set exhaustion to specific level.
    static async updateExhaustion(num, actor) {
      if (!num.between(0, 11)) {
        ui.notifications.warn("The provided level was not valid.");
        return null;
      }
  
      if (!(actor instanceof Actor)) {
        ui.notifications.warn("Invalid actor provided.");
        return null;
      }
  
      // Attempt to find any current exhaustion effect.
      const exhaustion = actor.effects.find(i => {
        return i.flags.core?.statusId === "exhaustion";
      });
  
      // if num===0, remove it.
      if (num === 0) return exhaustion?.delete();
  
      // if num===11, remove it and apply dead.
      if (num === 11) {
        await exhaustion?.delete();
        const dead = foundry.utils.deepClone(CONFIG.statusEffects.find(i => {
          return (i.id === CONFIG.specialStatusEffects.DEFEATED);
        }));
        foundry.utils.mergeObject(dead, {
          "flags.core.statusId": dead.id,
          "flags.core.overlay": true,
          label: game.i18n.localize(dead.label)
        });
        return actor.createEmbeddedDocuments("ActiveEffect", [dead]);
      }
  
      // Otherwise either update or create the exhaustion effect.
      const data = {
        label: game.i18n.localize("ZALGON.StatusConditionExhaustion"),
        "flags.core.statusId": "exhaustion",
        "flags.visual-active-effects.data.intro": `<p>${game.i18n.format("ZALGON.StatusConditionExhaustionDescription", {level: num})}</p>`,
        "flags.zalgon-custom-stuff.exhaustion": num,
        icon: "icons/skills/wounds/injury-body-pain-gray.webp",
        changes: [
          {key: "system.bonuses.abilities.save", mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: "-@attributes.exhaustion"},
          {key: "system.bonuses.abilities.check", mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: "-@attributes.exhaustion"},
          {key: "system.bonuses.mwak.attack", mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: "-@attributes.exhaustion"},
          {key: "system.bonuses.rwak.attack", mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: "-@attributes.exhaustion"},
          {key: "system.bonuses.msak.attack", mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: "-@attributes.exhaustion"},
          {key: "system.bonuses.rsak.attack", mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: "-@attributes.exhaustion"},
          {key: "system.bonuses.spell.dc", mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: "-@attributes.exhaustion"},
          {key: "system.attributes.exhaustion", mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: num},
        ]
      };
  
      // If actor has exhaustion, update it to the new level.
      if (exhaustion) return exhaustion.update(data);
  
      // If actor not already exhausted, find and apply.
      return actor.createEmbeddedDocuments("ActiveEffect", [data]);
    }
  
    // Reduce exhaustion on a long rest.
    static async _longRestExhaustionReduction(actor, data) {
      if (!data.longRest) return;
      return EXHAUSTION.decreaseExhaustion(actor, true);
    }
  }