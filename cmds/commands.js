document.addEventListener("DOMContentLoaded", () => {
  let allCommands = [];
  let categories = [];

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
        });

        const categoryButton = createCategoryButton(
          category,
          categoryCommandCount
        );
        categoryButton.addEventListener("click", () => showCategory(category));
        categorySelector.appendChild(categoryButton);
      }

      updateCategoryButtonCount(allCategoryButton, totalCommands);

      setupSearch();
      showCategory(categories[0].name);
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
  }

  function showCategory(categoryName) {
    if (categoryName === "All") {
      categories.forEach((category) => {
        category.element.style.display = "block";
      });
    } else {
      categories.forEach((category) => {
        category.element.style.display =
          category.name === categoryName ? "block" : "none";
      });
    }
    document.querySelectorAll(".category-button").forEach((button) => {
      button.classList.toggle(
        "active",
        button.querySelector(".category-name").textContent === categoryName
      );
    });
  }

  function setupSearch() {
    const searchInput = document.getElementById("searchInput");
    const searchButton = document.getElementById("searchButton");

    function performSearch() {
      const searchTerm = searchInput.value.toLowerCase().trim();

      let visibleCommandsCount = 0;

      categories.forEach((category) => {
        let categoryVisibleCount = 0;

        category.commands.forEach(({ name, info, element }) => {
          const matches =
            searchTerm === "" ||
            name.toLowerCase().includes(searchTerm) ||
            info.description.toLowerCase().includes(searchTerm);
          element.style.display = matches ? "" : "none";
          if (matches) {
            categoryVisibleCount++;
            visibleCommandsCount++;
          }
        });

        category.element.style.display =
          categoryVisibleCount > 0 ? "block" : "none";
        updateCategoryButtonCount(
          document.querySelector(
            `.category-button:nth-child(${categories.indexOf(category) + 2})`
          ),
          categoryVisibleCount
        );
      });

      updateCategoryButtonCount(
        document.querySelector(".category-button:first-child"),
        visibleCommandsCount
      );

      document.querySelectorAll(".category-button").forEach((button) => {
        button.classList.toggle(
          "active",
          button === document.querySelector(".category-button:first-child")
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
    return "<p><strong>Arguments<br> </strong> <code>None</code></p>";

  const argsList = args.map((arg) => `<code>${arg.name}</code>`).join(" ");

  return `<p><strong>Arguments<br> </strong> ${argsList}</p>`;
}

function createPermissionsString(permissions) {
  if (!permissions || permissions.length === 0)
    return "<p><strong>Permissions<br> </strong> <code>None</code></p>";

  return `<p><strong>Permissions<br> </strong> <code>${permissions.join(
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
