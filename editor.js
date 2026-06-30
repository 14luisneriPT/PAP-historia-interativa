let scenes = {};

init();

async function init() {

    const response = await fetch("scenes.json");

    scenes = await response.json();

    createGraph();

}

function createGraph() {

    const elements = [];

    Object.keys(scenes).forEach(sceneID => {

        const scene = scenes[sceneID];

        elements.push({

            data: {

                id: sceneID,
                label: scene.title

            }

        });

        scene.choices.forEach(choice => {

            elements.push({

                data: {

                    source: sceneID,
                    target: choice.next,
                    label: choice.text

                }

            });

        });

    });

    const cy = cytoscape({

        container: document.getElementById("graph"),

        elements: elements,

        style: [

            {

                selector: "node",

                style: {

                    label: "data(label)",

                    "text-valign": "center",

                    "text-halign": "center",

                    "background-color": "#4CAF50",

                    color: "white",

                    width: 90,

                    height: 90,

                    "font-size": 14

                }

            },

            {

                selector: "edge",

                style: {

                    label: "data(label)",

                    width: 3,

                    "curve-style": "bezier",

                    "target-arrow-shape": "triangle",

                    "font-size": 10

                }

            }

        ],

        layout: {

            name: "breadthfirst",

            directed: true,

            spacingFactor: 1.5

        }

    });

    cy.on("tap", "node", function(evt){

        const node = evt.target;

        alert(node.id());

    });

}
