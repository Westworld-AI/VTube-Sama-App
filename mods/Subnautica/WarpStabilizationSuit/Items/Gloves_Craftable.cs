using Nautilus.Assets;
using Nautilus.Assets.Gadgets;
using Nautilus.Assets.PrefabTemplates;
using UnityEngine;
using IndigocoderLib;
using Nautilus.Utility;
using Nautilus.Handlers;

namespace WarpStabilizationSuit.Items
{
    internal static class Gloves_Craftable
    {
        public static TechType techType { get; private set; }

        public static void Patch()
        {
            Atlas.Sprite sprite = ImageHelper.GetSpriteFromAssetsFolder("WarpStabilizationGloves.png", Main_Plugin.AssetsFolderPath);

            PrefabInfo prefabInfo = PrefabInfo.WithTechType("WarpStabilizationGloves", "Warp Stabilization Gloves", "Protects you from being displaced by teleportation technology. Works with the Warp Stabilization Suit")
                .WithIcon(sprite)
                .WithSizeInInventory(new Vector2int(2, 2));

            techType = prefabInfo.TechType;

            var prefab = new CustomPrefab(prefabInfo);

            CloneTemplate cloneTemplate = new CloneTemplate(prefabInfo, TechType.ReinforcedGloves);
            cloneTemplate.ModifyPrefab += gameObject =>
            {
                Renderer renderer = gameObject.GetComponentInChildren<Renderer>();
                renderer.material.SetTexture("_MainTex", Main_Plugin.warpArmsMain);
                renderer.material.SetTexture(ShaderPropertyID._SpecTex, Main_Plugin.warpArmsSpec);
            };

            prefab.SetGameObject(cloneTemplate);
            prefab.SetEquipment(EquipmentType.Gloves);

            prefab.Register();
        }
    }
}
