using Nautilus.Crafting;
using Nautilus.Handlers;
using System;
using System.Collections;
using System.Collections.Generic;
using static CraftData;
using UnityEngine;
using UWE;
using System.IO;
using System.Reflection;

namespace IndigocoderLib
{
    public static class PiracyDetector
    {
        public static readonly HashSet<string> PiracyFiles = new HashSet<string> { "steam_api64.cdx", "steam_api64.ini", "steam_emu.ini", "valve.ini", "chuj.cdx", "SteamUserID.cfg", "Achievements.bin", "steam_settings", "user_steam_id.txt", "account_name.txt", "ScreamAPI.dll", "ScreamAPI32.dll", "ScreamAPI64.dll", "SmokeAPI.dll", "SmokeAPI32.dll", "SmokeAPI64.dll", "Free Steam Games Pre-installed for PC.url", "Torrent-Igruha.Org.URL", "oalinst.exe", };

        public static bool TryFindPiracy()
        {
            foreach (var file in PiracyFiles)
            {
                if (File.Exists(Path.Combine(Environment.CurrentDirectory, file)))
                {
                    Console.WriteLine($"{Assembly.GetExecutingAssembly().GetName()} does not support piracy!");
                    ErrorMessage.AddError($"{Assembly.GetExecutingAssembly().GetName()} does not support piracy!");
                    Console.WriteLine("You can purchase the game at discounted prices here: https://isthereanydeal.com/game/subnautica/info/");
                    ErrorMessage.AddError("You can purchase the game at discounted prices here https://isthereanydeal.com/game/subnautica/info/");
                    return true;
                }
            }

            return false;
        }
    }
}
