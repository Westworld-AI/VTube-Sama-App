using HarmonyLib;

namespace WarpStabilizationSuit.Patches
{
    [HarmonyPatch(typeof(Player))]
    internal static class Player_Patch
    {
        [HarmonyPatch(nameof(Player.Awake)), HarmonyPostfix]
        private static void Awake_Patch()
        {
            PDAScanner.GetEntryData(TechType.PrecursorPrisonIonGenerator).blueprint = TechType.PrecursorPrisonIonGenerator;
        }
    }
}
