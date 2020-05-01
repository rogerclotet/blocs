using UnityEngine;

public class ApplyPrimaryColor : ApplyColor
{
    public override Color color()
    {
        return ThemeManager.instance.Current.Primary;
    }
}
