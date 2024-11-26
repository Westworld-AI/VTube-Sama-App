using HarmonyLib;
using WarpStabilizationSuit.Items;

namespace WarpStabilizationSuit
{
    [HarmonyPatch(typeof(Warper))]
    internal static class Warper_Patch
    {
        [HarmonyPatch(nameof(Warper.OnKill)), HarmonyPostfix]
        private static void Patch()
        {
            if (!KnownTech.Contains(Suit_Craftable.techType))
            {
                KnownTech.Add(Suit_Craftable.techType);

                PDAEncyclopedia.Add("WarpStabilizationSuit", true);
            }
        }
    }
}
