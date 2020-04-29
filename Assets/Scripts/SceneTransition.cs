using UnityEngine;
using UnityEngine.SceneManagement;

public class SceneTransition : MonoBehaviour
{
    public enum Scene
    {
        MainMenu,
        Game,
        Scores,
        Settings,
    }

    private CanvasGroup overlay;

    private enum State
    {
        FadingIn,
        Idle,
        FadingOut,
    }

    private State state;

    private const float transitionSpeed = 20f;

    void Start()
    {
        state = State.FadingIn;

        overlay = GetComponent<CanvasGroup>();
        overlay.alpha = 1;
    }

    void Update()
    {
        switch (state)
        {
            case State.FadingIn:
                overlay.alpha = Mathf.Lerp(overlay.alpha, 0, Time.deltaTime * transitionSpeed);

                if (overlay.alpha < 0.05)
                {
                    overlay.alpha = 0;
                    state = State.Idle;
                }

                break;
            case State.FadingOut:
                overlay.alpha = Mathf.Lerp(overlay.alpha, 1, Time.deltaTime * transitionSpeed);

                if (overlay.alpha > 0.95)
                {
                    overlay.alpha = 1;
                    state = State.Idle;
                }

                break;
        }
    }

    public void TransitionTo(Scene scene)
    {
        state = State.FadingOut;

        overlay.blocksRaycasts = true;

        SceneManager.LoadSceneAsync(scene.ToString());
    }
}
