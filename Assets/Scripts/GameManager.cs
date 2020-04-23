using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class GameManager : MonoBehaviour
{
    public Text scoreText;
    public Board board;
    public NextPieces nextPieces;
    public int score;

    private GameState gameState;
    private int displayedScore;
    private float lastScoreUpdate;


    void Start()
    {
        nextPieces.GeneratePieces();

        PieceDefinition[] defs = new PieceDefinition[nextPieces.Definitions.Length];
        for (int i = 0; i < defs.Length; i++)
        {
            PieceDefinition def = nextPieces.Definitions[i];
            defs[i] = def == null ? null : def.Clone();
        }
        gameState = new GameState(score, board.Export(), defs, null);
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

        scoreText.text = $"Score: {displayedScore.ToString()}";
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
        gameState = new GameState(score, board.Export(), defs, gameState);
    }

    public void Undo()
    {
        if (gameState.previous == null) return;

        gameState = gameState.previous;

        score = gameState.score;
        board.Import(gameState.board);
        nextPieces.GeneratePieces(gameState.pieces);
    }
}
