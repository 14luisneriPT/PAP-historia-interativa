let scenes = {};

let selectedScene = null;

let cy;

init();

async function init(){

    const response = await fetch("scenes.json");

    scenes = await response.json();

    createGraph();

}

function createGraph(){

    const elements=[];

    Object.keys(scenes).forEach(sceneID=>{

        const scene=scenes[sceneID];

        elements.push({

            data:{
                id:sceneID,
                label:scene.title
            }

        });

        scene.choices.forEach(choice=>{

            elements.push({

                data:{
                    source:sceneID,
                    target:choice.next,
                    label:choice.text
                }

            });

        });

    });

    cy=cytoscape({

        container:document.getElementById("graph"),

        elements:elements,

        style:[

            {

                selector:"node",

                style:{

                    label:"data(label)",

                    "background-color":"#4CAF50",

                    color:"white",

                    "text-valign":"center",

                    "text-halign":"center",

                    width:80,

                    height:80

                }

            },

            {

                selector:"edge",

                style:{

                    label:"data(label)",

                    width:3,

                    "curve-style":"bezier",

                    "target-arrow-shape":"triangle"

                }

            }

        ],

        layout:{

            name:"breadthfirst",

            directed:true,

            spacingFactor:1.6

        }

    });

    cy.on("tap","node",function(evt){

        selectedScene=evt.target.id();

        updateProperties();

    });

}

function updateProperties(){

    const scene=scenes[selectedScene];

    const panel=document.getElementById("properties");

    let choicesHTML="";

    scene.choices.forEach(choice=>{

        choicesHTML+=`
            <li>${choice.text} → ${choice.next}</li>
        `;

    });

    panel.innerHTML=`

        <h2>${selectedScene}</h2>

        <label>Title</label>

        <input
            id="titleInput"
            value="${scene.title}"
        >

        <label>Video</label>

        <input
            id="videoInput"
            value="${scene.video}"
        >

        <h3>Choices</h3>

        <ul>

            ${choicesHTML}

        </ul>

        <button onclick="saveScene()">

            Save

        </button>

    `;

}

function saveScene(){

    scenes[selectedScene].title=
        document.getElementById("titleInput").value;

    scenes[selectedScene].video=
        document.getElementById("videoInput").value;

    cy.getElementById(selectedScene).data(
        "label",
        scenes[selectedScene].title
    );

    alert("Saved in memory.\n\nThe next step will export it to scenes.json.");

}
