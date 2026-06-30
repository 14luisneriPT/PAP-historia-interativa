let connectMode = false;
let connectSource = null;

let scenes = {};
let cy;
let selectedScene = null;
let sceneCounter = 0;

init();

async function init() {

    const res = await fetch("scenes.json");
    scenes = await res.json();

    buildGraph();
    setupToolbar();
}

// ==============================
// GRAPH
// ==============================

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

            elements.push({
                data: {
                    source: id,
                    target: choice.next,
                    label: choice.text
                }
            });

        });

    });

    cy = cytoscape({

        container: document.getElementById("graph"),

        elements: elements,

        style: [
            {
                selector: "node",
                style: {
                    label: "data(label)",
                    "background-color": "#4CAF50",
                    color: "white",
                    "text-valign": "center",
                    "text-halign": "center",
                    width: 80,
                    height: 80
                }
            },

            {
                selector: "edge",
                style: {
                    label: "data(label)",
                    width: 2,
                    "curve-style": "bezier",
                    "target-arrow-shape": "triangle",
                    "font-size": 10
                }
            }
        ],

        layout: {
            name: "breadthfirst",
            directed: true
        }
    });

    cy.on("tap", "node", (evt) => {

        const id = evt.target.id();

        // CONNECT MODE
        if (connectMode) {

            if (!connectSource) {

                connectSource = id;
                alert("Now click target scene");

            } else {

                const target = id;
                const text = prompt("Choice text?");

                if (!text) return;

                if (!scenes[connectSource].choices) {
                    scenes[connectSource].choices = [];
                }

                scenes[connectSource].choices.push({
                    text,
                    next: target
                });

                connectMode = false;
                connectSource = null;

                rebuild();
                return;
            }
        }

        selectedScene = id;
        showProperties();
    });
}

// ==============================
// PROPERTIES PANEL
// ==============================

function showProperties() {

    const scene = scenes[selectedScene];

    document.getElementById("properties").innerHTML = `
        <h2>${selectedScene}</h2>

        <label>Title</label>
        <input id="titleInput" value="${scene.title || ""}">

        <label>Video</label>
        <input id="videoInput" value="${scene.video || ""}">

        <button onclick="saveScene()">💾 Save</button>
        <button onclick="addChoice()">➕ Add Choice</button>
        <button onclick="deleteScene()">❌ Delete</button>

        <hr>

        <h3>Choices</h3>
        <ul>
            ${(scene.choices || []).map(c => `
                <li>${c.text} → ${c.next}</li>
            `).join("")}
        </ul>
    `;
}

// ==============================
// SAVE
// ==============================

function saveScene() {

    scenes[selectedScene].title =
        document.getElementById("titleInput").value;

    scenes[selectedScene].video =
        document.getElementById("videoInput").value;

    rebuild();
}

// ==============================
// ADD CHOICE
// ==============================

function addChoice() {

    const text = prompt("Choice text?");
    const next = prompt("Target scene ID?");

    if (!text || !next) return;

    if (!scenes[selectedScene].choices) {
        scenes[selectedScene].choices = [];
    }

    scenes[selectedScene].choices.push({
        text,
        next
    });

    rebuild();
}

// ==============================
// DELETE SCENE
// ==============================

function deleteScene() {

    if (!confirm("Delete scene?")) return;

    delete scenes[selectedScene];
    selectedScene = null;

    rebuild();
}

// ==============================
// REBUILD GRAPH
// ==============================

function rebuild() {

    cy.destroy();
    buildGraph();

    document.getElementById("properties").innerHTML =
        "<p>Select a scene.</p>";
}

// ==============================
// TOOLBAR
// ==============================

function setupToolbar() {

    const toolbar = document.getElementById("toolbar");

    // NEW SCENE
    const btn = document.createElement("button");
    btn.textContent = "➕ New Scene";

    btn.onclick = () => {

        const id = prompt("Scene ID?");
        const title = prompt("Title?");
        const video = prompt("Video path?");

        if (!id || scenes[id]) return;

        scenes[id] = {
            title,
            video,
            choices: []
        };

        rebuild();
    };

    toolbar.appendChild(btn);

    // CONNECT MODE
    const connectBtn = document.createElement("button");
    connectBtn.textContent = "🔗 Connect";

    connectBtn.onclick = () => {

        connectMode = !connectMode;
        connectSource = null;

        alert(connectMode
            ? "Connect mode ON"
            : "Connect mode OFF");
    };

    toolbar.appendChild(connectBtn);

    // EXPORT
    const exportBtn = document.createElement("button");
    exportBtn.textContent = "⬇ Export";

    exportBtn.onclick = exportScenes;

    toolbar.appendChild(exportBtn);
}

// ==============================
// EXPORT
// ==============================

function exportScenes() {

    const json = JSON.stringify(scenes, null, 4);

    const blob = new Blob([json], { type: "application/json" });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "scenes.json";
    a.click();

    URL.revokeObjectURL(url);
}
