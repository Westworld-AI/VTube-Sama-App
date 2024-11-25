using Nautilus.Handlers;
using Nautilus.Options;

namespace ImprovedGravTrap
{
    internal class Options : ModOptions
    {
        public Options() : base("Todo List Options")
        {
            OptionsPanelHandler.RegisterModOptions(this);

            
        }
    }
}
