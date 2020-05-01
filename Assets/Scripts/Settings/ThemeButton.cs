using UnityEngine;
using UnityEngine.UI;
using UnityEngine.SceneManagement;

public class ThemeButton : MonoBehaviour
{
    public ThemeManager.ThemeName theme;

    void Start()
    {
        ThemeManager.ThemeName currentThemeName = ThemeManager.instance.Current.Name;

        if (currentThemeName == theme)
        {
            Color col;
            ColorUtility.TryParseHtmlString("#A4C54F", out col);
            GetComponentInChildren<Text>().color = col;
        }
    }

    public void SelectTheme()
    {
        ThemeManager.SetTheme(theme);
        SceneManager.LoadScene("Settings");
    }
}
