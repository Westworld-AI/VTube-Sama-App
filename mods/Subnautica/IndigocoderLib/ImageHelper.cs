using Nautilus.Utility;
using System.IO;
using System.Reflection;
using UnityEngine;

namespace IndigocoderLib
{
    public static class ImageHelper
    {
        public static Sprite SpriteFromAtlasSprite(Atlas.Sprite atlasSprite)
        {
            Rect rect = new Rect(0, 0, atlasSprite.texture.width, atlasSprite.texture.height);
            Vector2 pivot = new Vector2(atlasSprite.texture.width / 2, atlasSprite.texture.height / 2);
            return Sprite.Create(atlasSprite.texture, rect, pivot);
        }

        public static Atlas.Sprite GetSpriteFromAssetsFolder(string imageName, string asetFolderPath = null)
        {
            string spriteFilePath = "";
            if (!string.IsNullOrEmpty(asetFolderPath))
            {
                spriteFilePath = Path.Combine(asetFolderPath + $"/{imageName}");
            }
            else
            {
                spriteFilePath = Path.Combine(Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location), "Assets") + $"/{imageName}";
            }
            return ImageUtils.LoadSpriteFromFile(spriteFilePath);
        }
    }
}