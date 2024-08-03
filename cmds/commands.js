document.addEventListener("DOMContentLoaded", () => {
  let allCommands = [];
  let categories = [];
  let currentSearchTerm = "";

  fetch("commands.json")
    .then((response) => response.json())
    .then((data) => {
      const commandsContainer = document.getElementById("commandsContainer");
      const categorySelector = document.getElementById("categorySelector");

      const allCategoryButton = createCategoryButton("All", 0);
      allCategoryButton.addEventListener("click", () => showCategory("All"));
      categorySelector.appendChild(allCategoryButton);

      let totalCommands = 0;

      for (const [category, commands] of Object.entries(data)) {
        const categoryElement = document.createElement("div");
        categoryElement.className = "command-category";
        categoryElement.dataset.category = category;

        const commandsGrid = document.createElement("div");
        commandsGrid.className = "commands-grid";

        let categoryCommands = [];
        let categoryCommandCount = 0;

        for (const [commandName, commandInfo] of Object.entries(commands)) {
          const commandCard = createCommandCard(commandName, commandInfo);
          commandsGrid.appendChild(commandCard);
          categoryCommands.push({
            name: commandName,
            info: commandInfo,
            element: commandCard,
          });
          categoryCommandCount++;

          if (commandInfo.subcommands) {
            for (const [subName, subInfo] of Object.entries(
              commandInfo.subcommands
            )) {
              const fullSubName = `${commandName} ${subName}`;
              const subCommandCard = createCommandCard(fullSubName, subInfo);
              commandsGrid.appendChild(subCommandCard);
              categoryCommands.push({
                name: fullSubName,
                info: subInfo,
                element: subCommandCard,
              });
              categoryCommandCount++;
            }
          }
        }

        totalCommands += categoryCommandCount;
        categoryElement.appendChild(commandsGrid);
        commandsContainer.appendChild(categoryElement);

        allCommands.push(...categoryCommands);
        categories.push({
          name: category,
          element: categoryElement,
          commands: categoryCommands,
          button: null,
        });

        const categoryButton = createCategoryButton(
          category,
          categoryCommandCount
        );
        categoryButton.addEventListener("click", () => showCategory(category));
        categorySelector.appendChild(categoryButton);
        categories[categories.length - 1].button = categoryButton;
      }
      updateCategoryButtonCount(allCategoryButton, totalCommands);

      setupSearch();
      showCategory("All");
    })
    .catch((error) => console.error("Error loading commands:", error));

  function createCategoryButton(name, count) {
    const button = document.createElement("button");
    button.className = "category-button fade-in";
    button.innerHTML = `
      <span class="command-count">${count}</span>
      <span class="category-name">${name}</span>
    `;
    return button;
  }

  function updateCategoryButtonCount(button, count) {
    button.querySelector(".command-count").textContent = count;
    button.disabled = count === 0;
  }

  function showCategory(categoryName) {
    const commandsContainer = document.getElementById("commandsContainer");
    commandsContainer.innerHTML = "";

    let visibleCommandsCount = 0;

    if (categoryName === "All") {
      const allCommandsGrid = document.createElement("div");
      allCommandsGrid.className = "commands-grid";

      allCommands.forEach((command) => {
        const commandElement = command.element.cloneNode(true);
        if (commandMatchesSearch(command, currentSearchTerm)) {
          commandElement.style.display = "";
          visibleCommandsCount++;
        } else {
          commandElement.style.display = "none";
        }
        allCommandsGrid.appendChild(commandElement);
      });

      commandsContainer.appendChild(allCommandsGrid);
    } else {
      const category = categories.find((cat) => cat.name === categoryName);
      if (category) {
        const categoryGrid = category.element
          .querySelector(".commands-grid")
          .cloneNode(true);
        category.commands.forEach((command, index) => {
          if (commandMatchesSearch(command, currentSearchTerm)) {
            categoryGrid.children[index].style.display = "";
            visibleCommandsCount++;
          } else {
            categoryGrid.children[index].style.display = "none";
          }
        });
        commandsContainer.appendChild(categoryGrid);
      }
    }

    if (visibleCommandsCount === 0) {
      const noResultsDiv = createNoResultsDiv();
      commandsContainer.appendChild(noResultsDiv);
    }

    document.querySelectorAll(".category-button").forEach((button) => {
      const buttonCategoryName =
        button.querySelector(".category-name").textContent;
      button.classList.toggle("active", buttonCategoryName === categoryName);
    });
  }

  function createNoResultsDiv() {
    const noResultsDiv = document.createElement("div");
    noResultsDiv.className = "no-results";
    noResultsDiv.style.cssText = `
      height: calc(var(--card-height) * 2 + var(--grid-gap));
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 1.5rem;
      color: var(--text-color);
      text-align: center;
      width: 100%;
    `;
    noResultsDiv.textContent = "Alas, nothing here.";
    return noResultsDiv;
  }

  function commandMatchesSearch(command, searchTerm) {
    return (
      command.name.toLowerCase().includes(searchTerm) ||
      command.info.description.toLowerCase().includes(searchTerm)
    );
  }

  function setupSearch() {
    const searchInput = document.getElementById("searchInput");
    const searchButton = document.getElementById("searchButton");

    function performSearch() {
      currentSearchTerm = searchInput.value.toLowerCase().trim();

      showCategory("All");

      let visibleCommandsCount = 0;

      categories.forEach((category) => {
        let categoryVisibleCount = category.commands.filter((command) =>
          commandMatchesSearch(command, currentSearchTerm)
        ).length;

        visibleCommandsCount += categoryVisibleCount;

        updateCategoryButtonCount(category.button, categoryVisibleCount);
      });

      updateCategoryButtonCount(
        document.querySelector(".category-button:first-child"),
        visibleCommandsCount
      );

      document.querySelectorAll(".category-button").forEach((button) => {
        button.classList.toggle(
          "active",
          button.querySelector(".category-name").textContent === "All"
        );
      });
    }

    searchButton.addEventListener("click", performSearch);
    searchInput.addEventListener("input", performSearch);
    searchInput.addEventListener("keyup", (event) => {
      if (event.key === "Enter") {
        performSearch();
      }
    });
  }
});

function createCommandCard(name, info) {
  const card = document.createElement("div");
  card.className = "command-card fade-in-button";
  card.style = "--delay: 0.1s";

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
    return "<p>arguments<br> <code id='arg'>None</code></p>";

  const argsList = args
    .map((arg) => `<code id='arg'>${arg.name}</code>`)
    .join(" ");

  return `<p>arguments<br> ${argsList}</p>`;
}

function createPermissionsString(permissions) {
  if (!permissions || permissions.length === 0)
    return "<p>permissions<br> <code id='arg'>None</code></p>";

  return `<p>permissions<br> <code id='arg'>${permissions.join(
    ", "
  )}</code></p>`;
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
  if (
    document.body.scrollTop > 550 ||
    document.documentElement.scrollTop > 550
  ) {
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
