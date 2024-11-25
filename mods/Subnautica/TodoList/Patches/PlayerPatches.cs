using HarmonyLib;
using System.Collections.Generic;
using TodoList.Monobehaviors;

namespace TodoList.Patches
{
    [HarmonyPatch(typeof(Player))]
    internal class PlayerPatches
    {
        [HarmonyPatch(nameof(Player.OnProtoSerialize)), HarmonyPostfix]
        private static void OnProtoSerialize_Postfix()
        {
            
        }
    }
}
