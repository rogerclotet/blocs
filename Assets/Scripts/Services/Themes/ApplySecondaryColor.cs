using UnityEngine;
using UnityEngine.UI;

public class ApplySecondaryColor : ApplyColor
{
    public override Color color()
    {
        return ThemeManager.instance.Current.Secondary;
    }
}
