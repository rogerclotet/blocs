#if UNITY_EDITOR
using UnityEditor;
using UnityEditor.Android;
using UnityEditor.Build;
using UnityEngine;

[InitializeOnLoad]
public static class AndroidAdaptiveIconSetup
{
    const string ForegroundPath = "Assets/Icons/adaptive-foreground.png";
    const string BackgroundPath = "Assets/Icons/adaptive-background.png";
    const string LegacyPath = "Assets/Icons/legacy-icon-192.png";
    const string RoundPath = "Assets/Icons/round-icon-192.png";
    const string DefaultPath = "Assets/Icons/default-icon-512.png";

    static AndroidAdaptiveIconSetup()
    {
        EditorApplication.delayCall += TryConfigureIcons;
    }

    [MenuItem("Blocs/Configure Android Adaptive Icons")]
    public static void ConfigureIconsFromMenu()
    {
        TryConfigureIcons();
    }

    static void TryConfigureIcons()
    {
        var foreground = AssetDatabase.LoadAssetAtPath<Texture2D>(ForegroundPath);
        var background = AssetDatabase.LoadAssetAtPath<Texture2D>(BackgroundPath);
        var legacy = AssetDatabase.LoadAssetAtPath<Texture2D>(LegacyPath);
        var round = AssetDatabase.LoadAssetAtPath<Texture2D>(RoundPath);
        var defaultIcon = AssetDatabase.LoadAssetAtPath<Texture2D>(DefaultPath);

        if (foreground == null || background == null || legacy == null || round == null || defaultIcon == null)
        {
            return;
        }

        ConfigureAdaptiveIcons(background, foreground);
        ConfigureSingleLayerIcons(AndroidPlatformIconKind.Legacy, legacy);
        ConfigureSingleLayerIcons(AndroidPlatformIconKind.Round, round);

        var icons = new[] { defaultIcon };
        PlayerSettings.SetIconsForTargetGroup(BuildTargetGroup.Unknown, icons);

        AssetDatabase.SaveAssets();
        Debug.Log("Configured Android adaptive icons for Blocs!");
    }

    static void ConfigureAdaptiveIcons(Texture2D background, Texture2D foreground)
    {
        var platform = NamedBuildTarget.Android;
        var icons = PlayerSettings.GetPlatformIcons(platform, AndroidPlatformIconKind.Adaptive);

        for (int i = 0; i < icons.Length; i++)
        {
            icons[i].SetTextures(new[] { background, foreground });
        }

        PlayerSettings.SetPlatformIcons(platform, AndroidPlatformIconKind.Adaptive, icons);
    }

    static void ConfigureSingleLayerIcons(AndroidPlatformIconKind kind, Texture2D texture)
    {
        var platform = NamedBuildTarget.Android;
        var icons = PlayerSettings.GetPlatformIcons(platform, kind);

        for (int i = 0; i < icons.Length; i++)
        {
            icons[i].SetTexture(texture);
        }

        PlayerSettings.SetPlatformIcons(platform, kind, icons);
    }
}
#endif
