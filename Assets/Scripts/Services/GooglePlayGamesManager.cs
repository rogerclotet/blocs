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

    public void ShowAchievements()
    {
        Social.ShowAchievementsUI();
    }

    public void ReportLeaderboardScore(int score)
    {
        if (!Connected) return;

        Social.ReportScore(score, GPGSIds.leaderboard_high_scores, success =>
        {
            if (!success)
            {
                Debug.LogError("Leaderboard update failed");
            }
        });
    }

    public void ReportBlocksAchievementProgress(int amount)
    {
        if (!Connected) return;

        string[] blockAchievementIds = new string[] {
            GPGSIds.achievement_place_100_blocks,
            GPGSIds.achievement_place_1000_blocks,
            GPGSIds.achievement_place_10000_blocks,
        };
        foreach (string achievementId in blockAchievementIds)
        {
            Social.ReportProgress(achievementId, amount, success =>
            {
                if (!success)
                {
                    Debug.LogError("Achievement update failed");
                }
            });
        }
    }

    public void ReportLinesAchievementProgress(int amount)
    {
        if (!Connected) return;

        string[] blockAchievementIds = new string[] {
            GPGSIds.achievement_first_line_cleared,
            GPGSIds.achievement_clear_50_lines,
            GPGSIds.achievement_clear_200_lines,
        };
        foreach (string achievementId in blockAchievementIds)
        {
            Social.ReportProgress(achievementId, amount, success =>
            {
                if (!success)
                {
                    Debug.LogError("Achievement update failed");
                }
            });
        }
    }

    public void Report3LinesAtOnceAchievementProgress()
    {
        if (!Connected) return;

        Social.ReportProgress(GPGSIds.achievement_clear_3_lines_at_once, 1, success =>
        {
            if (!success)
            {
                Debug.LogError("Achievement update failed");
            }
        });
    }

    public void Report5LinesAtOnceAchievementProgress()
    {
        if (!Connected) return;

        Social.ReportProgress(GPGSIds.achievement_clear_5_lines_at_once, 1, success =>
        {
            if (!success)
            {
                Debug.LogError("Achievement update failed");
            }
        });
    }
}
