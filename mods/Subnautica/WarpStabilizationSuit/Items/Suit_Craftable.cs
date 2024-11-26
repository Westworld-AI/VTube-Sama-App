using Nautilus.Assets;
using Nautilus.Assets.Gadgets;
using Nautilus.Assets.PrefabTemplates;
using UnityEngine;
using IndigocoderLib;
using System.IO;

namespace WarpStabilizationSuit.Items
{
    internal static class Suit_Craftable
    {
        public static Color WarpColor = new Color(176 / 255f, 99 / 255f, 213 / 255f);
        public static TechType techType { get; private set; }

        public static void Patch()
        {
            Atlas.Sprite sprite = ImageHelper.GetSpriteFromAssetsFolder("warpStabilizationSuit.png");

            PrefabInfo prefabInfo = PrefabInfo.WithTechType("WarpStabilizationSuit", "Warp Stabilization Suit", "Protects you from being displaced by teleportation technology")
                .WithIcon(sprite)
                .WithSizeInInventory(new Vector2int(2, 2));

            techType = prefabInfo.TechType;

            var prefab = new CustomPrefab(prefabInfo);

            var cloneTemplate = new CloneTemplate(prefabInfo, TechType.ReinforcedDiveSuit);
            cloneTemplate.ModifyPrefab += gameObject =>
            {
                var renderer = gameObject.GetComponentInChildren<Renderer>();

                renderer.materials[0].SetTexture("_MainTex", Main_Plugin.warpSuitMain);
                renderer.materials[0].SetTexture(ShaderPropertyID._SpecTex, Main_Plugin.warpSuitSpec);
                renderer.materials[1].SetTexture("_MainTex", Main_Plugin.warpArmsMain);
                renderer.materials[1].SetTexture(ShaderPropertyID._SpecTex, Main_Plugin.warpArmsSpec);
            };

            bool usingHardRecipe = Main_Plugin.UseHardRecipe.Value;

            prefab.SetGameObject(cloneTemplate);
            prefab.SetUnlock(TechType.Warper).WithAnalysisTech(null);
            prefab.SetEquipment(EquipmentType.Body);       
            
            prefab.SetRecipe(Main_Plugin.UseHardRecipe.Value ? Main_Plugin.hardSuitRecipe : Main_Plugin.easySuitRecipe)
                .WithFabricatorType(CraftTree.Type.Workbench)
                .WithStepsToFabricatorTab("ModdedWorkbench")
                .WithCraftingTime(6f);

            prefab.SetPdaGroupCategory(TechGroup.Workbench, TechCategory.Workbench);

            prefab.Register();
        }
    }
}
