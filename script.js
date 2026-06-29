let story = {};
let currentNode = "intro";

const video = document.getElementById("videoPlayer");
const choicesDiv = document.getElementById("choices");

fetch("story.json")
  .then(res => res.json())
  .then(data => {
    story = data;
    loadNode(currentNode);
  });

function loadNode(nodeName) {
  const node = story[nodeName];
  currentNode = nodeName;

  video.src = node.video;
  video.play();

  choicesDiv.innerHTML = "";
  choicesDiv.style.display = "none";

  video.onended = () => {
    showChoices(node.choices);
  };
}

function showChoices(choices) {
  if (!choices || choices.length === 0) return;

  choicesDiv.style.display = "flex";

  choices.forEach(choice => {
    const btn = document.createElement("button");
    btn.innerText = choice.text;

    btn.onclick = () => {
      loadNode(choice.next);
    };

    choicesDiv.appendChild(btn);
  });
}
