using HarmonyLib;
using System;
using System.Reflection;

namespace IndigocoderLib
{
    public static class Utilities
    {
        public static void PatchIfExists(Harmony harmony, string assemblyName, string typeName, string methodName, HarmonyMethod prefix, HarmonyMethod postfix, HarmonyMethod transpiler)
        {
            var targetType = FindType(assemblyName, typeName);

            var targetMethod = AccessTools.Method(targetType, methodName);
            if (targetMethod != null)
            {
                harmony.Patch(targetMethod, prefix, postfix, transpiler);
            }
            else
            {
                Console.WriteLine($"Was not able to patch {typeName}.{methodName} because it doesn't exist!");
            }
        }

        public static Type FindType(string assemblyName, string typeName)
        {
            var assembly = FindAssembly(assemblyName);
            if (assembly == null)
            {
                return null;
            }

            Type targetType = assembly.GetType(typeName);
            if (targetType == null)
            {
                return null;
            }
            return targetType;
        }

        public static Assembly FindAssembly(string assemblyName)
        {
            foreach (var assembly in AppDomain.CurrentDomain.GetAssemblies())
                if (assembly.FullName.StartsWith(assemblyName + ","))
                    return assembly;

            return null;
        }

        public static string GetNameWithCloneRemoved(string name)
        {
            string cloneString = "(Clone)";
            int nameLength = name.Length - cloneString.Length;
            return name.Substring(0, nameLength);
        }
    }
}