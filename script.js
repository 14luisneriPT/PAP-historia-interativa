const Engine = {
    settings: {},
    story: {},
    scenes: {},
    currentScene: null
};
const video = document.getElementById("videoPlayer");
const choicesDiv = document.getElementById("choices");
init();
async function init() {
    const saved = localStorage.getItem("storyProject");
    if (saved) {
        Engine.scenes = JSON.parse(saved);
    } else {
        try {
            const res = await fetch("scenes.json");
            Engine.scenes = await res.json();
        } catch (e) {
            console.error("Error loading scenes.json", e);
            alert("Error: Could not load story data. Make sure scenes.json exists.");
            return;
        }
    }
    try {
        const storyRes = await fetch("story.json");
        Engine.story = await storyRes.json();
    } catch (e) {
        Engine.story = { firstScene: "scene_001" };
    }
    try {
        const settingsRes = await fetch("settings.json");
        Engine.settings = await settingsRes.json();
    } catch (e) {
        Engine.settings = { showControls: true, allowFullscreen: true };
    }
    applySettings();
    loadScene(Engine.story.firstScene || "scene_001");
}
function applySettings() {
    video.controls = Engine.settings.showControls !== false;
    if (Engine.settings.allowFullscreen === false) {
        video.setAttribute("controlsList", "nofullscreen");
    }
}
function loadScene(sceneID) {
    const scene = Engine.scenes[sceneID];
    if (!scene) {
        console.error("Scene not found:", sceneID);
        alert("Error: Scene " + sceneID + " not found.");
        return;
    }
    Engine.currentScene = sceneID;
    choicesDiv.innerHTML = "";
    choicesDiv.style.display = "none";
    video.src = scene.video;
    video.load();
    const playPromise = video.play();
    if (playPromise !== undefined) {
        playPromise.catch(error => {
            console.warn("Auto-play prevented by browser:", error);
            showChoices([{ text: "Start", next: sceneID }]);
        });
    }
    video.onended = () => {
        showChoices(scene.choices);
    };
}
function showChoices(choices) {
    if (!choices || choices.length === 0) {
        console.log("End of story or no choices for:", Engine.currentScene);
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
