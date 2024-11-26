using HarmonyLib;
using Nautilus.Utility;
using UnityEngine;
using WarpStabilizationSuit.Items;
using static Player;

namespace WarpStabilizationSuit
{
    [HarmonyPatch(typeof(Player))]
    internal static class Player_Patches
    {
        /*
        private static Texture defaultSuitTexture;
        private static Texture defaultSuitSpec;
        private static Texture defaultArmsTexture;
        private static Texture defaultArmsSpec;

        private static Texture warpSuitTexture;
        private static Texture warpSuitSpec;
        private static Texture warpArmsTexture;
        private static Texture warpArmsSpec;

        private static GameObject reinforcedSuitBodyGO;
        private static GameObject reinforcedSuitGlovesGO;

        private static GameObject diveSuitBodyGO;
        private static GameObject diveSuitGlovesGO;

        [HarmonyPatch(nameof(Player.Start)), HarmonyPrefix]
        private static void Start_Patch()
        {
            InitializeCustomTextures();
            InitializeSuitModels();
        }

        [HarmonyPatch(nameof(Player.EquipmentChanged)), HarmonyPostfix]
        private static void EquiupmentChanged_Patch()
        {
            Equipment equipment = Inventory.main.equipment;
            TechType typeInBodySlot = equipment.GetTechTypeInSlot("Body");
            TechType typeInGovesSlot = equipment.GetTechTypeInSlot("Gloves");

            bool wearingWarpSuit = typeInBodySlot.Equals(Suit_Craftable.techType);
            bool wearingWarpGloves = typeInGovesSlot.Equals(Gloves_Craftable.techType);

            bool wearingReinforcedSuit = typeInBodySlot.Equals(TechType.ReinforcedDiveSuit);
            bool wearingReinforcedGloves = typeInGovesSlot.Equals(TechType.ReinforcedGloves);

            bool wearingSuit = !typeInBodySlot.Equals(TechType.None);
            bool wearingGloves = !typeInGovesSlot.Equals(TechType.None);

            diveSuitBodyGO.SetActive(!(wearingWarpSuit || wearingReinforcedSuit || wearingSuit));
            reinforcedSuitBodyGO.SetActive(wearingWarpSuit || wearingReinforcedSuit);

            diveSuitGlovesGO.SetActive(!(wearingWarpGloves || wearingReinforcedGloves || wearingGloves));
            reinforcedSuitGlovesGO.SetActive(wearingWarpGloves || wearingReinforcedGloves);

            SetWarpColors(wearingWarpSuit, wearingWarpGloves);
        }

        private static void InitializeCustomTextures()
        {
            string suitFilePath = Main_Plugin.AssetsFolderPath + "/Textures/player_02_reinforced_suit_01_body_WARP.png";
            warpSuitTexture = ImageUtils.LoadTextureFromFile(suitFilePath);

            string suitSpecFilePath = Main_Plugin.AssetsFolderPath + "/Textures/player_02_reinforced_suit_01_body_spec_WARP.png";
            warpSuitSpec = ImageUtils.LoadTextureFromFile(suitSpecFilePath);

            string armsFilePath = Main_Plugin.AssetsFolderPath + "/Textures/player_02_reinforced_suit_01_arms_WARP.png";
            warpArmsTexture = ImageUtils.LoadTextureFromFile(armsFilePath);

            string armsSpecFilePath = Main_Plugin.AssetsFolderPath + "/Textures/player_02_reinforced_suit_01_arms_spec_WARP.png";
            warpArmsSpec = ImageUtils.LoadTextureFromFile(armsSpecFilePath);
        }

        private static void InitializeSuitModels()
        {
            Transform geo = Player.main.transform.Find("body/player_view/male_geo");
            Transform reinforcedSuit = geo.Find("reinforcedSuit"); ;

            reinforcedSuitBodyGO = reinforcedSuit.Find("reinforced_suit_01_body_geo").gameObject;
            reinforcedSuitGlovesGO = reinforcedSuit.Find("reinforced_suit_01_glove_geo").gameObject;

            Transform diveSuit = geo.Find("diveSuit");

            diveSuitBodyGO = diveSuit.Find("diveSuit_body_geo").gameObject;
            diveSuitGlovesGO = diveSuit.Find("diveSuit_hands_geo").gameObject;

            defaultSuitTexture = reinforcedSuitBodyGO.GetComponent<Renderer>().materials[0].GetTexture("_MainTex");
            defaultSuitSpec = reinforcedSuitBodyGO.GetComponent<Renderer>().materials[0].GetTexture(ShaderPropertyID._SpecTex);

            defaultArmsTexture = reinforcedSuitBodyGO.GetComponent<Renderer>().materials[1].GetTexture("_MainTex");
            defaultArmsSpec = reinforcedSuitBodyGO.GetComponent<Renderer>().materials[1].GetTexture(ShaderPropertyID._SpecTex);
        }

        private static void SetWarpColors(bool hasWarpSuit, bool hasWarpGloves)
        {
            Renderer suitRenderer = reinforcedSuitBodyGO.GetComponent<Renderer>();

            if (hasWarpSuit)
            {
                suitRenderer.materials[0].SetTexture("_MainTex", warpSuitTexture);
                suitRenderer.materials[0].SetTexture(ShaderPropertyID._SpecTex, warpSuitSpec);

                suitRenderer.materials[1].SetTexture("_MainTex", warpArmsTexture);
                suitRenderer.materials[1].SetTexture(ShaderPropertyID._SpecTex, warpArmsSpec);
            }
            else
            {
                suitRenderer.materials[0].SetTexture("_MainTex", defaultSuitTexture);
                suitRenderer.materials[0].SetTexture(ShaderPropertyID._SpecTex, defaultSuitSpec);

                suitRenderer.materials[1].SetTexture("_MainTex", defaultArmsTexture);
                suitRenderer.materials[1].SetTexture(ShaderPropertyID._SpecTex, defaultArmsSpec);
            }

            Renderer glovesRenderer = reinforcedSuitGlovesGO.GetComponent<Renderer>();

            if (hasWarpGloves)
            {
                glovesRenderer.material.SetTexture("_MainTex", warpArmsTexture);
                glovesRenderer.materials[0].SetTexture(ShaderPropertyID._SpecTex, warpArmsSpec);
            }
            else
            {
                glovesRenderer.material.SetTexture("_MainTex", defaultArmsTexture);
                glovesRenderer.materials[0].SetTexture(ShaderPropertyID._SpecTex, defaultArmsSpec);
            }
        }

        [HarmonyPatch(nameof(Player.HasReinforcedSuit)), HarmonyPostfix]
        private static void Suit_Patch(ref bool __result)
        {
            if(Inventory.main.equipment.GetTechTypeInSlot("Body") == Suit_Craftable.techType)
            {
                __result = true;
            }
        }

        [HarmonyPatch(nameof(Player.HasReinforcedGloves)), HarmonyPostfix]
        private static void Gloves_Patch(ref bool __result)
        {
            if(Inventory.main.equipment.GetTechTypeInSlot("Gloves") == Gloves_Craftable.techType)
            {
                __result = true;
            }
        }*/
    }
}