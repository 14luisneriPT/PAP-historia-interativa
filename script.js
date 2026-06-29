// ==============================
// ENGINE CORE
// ==============================

const Engine = {
    settings: {},
    story: {},
    scenes: {},
    currentScene: null
};

// ==============================
// DOM ELEMENTS
// ==============================

const video = document.getElementById("videoPlayer");
const choicesDiv = document.getElementById("choices");

// ==============================
// START ENGINE
// ==============================

init();

// ==============================
// INIT
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

        if (!Engine.story.firstScene) {
            console.error("ERROR: firstScene missing in story.json");
            return;
        }

        if (!Engine.scenes[Engine.story.firstScene]) {
            console.error("ERROR: firstScene not found in scenes.json");
            return;
        }

        loadScene(Engine.story.firstScene);

    } catch (error) {
        console.error("Engine failed to start:", error);
    }
}

// ==============================
// LOAD SCENE
// ==============================

function loadScene(sceneID) {

    const scene = Engine.scenes[sceneID];

    if (!scene) {
        console.error("Scene not found:", sceneID);
        return;
    }

    validateScene(sceneID, scene);

    Engine.currentScene = sceneID;

    // reset UI
    choicesDiv.innerHTML = "";
    choicesDiv.style.display = "none";

    // load video
    video.src = scene.video;
    video.load();
    video.play();

    // IMPORTANT: reset event to avoid stacking bugs later
    video.onended = null;
    video.onended = () => {
        showChoices(scene.choices);
    };
}

// ==============================
// SHOW CHOICES
// ==============================

function showChoices(choices) {

    if (!choices || choices.length === 0)
        return;

    choicesDiv.innerHTML = "";
    choicesDiv.style.display = "flex";

    choices.forEach(choice => {

        const button = document.createElement("button");

        button.textContent = choice.text;

        button.onclick = () => {
            loadScene(choice.next);
        };

        choicesDiv.appendChild(button);

    });
}

// ==============================
// VALIDATION (DEBUG TOOL)
// ==============================

function validateScene(sceneID, scene) {

    if (!scene.video) {
        console.warn("Scene missing video:", sceneID);
    }

    if (!scene.choices) {
        console.warn("Scene missing choices:", sceneID);
    }

    if (scene.choices) {

        scene.choices.forEach(choice => {

            if (!Engine.scenes[choice.next]) {
                console.error(
                    `Broken link in ${sceneID}: "${choice.next}" does not exist`
                );
            }

        });

    }
}
