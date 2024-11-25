using System.Collections.Generic;
using UnityEngine;
using static SuitLib.ModdedSuitsManager;

namespace SuitLib
{
    public class ModdedGloves
    {
        public Dictionary<string, Texture2D> replacementTexturePropertyPairs;
        public VanillaModel vanillaModel;
        public TechType itemTechType;
        public Modifications modifications;
        public StillsuitValues stillsuitValues;
        public float tempValue;
        public bool jsonGloves;

        /// <param name="replacementTexturePropertyPairs">The texture name (like _MainTex) and the texture pairs</param>
        /// <param name="vanillaModel">The tech type for the gloves model you're replacing (like reinforcedGloves)</param>
        /// <param name="itemTechType">The tech type of the moddedsuit</param>
        /// <param name="tempValue">The temperature damage reduction for these gloves</param>
        public ModdedGloves(Dictionary<string, Texture2D> replacementTexturePropertyPairs, VanillaModel vanillaModel, TechType itemTechType, float tempValue = 6f)
        {
            this.replacementTexturePropertyPairs = replacementTexturePropertyPairs;
            this.vanillaModel = vanillaModel;
            this.itemTechType = itemTechType;
            this.tempValue = tempValue;
        }

        public ModdedGloves(Dictionary<string, Texture2D> replacementTexturePropertyPairs, VanillaModel vanillaModel, TechType itemTechType,
            Modifications modifications, StillsuitValues stillsuitValues = null, float tempValue = 6f)
        {
            this.replacementTexturePropertyPairs = replacementTexturePropertyPairs;
            this.vanillaModel = vanillaModel;
            this.itemTechType = itemTechType;
            this.modifications = modifications;
            this.stillsuitValues = stillsuitValues;
            this.tempValue = tempValue;
        }

        public ModdedGloves(ModdedGloves copyFrom)
        {
            this.replacementTexturePropertyPairs = copyFrom.replacementTexturePropertyPairs;
            this.vanillaModel = copyFrom.vanillaModel;
            this.itemTechType = copyFrom.itemTechType;
            this.modifications = copyFrom.modifications;
            this.stillsuitValues = copyFrom.stillsuitValues;
            this.tempValue = copyFrom.tempValue;
            this.jsonGloves = copyFrom.jsonGloves;
        }
    }
}
