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

            input.addEventListener("input", () => {
                verifierSudoku();

                if (sudokuComplet(grille, solution)) {
                    alert("Bravo !");
                }
            });
        }
    }
}


function verifierSudoku() {
    const inputs = document.querySelectorAll("input");
    inputs.forEach(input => {
        input.classList.remove("invalide")
    });

    // vérif lignes
    for (let ligne = 0; ligne < 9; ligne++) {
        verifierLigne(ligne);
    }

    // vérif colonnes
    for (let col = 0; col < 9; col++) {
        verifierColonne(col);
    }

    // vérifier carrés
    for (let blocLigne = 0; blocLigne < 3; blocLigne++) {
        for (let blocCol = 0; blocCol < 3; blocCol++) {
            verifierCarre(blocLigne, blocCol);
        }
    }
}

function verifierLigne(ligne) {
    const dejaVus = [];

    for (let col = 0; col < 9; col++) {
        const input = document.getElementById(`case${ligne}-${col}`);
        const valeur = input.value;

        if (valeur !== "") {
            if (dejaVus.includes(valeur)) {
                input.classList.add("invalide");
            } else {
                dejaVus.push(valeur);
            }
        }
    }
}

function verifierColonne(col) {
    const dejaVus = [];

    for (let ligne = 0; ligne < 9; ligne++) {
        const input = document.getElementById(`case${ligne}-${col}`);
        const valeur = input.value;

        if (valeur !== "") {

            if (dejaVus.includes(valeur)) {
                input.classList.add("invalide");
            } else {
                dejaVus.push(valeur);
            }
        }
    }
}

function verifierCarre(blocLigne, blocCol) {
    const dejaVus = [];

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {

            const ligne = blocLigne * 3 + i;
            const col = blocCol * 3 + j;

            const input = document.getElementById(`case${ligne}-${col}`);
            const valeur = input.value;

            if (valeur !== "") {
                if (dejaVus.includes(valeur)) {
                    input.classList.add("invalide");
                } else {
                    dejaVus.push(valeur);
                }
            }
        }
    }
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
