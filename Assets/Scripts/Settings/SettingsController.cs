using UnityEngine;

public class SettingsController : MonoBehaviour
{
    public SceneTransition scene;

    void Update()
    {
        // Handle back button
        if (Input.GetKeyUp(KeyCode.Escape))
        {
            Back();
        }
    }

    public void Back()
    {
        scene.TransitionTo(SceneTransition.Scene.MainMenu);
    }
}
