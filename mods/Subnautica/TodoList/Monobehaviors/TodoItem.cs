using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

namespace TodoList.Monobehaviors
{
    public class TodoItem : MonoBehaviour
    {
        public static List<TodoItem> todoItems = new();

        public TodoInputField todoInputField;
        public Toggle toggle;

        public Color hintCheckmarkColor;
        public Color normalCheckmarkColor;
        public Image backgroundImage;
        public Image checkmarkBox;
        public Image checkmarkCheck;

        public bool isHintItem { get; private set; }
        public string hintCompleteKey { get; private set; }
        public Main_Plugin.EntryInfo entryInfo { get; private set; }

        private bool isModified;
        private bool ignoreInitialTextSet;
        private string localizationKey;

        public ItemSaveData SaveData
        {
            get
            {
                return new(isModified, IsCompleted, isHintItem, new(ItemText, entryInfo.completeKey, entryInfo.localized, localizationKey));
            }
            set
            {
                ItemText = value.entryInfo.entry;
                IsCompleted = value.isCompleted;
            }
        }

        public string ItemText
        {
            get
            {
                return todoInputField.inputField.text;
            }
            set
            {
                todoInputField.inputField.text = value;
            }
        }

        public bool IsCompleted
        {
            get
            {
                return toggle.isOn;
            }
            set
            {
                todoInputField.OnToggleChanged(value);
                toggle.isOn = value;
            }
        }

        private void Start()
        {
            toggle.onValueChanged.AddListener((bool val) => todoInputField.OnToggleChanged(val));
            todoInputField = GetComponentInChildren<TodoInputField>();
            toggle = GetComponentInChildren<Toggle>();
        }

        public void SetEntryInfo(Main_Plugin.EntryInfo entryInfo, bool modified = false)
        {
            this.entryInfo = entryInfo;
            hintCompleteKey = entryInfo.completeKey;
            localizationKey = entryInfo.localizationKey;

            string text = entryInfo.entry;
            if (entryInfo.localized && !modified)
            {
                // text = Language.main.Get(entryInfo.localizationKey);
                text = LocalizationUtils.GetValue(entryInfo.localizationKey);
                Console.WriteLine($"localizationUtils -> '{entryInfo.localizationKey}' : '{text}'");
                ignoreInitialTextSet = true;
            }
            ItemText = text;
        }

        public void SetIsHintItem(bool isHintItem)
        {
            this.isHintItem = isHintItem;
            Color checkboxColor = isHintItem ? hintCheckmarkColor : normalCheckmarkColor;
            backgroundImage.color = isHintItem ? hintCheckmarkColor : Color.white;
            checkmarkBox.color = checkboxColor;
            checkmarkCheck.color = checkboxColor;
        }

        public void DeleteItem()
        {
            Destroy(gameObject);
        }

        public void OnInputChanged()
        {
            entryInfo.SetEntry(ItemText);
            if(ignoreInitialTextSet)
            {
                ignoreInitialTextSet = false;
                return;
            }

            isModified = true;
        }

        private void OnEnable()
        {
            if (!todoItems.Contains(this))
            {
                todoItems.Add(this);
            }
        }

        private void OnDisable()
        {
            if (todoItems.Contains(this))
            {
                todoItems.Remove(this);
            }
        }

        private void OnDestroy()
        {
            if (todoItems.Contains(this))
            {
                todoItems.Remove(this);
            }
        }
    }
}
