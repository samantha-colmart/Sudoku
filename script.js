const main = document.getElementById("main");
RecupEnquetes();
let score = 0;
let scoreEvolution = 0;
let secondes = 0;
let chrono = null;

const musique = new Audio("audios/musique_fond.mp3");
musique.loop = true;
musique.volume = 0.2;

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
        const grid = document.createElement("section");
        grid.className = "grid";
        enquetes.forEach(enquete => {
            const classe = enquete.locked ? "level-card locked" : "level-card active";
            const div = document.createElement("div");
            div.className = classe;
            div.dataset.id = enquete.num;

            div.innerHTML = `
                <img src="${enquete.image}" alt="image ${enquete.titre}">
                <p class='affaire'>AFFAIRE #${enquete.num}</p>
                <h3>${enquete.titre}</h3>
                <p class='date'>${enquete.date}</p>
            `;

            if (!enquete.locked) {
                div.addEventListener("click", () => lancerEnquete(enquete.num));
            }
            grid.appendChild(div);
            main.appendChild(grid);
        });

    } catch (error) {
        console.error(error.message);
    }
}

// Fonction asynchrones pour lancer une enquête après le choix de l'utilisateur (effacer les scénarios pour afficher celui choisi ainsi que la grille)
async function lancerEnquete(id) {
    musique.play();
    const enquete = await RecupEnqueteId(id);
    chrono = window.setInterval(incrementerChrono, 1000);
    main.innerHTML = "";
    main.innerHTML = `
        <section class="enquete-container">
            <div class="enquete-header">
                <p class="badge-affaire">AFFAIRE #${enquete.num}</p>
                <h2 class="enquete-titre">${enquete.titre}</h2>
                <p class="enquete-date">${enquete.date}</p>
                <div class="chrono-container">
                    Temps : <span id="chrono">0:00</span>
                </div>
            </div>
            <div class="enquete-description">
                <p>${enquete.description}</p>
            </div>
            <div id="sudoku-container">
                ${genererGrilleHTML()}
            </div>
        </section>
    `;
    const [grille, solution] = await RecupSudoku();
    console.log(solution);
    initSudoku(grille, solution, enquete);
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
function initSudoku(grille, solution, enquete) {
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
                grille[ligne][col] = parseInt(input.value);
                verifierSudoku(e.target);

                const carres = verifierCarreComplet(grille, solution);
                score = carres.length;

                if (score > scoreEvolution) {
                    showNotification(`Indice n°${score} collecté`);
                    scoreEvolution = score;
                }

                if (sudokuComplet(grille, solution)) {
                    window.clearInterval(chrono);
                    chrono = null;
                    afficherFinEnquete(enquete);
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

function verifierCarreComplet(grille, solution) {
    let carresCompletes = [];
    for (let i = 0; i < 9; i += 3) {
        for (let j = 0; j < 9; j += 3) {
            if (verifierCarreUniqueComplet(i, j, grille, solution)) {
                carresCompletes.push([i, j]);
            }
        }
    }
    return carresCompletes;
}

function verifierCarreUniqueComplet(startLigne, startCol, grille, solution){
    for(let i = 0; i < 3; i++){
        for(let j = 0; j < 3; j++){
            let l = startLigne + i;
            let c = startCol + j;
            if(grille[l][c] !== solution[l][c]){
                return false;
            }
        }
    }
    colorerCarre(startLigne, startCol);
    return true;
}

function colorerCarre(startLigne, startCol){
    for(let i = 0; i < 3; i++){
        for(let j = 0; j < 3; j++){
            let input = document.getElementById(`case${startLigne+i}-${startCol+j}`);
            if (!input.classList.contains("valide")) {
                input.classList.add("valide");
                input.disabled = true;
            }
        }
    }
}

// Fonction pour vérifier si la grille est entièrement et correctement complétée
function sudokuComplet(grille, solution) {
    for (let ligne = 0; ligne < 9; ligne++) {
        for (let col = 0; col < 9; col++) {
            if (grille[ligne][col] !== solution[ligne][col]) {
                return false;
            }
        }
    }
    return true;
}

function showNotification(message) {
    const notif = document.getElementById('notification');
    notif.textContent = message;
    notif.classList.remove('hidden');

    setTimeout(() => {
        notif.classList.add('hidden');
    }, 2000);
}

function afficherFinEnquete(enquete) {
    main.innerHTML = "";

    let html = `
        <section class="enquete-container">
            <div class="enquete-header">
                <p class="badge-affaire">AFFAIRE #${enquete.num}</p>
                <h2 class="enquete-titre">${enquete.titre}</h2>
                <p class="enquete-date">${enquete.date}</p>
            </div>
            <div class="enquete-description">
                <p>${enquete.description}</p>
            </div>
            <div class="enquete-consignes">
                <p>À partir des indices que vous venez de récolter, analysez les informations à votre disposition pour identifier le coupable. Sélectionnez le suspect que vous jugez responsable, puis terminez l’enquête afin de vérifier si votre déduction est correcte.</p>
            </div>
            <section class="form-suspects">
                <div class="indices">
                    <h3>Indices récoltés :</h3>
                    <ul>
    `;
    for (let i = 0; i < enquete.indices.length-1; i++) {
        html += `<li>${enquete.indices[i]}</li>`;
    }
    if(secondes < 1200){
        html += `<li>${enquete.indices[9]}</li>`;
    } else{
        html += `<li>Vous avez raté un indice...</li>`;
    }
    html += `
                </ul>
            </div>
            <form class="suspects-list">
    `;
    for (let i = 0; i < enquete.suspects.length; i++) {
        const suspect = enquete.suspects[i];
        html += `
            <div class="choix_suspect" data-id="${suspect.id}">
                <input type="radio" name="suspect" value="${suspect.id}" id="suspect-${suspect.id}" />
                <label for="suspect-${suspect.id}">
                    <div class="suspect_content">
                        <img src="${suspect.image}" alt="${suspect.nom}">
                    </div>
                </label>
                <button type="button" class="eliminer">Éliminer</button>
            </div>
        `;
    }
    html += `
            </form>
            <button type="button" class="terminer-enquete">Terminer l'enquête</button>
        </section>
    </section>
    `;

    main.innerHTML = html;

    const boutonsEliminer = main.querySelectorAll(".eliminer");
    boutonsEliminer.forEach(btn => {
        btn.addEventListener("click", (e) => {
            const parent = e.target.parentNode;
            parent.classList.add("elimine");
            const input = parent.querySelector("input[type='radio']");
            input.disabled = true;
        });
    });

    const submitBtn = main.querySelector(".terminer-enquete");
    submitBtn.addEventListener("click", () => {
        const selection = main.querySelector("input[type='radio']:checked");
        if (!selection) {
            alert("Veuillez sélectionner un suspect !");
            return;
        }
        const coupableId = parseInt(selection.value);
        if (coupableId === enquete.coupableId) {
            afficherResultat(enquete, true);
        } else {
            afficherResultat(enquete, false);
        }
    });
}

function incrementerChrono() {
    secondes++;
    const minutes = Math.floor(secondes / 60);
    const secs = secondes % 60;
    let affichage = minutes + ":";
    if (secs < 10) {
        affichage += "0" + secs;
    } else {
        affichage += secs;
    }
    document.getElementById("chrono").textContent = affichage;
}

function afficherResultat(enquete, estCoupable) {
    const modal = document.createElement("div");
    modal.className = "modal-resultat";

    if (estCoupable) {
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Bravo !</h2>
                <p>Vous avez trouvé le coupable.</p>
                <div class="images-resultat">
                    <img src="${enquete.victime}" alt="victime">
                    <img src="${enquete.suspects[enquete.coupableId-1].image}" alt="coupable">
                </div>
                <p class="explication">${enquete.explication}</p>
                <button class="fermer">Fermer</button>
            </div>
        `;
        modal.querySelector(".fermer").addEventListener("click", () => {
            sauvegarderEnqueteTerminee(enquete.num);
            window.location.reload();
        })
    } else {
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Mauvaise réponse</h2>
                <p>Ce n’est pas le bon coupable…</p>
                <p>Retentez une prochaine fois !</p>
                <button class="rejouer">Recommencer</button>
            </div>
        `;
        modal.querySelector(".rejouer").addEventListener("click", () => {
            window.location.reload();
        });
    }

    document.body.appendChild(modal);
}

function sauvegarderEnqueteTerminee(enqueteId) {
    let terminees = JSON.parse(localStorage.getItem("enquetesTerminees")) || [];
    if (!terminees.includes(enqueteId)) {
        terminees.push(enqueteId);
    }
    localStorage.setItem("enquetesTerminees", JSON.stringify(terminees));
}