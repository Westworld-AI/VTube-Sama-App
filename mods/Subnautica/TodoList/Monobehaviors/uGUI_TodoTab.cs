using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using TMPro;
using UnityEngine;
using UnityEngine.UI;

namespace TodoList.Monobehaviors
{
    public class uGUI_TodoTab : uGUI_PDATab, uGUI_IScrollReceiver
    {
        public static uGUI_TodoTab Instance
        {
            get
            {
                return _instance;
            }
            set
            {
                if (_instance != null && value != null)
                {
                    Main_Plugin.logger.LogError($"More than 1 uGUI_TodoTab in the scene! Attempted to set {value} to _Instance");
                    return;
                }

                _instance = value;
            }
        }

        private static uGUI_TodoTab _instance;

        private CanvasGroup content;
        private ScrollRect scrollRect;
        private Transform scrollCanvas;

        new private void Awake()
        {
            content = GetComponentInChildren<CanvasGroup>();
            scrollRect = transform.Find("Content/ScrollView").GetComponent<ScrollRect>();
            scrollCanvas = scrollRect.transform.Find("Viewport/ScrollCanvas");
            scrollRect.enabled = true;

            Instance = this;
        }

        private void Start()
        {
            InitVerticalLayoutGroup();

            GameObject label = transform.Find("Content/LogLabel").gameObject;
            label.name = "TodoLabel";
            // label.GetComponent<TextMeshProUGUI>().text = Language.main.Get("TODO_Header");
            var todeHeaderText = LocalizationUtils.GetValue( "TODO_Header");
            label.GetComponentInChildren<TextMeshProUGUI>().text =  todeHeaderText;


            GetComponentInChildren<RectMask2D>().enabled = true;

            UpdateViewportSize();
            SpawnNewItemButton();
            SpawnClearItemsButton();
        }

        private void InitVerticalLayoutGroup()
        {
            var verticalLayout = scrollCanvas.GetComponent<VerticalLayoutGroup>();
            verticalLayout.padding.top = 0;
            verticalLayout.spacing = 5;
            verticalLayout.childControlWidth = false;
            verticalLayout.childForceExpandWidth = false;
            verticalLayout.childScaleWidth = false;
            verticalLayout.enabled = false;
            verticalLayout.enabled = true;
        }

        private void UpdateViewportSize()
        {
            var viewportRect = scrollRect.transform.Find("Viewport").GetComponent<RectTransform>();
            viewportRect.offsetMax = new Vector2(-30f, -80f);
            viewportRect.offsetMin = new Vector2(17.25f, 0f);
            viewportRect.sizeDelta = new Vector2(0, -100);
        }

        private void SpawnNewItemButton()
        {
            GameObject newItemButton = Main_Plugin.AssetBundle.LoadAsset<GameObject>("AddNewItemButton");
            RectTransform newItemButtonRect = Instantiate(newItemButton, content.transform).GetComponent<RectTransform>();
            newItemButtonRect.localPosition = new Vector3(-386f, 241f, 5.94f);
            newItemButtonRect.GetComponent<Button>().onClick.AddListener(() => CreateNewItem());
        }

        private void SpawnClearItemsButton()
        {
            GameObject clearItemsButton = Main_Plugin.AssetBundle.LoadAsset<GameObject>("ClearCompletedItemsButton");
            RectTransform clearItemsButtonRect = Instantiate(clearItemsButton, content.transform).GetComponent<RectTransform>();
            clearItemsButtonRect.localPosition = new Vector3(350f, 241f, 5.94f);
            clearItemsButtonRect.GetComponent<Button>().onClick.AddListener(() => ClearCompletedItems());
        }
        
        public override void Open()
        {
            content.SetVisible(true);
        }

        public override void Close()
        {
            scrollRect.velocity = Vector2.zero;
            content.SetVisible(false);
        }

        public bool OnScroll(float scrollDelta, float speedMultiplier)
        {
            scrollRect.Scroll(scrollDelta, speedMultiplier);
            return true;
        }

        public void LoadSavedItems()
        {
            foreach (ItemSaveData saveData in Main_Plugin.SaveData.saveData)
            {
                GameObject newItem = CreateNewItem();
                var todoItem = newItem.GetComponent<TodoItem>();
                todoItem.SaveData = saveData;
                todoItem.SetEntryInfo(saveData.entryInfo, saveData.isModified);
                todoItem.SetIsHintItem(saveData.isHint);
            }
        }

        public GameObject CreateNewItem()
        {
            return Instantiate(Main_Plugin.NewItemPrefab, scrollCanvas);
        }

        public GameObject CreateNewItem(Main_Plugin.EntryInfo entryInfo, bool isHintItem)
        {
            GameObject newItem = CreateNewItem();
            var todoItem = newItem.GetComponent<TodoItem>();
            todoItem.SetEntryInfo(entryInfo);
            todoItem.SetIsHintItem(isHintItem);

            if (isHintItem)
            {
                SortTodoItems();
            }

            return newItem;
        }

        public void CreateNewItems(Main_Plugin.EntryInfo[] entryInfos, bool areHintItems = false)
        {
            foreach (var entryInfo in entryInfos)
            {
                GameObject newItem = CreateNewItem(entryInfo, areHintItems);
            }
        }

        public static void RegisterStoryGoalEntry(Main_Plugin.StoryGoalTodoEntry entry)
        {
            Main_Plugin.StoryGoalTodoEntries.Add(entry);
        }

        public static bool RemoveStoryGoalEntry(Main_Plugin.StoryGoalTodoEntry entry)
        {
            return Main_Plugin.StoryGoalTodoEntries.Remove(entry);
        }

        private void ClearCompletedItems()
        {
            List<TodoItem> checkedInputFields = TodoItem.todoItems.Where(i => i.IsCompleted).ToList();
            for (int i = checkedInputFields.Count - 1; i >= 0; i--)
            {
                Destroy(checkedInputFields[i].gameObject);
            }
        }

        public bool CompleteTodoItem(Main_Plugin.EntryInfo entryInfo)
        {
            TodoItem item = TodoItem.todoItems.FirstOrDefault(i => i.entryInfo.completeKey == entryInfo.completeKey);
            if (item == null) return false;

            Destroy(item.gameObject);
            return true;
        }

        private void SortTodoItems()
        {
            int sortedHintItemIndex = 0;
            int unsortedHintItemIndex = TodoItem.todoItems.Count - 1;

            foreach (var item in TodoItem.todoItems)
            {
                if (item.isHintItem)
                {
                    item.transform.SetSiblingIndex(sortedHintItemIndex);
                    sortedHintItemIndex++;
                }
                else
                {
                    item.transform.SetSiblingIndex(unsortedHintItemIndex);
                    unsortedHintItemIndex--;
                }
            }
        }

        private void OnDestroy()
        {
            Instance = null;
        }
    }
}
