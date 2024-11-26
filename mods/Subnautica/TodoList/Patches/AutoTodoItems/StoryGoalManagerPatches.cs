using HarmonyLib;
using Story;
using System.Linq;
using TodoList.Monobehaviors;

namespace TodoList.Patches.AutoTodoItems
{
    [HarmonyPatch(typeof(StoryGoalManager))]
    internal class StoryGoalManagerPatches
    {
        [HarmonyPatch(nameof(StoryGoalManager.OnGoalComplete)), HarmonyPostfix]
        private static void OnGoalComplete_Postfix(StoryGoalManager __instance, bool __result, string key)
        {
            if (!__result) return;

            if (!Main_Plugin.CreateHintTodoItems.Value) return;

            TryCompleteHintEntries(key);
            if (!Main_Plugin.StoryGoalTodoEntries.Any(i => i.key == key)) return;

            Main_Plugin.StoryGoalTodoEntry entry = Main_Plugin.StoryGoalTodoEntries.FirstOrDefault(i => i.key == key);

            Main_Plugin.EntryInfo[] entryInfos = entry.entryInfos;
            for (int i = 0; i < entryInfos.Length; i++)
            {
                Main_Plugin.EntryInfo info = entryInfos[i];
                if (!info.localized) continue;

                info.SetLocalizationKey(info.entry);
                info.entry = LocalizationUtils.GetValue(info.entry);
                entryInfos[i] = info;
            }

            uGUI_TodoTab.Instance.CreateNewItems(entryInfos, true);

            ErrorMessage.AddError($"<color=#FFFF00>{LocalizationUtils.GetValue("TODO_NewHintItems")}</color>");
        }

        private static void TryCompleteHintEntries(string key)
        {
            if (!Main_Plugin.StoryGoalTodoEntries.Any(i => i.entryInfos.Any(j => j.completeKey == key))) return;

            Main_Plugin.StoryGoalTodoEntry storyEntry = Main_Plugin.StoryGoalTodoEntries.First(i => i.entryInfos.Any(j => j.completeKey == key));
            Main_Plugin.EntryInfo entryInfo = storyEntry.entryInfos.FirstOrDefault(i => i.completeKey == key);
            if (uGUI_TodoTab.Instance.CompleteTodoItem(entryInfo))
            {
                ErrorMessage.AddMessage($"<color=#00FF00>{LocalizationUtils.GetValue("TODO_ItemComplete")}</color>");
            }
        }
    }
}
