using Nautilus.Utility;
using TMPro;
using UnityEngine;

namespace TodoList.Monobehaviors
{
    [RequireComponent(typeof(TextMeshProUGUI))]
    internal class ApplySNFont : MonoBehaviour
    {
        private void Start()
        {
            GetComponent<TextMeshProUGUI>().font = FontUtils.Aller_Rg;
        }
    }
}
