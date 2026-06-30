let scenes = {};
let cy;
let selectedScene = null;

init();

async function init() {

    const response = await fetch("scenes.json");

    scenes = await response.json();

    buildGraph();

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

                    "text-halign": "center"

                }

            },

            {

                selector: "edge",

                style: {

                    label: "data(label)",

                    width: 3,

                    "curve-style": "bezier",

                    "target-arrow-shape": "triangle"

                }

            }

        ],

        layout: {

            name: "breadthfirst",

            directed: true

        }

    });

    cy.on("tap", "node", function(evt) {

        selectedScene = evt.target.id();

        showProperties();

    });

}

function showProperties() {

    const scene = scenes[selectedScene];

    document.getElementById("properties").innerHTML = `

        <h2>${selectedScene}</h2>

        <p>Title</p>

        <input
            id="titleInput"
            value="${scene.title}"
        >

        <p>Video</p>

        <input
            id="videoInput"
            value="${scene.video}"
        >

        <button onclick="saveScene()">
            Save Changes
        </button>

        <hr>

        <h3>Choices</h3>

        <ul>

            ${scene.choices.map(choice => `
                <li>${choice.text} → ${choice.next}</li>
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

    alert("Scene updated in memory.");

}

function exportScenes() {

    const json = JSON.stringify(
        scenes,
        null,
        4
    );

    const blob = new Blob(
        [json],
        {
            type: "application/json"
        }
    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;

    a.download = "scenes.json";

    a.click();

    URL.revokeObjectURL(url);

}
