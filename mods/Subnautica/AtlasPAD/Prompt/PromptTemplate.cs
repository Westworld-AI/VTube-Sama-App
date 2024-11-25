using System;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
using IndigocoderLib;

namespace AtlasPAD.Prompt
{
    public enum PromptKeys
    {
        ScanPrompt,
        // 未来可以添加更多的提示键
    }

    public class PromptTemplate
    {
        public string Template { get; private set; }

        public PromptTemplate(string template)
        {
            Template = template;
        }

        public string BuildPrompt(params (string key, string value)[] parameters)
        {
            string prompt = Template;
            foreach (var param in parameters)
            {
                prompt = prompt.Replace($"{{{param.key}}}", param.value);
            }

            return prompt;
        }
    }

    public static class PromptTemplates
    {
        private static readonly Dictionary<string, object> _promptConfig = LoadPromptConfig();

        private static Dictionary<string, object> LoadPromptConfig()
        {
            var promptConfigFilePath = Path.Combine(Plugin.ClientConfigPath, "prompts.json");   
            var jsonConfigUtils = new JsonConfigUtils();
            try
            {
                return jsonConfigUtils.ReadJsonConfig(promptConfigFilePath);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to load prompt config: {ex.Message}");
                return new Dictionary<string, object>(); // Return an empty dictionary on failure
            }
        }

        public static PromptTemplate GetPrompt(PromptKeys key) =>
            new PromptTemplate(GetPromptConfig().ContainsKey(key.ToString())
                ? GetPromptConfig()[key.ToString()].ToString()
                : string.Empty);

        public static PromptTemplate ScanPrompt => GetPrompt(PromptKeys.ScanPrompt);

        public static Dictionary<string, object> GetPromptConfig()
        {
            return _promptConfig;
        }
    }
}