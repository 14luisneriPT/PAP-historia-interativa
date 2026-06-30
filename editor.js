let scenes = {};
let cy;
let selectedScene = null;

init();

async function init() {

    const res = await fetch("scenes.json");
    scenes = await res.json();

    buildGraph();
    setupToolbar();

}

function buildGraph() {

    const elements = [];

    Object.keys(scenes).forEach(id => {

        const scene = scenes[id];

        elements.push({
            data: {
                id: id,
                label: scene.title
            }
        });

        scene.choices.forEach(choice => {

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

        selectedScene = evt.target.id();
        showProperties();

    });

}

function showProperties() {

    const scene = scenes[selectedScene];

    document.getElementById("properties").innerHTML = `

        <h2>${selectedScene}</h2>

        <label>Title</label>
        <input id="titleInput" value="${scene.title}">

        <label>Video</label>
        <input id="videoInput" value="${scene.video}">

        <button onclick="saveScene()">💾 Save</button>
        <button onclick="addChoice()">➕ Add Choice</button>
        <button onclick="deleteScene()">❌ Delete Scene</button>

        <hr>

        <h3>Choices</h3>

        <ul>
            ${scene.choices.map(c => `
                <li>${c.text} → ${c.next}</li>
            `).join("")}
        </ul>

    `;

}

function saveScene() {

    scenes[selectedScene].title =
        document.getElementById("titleInput").value;

    scenes[selectedScene].video =
        document.getElementById("videoInput").value;

    cy.getElementById(selectedScene).data(
        "label",
        scenes[selectedScene].title
    );

    alert("Saved (memory only)");

}

function addChoice() {

    const text = prompt("Choice text?");
    const next = prompt("Target scene ID?");

    if (!text || !next) return;

    scenes[selectedScene].choices.push({
        text,
        next
    });

    rebuild();

}

function deleteScene() {

    if (!confirm("Delete this scene?")) return;

    delete scenes[selectedScene];

    selectedScene = null;

    rebuild();

}

function rebuild() {

    cy.destroy();
    buildGraph();

    document.getElementById("properties").innerHTML =
        "<p>Select a scene.</p>";

}

function setupToolbar() {

    const toolbar = document.getElementById("toolbar");

    const btn = document.createElement("button");
    btn.textContent = "➕ New Scene";

    btn.onclick = () => {

        const id = prompt("Scene ID? (e.g. scene_004)");
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

}

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
