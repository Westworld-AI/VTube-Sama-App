using HarmonyLib;
using Story;

namespace TodoList.Patches.AutoTodoItems
{
    [HarmonyPatch(typeof(uGUI_SceneIntro))]
    internal class uGUI_SceneIntroPatches
    {
        [HarmonyPatch(nameof(uGUI_SceneIntro.Stop)), HarmonyPostfix]
        private static void Stop_Postfix(bool isInterrupted)
        {
            if (!isInterrupted) return;

            StoryGoalManager.main.OnGoalComplete("Trigger_PDAIntroEnd");
        }
    }
}
