using HarmonyLib;
using IndigocoderLib;
using Nautilus.Handlers;
using Nautilus.Utility;
using UnityEngine;

namespace WarpStabilizationSuit
{
    [HarmonyPatch(typeof(Player))]
    internal static class EncySetup
    {
        [HarmonyPatch(nameof(Player.Start)), HarmonyPostfix]
        private static void Patch()
        {
            string bannerFilePath = Main_Plugin.AssetsFolderPath + "/warpStabilizationEncyBanner.png";
            Texture2D bannerImage = ImageUtils.LoadTextureFromFile(bannerFilePath);

            string popupFilePath = Main_Plugin.AssetsFolderPath + "/warpStabilizationPopup.png";
            Sprite popupImage = ImageHelper.SpriteFromAtlasSprite(ImageUtils.LoadSpriteFromFile(popupFilePath));

            LanguageHandler.SetLanguageLine("Tech/Equipment", "Warp Stabilization Suit");

            PDAHandler.AddEncyclopediaEntry("WarpStabilizationSuit", "Tech/Equipment", "Warp Stabilization Suit", 
                "Using technology scanned from alien \"Warpers\" this suit has been designed to prevent teleportation from unknown sources. \n" +
                "\n" +
                "-While wearing this suit warpers' teleportation technology will not be effective. \n" +
                "-It will not be possible to be warped out of vehicles. \n" +
                "-Warpers will most likely use other methods to attack.",
                bannerImage,
                popupImage,
                PDAHandler.UnlockImportant
                );
        }
    }
}
