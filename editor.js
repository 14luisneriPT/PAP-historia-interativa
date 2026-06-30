const graph = document.getElementById("graph");
const properties = document.getElementById("properties");

let scenes = {};
let selectedScene = null;

init();

async function init(){

    const response = await fetch("scenes.json");

    scenes = await response.json();

    renderGraph();

}

function renderGraph(){

    graph.innerHTML = "";

    Object.keys(scenes).forEach(sceneID=>{

        const scene = scenes[sceneID];

        const card = document.createElement("div");

        card.className = "sceneCard";

        card.innerHTML = `
            <strong>${sceneID}</strong><br>
            ${scene.title}
        `;

        card.onclick=()=>{

            selectedScene=sceneID;

            renderProperties();

        };

        graph.appendChild(card);

    });

}

function renderProperties(){

    const scene=scenes[selectedScene];

    properties.innerHTML=`

        <p><b>ID</b></p>
        <p>${selectedScene}</p>

        <p><b>Title</b></p>

        <input
            type="text"
            value="${scene.title}"
            disabled
        >

        <p><b>Video</b></p>

        <input
            type="text"
            value="${scene.video}"
            disabled
        >

        <p><b>Choices</b></p>

        <ul>

            ${
                scene.choices.map(choice=>`

                    <li>

                        ${choice.text}

                        →

                        ${choice.next}

                    </li>

                `).join("")
            }

        </ul>

    `;

}
