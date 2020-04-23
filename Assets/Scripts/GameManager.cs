using System.Collections;
using System.Collections.Generic;
using System.Runtime.Serialization.Formatters.Binary;
using System.IO;
using UnityEngine;
using UnityEngine.UI;

public class GameManager : MonoBehaviour
{
    public Text scoreText;
    public Board board;
    public NextPieces nextPieces;
    public int score;
    public int highScore;

    private GameState gameState;
    private int displayedScore;
    private int displayedHighScore;
    private float lastScoreUpdate;


    void Start()
    {
        LoadGame();

        nextPieces.GeneratePieces();

        PieceDefinition[] defs = new PieceDefinition[nextPieces.Definitions.Length];
        for (int i = 0; i < defs.Length; i++)
        {
            PieceDefinition def = nextPieces.Definitions[i];
            defs[i] = def == null ? null : def.Clone();
        }
        gameState = new GameState(score, board.Export(), defs, nextPieces.RandomState, null);
    }

    void Update()
    {
        float now = Time.realtimeSinceStartup;

        if (now < lastScoreUpdate + 0.05f) return;

        lastScoreUpdate = now;

        if (displayedScore != score)
        {
            displayedScore += (int)Mathf.Sign(score - displayedScore);
        }

        if (displayedHighScore != highScore)
        {
            displayedHighScore += (int)Mathf.Sign(highScore - displayedHighScore);
        }

        scoreText.text = $"Punts: {displayedScore.ToString()}\nRécord: {displayedHighScore.ToString()}";
    }

    public void OnPiecePlaced(Piece piece)
    {
        nextPieces.OnPiecePlaced(piece);

        PieceDefinition[] defs = new PieceDefinition[nextPieces.Definitions.Length];
        for (int i = 0; i < defs.Length; i++)
        {
            PieceDefinition def = nextPieces.Definitions[i];
            defs[i] = def == null ? null : def.Clone();
        }

        // TODO limit number of saved previous states
        gameState = new GameState(score, board.Export(), defs, nextPieces.RandomState, gameState);

        if (score > highScore)
        {
            highScore = score;
        }

        SaveGame();
    }

    public void Undo()
    {
        if (gameState.previous == null) return;

        gameState = gameState.previous;

        score = gameState.score;
        board.Import(gameState.board);
        nextPieces.GeneratePieces(gameState.pieces);
        nextPieces.RandomState = gameState.randomState;
    }

    void SaveGame()
    {
        SaveData saveData = new SaveData() { highScore = highScore };
        BinaryFormatter bf = new BinaryFormatter();
        FileStream file = File.OpenWrite(Application.persistentDataPath + "/save.blc");
        bf.Serialize(file, saveData);
        file.Close();
    }

    void LoadGame()
    {
        BinaryFormatter bf = new BinaryFormatter();

        try
        {
            FileStream file = File.OpenRead(Application.persistentDataPath + "/save.blc");
            SaveData saveData = (SaveData)bf.Deserialize(file);
            file.Close();

            highScore = saveData.highScore;
            displayedHighScore = highScore;
        }
        catch (FileNotFoundException)
        {
            Debug.Log("Save game not found");
        }
    }
}
