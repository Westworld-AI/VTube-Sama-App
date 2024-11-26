using HarmonyLib;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Reflection.Emit;
using TodoList.Monobehaviors;

namespace TodoList.Patches
{
    //[HarmonyPatch]
    internal static class MapModCompatibilityPatches
    {
        //[HarmonyPatch("SubnauticaMap.Controller", "Update"), HarmonyTranspiler]
        internal static IEnumerable<CodeInstruction> ControllerUpdate_Transpiler(IEnumerable<CodeInstruction> instructions)
        {
            CodeMatch[] matches = new CodeMatch[]
            {
                new(i => i.opcode == OpCodes.Call && ((MethodInfo)i.operand).Name == "get_Settings"),
                new(i => i.opcode == OpCodes.Ldfld),
                new(i => i.opcode == OpCodes.Call && ((MethodInfo)i.operand).Name == "GetKeyDown")
            };

            var newInstructions = new CodeMatcher(instructions)
                .MatchForward(false, matches)
                .Advance(3)
                .InsertAndAdvance(Transpilers.EmitDelegate(IsUsingTodoInputField))
                .Advance(4)
                .InsertAndAdvance(Transpilers.EmitDelegate(IsUsingTodoInputField))
                .Advance(4)
                .InsertAndAdvance(Transpilers.EmitDelegate(IsUsingTodoInputField));

            return newInstructions.InstructionEnumeration();
        }

        public static bool IsUsingTodoInputField(bool previousValue)
        {
            if (TodoItem.todoItems.Any(item => item.todoInputField.inputField.isFocused))
            {
                return false;
            }

            return previousValue;
        }
    }
}
