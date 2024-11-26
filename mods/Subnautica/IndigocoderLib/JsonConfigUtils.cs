using System;
using System.Collections.Generic;
using System.IO;
using Newtonsoft.Json; // 确保你安装了 Newtonsoft.Json 包

namespace IndigocoderLib
{
    public class JsonConfigUtils
    {
        public Dictionary<string, object> ReadJsonConfig(string filePath)
        {
            if (!File.Exists(filePath))
            {
                throw new FileNotFoundException($"The specified file does not exist: {filePath}");
            }

            try
            {
                // 读取文件内容
                var jsonContent = File.ReadAllText(filePath);
                // 反序列化为字典
                var configData = JsonConvert.DeserializeObject<Dictionary<string, object>>(jsonContent);
                return configData;
            }
            catch (Exception ex)
            {
                throw new Exception("Error reading JSON config file", ex);
            }
        }
    }
}
