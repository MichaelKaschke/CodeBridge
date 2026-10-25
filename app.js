const CONFIG = {
 
matlabRepo:
"https://raw.githubusercontent.com/sn-code-inside/fingeruebungen-physik/main",
 
matlabGithub:
"https://github.com/sn-code-inside/fingeruebungen-physik/blob/main",
 
pythonRepo:
"https://raw.githubusercontent.com/sn-code-inside/fingeruebungen-physik/main/python",
 
pythonGithub:
"https://github.com/sn-code-inside/fingeruebungen-physik/blob/main/python"
};
const files = {};
let currentLanguage = null;
let sideBySide = false;


/* ------------------------------------- */
/* URL aus Hash lesen                    */
/* ------------------------------------- */

function getSimPath() {

    return window.location.hash
        .replace(/^#/, "")
        .trim();
}


/* ------------------------------------- */
/* Theme                                 */
/* ------------------------------------- */

function setTheme(lang) {

    const root =
        document.documentElement;

    switch (lang) {

        case "matlab":
            root.style.setProperty(
                "--accent",
                "#1565c0"
            );
            break;

        case "python":
            root.style.setProperty(
                "--accent",
                "#c62828"
            );
            break;

        case "notebook":
            root.style.setProperty(
                "--accent",
                "#7b1fa2"
            );
            break;
    }
}


/* ------------------------------------- */
/* Laden                                 */
/* ------------------------------------- */

async function fetchFile(url) {

    console.log(
        "Load:",
        url
    );

    const response =
        await fetch(url);

    console.log(
        response.status,
        url
    );

    if (!response.ok) {
        throw new Error(
            response.status
        );
    }

    return await response.text();
}


async function tryLoad(
    url,
    githubUrl
) {

    try {

        const content =
            await fetchFile(url);

        return {
            content,
            github: githubUrl
        };
    }
    catch {

        return null;
    }
}


/* ------------------------------------- */
/* Notebook -> Python                    */
/* ------------------------------------- */

function notebookToPython(text) {

    try {

        const nb =
            JSON.parse(text);

        let code = "";

        for (const cell of nb.cells) {

            if (
                cell.cell_type ===
                "code"
            ) {

                code +=
                    cell.source.join("")
                    + "\n\n";
            }
        }

        return code;
    }
    catch {

        return text;
    }
}


/* ------------------------------------- */
/* Buttons                               */
/* ------------------------------------- */

function addLanguageButton(
    language,
    caption
) {

    const button =
        document.createElement(
            "button"
        );

    button.className =
        "lang-btn";

    button.id =
        `btn-${language}`;

    button.textContent =
        caption;

    button.addEventListener(
        "click",
        () => showLanguage(
            language
        )
    );

    document
        .getElementById(
            "languageButtons"
        )
        .appendChild(
            button
        );
}


/* ------------------------------------- */
/* Side-by-Side                          */
/* ------------------------------------- */

function showSideBySide() {

    sideBySide = true;

    document
        .getElementById("singleViewer")
        .style.display = "none";

    document
        .getElementById("splitViewer")
        .style.display = "flex";

    const matlabCode =
        document.getElementById("codeMatlab");

    matlabCode.textContent =
        files.matlab.content;

    matlabCode.className =
        "language-matlab";

    Prism.highlightElement(matlabCode);

    const rightLang =
        files.python ? "python" : "notebook";

    const panelPy =
        document.getElementById("panelPython");

    panelPy.classList.remove(
        "bg-python",
        "bg-notebook"
    );

    panelPy.classList.add(
        "bg-" + rightLang
    );

    const rightCode =
        document.getElementById("codePython");

    rightCode.textContent =
        files[rightLang].content;

    rightCode.className =
        "language-python";

    Prism.highlightElement(rightCode);

    document
        .querySelectorAll(".lang-btn")
        .forEach(b =>
            b.classList.remove("active")
        );

    document
        .getElementById("btn-matlab")
        .classList.add("active");

    document
        .getElementById("btn-" + rightLang)
        .classList.add("active");

    document
        .getElementById("sideBySideBtn")
        .classList.add("active");
}


function hideSideBySide() {

    sideBySide = false;

    document
        .getElementById("splitViewer")
        .style.display = "none";

    document
        .getElementById("singleViewer")
        .style.display = "";

    document
        .getElementById("sideBySideBtn")
        .classList.remove("active");
}


function toggleSideBySide() {

    if (sideBySide) {

        hideSideBySide();
        showLanguage(currentLanguage);

    } else {

        showSideBySide();
    }
}


/* ------------------------------------- */
/* Anzeige                               */
/* ------------------------------------- */

function showLanguage(
    language
) {

    if (sideBySide) {
        hideSideBySide();
    }

    currentLanguage =
        language;

    setTheme(language);

    const viewer =
        document.getElementById("viewer");

    viewer.classList.remove(
        "bg-matlab",
        "bg-python",
        "bg-notebook"
    );

    viewer.classList.add(
        "bg-" + language
    );

    const file =
        files[language];

    const code =
        document.getElementById(
            "sourceCode"
        );

    code.textContent =
        file.content;

    if (
        language ===
        "matlab"
    ) {

        code.className =
            "language-matlab";
    }
    else {

        code.className =
            "language-python";
    }

    Prism.highlightElement(
        code
    );

    document
        .getElementById(
            "githubLink"
        ).href =
        file.github;

    document
        .querySelectorAll(
            ".lang-btn"
        )
        .forEach(btn =>
            btn.classList.remove(
                "active"
            )
        );

    document
        .getElementById(
            `btn-${language}`
        )
        .classList.add(
            "active"
        );
}


/* ------------------------------------- */
/* Initialisierung                       */
/* ------------------------------------- */

async function init() {

    const sim =
        getSimPath();

    if (!sim) {

        document
            .getElementById(
                "status"
            )
            .textContent =
            "URL-Beispiel: #hm/AbflachungSonne";

        return;
    }

    document
        .getElementById(
            "simPath"
        )
        .textContent =
        sim;

    files.matlab =
        await tryLoad(
            `${CONFIG.matlabRepo}/${sim}.m`,
            `${CONFIG.matlabGithub}/${sim}.m`
        );

    files.python =
        await tryLoad(
            `${CONFIG.pythonRepo}/${sim}.py`,
            `${CONFIG.pythonGithub}/${sim}.py`
        );

    const notebook =
        await tryLoad(
            `${CONFIG.pythonRepo}/${sim}.ipynb`,
            `${CONFIG.pythonGithub}/${sim}.ipynb`
        );

    if (notebook) {

        notebook.content =
            notebookToPython(
                notebook.content
            );

        files.notebook =
            notebook;
    }

    if (files.matlab) {
        addLanguageButton(
            "matlab",
            "MATLAB"
        );
    }

    if (files.python) {
        addLanguageButton(
            "python",
            "Python"
        );
    }

    if (files.notebook) {
        addLanguageButton(
            "notebook",
            "Notebook"
        );
    }

    if (files.matlab) {

        showLanguage(
            "matlab"
        );
    }
    else if (
        files.python
    ) {

        showLanguage(
            "python"
        );
    }
    else if (
        files.notebook
    ) {

        showLanguage(
            "notebook"
        );
    }
    else {

        document
            .getElementById(
                "status"
            )
            .textContent =
            "Keine Datei gefunden.";

        return;
    }


    if (
        files.matlab &&
        (files.python || files.notebook)
    ) {

        const sbsBtn =
            document.getElementById(
                "sideBySideBtn"
            );

        sbsBtn.classList.remove("hidden");

        sbsBtn.addEventListener(
            "click",
            toggleSideBySide
        );
    }
}


/* ------------------------------------- */
/* Neu laden bei Hash-Änderung           */
/* ------------------------------------- */

window.addEventListener(
    "hashchange",
    () => location.reload()
);

init();
