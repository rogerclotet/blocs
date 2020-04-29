using UnityEngine;

public class MainMenuController : MonoBehaviour
{
    public GameObject continueButton;
    public GameObject scoresButton;
    public SceneTransition scene;
    public GameObject leaderboardButton;

    private GooglePlayGamesManager gpgManager;

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

        gpgManager = GooglePlayGamesManager.instance;
        if (!gpgManager.Enabled)
        {
            leaderboardButton.SetActive(false);
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
        scene.TransitionTo(SceneTransition.Scene.Game);
    }

    public void Continue()
    {
        GameModeSelector.Selected = GameMode.Continue;
        scene.TransitionTo(SceneTransition.Scene.Game);
    }

    public void Scores()
    {
        scene.TransitionTo(SceneTransition.Scene.Scores);
    }

    public void Settings()
    {
        scene.TransitionTo(SceneTransition.Scene.Settings);
    }

    public void ShowLeaderboard()
    {
        gpgManager.ShowLeaderboard();
    }

    public void Exit()
    {
        Application.Unload();
    }
}
