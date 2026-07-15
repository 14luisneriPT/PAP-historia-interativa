let scenes = {};
let cy = null;
let selectedScene = null;

let connectMode = false;
let connectSource = null;
let sceneCounter = 0;

init();

async function init() {
    const saved = localStorage.getItem("storyProject");

    if (saved) {
        try {
            scenes = JSON.parse(saved);
        } catch (e) {
            console.error("Error loading saved project", e);
            scenes = {};
        }
    } else {
        try {
            const res = await fetch("scenes.json");
            scenes = await res.json();
        } catch (e) {
            console.error("Error loading scenes.json", e);
            scenes = {};
        }
    }

    Object.keys(scenes).forEach(id => {
        if (id.startsWith("scene_")) {
            const n = parseInt(id.replace("scene_", ""));
            if (!isNaN(n) && n > sceneCounter) {
                sceneCounter = n;
            }
        }
    });

    setupToolbar();
    buildGraph();
}

function autoSave() {
    localStorage.setItem("storyProject", JSON.stringify(scenes));
}

function rebuild() {
    if (cy) {
        cy.destroy();
        cy = null;
    }
    setTimeout(() => {
        buildGraph();
        document.getElementById("properties").innerHTML =
            "<h2>Select a scene</h2><p>Click any node to edit.</p>";
    }, 50);
}

function computeRoots(elements) {
    const allIds = new Set();
    const targetIds = new Set();
    elements.forEach(el => {
        if (el.data.id) allIds.add(el.data.id);
        if (el.data.target) targetIds.add(el.data.target);
    });
    const roots = [...allIds].filter(id => !targetIds.has(id));
    return roots.length ? roots : [...allIds].slice(0, 1);
}

function buildGraph() {
    const elements = [];

    Object.keys(scenes).forEach(id => {
        const scene = scenes[id];

        elements.push({
            data: {
                id: id,
                label: scene.title || id
            }
        });

        (scene.choices || []).forEach(choice => {
            if (scenes[choice.next]) {
                elements.push({
                    data: {
                        source: id,
                        target: choice.next,
                        label: choice.text
                    }
                });
            }
        });
    });

    try {
        cy = cytoscape({
            container: document.getElementById("graph"),
            elements: elements,
            style: [
                {
                    selector: "node",
                    style: {
                        "label": "data(label)",
                        "background-color": "#4CAF50",
                        "color": "white",
                        "width": 90,
                        "height": 90,
                        "text-wrap": "wrap",
                        "text-max-width": 80,
                        "text-valign": "center",
                        "text-halign": "center",
                        "border-width": 2,
                        "border-color": "#333",
                        "font-size": "12px"
                    }
                },
                {
                    selector: "edge",
                    style: {
                        "label": "data(label)",
                        "width": 2,
                        "curve-style": "bezier",
                        "target-arrow-shape": "triangle",
                        "line-color": "#555",
                        "target-arrow-color": "#555",
                        "font-size": "10px",
                        "text-outline-color": "#111",
                        "text-outline-width": 1
                    }
                }
            ],
            layout: {
                name: "breadthfirst",
                directed: true,
                roots: computeRoots(elements),
                padding: 30,
                spacingFactor: 1.5,
                avoidOverlap: true
            },
            minZoom: 0.1,
            maxZoom: 2,
            wheelSensitivity: 0.2
        });

        cy.on("tap", "node", function(evt){
            const id = evt.target.id();

            if (connectMode) {
                if (connectSource === null) {
                    connectSource = id;
                    evt.target.style("background-color", "#FF9800");
                    alert("Now click the destination scene.");
                    return;
                }

                const text = prompt("Choice text:");
                if (text) {
                    if (!scenes[connectSource].choices) {
                        scenes[connectSource].choices = [];
                    }
                    scenes[connectSource].choices.push({
                        text: text,
                        next: id
                    });
                    autoSave();
                    rebuild();
                }
                connectSource = null;
                connectMode = false;
                const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Connect'));
                if(btn) { btn.style.background = ""; btn.style.color = ""; }
                return;
            }

            selectedScene = id;
            showProperties();
        });

        cy.on("tap", function(evt){
            if(evt.target === cy){
                if (connectMode && connectSource) {
                    cy.$(`#${connectSource}`).style("background-color", "#4CAF50");
                    connectSource = null;
                    connectMode = false;
                    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Connect'));
                    if(btn) { btn.style.background = ""; btn.style.color = ""; }
                }
            }
        });

    } catch (err) {
        console.error("Cytoscape initialization error:", err);
        document.getElementById("graph").innerHTML = "<p style='color:white; padding:20px;'>Error loading graph. Check console.</p>";
    }
}

function showProperties() {
    if (!selectedScene) return;

    const scene = scenes[selectedScene];

    document.getElementById("properties").innerHTML = `
        <h2>${selectedScene}</h2>
        <label>Title</label>
        <input id="titleInput" value="${scene.title || ""}">

        <label>Video Path</label>
        <input id="videoInput" value="${scene.video || ""}">

        <br><br>

        <button onclick="saveScene()"> Save Changes</button>
        <button onclick="addChoice()"> Add Choice</button>
        <button onclick="deleteScene()" style="background:#f44336; color:white;"> Delete Scene</button>
        <hr>
        <h3>Choices</h3>
        <ul>
            ${(scene.choices || []).map((choice, index) => `
                <li style="margin-bottom:5px; display:flex; justify-content:space-between; align-items:center;">
                    <span>${choice.text} → ${choice.next}</span>
                    <span>
                        <button onclick="editChoice(${index})" style="padding:2px 8px; margin-right:4px; cursor:pointer;">Edit</button>
                        <button onclick="deleteChoice(${index})" style="padding:2px 8px; background:#f44336; color:white; border:none; cursor:pointer;">X</button>
                    </span>
                </li>
            `).join("")}
        </ul>
    `;
}

