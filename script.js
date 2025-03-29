document.getElementById("file-upload").addEventListener("change", handleFile);

let currentIndex = -1; // Track the currently selected file index
let files = []; // Store parsed files globally

function hideElement(params) {
    document.getElementById(params).classList.add("hidden");
}

function showElement(params) {
    document.getElementById(params).classList.remove("hidden");
}

hideElement("left-view");
hideElement("right-view");

function handleFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const content = e.target.result;
        parseAndRenderPatch(content);
    };
    reader.readAsText(file);
}

function parseAndRenderPatch(patchContent) {
    const fileListContainer = document.getElementById("file-list-container");
    const diffContainerOld = document.getElementById("left-view");
    const diffContainerNew = document.getElementById("right-view");
    fileListContainer.innerHTML = ""; // Clear previous file list
    diffContainerOld.innerHTML = ""; // Clear previous diff
    diffContainerNew.innerHTML = ""; // Clear previous diff

    const lines = patchContent.split("\n");
    files = []; // Reset files array
    let currentFile = null;

    lines.forEach(line => {
        if (line.startsWith("--- ") || line.startsWith("+++ ")) {
            const fileName = line.substring(6).trim();
            if (line.startsWith("--- ")) {
                if (currentFile) files.push(currentFile);
                currentFile = { name: fileName, diff: [] };
            }
        } else if (currentFile) {
            currentFile.diff.push(line);
        }
    });

    if (currentFile) files.push(currentFile); // Push the last file

    // Render file list
    files.forEach((file, index) => {
        const fileItem = document.createElement("div");
        fileItem.className = "file-item";
        fileItem.textContent = file.name;
        fileItem.addEventListener("click", () => {
            hideElement("file-list-container");
            currentIndex = index; // Update current index
            showFileDiff(index);
        });
        fileListContainer.appendChild(fileItem);
    });
}

function showFileDiff(fileIndex) {
    showElement("left-view");
    showElement("right-view");
    const diffContainerOld = document.getElementById("left-view");
    const diffContainerNew = document.getElementById("right-view");
    diffContainerOld.innerHTML = ""; // Clear previous diff
    diffContainerNew.innerHTML = ""; // Clear previous diff

    document.querySelectorAll(".file-item").forEach(item => {
        item.classList.remove("active");
    });

    const selectedFile = files[fileIndex];
    const fileItem = document.querySelectorAll(".file-item")[fileIndex];
    if (fileItem) fileItem.classList.add("active"); // Highlight the selected file

    selectedFile.diff.forEach(line => {
        if (line.startsWith("+") && !line.startsWith("+++")) {
            const div = document.createElement("div");
            div.className = "added";
            div.textContent = line;
            diffContainerNew.appendChild(div);
        } else if (line.startsWith("-") && !line.startsWith("---")) {
            const div = document.createElement("div");
            div.className = "removed";
            div.textContent = line;
            diffContainerOld.appendChild(div);
        } else {
            const div = document.createElement("div");
            div.className = "context";
            div.textContent = line;
            diffContainerOld.appendChild(div);
            diffContainerNew.appendChild(div.cloneNode(true));
        }
    });
}

// Keyboard navigation for [ and ]
document.addEventListener("keydown", (event) => {
    if (event.key === "]") {
        // Navigate to the next file
        if (currentIndex < files.length - 1) {
            currentIndex++;
            showFileDiff(currentIndex);
            hideElement("file-list-container");
        } else {
            showElement("file-list-container");
            hideElement("left-view");
            hideElement("right-view");
            currentIndex = -1;
        }
    } else if (event.key === "[") {
        // Navigate to the previous file
        if (currentIndex > 0) {
            currentIndex--;
            showFileDiff(currentIndex);
            hideElement("file-list-container");
        } else {
            showElement("file-list-container");
            hideElement("left-view");
            hideElement("right-view");
            currentIndex = -1;
        }
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const tabs = document.querySelectorAll(".tab-button");
    const tabContents = document.querySelectorAll(".tab-content");

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            // Remove active class from all tabs and contents
            tabs.forEach(t => t.classList.remove("active"));
            tabContents.forEach(tc => tc.classList.remove("active"));

            // Add active class to clicked tab and corresponding content
            tab.classList.add("active");
            document.getElementById(tab.dataset.tab).classList.add("active");
        });
    });
});

