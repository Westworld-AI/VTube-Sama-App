using Nautilus.Json;
using Nautilus.Json.Attributes;
using System;
using System.Collections.Generic;
using TodoList.Monobehaviors;
using static TodoList.Main_Plugin;

namespace TodoList
{
    [Serializable]
    public struct ItemSaveData
    {
        public bool isCompleted;
        public bool isHint;
        public bool isModified;
        public EntryInfo entryInfo;

        public ItemSaveData(bool isModified, bool isCompleted, bool isHint, EntryInfo entryInfo)
        {
            this.isModified = isModified;
            this.isCompleted = isCompleted;
            this.isHint = isHint;
            this.entryInfo = entryInfo;
        }
    }

    [FileName("TodoListSaveData")]
    public class TodoListSaveData : SaveDataCache
    {
        public List<ItemSaveData> saveData = new();

        public TodoListSaveData()
        {
            OnStartedSaving += (_, __) =>
            {
                List<ItemSaveData> data = new();
                foreach (var item in TodoItem.todoItems)
                {
                    data.Add(item.SaveData);
                }

                saveData = data;
            };
        }
    }
}
