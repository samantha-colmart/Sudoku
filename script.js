const main = document.getElementById("main");
RecupEnquetes();

// Fonction asynchrone pour récupérer les infos d'une enquête à partir de son numéro
async function RecupEnqueteId(id) {
    const url = "enquetes.json";
    try {
        const response = await fetch(url);
        if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
        }

        const enquetes = await response.json();
        const enquete = enquetes[id-1];
        return enquete;
    } catch (error) {
        console.error(error.message);
    }
}

// Fonction asynchrone pour récupérer une grille de sudoku à partir d'un appel API
async function RecupSudoku() {
    const url = "https://sudoku-api.vercel.app/api/dosuku";
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const sudoku = await response.json();
        const grille = sudoku["newboard"]["grids"][0]["value"];
        const solution = sudoku["newboard"]["grids"][0]["solution"];
        return [grille, solution];
    } catch (error) {
        console.error(error.message);
    }
}

// Fonction asynchrone pour récupérer tous les scénarios d'enquêtes présents dans le fichier JSON puis les afficher
async function RecupEnquetes() {
    const url = "enquetes.json";

    try {
        const response = await fetch(url);
        const enquetes = await response.json();
        main.innerHTML = "";
        enquetes.forEach(enquete => {
            const classe = enquete.locked ? "level-card locked" : "level-card active";
            const div = document.createElement("div");
            div.className = classe;
            div.dataset.id = enquete.num;

            div.innerHTML = `
                <div class='affaire'>AFFAIRE #${enquete.num}</div>
                <h3>${enquete.titre}</h3>
                <div class='date'>${enquete.date}</div>
            `;

            if (!enquete.locked) {
                div.addEventListener("click", () => lancerEnquete(enquete.num));
            }
            main.appendChild(div);
        });

    } catch (error) {
        console.error(error.message);
    }
}

// Fonction asynchrones pour lancer une enquête après le choix de l'utilisateur (effacer les scénarios pour afficher celui choisi ainsi que la grille)
async function lancerEnquete(id) {
    const enquete = await RecupEnqueteId(id);
    main.innerHTML = "";
    main.innerHTML = `
        <h2>${enquete.titre}</h2>
        <p>${enquete.description}</p>
        <div id="sudoku-container">
            ${genererGrilleHTML()}
        </div>
    `;
    const [grille, solution] = await RecupSudoku();
    initSudoku(grille, solution);
}

// Fonction pour afficher la grille de sudoku de manière dynamique
function genererGrilleHTML() {
    let html = "<table><tbody>";
    for (let ligne = 0; ligne < 9; ligne++) {
        html += "<tr>";
        for (let col = 0; col < 9; col++) {
            html += `
                <td>
                    <input type="number" min="1" max="9" id="case${ligne}-${col}">
                </td>
            `;
        }
        html += "</tr>";
    }
    html += "</tbody></table>";
    return html;
}

// Fonction pour gérer les saisies dans la grille et vérifier si le joueur termine la partie
function initSudoku(grille, solution) {
    for (let ligne = 0; ligne < 9; ligne++) {
        for (let col = 0; col < 9; col++) {

            const input = document.getElementById(`case${ligne}-${col}`);
            const valeur = grille[ligne][col];

            if (valeur !== 0) {
                input.value = valeur;
                input.disabled = true;
                input.classList.add("fixe");
            }

            input.addEventListener("input", (e) => {
                verifierSudoku(e.target);

                if (sudokuComplet(grille, solution)) {
                    alert("Bravo !");
                }
            });
        }
    }
}


function verifierSudoku(inputActif) {
    const inputs = document.querySelectorAll("input");
    inputs.forEach(input => {
        input.classList.remove("invalide")
    });

    const coordonnees = inputActif.id.replace("case", "").split("-");
    const ligne = parseInt(coordonnees[0]);
    const col = parseInt(coordonnees[1]);
    const valeur = inputActif.value;

    if (valeur === "") {
        return;
    }

    if ((!verifierLigne(ligne, col, valeur) || !verifierColonne(col, ligne, valeur) || !verifierCarreUnique(ligne, col, valeur)) || (valeur > 9 || valeur <= 0)){
        inputActif.classList.add("invalide");
    }
}

function verifierLigne(ligne, colActuel, valeur) {
    for (let col = 0; col < 9; col++) {
        if (col !== colActuel) {
            const input = document.getElementById(`case${ligne}-${col}`);
            if (input.value == valeur) {
                return false;
            }
        }
    }
    return true;
}

function verifierColonne(col, ligneActuelle, valeur) {
    for (let ligne = 0; ligne < 9; ligne++) {
        if (ligne !== ligneActuelle) {
            const input = document.getElementById(`case${ligne}-${col}`);
            if (input.value == valeur) {
                return false;
            }
        }
    }
    return true;
}

function verifierCarreUnique(ligne, col, valeur) {
    const startLigne = Math.floor(ligne / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {

            const l = startLigne + i;
            const c = startCol + j;

            if (l !== ligne && c !== col) {
                const input = document.getElementById(`case${l}-${c}`);
                if (input.value == valeur) {
                    return false;
                }
            }         
        }
    }
    return true;
}

// Fonction pour vérifier si la grille est entièrement et correctement complétée
function sudokuComplet(grille, solution) {
    for (let ligne = 0; ligne < 9; ligne++) {
        for (let col = 0; col < 9; col++) {

            const input = document.getElementById(`case${ligne}-${col}`);
            const valeur = input.value;

            if (valeur !== solution[ligne][col]) {
                return false;
            }
        }
    }
    return true;
}
