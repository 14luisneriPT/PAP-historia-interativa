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
    // Load scenes from local storage if available, otherwise fetch
    const saved = localStorage.getItem("storyProject");

    if (saved) {
        Engine.scenes = JSON.parse(saved);
        console.log("Loaded project from Local Storage");
    } else {
        try {
            const res = await fetch("scenes.json");
            Engine.scenes = await res.json();
            console.log("Loaded project from scenes.json");
        } catch (e) {
            console.error("Error loading scenes.json", e);
            alert("Error: Could not load story data. Make sure scenes.json exists.");
            return;
        }
    }

    // Load story settings
    try {
        const storyRes = await fetch("story.json");
        Engine.story = await storyRes.json();
    } catch (e) {
        console.warn("Could not load story.json, using defaults");
        Engine.story = { firstScene: "scene_001" };
    }

    // Start the story
    loadScene(Engine.story.firstScene || "scene_001");
}

function loadScene(sceneID) {
    const scene = Engine.scenes[sceneID];

    if (!scene) {
        console.error("Scene not found:", sceneID);
        alert("Error: Scene " + sceneID + " not found.");
        return;
    }

    Engine.currentScene = sceneID;

    // Clear previous choices
    choicesDiv.innerHTML = "";
    choicesDiv.style.display = "none";

    // Setup video
    video.src = scene.video;
    video.load();
    
    // Play video
    const playPromise = video.play();
    if (playPromise !== undefined) {
               playPromise.catch(error => {
            console.warn("Auto-play prevented by browser:", error);
            // Optionally show a "Play" button if auto-play fails
            showChoices([{ text: "Start", next: sceneID }]); 
        });
    }

    // When video ends, show choices
    video.onended = () => {
        showChoices(scene.choices);
    };
}

function showChoices(choices) {
    if (!choices || choices.length === 0) {
        // End of story or no choices
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
