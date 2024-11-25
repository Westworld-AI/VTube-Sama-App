using System;
using HarmonyLib;
using System.Collections.Generic;
using System.Reflection;
using System.Reflection.Emit;
using TodoList.Monobehaviors;
using UnityEngine;

namespace TodoList.Patches
{
    
    internal static class ReflectionHelper
    {
        // 获取私有字段的值
        public static T GetPrivateField<T>(object obj, string fieldName)
        {
            FieldInfo fieldInfo = obj.GetType().GetField(fieldName, BindingFlags.NonPublic | BindingFlags.Instance);
            return (T)fieldInfo.GetValue(obj);
        }

        // 设置私有字段的值
        public static void SetPrivateField<T>(object obj, string fieldName, T value)
        {
            FieldInfo fieldInfo = obj.GetType().GetField(fieldName, BindingFlags.NonPublic | BindingFlags.Instance);
            fieldInfo.SetValue(obj, value);
        }
    }
    
    [HarmonyPatch(typeof(uGUI_PDA))]
    internal class uGUI_PDAPatches
    {
        [HarmonyPatch(nameof(uGUI_PDA.Initialize)), HarmonyPrefix]
        private static void Initialize_Prefix(uGUI_PDA __instance)
        {
            // 获取 uGUI_PDA 类的类型
            Type uGUITabType = typeof(uGUI_PDA);
            // 获取 regularTabs 字段
            FieldInfo regularTabsField = uGUITabType.GetField("regularTabs", BindingFlags.Static | BindingFlags.NonPublic);
            // 获取当前的 regularTabs
            var currentTabs = (List<PDATab>)regularTabsField.GetValue(null);
            if (currentTabs.Contains(Main_Plugin.todoTab)) return;
            currentTabs.Add(Main_Plugin.todoTab);
        }

        [HarmonyPatch(nameof(uGUI_PDA.Initialize)), HarmonyPostfix]
        private static void Initialize_Postfix(uGUI_PDA __instance)
        {
            GameObject logTab = __instance.tabLog.gameObject;
            GameObject todoTab = GameObject.Instantiate(logTab, __instance.transform.Find("Content"));
            todoTab.name = "TodoTab";
            GameObject.DestroyImmediate(todoTab.GetComponent<uGUI_LogTab>());
            todoTab.AddComponent<uGUI_TodoTab>();

            var tabDict = ReflectionHelper.GetPrivateField<Dictionary<PDATab, uGUI_PDATab>>(__instance, "tabs");
            tabDict.Add(Main_Plugin.todoTab, todoTab.GetComponent<uGUI_PDATab>());
            ReflectionHelper.SetPrivateField(__instance, "tabs", tabDict);

            TodoItem.todoItems = new();
            todoTab.GetComponent<uGUI_TodoTab>().LoadSavedItems();
        }

        [HarmonyPatch(nameof(uGUI_PDA.SetTabs)), HarmonyTranspiler]
        private static IEnumerable<CodeInstruction> SetTabs_Transpiler(IEnumerable<CodeInstruction> instructions)
        {
            CodeMatch[] matches = new CodeMatch[]
            {
                new(i => i.opcode == OpCodes.Call && ((MethodInfo)i.operand).Name == "Get"),
                new(i=> i.opcode == OpCodes.Stelem_Ref)
            };

            var newInstructions = new CodeMatcher(instructions)
                .MatchForward(false, matches)
                .Advance(1)
                .InsertAndAdvance(new CodeInstruction(OpCodes.Ldloc_3))
                .Insert(Transpilers.EmitDelegate(TryGetTodoListSprite));

            return newInstructions.InstructionEnumeration();
        }

        public static Atlas.Sprite TryGetTodoListSprite(Atlas.Sprite originalSprite, PDATab currentTab)
        {
            if (currentTab != Main_Plugin.todoTab) return originalSprite;

            return Main_Plugin.TodoListTabSprite;
        }
    }
}
