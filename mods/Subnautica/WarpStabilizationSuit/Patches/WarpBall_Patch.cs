using HarmonyLib;
using System.Net;
using UnityEngine;
using WarpStabilizationSuit.Items;

namespace WarpStabilizationSuit
{
    [HarmonyPatch(typeof(WarpBall))]
    internal static class WarpBall_Patch
    {
        [HarmonyPatch(nameof(WarpBall.Warp)), HarmonyPrefix]
        private static bool Patch(WarpBall __instance, GameObject target)
        {
            Player component = target.GetComponent<Player>();

            if(component == null)
            {
                return true;
            }

            bool hasSuit = Inventory.main.equipment.GetTechTypeInSlot("Body") == Suit_Craftable.techType;
            bool hasGloves = Inventory.main.equipment.GetTechTypeInSlot("Gloves") == Gloves_Craftable.techType;

            if (hasSuit && hasGloves)
            {
                GameObject.Destroy(__instance);
                return false;
            }

            return true;
        }
    }
}
