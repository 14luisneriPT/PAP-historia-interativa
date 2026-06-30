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

    const local = localStorage.getItem("storyProject");

    if (local) {

        scenes = JSON.parse(local);
        console.log("Loaded project from local storage.");

    } else {

        const res = await fetch("scenes.json");
        scenes = await res.json();

        console.log("Loaded project from scenes.json");

    }

    buildGraph();
    setupToolbar();

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

    choicesDiv.innerHTML = "";
    choicesDiv.style.display = "none";

    video.src = scene.video;
    video.load();
    video.play();

    video.onended = () => {
        showChoices(scene.choices);
    };

}

// ==============================
// SHOW CHOICES
// ==============================

function showChoices(choices) {

    if (!choices || choices.length === 0) {
        return;
    }

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
// VALIDATION
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
