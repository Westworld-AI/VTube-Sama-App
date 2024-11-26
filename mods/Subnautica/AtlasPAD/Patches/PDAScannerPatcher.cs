using HarmonyLib;
using System.Linq;
using AtlasPAD.client;
using AtlasPAD.Prompt;

namespace AtlasPAD.Patches
{
    [HarmonyPatch(typeof(PDAScanner))]
    internal class PDAScannerPatcher
    {
        
        [HarmonyPatch(nameof(PDAScanner.Initialize)), HarmonyPostfix]
        public static void Initialize_Postfix(PDAData pdaData)
        {
            Plugin.Logger.LogInfo("PDAScannerPatcher => Initializing PDA Scanner");
            PDAScanner.onAdd += new PDAScanner.OnEntryEvent(UnlockSuitOnScan);;
        }

        protected static async void UnlockSuitOnScan(PDAScanner.Entry entry)
        {
            TechType key = entry.techType; // 获取技术类型
            
            // 尝试从映射中获取条目数据
            if (PDAScanner.mapping.TryGetValue(key, out PDAScanner.EntryData entryData))
            {
                string encyclopedia = entryData.encyclopedia; // 获取百科全书条目
                if (string.IsNullOrEmpty(encyclopedia))
                {
                    return; // 如果条目为空，则返回
                }

                // 获取标题和描述
                var title = Language.main.Get($"Ency_{encyclopedia}");
                var desc = Language.main.Get($"EncyDesc_{encyclopedia}");

                // 格式化标题和描述
                string formattedTitle = System.Text.Encoding.UTF8.GetString(System.Text.Encoding.Default.GetBytes(title));
                string formattedDesc = System.Text.Encoding.UTF8.GetString(System.Text.Encoding.Default.GetBytes(desc));

                // 记录日志信息
                Plugin.Logger.LogInfo($"PDAScannerPatcher =>  PDA Scanner TechType:{key}  encyclopedia:{encyclopedia}");

                // 构建提示信息并发送
                string promptTemplate = PromptTemplates.ScanPrompt.Template;
                string prompt = new PromptTemplate(promptTemplate).BuildPrompt(
                    ("title", formattedTitle),
                    ("desc", formattedDesc)
                );
                Plugin.Logger.LogInfo($"ScanPrompt => {prompt}");
                await VtuberSamaClient.SendMessageAsync(prompt); // 发送提示信息
            }
            else
            {
                // 如果未找到条目数据，记录警告
                Plugin.Logger.LogWarning($"EntryData not found for TechType: {key}");
            }
        }
    }
}