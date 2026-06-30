const graph = document.getElementById("graph");

let scenes = {};

loadScenes();

async function loadScenes(){

    const response = await fetch("scenes.json");

    scenes = await response.json();

    render();

}

function render(){

    graph.innerHTML = "";

    Object.keys(scenes).forEach(sceneID => {

        const scene = scenes[sceneID];

        const node = document.createElement("div");

        node.className = "node";

        node.innerHTML = `
            <h3>${sceneID}</h3>
            <p>${scene.title}</p>
        `;

        const list = document.createElement("ul");

        scene.choices.forEach(choice => {

            const li = document.createElement("li");

            li.textContent = `${choice.text} → ${choice.next}`;

            list.appendChild(li);

        });

        node.appendChild(list);

        graph.appendChild(node);

    });

}
