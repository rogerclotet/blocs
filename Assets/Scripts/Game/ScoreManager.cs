using System;
using UnityEngine;
using UnityEngine.UI;

public class ScoreManager : MonoBehaviour
{
    public Text scoreText;

    public int Score { get; set; }
    public int HighScore { get; private set; }
    public bool IsNewHighScore { get; private set; }

    private int displayedScore;
    private int displayedHighScore;
    private float lastScoreUpdate;

    void Start()
    {
        UpdateScoreText();
    }

    void Update()
    {
        if (displayedHighScore == Score)
        {
            return;
        }

        UpdateScoreText();
    }

    void UpdateScoreText()
    {
        float now = Time.realtimeSinceStartup;

        if (now < lastScoreUpdate + 0.05f) return;

        lastScoreUpdate = now;

        if (displayedScore != Score)
        {
            displayedScore += (int)Mathf.Sign(Score - displayedScore);
        }

        if (displayedHighScore != HighScore)
        {
            displayedHighScore += (int)Mathf.Sign(HighScore - displayedHighScore);
        }

        scoreText.text = $"Punts: {displayedScore.ToString()}\nRécord: {displayedHighScore.ToString()}";
    }

    public void AddPiece(int score)
    {
        Score += score;

        UpdateHighScore();
    }

    public void AddClearedLine(int score)
    {
        Score += score;

        UpdateHighScore();
    }

    void UpdateHighScore()
    {
        if (Score > HighScore)
        {
            HighScore = Score;
            IsNewHighScore = true;
        }
    }

    public void Save(ref GameState state)
    {
        state.score = Score;
        state.highScore = HighScore;
    }

    public void Load(GameState state)
    {
        Score = state.score;
        HighScore = state.highScore;

        displayedScore = Score;
        displayedHighScore = HighScore;

        UpdateScoreText();
    }

    internal void LoadHighScore(GameState state)
    {
        HighScore = state.highScore;
        displayedHighScore = HighScore;

        UpdateScoreText();
    }
}
