using UnityEngine;
using UnityEngine.SocialPlatforms;
using GooglePlayGames;
using GooglePlayGames.BasicApi;

public class GooglePlayGamesManager : MonoBehaviour
{
    private static GooglePlayGamesManager _instance;

    public static GooglePlayGamesManager instance
    {
        get
        {
            if (_instance == null)
            {
                _instance = GameObject.FindObjectOfType<GooglePlayGamesManager>();

                DontDestroyOnLoad(_instance.gameObject);
            }

            return _instance;
        }
    }

    public bool Enabled
    {
        get
        {
            return Application.platform == RuntimePlatform.Android;
        }
    }

    public bool Connected
    {
        get
        {
            return Social.localUser.authenticated;
        }
    }

    void Awake()
    {
        if (_instance == null)
        {
            _instance = this;
            Init();
            DontDestroyOnLoad(this);
        }
        else if (this != _instance)
        {
            Destroy(this.gameObject);
        }
    }

    void Init()
    {
        if (!Enabled) return;

        PlayGamesClientConfiguration config = new PlayGamesClientConfiguration.Builder().Build();
        PlayGamesPlatform.InitializeInstance(config);
        PlayGamesPlatform.DebugLogEnabled = true;
        PlayGamesPlatform.Activate();

        PlayGamesPlatform.Instance.Authenticate(SignInInteractivity.CanPromptOnce, (result) =>
        {
            bool connected = result == SignInStatus.Success;

            if (!connected)
            {
                Debug.LogError("Did not authenticate: " + result.ToString());
            }
        });
    }

    public void SignIn()
    {
        Social.localUser.Authenticate((success, err) =>
        {
            if (!success)
            {
                Debug.LogError("Did not authenticate: " + err);
            }
        });
    }

    public void SignOut()
    {
        PlayGamesPlatform.Instance.SignOut();
    }

    public void ShowLeaderboard()
    {
        Social.ShowLeaderboardUI();
    }

    public void ReportLeaderboardScore(int score)
    {
        Social.ReportScore(score, GPGSIds.leaderboard_highscores, data => { Debug.Log("Score reported " + data); });
    }
}
