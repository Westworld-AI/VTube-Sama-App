using HarmonyLib;
using System;
using System.Collections.Generic;
using System.Net;
using System.Reflection.Emit;

namespace SuitLib.Patches
{
    [HarmonyPatch(typeof(Stillsuit))]
    internal static class Stillsuit_Patches
    {
        [HarmonyPatch("IEquippable.UpdateEquipped"), HarmonyTranspiler]
        private static IEnumerable<CodeInstruction> WaterCaptured_Transpiler(IEnumerable<CodeInstruction> instructions)
        {
            CodeMatch deltaReductionMatch = new CodeMatch(i => i.opcode == OpCodes.Ldc_R4 && ((float)i.operand == 1800f));
            CodeMatch deltaMultiplier = new CodeMatch(i => i.opcode == OpCodes.Ldc_R4 && ((float)i.operand == 100));

            var newInstructions = new CodeMatcher(instructions)
                .MatchForward(false, deltaReductionMatch)
                .SetInstruction(Transpilers.EmitDelegate<Func<float>>(GetDeltaTimeReduction))
                .MatchForward(false, deltaMultiplier)
                .SetInstruction(Transpilers.EmitDelegate<Func<float>>(GetDeltaMultiplier));

            return newInstructions.InstructionEnumeration();
        }

        public static float GetDeltaTimeReduction()
        {
            //I need a better name for this xd
            float vanillaValue = 1800;
            float moddedValue = 0;
            int itemsWorn = 0;

            foreach (ModdedSuit suit in ModdedSuitsManager.moddedSuitsList)
            {
                if(!Player_Patches.WearingItem(suit.itemTechType, "Body") || suit.stillsuitValues == null)
                {
                    continue;
                }

                moddedValue += suit.stillsuitValues.stillsuitDeltaTimeReduction;
                itemsWorn++;
            }

            foreach (ModdedGloves gloves in ModdedSuitsManager.moddedGlovesList)
            {
                if (!Player_Patches.WearingItem(gloves.itemTechType, "Gloves") || gloves.stillsuitValues == null)
                {
                    continue;
                }

                moddedValue += gloves.stillsuitValues.stillsuitDeltaTimeReduction;
                itemsWorn++;
            }

            if(itemsWorn != 0)
            {
                moddedValue = moddedValue / itemsWorn;
            }

            return moddedValue != 0 ? moddedValue : vanillaValue;
        }

        public static float GetDeltaMultiplier()
        {
            float vanillaValue = 100;
            float moddedValue = 0;
            int itemsWorn = 0;

            foreach (ModdedSuit suit in ModdedSuitsManager.moddedSuitsList)
            {
                if (!Player_Patches.WearingItem(suit.itemTechType, "Body") || suit.stillsuitValues == null)
                {
                    continue;
                }

                moddedValue += suit.stillsuitValues.stillsuitDeltaTimeReduction;
                itemsWorn++;
            }

            foreach (ModdedGloves gloves in ModdedSuitsManager.moddedGlovesList)
            {
                if (!Player_Patches.WearingItem(gloves.itemTechType, "Gloves") || gloves.stillsuitValues == null)
                {
                    continue;
                }

                moddedValue += gloves.stillsuitValues.stillsuitDeltaTimeReduction;
                itemsWorn++;
            }

            if (itemsWorn != 0)
            {
                moddedValue = moddedValue / itemsWorn;
            }

            return moddedValue != 0 ? moddedValue : vanillaValue;
        }
    }
}
