using UnityEngine;
using UnityEngine.UI;

public class GooglePlayGamesButton : MonoBehaviour
{
    public Image logo;
    public Sprite connectedSprite;
    public Sprite disconnectedSprite;
    public Text text;

    private GooglePlayGamesManager gpgManager;

    void Start()
    {
        gpgManager = GooglePlayGamesManager.instance;

        if (!gpgManager.Enabled)
        {
            gameObject.SetActive(false);
        }
    }

    void Update()
    {
        if (gpgManager.Connected)
        {
            text.text = I18n.Fields["settings.gpg.connected"];
            logo.sprite = connectedSprite;
        }
        else
        {
            text.text = I18n.Fields["settings.gpg.disconnected"];
            logo.sprite = disconnectedSprite;
        }
    }

    public void ToggleConnected()
    {
        if (gpgManager.Connected)
        {
            gpgManager.SignOut();
        }
        else
        {
            gpgManager.SignIn();
        }
    }
}
