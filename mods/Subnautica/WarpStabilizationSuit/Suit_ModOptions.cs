using Nautilus.Crafting;
using Nautilus.Handlers;
using Nautilus.Options;
using WarpStabilizationSuit.Items;
using static CraftData;

namespace WarpStabilizationSuit
{
    internal class Suit_ModOptions : ModOptions
    {
        public Suit_ModOptions() : base("Warp Stabilization Suit Options")
        {
            OptionsPanelHandler.RegisterModOptions(this);

            var harderRecipeOption = Main_Plugin.UseHardRecipe.ToModToggleOption();
            harderRecipeOption.OnChanged += OnHarderRecipeOptionChanged;
            AddItem(harderRecipeOption);
        }

        private void OnHarderRecipeOptionChanged(object sender, ToggleChangedEventArgs e)
        {
            Main_Plugin.UseHardRecipe.Value = e.Value;
            RecipeData recipe = e.Value ? Main_Plugin.hardSuitRecipe : Main_Plugin.easySuitRecipe;
            CraftDataHandler.SetRecipeData(Suit_Craftable.techType, recipe);
        }
    }
}
