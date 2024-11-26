using HarmonyLib;
using Story;

namespace TodoList.Patches.AutoTodoItems
{
    [HarmonyPatch(typeof(Radio))]
    internal class RadioPatches
    {
        [HarmonyPatch(nameof(Radio.OnRepair)), HarmonyPostfix]
        private static void OnRepair_Postfix()
        {
            StoryGoalManager.main.OnGoalComplete("OnRadioRepair");
        }
    }
}
