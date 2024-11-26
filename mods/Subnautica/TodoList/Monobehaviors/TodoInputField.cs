using TMPro;
using UnityEngine;

namespace TodoList.Monobehaviors
{
    public class TodoInputField : MonoBehaviour
    {
        private const float ALPHA_TRANSITION_SPEED = 12f;

        public TMP_InputField inputField;

        private TextMeshProUGUI text;
        private bool wasFocusedLastFrame;

        private CanvasGroup canvasGroup;
        private float targetAlpha = 1f;

        private void Start()
        {
            inputField = GetComponent<TMP_InputField>();
            canvasGroup = GetComponent<CanvasGroup>();
            text = (TextMeshProUGUI)inputField.textComponent;
        }

        private void Update()
        {
            if (inputField.isFocused != wasFocusedLastFrame)
            {
                FPSInputModule.current.lockMovement = inputField.isFocused;
            }

            wasFocusedLastFrame = inputField.isFocused;

            canvasGroup.alpha = Mathf.Lerp(canvasGroup.alpha, targetAlpha, Time.deltaTime * ALPHA_TRANSITION_SPEED);
        }

        public void OnToggleChanged(bool value)
        {
            inputField.interactable = !value;
            targetAlpha = value ? 0.2f : 1f;
        }
    }
}