function saveScene() {
    if (!selectedScene) return;
    scenes[selectedScene].title = document.getElementById("titleInput").value;
    scenes[selectedScene].video = document.getElementById("videoInput").value;
    autoSave();
    rebuild();
    showProperties();
}

function addChoice() {
    if (!selectedScene) return;

    const text = prompt("Choice text:");
    if (text === null) return;

    const target = prompt("Destination Scene ID (e.g., scene_002):");
    if (target === null) return;

    if (!scenes[target]) {
        alert("That scene ID does not exist. Create it first.");
        return;
    }

    if (!scenes[selectedScene].choices) {
        scenes[selectedScene].choices = [];
    }
    scenes[selectedScene].choices.push({
        text: text,
        next: target
    });

    autoSave();
    rebuild();
    showProperties();
}

function editChoice(index) {
    if (!selectedScene) return;
    const choice = scenes[selectedScene].choices[index];
    const newText = prompt("Choice text:", choice.text);
    if (newText === null || newText === "") return;
    choice.text = newText;
    autoSave();
    rebuild();
    showProperties();
}

function deleteChoice(index) {
    if (!selectedScene) return;
    scenes[selectedScene].choices.splice(index, 1);
    autoSave();
    rebuild();
    showProperties();
}

function deleteScene() {
    if (!selectedScene) return;
    if (!confirm("Are you sure you want to delete this scene?")) return;

    delete scenes[selectedScene];

    Object.values(scenes).forEach(scene => {
        if (scene.choices) {
            scene.choices = scene.choices.filter(choice => choice.next !== selectedScene);
        }
    });

    selectedScene = null;
    autoSave();
    rebuild();
    document.getElementById("properties").innerHTML = "<h2>Select a scene</h2><p>Click any node to edit.</p>";
}

function setupToolbar() {
    const toolbar = document.getElementById("toolbar");
    if (!toolbar) return;

    toolbar.innerHTML = "";

    const addSceneBtn = document.createElement("button");
    addSceneBtn.textContent = "New Scene";
    addSceneBtn.onclick = function () {
        sceneCounter++;
        let id = "scene_" + String(sceneCounter).padStart(3, "0");

        while (scenes[id]) {
            sceneCounter++;
            id = "scene_" + String(sceneCounter).padStart(3, "0");
        }

        scenes[id] = {
            title: "New Scene",
            video: "",
            choices: []
        };

        selectedScene = id;
        autoSave();
        rebuild();
        showProperties();
    };
    toolbar.appendChild(addSceneBtn);

    const connectBtn = document.createElement("button");
    connectBtn.textContent = " Connect";
    connectBtn.onclick = function () {
        connectMode = !connectMode;
        connectSource = null;
        if (connectMode) {
            connectBtn.style.background = "#FF9800";
            connectBtn.style.color = "black";
            alert("Click the first scene, then click the destination scene.");
        } else {
            connectBtn.style.background = "";
            connectBtn.style.color = "";
            alert("Connect mode disabled.");
            if (cy) cy.$(":selected").style("background-color", "#4CAF50");
        }
    };
    toolbar.appendChild(connectBtn);

    const saveBtn = document.createElement("button");
    saveBtn.textContent = " Save";
    saveBtn.onclick = function () {
        autoSave();
        alert("Project saved to browser storage.");
    };
    toolbar.appendChild(saveBtn);

    const exportBtn = document.createElement("button");
    exportBtn.textContent = " Export";
    exportBtn.onclick = exportScenes;
    toolbar.appendChild(exportBtn);

    const importBtn = document.createElement("button");
    importBtn.textContent = " Import";
    importBtn.onclick = function () {
        document.getElementById("importFile").click();
    };
    toolbar.appendChild(importBtn);

    // FIX: the file input existed in editor.html but nothing was ever
    // listening for its "change" event, so picking a file did nothing.
    const importFileInput = document.getElementById("importFile");
    if (importFileInput) {
        importFileInput.addEventListener("change", importScenes);
    }

    const resetBtn = document.createElement("button");
    resetBtn.textContent = " Reset";
    resetBtn.onclick = function () {
        if (!confirm("Delete local save and reload default?")) return;
        localStorage.removeItem("storyProject");
        location.reload();
    };
    toolbar.appendChild(resetBtn);
}

function exportScenes() {
    const json = JSON.stringify(scenes, null, 4);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "scenes.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function importScenes(event) {
    // FIX: event.target.files is a FileList, not a File — FileReader needs
    // a single File object, so this was passing the wrong type in.
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const imported = JSON.parse(e.target.result);
            scenes = imported;
            sceneCounter = 0;

            Object.keys(scenes).forEach(id => {
                if (id.startsWith("scene_")) {
                    const number = parseInt(id.replace("scene_", ""));
                    if (!isNaN(number) && number > sceneCounter) {
                        sceneCounter = number;
                    }
                }
            });

            selectedScene = null;
            autoSave();
            rebuild();
            alert("Project imported successfully.");
        } catch (err) {
            alert("Invalid JSON file.");
            console.error(err);
        }
    };
    reader.readAsText(file);
    event.target.value = "";
}

window.addEventListener("beforeunload", function () {
    autoSave();
});
