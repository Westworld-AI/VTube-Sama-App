using BepInEx;
using BepInEx.Configuration;
using BepInEx.Logging;
using HarmonyLib;
using Nautilus.Handlers;
using System;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
using IndigocoderLib;
using Nautilus.Assets;
using Nautilus.Utility;
using Newtonsoft.Json;
using TodoList.Patches;
using UnityEngine;
using ReflectionHelper = Nautilus.Utility.ReflectionHelper;

namespace TodoList
{
    [BepInPlugin(myGUID, pluginName, versionString)]
    [BepInDependency("com.snmodding.nautilus")]
    [BepInDependency("sn.subnauticamap.mod", BepInDependency.DependencyFlags.SoftDependency)]
    public class Main_Plugin : BaseUnityPlugin
    {
        private const string myGUID = "Indigocoder.TodoList";
        private const string pluginName = "Todo List";
        private const string versionString = "1.1.2";

        public static ManualLogSource logger;

        public static string AssetsFolderPath = Path.Combine(Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location), "Assets");
        public static AssetBundle AssetBundle = AssetBundle.LoadFromFile(Path.Combine(AssetsFolderPath, "todolist"));
        public static TodoListSaveData SaveData { get; } = SaveDataHandler.RegisterSaveDataCache<TodoListSaveData>();

        public static Atlas.Sprite TodoListTabSprite;
        public static GameObject NewItemPrefab;

        public static ConfigEntry<bool> CreateHintTodoItems;

        private static readonly Harmony harmony = new Harmony(myGUID);

        internal static PDATab todoTab;
        internal static bool Initialized;

        private void Awake()
        {
            if (Initialized) return;

            logger = Logger;

            LanguageHandler.RegisterLocalizationFolder();
            string tabTodoList = LocalizationUtils.GetValue("TabTodoList");
            Logger.LogInfo($"localizationUtils -> '{tabTodoList}'");
          
            todoTab = EnumHandler.AddEntry<PDATab>("TodoList");

            BindConfigs();
            CachePrefabs();
            RegisterStoryGoals();
            

            new TodoOptions();

            if (BepInEx.Bootstrap.Chainloader.PluginInfos.ContainsKey("sn.subnauticamap.mod"))
            {
                RunCompatibilityPatches();
            }

            harmony.PatchAll();
            Initialized = true;
            Logger.LogInfo($"{pluginName} {versionString} Loaded.");
        }

        private void BindConfigs()
        {
            CreateHintTodoItems = Config.Bind("Todo List", "Create guiding todo items", true,
                new ConfigDescription("Automatically create todo list items at key story points to give you hints on what to do"));
        }

        private void CachePrefabs()
        {
            TodoListTabSprite = new Atlas.Sprite(AssetBundle.LoadAsset<Texture2D>("todoListTabImage"));
            TodoListTabSprite.size = new Vector2(220, 220);
            NewItemPrefab = AssetBundle.LoadAsset<GameObject>("ChecklistItem");
        }

        private void RunCompatibilityPatches()
        {
            Type mapControllerType = Type.GetType("SubnauticaMap.Controller, SubnauticaMap");
            MethodBase methodBase = mapControllerType.GetMethod("Update", BindingFlags.NonPublic | BindingFlags.Instance);
            MethodInfo transpilerInfo = AccessTools.Method(typeof(MapModCompatibilityPatches),
                nameof(MapModCompatibilityPatches.ControllerUpdate_Transpiler));

            harmony.Patch(methodBase, null, null, new HarmonyMethod(transpilerInfo));
        }

        private void RegisterStoryGoals()
        {
            try
            {
                StoryGoalHandler.RegisterCustomEvent("OnRadioRepair", null);
                StoryGoalHandler.RegisterItemGoal("Goal_RadiationSuit", Story.GoalType.Story, TechType.RadiationSuit);
                StoryGoalHandler.RegisterLocationGoal("OnVisitLifepod2", Story.GoalType.Story, new Vector3(-481, -502, 1324), 15f, 5f);
                StoryGoalHandler.RegisterLocationGoal("OnVisitLifepod3", Story.GoalType.Story, new Vector3(-33, -21, 410), 15f, 5f);
                StoryGoalHandler.RegisterLocationGoal("OnVisitLifepod4", Story.GoalType.Story, new Vector3(713, -2, 161), 15f, 5f);
                StoryGoalHandler.RegisterLocationGoal("OnVisitLifepod6", Story.GoalType.Story, new Vector3(363, -115, 309), 15f, 5f);
                StoryGoalHandler.RegisterLocationGoal("OnVisitLifepod7", Story.GoalType.Story, new Vector3(-56, -180, -1039), 15f, 5f);
                StoryGoalHandler.RegisterLocationGoal("OnVisitLifepod12", Story.GoalType.Story, new Vector3(1116, -269, 566), 15f, 5f);
                StoryGoalHandler.RegisterLocationGoal("OnVisitLifepod13", Story.GoalType.Story, new Vector3(-926, -183, 507), 15f, 5f);
                StoryGoalHandler.RegisterLocationGoal("OnVisitLifepod17", Story.GoalType.Story, new Vector3(-516, -98, -56), 15f, 5f);
                StoryGoalHandler.RegisterLocationGoal("OnVisitLifepod19", Story.GoalType.Story, new Vector3(-809, -298, -873), 15f, 5f);
                StoryGoalHandler.RegisterLocationGoal("OnVisitSunbeamSite", Story.GoalType.Story, new Vector3(289, 4, 1097), 15f, 5f);
            }
            catch (Exception ex)
            {
                Logger.LogError($"An error occurred while registering story goals: {ex}");
                Logger.LogError(ex.StackTrace);
            }
            
        }

