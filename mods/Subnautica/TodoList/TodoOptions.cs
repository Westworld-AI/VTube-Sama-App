using Nautilus.Handlers;
using Nautilus.Options;

namespace TodoList
{
    internal class TodoOptions : ModOptions
    {
        public TodoOptions() : base("Todo List Options")
        {
            OptionsPanelHandler.RegisterModOptions(this);

            var generateHintsOption = Main_Plugin.CreateHintTodoItems.ToModToggleOption();
            generateHintsOption.OnChanged += (object _, ToggleChangedEventArgs args) => Main_Plugin.CreateHintTodoItems.Value = args.Value;
            AddItem(generateHintsOption);
        }
    }
}
