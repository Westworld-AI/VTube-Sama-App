using System.IO;
using System.Reflection;
using AtlasPAD.client;
using BepInEx;
using BepInEx.Logging;
using HarmonyLib;
using Nautilus.Handlers;

namespace AtlasPAD
{

    [BepInPlugin(myGUID, pluginName, versionString)]
    [BepInDependency("com.snmodding.nautilus")]
    internal class Plugin : BaseUnityPlugin
    {
        private const string myGUID = "atlas.atlasPAD";
        private const string pluginName = "Atlas PAD";
        private const string versionString = "1.0.0";
    
        public new static ManualLogSource Logger { get; private set; }
       
        public static string ClientConfigPath = Path.Combine(Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location), "config");
    
        private static Assembly Assembly { get; } = Assembly.GetExecutingAssembly();

        private void Awake()
        {
            // set project-scoped logger instance
            Logger = base.Logger;
        
            // register localization folder
            LanguageHandler.RegisterLocalizationFolder();
        
            // Initialize custom prefabs
            InitializePrefabs();

            // register harmony patches, if there are any
            Harmony.CreateAndPatchAll(Assembly, $"{myGUID}");
            Logger.LogInfo($"{pluginName} {versionString} Loaded.");
        }

        private void InitializePrefabs()
        {
           
        }
    }
}