        public static List<StoryGoalTodoEntry> StoryGoalTodoEntries { get; internal set; } = new()
        {
            new("Trigger_PDAIntroEnd", new EntryInfo[] {
                new("OnPDAIntroEnd1", "Goal_Scanner", true),
                new("OnPDAIntroEnd2", "RepairLifepod", true),
                new("OnPDAIntroEnd3", "OnRadioRepair", true)}),
            new("Goal_UnlockRadSuit", new EntryInfo[] { new("OnAuroraExplode1", "AuroraRadiationFixed", true), new("OnAuroraExplode2", "Goal_RadiationSuit", true)}),
            new("OnPlayRadioBloodKelp29", new EntryInfo[] { new("OnLifepod2RadioFinished", "OnVisitLifepod2", true)}),
            new("OnPlayRadioGrassy25", new EntryInfo[] { new("OnLifepod3RadioFinished", "OnVisitLifepod3", true)}),
            new("OnPlayRadioRadiationSuit", new EntryInfo[] { new("OnLifepod4RadioFinished", "OnVisitLifepod4", true)}),
            new("OnPlayRadioShallows22", new EntryInfo[] { new("OnLifepod6RadioFinished", "OnVisitLifepod6", true)}),
            new("OnPlayRadioKelp28", new EntryInfo[] { new("OnLifepod7RadioFinished", "OnVisitLifepod7", true)}),
            new("OnPlayRadioKoosh26", new EntryInfo[] { new("OnLifepod12RadioFinished", "OnVisitLifepod12", true)}),
            new("OnPlayRadioMushroom24", new EntryInfo[] { new("OnLifepod13RadioFinished", "OnVisitLifepod13", true)}),
            new("OnPlayRadioGrassy21", new EntryInfo[] { new("OnLifepod17RadioFinished", "OnVisitLifepod17", true)}),
            new("OnPlayRadioSecondOfficer", new EntryInfo[] { new("OnLifepod19RadioFinished", "OnVisitLifepod19", true)}),
            new("CaptainCode", new EntryInfo[] {
                new("OnCaptainsCodeRadioFinished1", "Aurora_RingRoom_Terminal13", true),
                new("OnCaptainsCodeRadioFinished2", null, true)}),
            new("OnPlayRadioSunbeam4", new EntryInfo[] { new("OnSunbeamPreparingToLand", "OnVisitSunbeamSite", true)}),
            new("Precursor_Gun_DataDownload3", new EntryInfo[] {
                new("OnLostRiverHintDownloaded1", "Precursor_LostRiverBase_Log1", true),
                new("OnLostRiverHintDownloaded2", "FindPrecursorLavaCastleFacility", true)}),
            new("Emperor_Telepathic_Contact1", new EntryInfo[] { new("OnEmperorFirstTelepathy", "Precursor_Prison_Aquarium_EmperorLog1", true)}),
            new("Goal_SecondarySystems", new EntryInfo[] {
                new("OnLifepodRepaired1", "Goal_Seaglide", true),
                new("OnLifepodRepaired2", "Goal_Builder", true)}),
            new("Goal_JellyCaveEntrance", new EntryInfo[] { new( "OnJellyHintGiven", "Goal_BiomeJellyCave", true)}),
            new("AdviseSelfScan", new EntryInfo[] { new("OnAdviseSelfScan", "SelfScan2", true)})
        };

        public struct StoryGoalTodoEntry
        {
            public string key;
            public EntryInfo[] entryInfos;

            public StoryGoalTodoEntry(string key, EntryInfo[] entryInfos)
            {
                this.key = key;
                this.entryInfos = entryInfos;
            }
        }

        public struct EntryInfo
        {
            public string entry;
            public string completeKey;
            public bool localized;
            public string localizationKey;

            public EntryInfo(string entry, string completeKey, bool localized, string localizationKey = "")
            {
                this.entry = entry;
                this.completeKey = completeKey;
                this.localized = localized;
                this.localizationKey = localizationKey;
            }

            public void SetEntry(string entry)
            {
                this.entry = entry;
            }

            public void SetLocalizationKey(string key)
            {
                Main_Plugin.logger.LogInfo($"Setting localizaton key to {key}");
                this.localizationKey = key;
            }
        }
    }
}
