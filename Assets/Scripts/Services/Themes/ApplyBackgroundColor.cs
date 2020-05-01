using UnityEngine;
using UnityEngine.UI;

public class ApplyBackgroundColor : ApplyColor
{
    public override Color color()
    {
        return ThemeManager.instance.Current.Background;
    }
}
