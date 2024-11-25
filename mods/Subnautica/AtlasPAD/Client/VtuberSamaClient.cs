using System;
using System.Collections.Generic;
using System.IO;
using System.Net.Http;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using IndigocoderLib;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace AtlasPAD.client;

public class VtuberSamaClient
{
    private static readonly HttpClient Client = new HttpClient();
    private static readonly Dictionary<string, object> ClientConfig = LoadClientConfig();
    private static Dictionary<string, object> LoadClientConfig()
    {
        var clientConfigFilePath = Path.Combine(Plugin.ClientConfigPath, "client.json");
        try
        {
            var jsonConfigUtils = new JsonConfigUtils();
            var config = jsonConfigUtils.ReadJsonConfig(clientConfigFilePath);
            return config;
        }
        catch (Exception ex)
        {
            Plugin.Logger.LogInfo($"Failed to load client config: {ex.Message}");
            return new Dictionary<string, object>(); // Return an empty dictionary on failure
        }
    }
    
    
    private static string GetBaseUrl()
    {
        if (ClientConfig.TryGetValue("vtuberSamaClient", out var vtuberConfig))
        {
            if (vtuberConfig is JObject configObject)
            {
                var baseUrlToken = configObject.SelectToken("baseUrl");
                if (baseUrlToken != null && baseUrlToken.Type == JTokenType.String)
                {
                    var url = baseUrlToken.ToString();
                    if (!string.IsNullOrWhiteSpace(url))
                    {
                        return url; // 返回有效的 baseUrl
                    }
                }
            }
        }
        return string.Empty; // 返回空字符串以指示未找到有效的 baseUrl
    }


    public async static Task<string> SendMessageAsync(string msg)
    {
        if (string.IsNullOrEmpty(msg))
        {
            throw new ArgumentException("Message cannot be null or empty.", nameof(msg));
        }

        string jsonBody = JsonConvert.SerializeObject(new { msg });
        string baseUrl = GetBaseUrl();
        if (string.IsNullOrEmpty(baseUrl))
        {
            throw new InvalidOperationException("Base URL is not configured.");
        }

        using var content = new StringContent(jsonBody, Encoding.UTF8, "application/json");
        using HttpResponseMessage response = await Client.PostAsync($"{baseUrl}/game/message", content);
        response.EnsureSuccessStatusCode(); // Ensure the response status is successful

        return await response.Content.ReadAsStringAsync();
    }
}
