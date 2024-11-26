using System.Collections.Generic;
using UnityEngine;
using static SuitLib.ModdedSuitsManager;

namespace SuitLib
{
    public class ModdedSuit
    {
        public Dictionary<string, Texture2D> suitReplacementTexturePropertyPairs;
        public Dictionary<string, Texture2D> armsReplacementTexturePropertyPairs;
        public VanillaModel vanillaModel;
        public TechType itemTechType;
        public Modifications modifications;
        public StillsuitValues stillsuitValues;
        public float tempValue;
        public bool jsonSuit;

        /// <param name="suitReplacementTexturePropertyPairs">The texture name (like _MainTex) and the texture pairs for the suit (not the arms!)</param>
        /// <param name="vanillaModel">The tech type for the suit you're replacing (like reinforcedSuit)</param>
        /// <param name="itemTechType">The tech type of the moddedsuit</param>
        /// <param name="tempValue">The temperature damage reduction for this suit</param>
        public ModdedSuit(Dictionary<string, Texture2D> suitReplacementTexturePropertyPairs, Dictionary<string, Texture2D> armsReplacementTexturePropertyPairs, 
            VanillaModel vanillaModel, TechType itemTechType, float tempValue = 15)
        {
            this.suitReplacementTexturePropertyPairs = suitReplacementTexturePropertyPairs;
            this.armsReplacementTexturePropertyPairs = armsReplacementTexturePropertyPairs;
            this.vanillaModel = vanillaModel;
            this.itemTechType = itemTechType;
            this.tempValue = tempValue;
        }

        public ModdedSuit(Dictionary<string, Texture2D> suitReplacementTexturePropertyPairs, Dictionary<string, Texture2D> armsReplacementTexturePropertyPairs,
            VanillaModel vanillaModel, TechType itemTechType, Modifications modifications, StillsuitValues modificationValues = null, float tempValue = 15)
        {
            this.suitReplacementTexturePropertyPairs = suitReplacementTexturePropertyPairs;
            this.armsReplacementTexturePropertyPairs = armsReplacementTexturePropertyPairs;
            this.vanillaModel = vanillaModel;
            this.itemTechType = itemTechType;
            this.modifications = modifications;
            this.stillsuitValues = modificationValues;
            this.tempValue = tempValue;
        }

        public ModdedSuit(ModdedSuit copyFrom)
        {
            this.suitReplacementTexturePropertyPairs = copyFrom.suitReplacementTexturePropertyPairs;
            this.armsReplacementTexturePropertyPairs = copyFrom.armsReplacementTexturePropertyPairs;
            this.vanillaModel = copyFrom.vanillaModel;
            this.itemTechType = copyFrom.itemTechType;
            this.modifications = copyFrom.modifications;
            this.stillsuitValues = copyFrom.stillsuitValues;
            this.tempValue = copyFrom.tempValue;
            this.jsonSuit = copyFrom.jsonSuit;
        }
    }
}
