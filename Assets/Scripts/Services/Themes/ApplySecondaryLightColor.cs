using UnityEngine;

public class ApplySecondaryLightColor : ApplyColor
{
    public override Color color()
    {
        return ThemeManager.instance.Current.SecondaryLight;
    }
}
