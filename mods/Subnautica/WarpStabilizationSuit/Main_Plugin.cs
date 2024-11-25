using HarmonyLib;
using BepInEx;
using BepInEx.Logging;
using System.Reflection;
using System.IO;
using WarpStabilizationSuit.Items;
using BepInEx.Configuration;
using IndigocoderLib;
using SuitLib;
using Nautilus.Utility;
using UnityEngine;
using System.Collections.Generic;
using Nautilus.Handlers;
using Nautilus.Crafting;
using Nautilus.Json.Converters;
using Newtonsoft.Json;
using System;
using BepInEx.Bootstrap;

namespace WarpStabilizationSuit
{
    [BepInPlugin(myGUID, pluginName, versionString)]
    [BepInDependency("com.snmodding.nautilus", BepInDependency.DependencyFlags.HardDependency)]
    [BepInDependency("Indigocoder.SuitLib", BepInDependency.DependencyFlags.HardDependency)]
    [BepInDependency("com.github.tinyhoot.DeathrunRemade", BepInDependency.DependencyFlags.SoftDependency)]
    public class Main_Plugin : BaseUnityPlugin
    {
        private const string myGUID = "Indigocoder.WarpStabilizationSuit";
        private const string pluginName = "Warp Stabilization Suit";
        private const string versionString = "1.4.0";
        public static ManualLogSource logger;

        public static string AssetsFolderPath = Path.Combine(Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location), "Assets");
        public static string RecipesFolderPath = Path.Combine(Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location), "Recipes");

        public static RecipeData easySuitRecipe;
        public static RecipeData hardSuitRecipe;

        internal static Texture2D warpSuitMain;
        internal static Texture2D warpSuitSpec;
        internal static Texture2D warpArmsMain;
        internal static Texture2D warpArmsSpec;

        private static readonly Harmony harmony = new Harmony(myGUID);

        public static ConfigEntry<bool> UseHardRecipe;
        public static bool TabsNeeded;

        private void Awake()
        {
            logger = Logger;

            PiracyDetector.TryFindPiracy();

            harmony.PatchAll();

            UseHardRecipe = Config.Bind("Warp Stabilization Suit", "Use harder recipe", false);
            new Suit_ModOptions();

            Gloves_Craftable.Patch();
            easySuitRecipe = GetRecipeFromJson(Path.Combine(RecipesFolderPath, "EasySuitRecipe.json"));
            hardSuitRecipe = GetRecipeFromJson(Path.Combine(RecipesFolderPath, "HardSuitRecipe.json"));

            Suit_Craftable.Patch();
            KnownTechHandler.SetAnalysisTechEntry(TechType.Warper, new List<TechType> { Suit_Craftable.techType, Gloves_Craftable.techType });

            InitializeSuits();
            if (Chainloader.PluginInfos.ContainsKey("com.github.tinyhoot.DeathrunRemade"))
            {
                gameObject.AddComponent<DeathrunComponentAdder>();
            }

            Logger.LogInfo($"{pluginName} {versionString} Loaded.");
        }

        private void InitializeSuits()
        {
            string suitFilePath = AssetsFolderPath + "/Textures/player_02_reinforced_suit_01_body_WARP.png";
            warpSuitMain = ImageUtils.LoadTextureFromFile(suitFilePath);

            string suitSpecFilePath = AssetsFolderPath + "/Textures/player_02_reinforced_suit_01_body_spec_WARP.png";
            warpSuitSpec = ImageUtils.LoadTextureFromFile(suitSpecFilePath);

            string armsFilePath = AssetsFolderPath + "/Textures/player_02_reinforced_suit_01_arms_WARP.png";
            warpArmsMain = ImageUtils.LoadTextureFromFile(armsFilePath);

            string armsSpecFilePath = AssetsFolderPath + "/Textures/player_02_reinforced_suit_01_arms_spec_WARP.png";
            warpArmsSpec = ImageUtils.LoadTextureFromFile(armsSpecFilePath);

            Dictionary<string, Texture2D> suitKeyValuePairs = new Dictionary<string, Texture2D> { { "_MainTex", warpSuitMain }, { "_SpecTex", warpSuitSpec } };
            Dictionary<string, Texture2D> armKeyValuePairs = new Dictionary<string, Texture2D> { { "_MainTex", warpArmsMain }, { "_SpecTex", warpArmsSpec } };

            ModdedSuit warpSuit = new ModdedSuit(suitKeyValuePairs, armKeyValuePairs, ModdedSuitsManager.VanillaModel.Reinforced, Suit_Craftable.techType,
                ModdedSuitsManager.Modifications.Reinforced);
            ModdedGloves warpGloves = new ModdedGloves(armKeyValuePairs, ModdedSuitsManager.VanillaModel.Reinforced, Gloves_Craftable.techType,
                ModdedSuitsManager.Modifications.Reinforced);

            ModdedSuitsManager.AddModdedSuit(warpSuit);
            ModdedSuitsManager.AddModdedGloves(warpGloves);
        }

        private static RecipeData GetRecipeFromJson(string path)
        {
            var content = File.ReadAllText(path);
            return JsonConvert.DeserializeObject<RecipeData>(content, new CustomEnumConverter());
        }
    }

    internal class DeathrunComponentAdder : MonoBehaviour
    {
        private void Start()
        {
            Type DeathrunAPI = AccessTools.TypeByName("DeathrunRemade.DeathrunAPI");

            MethodInfo AddSuitCrushDepth = DeathrunAPI.GetMethod("AddSuitCrushDepth", new Type[] { typeof(TechType), typeof(IEnumerable<float>) });
            AddSuitCrushDepth.Invoke(null, new object[] { Suit_Craftable.techType, new float[] { 1700f, 1600f } });

            Destroy(this);
        }
    }
}
