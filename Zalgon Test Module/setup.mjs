import {registerSettings} from "./scripts/settings.mjs";
import {_performSheetEdits} from "./scripts/modules/sheetEdits.mjs";
import {_activeEffectConfig} from "./scripts/modules/gameChanges.mjs";
import {EXHAUSTION} from "./scripts/modules/zalgon_functions.mjs";
import {DEPEND, MODULE} from "./scripts/const.mjs";


Hooks.once("init", registerSettings);
Hooks.once("init", setupAPI);
Hooks.once("init", GameChangesHandler._setUpGameChanges);
Hooks.once("ready", SheetEdits.refreshColors);

Hooks.on("renderActorSheet", _performSheetEdits);
Hooks.on("dnd5e.restCompleted", EXHAUSTION._longRestExhaustionReduction);
Hooks.on("renderActiveEffectConfig", _activeEffectConfig);