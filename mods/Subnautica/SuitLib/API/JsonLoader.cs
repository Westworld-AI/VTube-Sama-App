using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;

namespace SuitLib.API
{
    internal static class JsonLoader<T>
    {
        public static List<T> LoadJsons(string folderPath)
        {
            List<T> configDatas = new List<T>();
            foreach (string file in Directory.EnumerateFiles(folderPath, "*.json"))
            {
                List<T> tempData = new List<T>();
                try
                {
                    tempData = LoadJson(file);
                }
                catch (Exception e)
                {
                    Main.logger.LogError($"Error loading JSON at {file} \nMessage is: {e.Message}");
                }

                configDatas.AddRange(tempData);
            }

            return configDatas;
        }

        public static List<T> LoadJson(string filePath)
        {
            if (!File.Exists(filePath))
            {
                return null;
            }

            string data = File.ReadAllText(filePath);
            try
            {
                List<T> List = JsonConvert.DeserializeObject<List<T>>(data);
                return List;
            }
            catch
            {
                return null;
            }
        }

        public static void SaveToJson(List<T> saveData, string filePath)
        {
            var textureConfigJson = JsonConvert.SerializeObject(saveData, Formatting.Indented);
            File.WriteAllText(filePath, textureConfigJson);
        }
    }
}
