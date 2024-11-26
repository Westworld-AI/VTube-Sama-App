using Nautilus.Utility;
using Newtonsoft.Json;
using System.Collections.Generic;
using static SuitLib.ModdedSuitsManager;
using UnityEngine;
using System.IO;

namespace SuitLib.API
{
    internal class JsonSuit
    {
        public Dictionary<string, string> suitFileNamePairs;
        public Dictionary<string, string> armFileNamePairs;
        public VanillaModel vanillaModel;
        public Modifications modifications;
        public StillsuitValues stillsuitValues;

        public JsonSuit(Dictionary<string, string> suitFileNamePairs, Dictionary<string, string> armFileNamePairs,
            VanillaModel vanillaModel, Modifications modifications, StillsuitValues stillsuitValues)
        {
            this.suitFileNamePairs = suitFileNamePairs;
            this.armFileNamePairs = armFileNamePairs;
            this.vanillaModel = vanillaModel;
            this.modifications = modifications;
            this.stillsuitValues = stillsuitValues;
        }
    }
}
