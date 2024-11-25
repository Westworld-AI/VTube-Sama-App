using HarmonyLib;
using Story;
using TodoList.Monobehaviors;

namespace TodoList.Patches.AutoTodoItems
{
    [HarmonyPatch(typeof(CompoundGoal))]
    internal class CompoundGoalPatches
    {
        [HarmonyPatch(nameof(CompoundGoal.Trigger)), HarmonyPostfix]
        private static void Trigger_Postfix(CompoundGoal __instance, bool __result)
        {
            /*
            string matchedGoal = "";
            if (!Main_Plugin.CompoundGoalEntries.TryGetValue(__instance.key, out matchedGoal))
            {
                return;
            }

            Main_Plugin.logger.LogInfo($"Spawning new todo item for {__instance.key}");
            uGUI_TodoTab.Instance.CreateNewItem(matchedGoal);
            */
        }
    }
}
