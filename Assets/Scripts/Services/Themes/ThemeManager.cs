using System;
using UnityEngine;

public class ThemeManager : MonoBehaviour
{
    public enum ThemeName
    {
        Purple,
        BlueYellow,
        Green,
    }

    public struct Theme
    {
        public ThemeName Name;
        public Color Primary;
        public Color PrimaryDark;
        public Color Secondary;
        public Color SecondaryLight;
        public Color Background;

        public Theme(ThemeName name, Color primary, Color primaryDark, Color secondary, Color secondaryLight, Color background)
        {
            Name = name;
            Primary = primary;
            PrimaryDark = primaryDark;
            Secondary = secondary;
            SecondaryLight = secondaryLight;
            Background = background;
        }
    }

    private static ThemeManager _instance;

    public static ThemeManager instance
    {
        get
        {
            if (_instance == null)
            {
                _instance = GameObject.FindObjectOfType<ThemeManager>();

                DontDestroyOnLoad(_instance.gameObject);
            }

            return _instance;
        }
    }

    public Theme Current
    {
        get
        {
            if (!_current.HasValue)
            {
                if (PlayerPrefs.HasKey(themePrefsKey))
                {
                    bool validTheme = Enum.TryParse(PlayerPrefs.GetString(themePrefsKey), out ThemeName themeName);
                    if (validTheme)
                    {
                        ApplyTheme(themeName);
                        return _current.Value;
                    }
                }

                PlayerPrefs.SetString(themePrefsKey, ThemeName.Purple.ToString());
                ApplyTheme(ThemeName.Purple);
            }

            return _current.Value;
        }

        private set
        {
            _current = value;
        }
    }

    private Nullable<Theme> _current;

    private const string themePrefsKey = "theme";

    void Awake()
    {
        if (_instance == null)
        {
            _instance = this;
            DontDestroyOnLoad(this);
        }
        else if (this != _instance)
        {
            Destroy(this.gameObject);
        }
    }

    public static void SetTheme(ThemeName theme)
    {
        PlayerPrefs.SetString(themePrefsKey, theme.ToString());
        ApplyTheme(theme);
    }

    static void ApplyTheme(ThemeName themeName)
    {
        switch (themeName)
        {
            case ThemeName.BlueYellow:
                instance.Current = new Theme(
                    ThemeName.BlueYellow,
                    new Color32(45, 106, 143, 255),
                    new Color32(27, 42, 59, 255),
                    new Color32(240, 217, 121, 255),
                    new Color32(255, 235, 158, 255),
                    new Color32(47, 72, 88, 255)
                );
                break;
            case ThemeName.Green:
                instance.Current = new Theme(
                    ThemeName.Green,
                    new Color32(91, 129, 81, 255),
                    new Color32(47, 54, 43, 255),
                    new Color32(234, 223, 184, 255),
                    new Color32(240, 234, 199, 255),
                    new Color32(76, 95, 73, 255)
                );
                break;
            case ThemeName.Purple:
            default:
                instance.Current = new Theme(
                    ThemeName.Purple,
                    new Color32(129, 87, 161, 255),
                    new Color32(70, 40, 93, 255),
                    new Color32(240, 217, 121, 255),
                    new Color32(255, 235, 158, 255),
                    new Color32(106, 61, 140, 255)
                );
                break;
        }
    }
}
