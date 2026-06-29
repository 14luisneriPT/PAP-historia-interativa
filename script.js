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

        // Load settings
        const settingsResponse = await fetch("settings.json");
        Engine.settings = await settingsResponse.json();

        // Load story information
        const storyResponse = await fetch("story.json");
        Engine.story = await storyResponse.json();

        // Load scenes
        const scenesResponse = await fetch("scenes.json");
        Engine.scenes = await scenesResponse.json();

        // Apply settings
        video.controls = Engine.settings.showControls;

        // Load first scene
        loadScene(Engine.story.firstScene);

    }

    catch(error){

        console.error("Engine failed to start.", error);

    }

}

// ==============================
// LOAD SCENE
// ==============================

function loadScene(sceneID){

    const scene = Engine.scenes[sceneID];

    if(!scene){

        console.error("Scene not found:", sceneID);
        return;

    }

    Engine.currentScene = sceneID;

    choicesDiv.innerHTML = "";
    choicesDiv.style.display = "none";

    video.src = scene.video;

    video.play();

    video.onended = () => {

        showChoices(scene.choices);

    };

}

// ==============================
// SHOW CHOICES
// ==============================

function showChoices(choices){

    if(!choices || choices.length === 0)
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
