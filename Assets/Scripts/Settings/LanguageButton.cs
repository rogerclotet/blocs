using UnityEngine;
using UnityEngine.UI;
using UnityEngine.SceneManagement;

public class LanguageButton : MonoBehaviour
{
    public string languageId;

    void Start()
    {
        string lang = PlayerPrefs.GetString("language");

        if (lang == "")
        {
            lang = I18n.GetDefaultLanguage();
        }

        if (lang == languageId)
        {
            Color col;
            ColorUtility.TryParseHtmlString("#A4C54F", out col);
            GetComponentInChildren<Text>().color = col;
        }
    }

    public void SelectLanguage()
    {
        PlayerPrefs.SetString("language", languageId);
        I18n.LoadLanguage(languageId);
        SceneManager.LoadScene("Settings");
    }
}
