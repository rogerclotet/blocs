using UnityEngine;

public class ApplyPrimaryDarkColor : ApplyColor
{
    public override Color color()
    {
        return ThemeManager.instance.Current.PrimaryDark;
    }
}
