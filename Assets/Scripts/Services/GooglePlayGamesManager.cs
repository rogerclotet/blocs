#if UNITY_ANDROID
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
                _instance = GameObject.FindAnyObjectByType<GooglePlayGamesManager>();

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
            return PlayGamesPlatform.Instance.IsAuthenticated();
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

        PlayGamesPlatform.DebugLogEnabled = true;
        PlayGamesPlatform.Activate();
        PlayGamesPlatform.Instance.Authenticate(result =>
        {
            if (result != SignInStatus.Success)
            {
                Debug.LogError("Did not authenticate: " + result.ToString());
            }
        });
    }

    public void SignIn()
    {
        PlayGamesPlatform.Instance.ManuallyAuthenticate(result =>
        {
            if (result != SignInStatus.Success)
            {
                Debug.LogError("Did not authenticate: " + result.ToString());
            }
        });
    }

    public void SignOut()
    {
        Debug.LogWarning("Google Play Games v2 does not support programmatic sign-out.");
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
            GPGSIds.achievement_100_blocks,
            GPGSIds.achievement_1000_blocks,
            GPGSIds.achievement_10000_blocks,
        };
        foreach (string achievementId in blockAchievementIds)
        {
            PlayGamesPlatform.Instance.IncrementAchievement(
                achievementId,
                amount,
                success =>
                {
                    if (!success)
                    {
                        Debug.LogError("Achievement update failed");
                    }
                }
            );
        }
    }

    public void ReportLinesAchievementProgress(int amount)
    {
        if (!Connected) return;

        PlayGamesPlatform.Instance.UnlockAchievement(
            GPGSIds.achievement_first_of_many,
            success =>
            {
                if (!success)
                {
                    Debug.LogError("Achievement update failed");
                }
            }
        );

        string[] blockAchievementIds = new string[] {
            GPGSIds.achievement_50_lines,
            GPGSIds.achievement_200_lines,
        };
        foreach (string achievementId in blockAchievementIds)
        {
            PlayGamesPlatform.Instance.IncrementAchievement(
                achievementId,
                amount,
                success =>
                {
                    if (!success)
                    {
                        Debug.LogError("Achievement update failed");
                    }
                }
            );
        }
    }

    public void Report3LinesAtOnceAchievementProgress()
    {
        if (!Connected) return;

        PlayGamesPlatform.Instance.UnlockAchievement(
            GPGSIds.achievement_triple,
            success =>
            {
                if (!success)
                {
                    Debug.LogError("Achievement update failed");
                }
            }
        );
    }

    public void Report5LinesAtOnceAchievementProgress()
    {
        if (!Connected) return;

        PlayGamesPlatform.Instance.UnlockAchievement(
            GPGSIds.achievement_pentaline,
            success =>
            {
                if (!success)
                {
                    Debug.LogError("Achievement update failed");
                }
            }
        );
    }
}
#else
using UnityEngine;

public class GooglePlayGamesManager : MonoBehaviour
{
    private static GooglePlayGamesManager _instance;

    public static GooglePlayGamesManager instance
    {
        get
        {
            if (_instance == null)
            {
                _instance = GameObject.FindAnyObjectByType<GooglePlayGamesManager>();
                DontDestroyOnLoad(_instance.gameObject);
            }

            return _instance;
        }
    }

    public bool Enabled => false;
    public bool Connected => false;

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

    public void SignIn() { }
    public void SignOut() { }
    public void ShowLeaderboard() { }
    public void ShowAchievements() { }
    public void ReportLeaderboardScore(int score) { }
    public void ReportBlocksAchievementProgress(int amount) { }
    public void ReportLinesAchievementProgress(int amount) { }
    public void Report3LinesAtOnceAchievementProgress() { }
    public void Report5LinesAtOnceAchievementProgress() { }
}
#endif
