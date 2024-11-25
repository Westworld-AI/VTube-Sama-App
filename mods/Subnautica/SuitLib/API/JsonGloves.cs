using Nautilus.Utility;
using System.Collections.Generic;
using static SuitLib.ModdedSuitsManager;
using UnityEngine;
using System.IO;

namespace SuitLib.API
{
    internal class JsonGloves
    {
        public Dictionary<string, string> gloveTexturePairs;
        public VanillaModel vanillaModel;
        public Modifications modifications;
        public StillsuitValues stillsuitValues;

        public JsonGloves(Dictionary<string, string> gloveFileNamePairs, VanillaModel vanillaModel, Modifications modifications, StillsuitValues stillsuitValues)
        {
            this.gloveTexturePairs = gloveFileNamePairs;
            this.vanillaModel = vanillaModel;
            this.modifications = modifications;
            this.stillsuitValues = stillsuitValues;
        }
    }
}
