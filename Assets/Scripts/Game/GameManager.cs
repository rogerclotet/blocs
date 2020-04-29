using System.Collections.Generic;
using System.Linq;
using UnityEngine;
using UnityEngine.UI;

public class GameManager : MonoBehaviour
{
    public Board board;
    public ScoreManager scoreManager;
    public NextPieces nextPieces;
    public GameObject postGameOverlay;
    public Text postGameText;
    public Button undoButton;
    public SceneTransition scene;

    private GameState gameState;
    private int undoTimes = 0;
    private List<GameState> previousStates;

    void Start()
    {
        previousStates = new List<GameState>();

        if (GameModeSelector.Selected == GameMode.Continue)
        {
            LoadGame();
        }
        else
        {
            LoadHighScore();

            nextPieces.GeneratePieces();
            PieceDefinitionData[] defs = new PieceDefinitionData[nextPieces.Definitions.Length];
            for (int i = 0; i < defs.Length; i++)
            {
                PieceDefinition def = nextPieces.Definitions[i];
                defs[i] = def == null ? null : def.Data();
            }
            gameState = new GameState()
            {
                score = scoreManager.Score,
                placedBlocks = scoreManager.Blocks,
                board = board.Export(),
                pieces = defs,
                randomState = nextPieces.RandomState
            };
        }

        UpdateUndoButton();

        SaveGame();
    }

    void Update()
    {
        // Handle back button
        if (Input.GetKeyUp(KeyCode.Escape))
        {
            GoToMainMenu();
        }
    }

    public void OnPiecePlaced(Piece piece)
    {
        nextPieces.OnPiecePlaced(piece);

        if (nextPieces.Empty)
        {
            do
            {
                nextPieces.GeneratePieces();
            } while (!HasPossibleMoves());
        }
        else if (!HasPossibleMoves())
        {
            GameOver();

            return;
        }

        UpdateGameState();

        if (undoTimes > 0)
        {
            undoTimes--;
        }
        UpdateUndoButton();

        SaveGame();
    }

    void UpdateGameState()
    {
        PieceDefinitionData[] defs = new PieceDefinitionData[nextPieces.Definitions.Length];
        for (int i = 0; i < defs.Length; i++)
        {
            PieceDefinition def = nextPieces.Definitions[i];
            defs[i] = def == null ? null : def.Data();
        }

        if (previousStates.Count > 2)
        {
            previousStates.RemoveAt(0);
        }
        previousStates.Add(gameState);

        gameState = new GameState()
        {
            score = scoreManager.Score,
            placedBlocks = scoreManager.Blocks,
            board = board.Export(),
            pieces = defs,
            randomState = nextPieces.RandomState
        };
    }

    void UpdateUndoButton()
    {
        undoButton.gameObject.SetActive(undoTimes < 3 && previousStates.Count > 0);
    }

    public void Undo()
    {
        if (previousStates.Count == 0) return;
        if (undoTimes > 3) return;

        gameState = previousStates[previousStates.Count - 1];
        previousStates.RemoveAt(previousStates.Count - 1);

        scoreManager.Load(gameState);
        board.Import(gameState.board);

        PieceDefinition[] pieces = new PieceDefinition[gameState.pieces.Length];
        for (int i = 0; i < gameState.pieces.Length; i++)
        {
            pieces[i] = gameState.pieces[i] == null ? null : gameState.pieces[i].ToDefinition();
        }
        nextPieces.GeneratePieces(pieces);
        nextPieces.RandomState = gameState.randomState;

        undoTimes++;
        UpdateUndoButton();

        SaveGame();
    }

    bool HasPossibleMoves()
    {
        foreach (PieceDefinition pieceDefinition in nextPieces.Definitions)
        {
            if (pieceDefinition != null && board.IsPiecePlaceable(pieceDefinition))
            {
                return true;
            }
        }

        return false;
    }

    void GameOver()
    {
        int score = scoreManager.Score;
        int blocks = scoreManager.Blocks;

        postGameText.text = string.Format(I18n.Fields["game.post.score_text"], score, blocks);
        if (scoreManager.IsNewHighScore)
        {
            string highScoreText = I18n.Fields["game.post.new_high_score"];
            postGameText.text += $"\n\n<color=#A4C54F>{highScoreText}</color>";
        }

        postGameOverlay.SetActive(true);

        // Save game over state
        gameState = null;
        previousStates = new List<GameState>();
        undoTimes = 0;

        SaveGame(score, blocks);
    }

    void SaveGame(int gameEndScore = 0, int gameEndBlocks = 0)
    {
        if (gameState != null)
        {
            scoreManager.Save(ref gameState);
        }

        SaveData lastSaveData = SaveGameStorage.LoadGame();

        int highScoreBlocks =
            scoreManager.IsNewHighScore ?
                scoreManager.Blocks :
                lastSaveData != null ?
                    lastSaveData.highScoreBlocks :
                    0;

        SaveData saveData = new SaveData()
        {
            highScore = scoreManager.HighScore,
            highScoreBlocks = highScoreBlocks,
            history = lastSaveData != null ? lastSaveData.history : new HistoryEntry[] { },
            state = gameState,
            previousStates = previousStates.ToArray(),
            undoTimes = undoTimes,
        };

        if (gameEndScore != 0)
        {
            List<HistoryEntry> entries;
            if (lastSaveData != null && lastSaveData.history != null)
            {
                entries = lastSaveData.history.ToList();
                if (entries.Count >= 10)
                {
                    entries.RemoveAt(0);
                }
            }
            else
            {
                entries = new List<HistoryEntry>();
            }

            entries.Add(new HistoryEntry() { score = gameEndScore, blocks = gameEndBlocks });

            saveData.history = entries.ToArray();
        }

        SaveGameStorage.SaveGame(saveData);
    }

    void LoadGame()
    {
        SaveData saveData = SaveGameStorage.LoadGame();
        if (saveData == null)
        {
            return;
        }

        if (saveData.state != null)
        {
            gameState = saveData.state;
            board.Import(saveData.state.board);
            scoreManager.Load(saveData.state);

            PieceDefinition[] pieces = new PieceDefinition[saveData.state.pieces.Length];
            for (int i = 0; i < saveData.state.pieces.Length; i++)
            {
                pieces[i] = saveData.state.pieces[i] == null ? null : saveData.state.pieces[i].ToDefinition();
            }
            nextPieces.GeneratePieces(pieces);
            nextPieces.RandomState = saveData.state.randomState;
        }
        else
        {
            Debug.Log("Incompatible save file");
            return;
        }

        // If we only had one previous state, we are on the first turn
        if (saveData.previousStates != null && saveData.previousStates.Length > 1)
        {
            previousStates = new List<GameState>(saveData.previousStates);
        }

        if (saveData.highScore != 0)
        {
            // Not sure if necessary
            scoreManager.LoadHighScore(saveData.highScore);
        }

        undoTimes = saveData.undoTimes;
    }

    void LoadHighScore()
    {
        SaveData saveData = SaveGameStorage.LoadGame();

        if (saveData != null && saveData.highScore > 0)
        {
            scoreManager.LoadHighScore(saveData.highScore);
        }
    }

    public void Restart()
    {
        previousStates.Clear();
        gameState = new GameState();
        undoTimes = 0;

        GameModeSelector.Selected = GameMode.New;

        SaveGame();

        scene.TransitionTo(SceneTransition.Scene.Game);
    }

    public void GoToMainMenu()
    {
        scene.TransitionTo(SceneTransition.Scene.MainMenu);
    }
}
