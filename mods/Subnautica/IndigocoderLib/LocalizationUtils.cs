using System;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
using Newtonsoft.Json;

public static class LocalizationUtils
{
    private static readonly Dictionary<string, Dictionary<string, string>> _localizationData = new();

    static LocalizationUtils()
    {
        LoadLocalizationFiles();
    }

    private static void LoadLocalizationFiles()
    {
        var path =  Path.Combine(Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location), "Localization");
        if (!Directory.Exists(path))
        {
             Console.WriteLine($"Localization - Directory '{path}' does not exist. Skipping localization registration.");
            return;
        }

        foreach (var file in Directory.GetFiles(path))
        {
            if (Path.GetExtension(file) != ".json")
            {
                continue;
            }

            Dictionary<string, string> content = null;
            try
            {
                content = JsonConvert.DeserializeObject<Dictionary<string, string>>(File.ReadAllText(file));
                 Console.WriteLine($"Localization - Location JSON: '{content}'");
            }
            catch (Exception e)
            {
                 Console.WriteLine($"Localization - Exception caught while trying to deserialize localization file at path: '{file}'. Exception: {e}");
            }

            if (content is null)
            {
                 Console.WriteLine($"Localization - Localization file '{file}' is empty, skipping registration.");
                continue;
            }

            var languageName = Path.GetFileNameWithoutExtension(file);
            _localizationData[languageName] = content;
             Console.WriteLine($"Localization - languageName: '{languageName}'.");
        }
    }

    public static string GetValue(string languageName, string key)
    {
        if (_localizationData.TryGetValue(languageName, out var content) && content.TryGetValue(key, out var value))
        {
            return value;
        }
        Console.WriteLine($"Localization - Key '{key}' not found for language '{languageName}'.");
        return null;
    }
    
    public static string GetValue(string key)
    {
        return GetValue(Language.main.GetCurrentLanguage(), key);
    }
}
