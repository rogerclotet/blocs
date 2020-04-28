using System.IO;
using UnityEngine;
using UnityEngine.SceneManagement;

public class MainMenuController : MonoBehaviour
{
    public GameObject continueButton;
    public GameObject scoresButton;

    void Start()
    {
        SaveData saveData = SaveGameStorage.LoadGame();
        if (saveData == null || saveData.state == null)
        {
            continueButton.SetActive(false);
        }

        if (saveData == null || saveData.highScore == 0 || saveData.history == null)
        {
            scoresButton.SetActive(false);
        }
    }

    void Update()
    {
        // Handle back button
        if (Input.GetKeyUp(KeyCode.Escape))
        {
            Exit();
        }
    }

    public void NewGame()
    {
        GameModeSelector.Selected = GameMode.New;
        SceneManager.LoadScene("Game");
    }

    public void Continue()
    {
        GameModeSelector.Selected = GameMode.Continue;
        SceneManager.LoadScene("Game");
    }

    public void Scores()
    {
        SceneManager.LoadScene("Scores");
    }

    public void Exit()
    {
        Application.Unload();
    }
}
