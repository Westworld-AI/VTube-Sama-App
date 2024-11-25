using System;
using UnityEngine;

namespace SuitLib
{
    public static class PrefabComponentAssigner
    {
        public static void EnsureStillsuitConfigured(ref GameObject prefab)
        {
            Stillsuit suit = prefab.EnsureComponent<Stillsuit>();
            suit.waterPrefab = Main.waterPefab;
        }

        [Obsolete("This method is not implemented as of now. It will be added once the Deathrun API is released")]
        public static void EnsureDeathrunComponent(ref GameObject prefab)
        {

        }
    }
}
