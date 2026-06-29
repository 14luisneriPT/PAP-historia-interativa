// ===========================
// Configuration
// ===========================

const CONFIG = {
    storyFile: "stories/demo/story.json"
};

// ===========================
// Variables
// ===========================

let story = {};
let currentScene = null;

const video = document.getElementById("videoPlayer");
const choicesDiv = document.getElementById("choices");

// ===========================
// Start Engine
// ===========================

loadStory();

// ===========================
// Functions
// ===========================

async function loadStory() {

    try {

        const response = await fetch(CONFIG.storyFile);
        story = await response.json();

        loadScene("scene_001");

    } catch (error) {

        console.error("Could not load story:", error);

    }

}

function loadScene(sceneID) {

    const scene = story[sceneID];

    if (!scene) {

        console.error("Scene not found:", sceneID);
        return;

    }

    currentScene = sceneID;

    choicesDiv.innerHTML = "";
    choicesDiv.style.display = "none";

    video.src = scene.video;

    video.play();

    video.onended = () => {

        showChoices(scene.choices);

    };

}

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
