document.addEventListener("DOMContentLoaded", () => {
  fetch("commands.json")
    .then((response) => response.json())
    .then((data) => {
      const commandsContainer = document.getElementById("commandsContainer");

      for (const [category, commands] of Object.entries(data)) {
        const categoryElement = document.createElement("div");
        categoryElement.className = "command-category";
        categoryElement.innerHTML = `<h1 class="fredoka-medium fade-in-button" style="--delay: 0.1s">${category}</h1>`;

        const commandsGrid = document.createElement("div");
        commandsGrid.className = "commands-grid";

        for (const [commandName, commandInfo] of Object.entries(commands)) {
          const commandCard = createCommandCard(commandName, commandInfo);
          commandsGrid.appendChild(commandCard);

          if (commandInfo.subcommands) {
            for (const [subName, subInfo] of Object.entries(
              commandInfo.subcommands
            )) {
              const subCommandCard = createCommandCard(
                `${commandName} ${subName}`,
                subInfo
              );
              commandsGrid.appendChild(subCommandCard);
            }
          }
        }

        commandsContainer.appendChild(categoryElement);
        categoryElement.appendChild(commandsGrid);
      }
    })
    .catch((error) => console.error("Error loading commands:", error));
});

function createCommandCard(name, info) {
  const card = document.createElement("div");
  card.className = "command-card fade-in-button";
  card.style = "--delay: 0.3s";

  card.innerHTML = `
      <div class="command-header">
        <h3>${name}</h3>
        <button class="copy-button" onclick="copyCommand('${name}')">
          <span class="material-symbols-rounded">content_copy</span>
        </button>
      </div>
      <p>${info.description}</p>
      <div class="command-details">
        ${createArgumentsString(info.arguments)}
        ${createPermissionsString(info.permissions)}
      </div>
    `;

  return card;
}

function createArgumentsString(args) {
  if (!args || args.length === 0)
    return "<p><strong>Arguments</strong><br>None</p>";

  const argsList = args
    .map(
      (arg) =>
        `${arg.name}${arg.required ? "*" : ""}${
          arg.default ? `=${arg.default}` : ""
        }`
    )
    .join(", ");

  return `<p><strong>Arguments</strong><br>${argsList}</p>`;
}

function createPermissionsString(permissions) {
  if (!permissions || permissions.length === 0)
    return "<p><strong>Permissions</strong><br>None</p>";

  return `<p><strong>Permissions</strong><br>${permissions.join(", ")}</p>`;
}

function copyCommand(commandName) {
  navigator.clipboard
    .writeText(commandName)
    .then(() => {
      const copyButton = document.querySelector(
        `[onclick="copyCommand('${commandName}')"]`
      );
      const originalIcon = copyButton.innerHTML;
      copyButton.innerHTML =
        '<span class="material-symbols-rounded">check</span>';
      setTimeout(() => {
        copyButton.innerHTML = originalIcon;
      }, 2000);
    })
    .catch((err) => {
      console.error("Failed to copy command: ", err);
    });
}

window.onscroll = function () {
  console.log("Scrolling...");
  scrollFunction();
};

function scrollFunction() {
  console.log("Checking scroll position...");
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    console.log("Showing button");
    backToTopBtn.classList.add("show");
  } else {
    console.log("Hiding button");
    backToTopBtn.classList.remove("show");
  }
}

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}
