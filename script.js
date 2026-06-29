// ==============================
// ENGINE
// ==============================

const Engine = {

    settings: {},
    story: {},
    scenes: {},
    currentScene: null

};

// ==============================
// HTML
// ==============================

const video = document.getElementById("videoPlayer");
const choicesDiv = document.getElementById("choices");

// ==============================
// START
// ==============================

init();

// ==============================
// INITIALIZATION
// ==============================

async function init() {

    try {

        console.log("Engine starting...");

        const [settingsRes, storyRes, scenesRes] = await Promise.all([

            fetch("settings.json"),
            fetch("story.json"),
            fetch("scenes.json")

        ]);

        Engine.settings = await settingsRes.json();
        Engine.story = await storyRes.json();
        Engine.scenes = await scenesRes.json();

        console.log("Settings loaded:", Engine.settings);
        console.log("Story loaded:", Engine.story);
        console.log("Scenes loaded:", Object.keys(Engine.scenes));

        video.controls = Engine.settings.showControls;

        // safety check
        if (!Engine.story.firstScene) {
            console.error("ERROR: firstScene is missing in story.json");
            return;
        }

        if (!Engine.scenes[Engine.story.firstScene]) {
            console.error("ERROR: firstScene does not exist in scenes.json");
            return;
        }

        loadScene(Engine.story.firstScene);

    }

    catch (error) {

        console.error("Engine failed to start.", error);

    }
}
