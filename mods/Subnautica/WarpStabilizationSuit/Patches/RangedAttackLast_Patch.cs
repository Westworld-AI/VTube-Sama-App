using HarmonyLib;
using WarpStabilizationSuit.Items;

namespace WarpStabilizationSuit
{
    [HarmonyPatch(typeof(RangedAttackLastTarget))]
    internal static class RangedAttackLast_Patch
    {
        [HarmonyPatch(nameof(RangedAttackLastTarget.Evaluate)), HarmonyPostfix]
        private static void Patch(Creature creature, ref float __result)
        {
            if (creature.GetType() != typeof(Warper))
            {
                return;
            }

            bool hasSuit = Inventory.main.equipment.GetTechTypeInSlot("Body") == Suit_Craftable.techType;
            bool hasGloves = Inventory.main.equipment.GetTechTypeInSlot("Gloves") == Gloves_Craftable.techType;

            float weightedResult = 1f;

            if (hasSuit)
            {
                weightedResult -= 0.6f;
            }

            if(hasGloves)
            {
                weightedResult -= 0.2f;
            }

            __result = weightedResult;
        }
    }
}
