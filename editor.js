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

        scenes = JSON.parse(saved);

    } else {

        const res = await fetch("scenes.json");
        scenes = await res.json();

    }

    Object.keys(scenes).forEach(id => {

        if (id.startsWith("scene_")) {

            const n = parseInt(id.replace("scene_", ""));

            if (!isNaN(n) && n > sceneCounter)
                sceneCounter = n;

        }

    });

    setupToolbar();
    buildGraph();

}

function autoSave() {

    localStorage.setItem(
        "storyProject",
        JSON.stringify(scenes)
    );

}

function rebuild() {

    if (cy)
        cy.destroy();

    buildGraph();

    document.getElementById("properties").innerHTML =
        "<h2>Select a scene</h2><p>Click any node.</p>";

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

            if (!scenes[choice.next])
                return;

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

        elements,

        style: [

            {

                selector: "node",

                style: {

                    label: "data(label)",
                    "background-color": "#4CAF50",
                    color: "white",
                    width: 90,
                    height: 90,
                    "text-wrap": "wrap",
                    "text-max-width": 80,
                    "text-valign": "center",
                    "text-halign": "center"

                }

            },

            {

                selector: "edge",

                style: {

                    label: "data(label)",
                    width: 2,
                    "curve-style": "bezier",
                    "target-arrow-shape": "triangle"

                }

            }

        ],

        layout:{
    name:"cose",
    animate:true
}
            padding: 40

        }

    });

    cy.on("tap", "node", function(evt){

        const id = evt.target.id();

        if(connectMode){

            if(connectSource === null){

                connectSource = id;

                alert("Now click the destination scene.");

                return;

            }

            const text = prompt("Choice text:");

            if(text){

                scenes[connectSource].choices.push({

                    text: text,
                    next: id

                });

                autoSave();
                rebuild();

            }

            connectSource = null;
            connectMode = false;

            return;

        }

        selectedScene = id;

        showProperties();

    });

}
function showProperties() {

    if (!selectedScene)
        return;

    const scene = scenes[selectedScene];

    document.getElementById("properties").innerHTML = `

        <h2>${selectedScene}</h2>

        <label>Title</label>
        <input id="titleInput" value="${scene.title || ""}">

        <label>Video</label>
        <input id="videoInput" value="${scene.video || ""}">

        <br><br>

        <button onclick="saveScene()">💾 Save</button>

        <button onclick="addChoice()">➕ Add Choice</button>

        <button onclick="deleteScene()">❌ Delete Scene</button>

        <hr>

        <h3>Choices</h3>

        <ul>

            ${(scene.choices || []).map((choice,index)=>`

                <li>

                    ${choice.text} → ${choice.next}

                    <button onclick="deleteChoice(${index})">

                        ❌

                    </button>

                </li>

            `).join("")}

        </ul>

    `;

}

function saveScene(){

    if(!selectedScene)
        return;

    scenes[selectedScene].title =
        document.getElementById("titleInput").value;

    scenes[selectedScene].video =
        document.getElementById("videoInput").value;

    autoSave();

    rebuild();

}

function addChoice(){

    if(!selectedScene)
        return;

    const text = prompt("Choice text:");

    if(text === null)
        return;

    const target = prompt("Destination Scene ID:");

    if(target === null)
        return;

    if(!scenes[target]){

        alert("That scene doesn't exist.");

        return;

    }

    scenes[selectedScene].choices.push({

        text:text,
        next:target

    });

    autoSave();

    rebuild();

}

function deleteChoice(index){

    if(!selectedScene)
        return;

    scenes[selectedScene].choices.splice(index,1);

    autoSave();

    rebuild();

    selectedScene = null;

}

function deleteScene(){

    if(!selectedScene)
        return;

    if(!confirm("Delete this scene?"))
        return;

    delete scenes[selectedScene];

    Object.values(scenes).forEach(scene=>{

        scene.choices =
            (scene.choices || []).filter(choice=>choice.next!==selectedScene);

    });

    selectedScene = null;

    autoSave();

    rebuild();

}
function setupToolbar() {

    const addSceneBtn = document.getElementById("addSceneBtn");

    addSceneBtn.onclick = function () {

        sceneCounter++;

        let id = "scene_" + sceneCounter;

        while (scenes[id]) {

            sceneCounter++;
            id = "scene_" + sceneCounter;

        }

        scenes[id] = {

            title: "New Scene",
            video: "",
            choices: []

        };

        selectedScene = id;

        autoSave();

        rebuild();

        selectedScene = id;

        showProperties();

    };

    const toolbar = document.getElementById("toolbar");

    const connectBtn = document.createElement("button");

    connectBtn.textContent = "🔗 Connect";

    connectBtn.onclick = function () {

        connectMode = !connectMode;
        connectSource = null;

        if (connectMode)
            alert("Click the first scene, then the destination scene.");
        else
            alert("Connect mode disabled.");

    };

    toolbar.appendChild(connectBtn);

    const saveBtn = document.createElement("button");

    saveBtn.textContent = "💾 Save";

    saveBtn.onclick = function () {

        autoSave();

        alert("Project saved.");

    };

    toolbar.appendChild(saveBtn);

    const exportBtn = document.createElement("button");

    exportBtn.textContent = "⬇ Export";

    exportBtn.onclick = exportScenes;

    toolbar.appendChild(exportBtn);

    const importBtn = document.createElement("button");

    importBtn.textContent = "📂 Import";

    importBtn.onclick = function () {

        document.getElementById("importFile").click();

    };

    toolbar.appendChild(importBtn);

    document.getElementById("importFile").addEventListener("change", importScenes);

    const resetBtn = document.createElement("button");

    resetBtn.textContent = "🗑 Reset";

    resetBtn.onclick = function () {

        if (!confirm("Delete local save?"))
            return;

        localStorage.removeItem("storyProject");

        location.reload();

    };

    toolbar.appendChild(resetBtn);

}
function exportScenes() {

    const json = JSON.stringify(scenes, null, 4);

    const blob = new Blob(
        [json],
        { type: "application/json" }
    );

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

    const file = event.target.files[0];

    if (!file)
        return;

    const reader = new FileReader();

    reader.onload = function(e) {

        try {

            const imported = JSON.parse(e.target.result);

            scenes = imported;

            sceneCounter = 0;

            Object.keys(scenes).forEach(id => {

                if (id.startsWith("scene_")) {

                    const number = parseInt(id.replace("scene_", ""));

                    if (!isNaN(number) && number > sceneCounter)
                        sceneCounter = number;

                }

            });

            selectedScene = null;

            autoSave();

            rebuild();

            alert("Project imported successfully.");

        }

        catch(err) {

            alert("Invalid JSON file.");

            console.error(err);

        }

    };

    reader.readAsText(file);

}

window.addEventListener("beforeunload", function () {

    autoSave();

});
